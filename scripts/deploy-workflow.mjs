#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { findWorkflowByName, n8nFetch } from './lib/n8n-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const validatorPath = path.join(repoRoot, 'skill/scripts/validate-workflow.mjs');

function usage() {
  console.error(`Usage:
  N8N_URL=https://your-instance.n8n.cloud N8N_API_KEY=n8n_api_xxx \\
    node scripts/deploy-workflow.mjs <workflow.json> [--activate] [--name "Workflow Name"] [--dry-run]

Options:
  --activate      Activate workflow after create/update.
  --dry-run       Validate and print payload summary without calling n8n API.
  --name <name>   Override workflow name used for lookup and deployment.
`);
}

function parseArgs(argv) {
  const args = { file: '', activate: false, dryRun: false, name: '' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--activate') args.activate = true;
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--name') {
      args.name = argv[i + 1] ?? '';
      i += 1;
    } else if (!args.file) {
      args.file = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!args.file) throw new Error('workflow.json path is required');
  return args;
}

function runValidator(file) {
  if (!fs.existsSync(validatorPath)) {
    console.warn(`[deploy-workflow] validator not found, skipping: ${validatorPath}`);
    return;
  }
  const result = spawnSync(process.execPath, [validatorPath, file], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function removeCredentialIds(node) {
  if (!node.credentials || typeof node.credentials !== 'object') return node;
  const credentials = {};
  for (const [type, value] of Object.entries(node.credentials)) {
    if (!value || typeof value !== 'object') {
      credentials[type] = value;
      continue;
    }
    const { id: _id, ...rest } = value;
    credentials[type] = rest;
  }
  return { ...node, credentials };
}

function toDeployPayload(workflow, nameOverride) {
  const payload = {
    name: nameOverride || workflow.name,
    nodes: (workflow.nodes ?? []).map(removeCredentialIds),
    connections: workflow.connections ?? {},
    settings: workflow.settings ?? {},
  };

  if (workflow.staticData && typeof workflow.staticData === 'object') {
    payload.staticData = workflow.staticData;
  }
  if (workflow.meta && typeof workflow.meta === 'object') {
    payload.meta = workflow.meta;
  }
  if (Array.isArray(workflow.tags) && workflow.tags.length > 0) {
    payload.tags = workflow.tags
      .map((tag) => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object' && typeof tag.id === 'string') return tag.id;
        return null;
      })
      .filter(Boolean);
  }

  return payload;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const file = path.resolve(process.cwd(), args.file);

  runValidator(file);

  const workflow = JSON.parse(fs.readFileSync(file, 'utf8'));
  const payload = toDeployPayload(workflow, args.name);
  if (!payload.name || !Array.isArray(payload.nodes)) {
    throw new Error('Invalid workflow payload');
  }

  if (args.dryRun) {
    console.log('[deploy-workflow] dry run');
    console.log(JSON.stringify({
      name: payload.name,
      nodeCount: payload.nodes.length,
      connectionKeys: Object.keys(payload.connections),
      activate: args.activate,
    }, null, 2));
    return;
  }

  const existing = await findWorkflowByName(payload.name);
  let deployed;
  if (existing?.id) {
    deployed = await n8nFetch('PATCH', `/api/v1/workflows/${existing.id}`, payload);
    console.log(`[deploy-workflow] updated workflow: ${payload.name} (${existing.id})`);
  } else {
    deployed = await n8nFetch('POST', '/api/v1/workflows', payload);
    console.log(`[deploy-workflow] created workflow: ${payload.name} (${deployed.id})`);
  }

  if (args.activate) {
    await n8nFetch('POST', `/api/v1/workflows/${deployed.id}/activate`);
    console.log(`[deploy-workflow] activated workflow: ${payload.name} (${deployed.id})`);
  }
}

main().catch((error) => {
  usage();
  console.error(`[deploy-workflow] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
