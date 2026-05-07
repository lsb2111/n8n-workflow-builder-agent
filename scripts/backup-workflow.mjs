#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { findWorkflowByName, getWorkflow } from './lib/n8n-api.mjs';

function usage() {
  console.error(`Usage:
  N8N_URL=https://your-instance.n8n.cloud N8N_API_KEY=n8n_api_xxx \\
    node scripts/backup-workflow.mjs --name "Workflow Name" [--out dir]

Options:
  --name <name>  Workflow name to backup.
  --id <id>      Workflow id to backup.
  --out <dir>    Output directory. Default: backups
`);
}

function parseArgs(argv) {
  const args = { name: '', id: '', out: 'backups' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--name') {
      args.name = argv[i + 1] ?? '';
      i += 1;
    } else if (arg === '--id') {
      args.id = argv[i + 1] ?? '';
      i += 1;
    } else if (arg === '--out') {
      args.out = argv[i + 1] ?? '';
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (!args.name && !args.id) throw new Error('--name or --id is required');
  return args;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9가-힣]+/gi, '-').replace(/^-|-$/g, '') || 'workflow';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workflowRef = args.id ? { id: args.id } : await findWorkflowByName(args.name);
  if (!workflowRef?.id) throw new Error(`workflow not found: ${args.name || args.id}`);

  const workflow = await getWorkflow(workflowRef.id);
  const outDir = path.resolve(process.cwd(), args.out);
  fs.mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(outDir, `${slugify(workflow.name ?? workflowRef.id)}-${timestamp}.json`);
  fs.writeFileSync(file, JSON.stringify(workflow, null, 2) + '\n');
  console.log(`[backup-workflow] saved ${workflow.name} (${workflowRef.id}) -> ${file}`);
}

main().catch((error) => {
  usage();
  console.error(`[backup-workflow] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
