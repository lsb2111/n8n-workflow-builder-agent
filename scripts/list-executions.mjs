#!/usr/bin/env node
import { findWorkflowByName, listItems, n8nFetch } from './lib/n8n-api.mjs';

function usage() {
  console.error(`Usage:
  N8N_URL=https://your-instance.n8n.cloud N8N_API_KEY=n8n_api_xxx \\
    node scripts/list-executions.mjs [--workflow-name "Name" | --workflow-id id] [--status error|success|running|waiting] [--limit 20]
`);
}

function parseArgs(argv) {
  const args = { workflowName: '', workflowId: '', status: '', limit: 20 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--workflow-name') {
      args.workflowName = argv[i + 1] ?? '';
      i += 1;
    } else if (arg === '--workflow-id') {
      args.workflowId = argv[i + 1] ?? '';
      i += 1;
    } else if (arg === '--status') {
      args.status = argv[i + 1] ?? '';
      i += 1;
    } else if (arg === '--limit') {
      args.limit = Number(argv[i + 1] ?? 20);
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

async function resolveWorkflowId(args) {
  if (args.workflowId) return args.workflowId;
  if (!args.workflowName) return '';
  const workflow = await findWorkflowByName(args.workflowName);
  if (!workflow?.id) throw new Error(`workflow not found: ${args.workflowName}`);
  return workflow.id;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workflowId = await resolveWorkflowId(args);
  const params = new URLSearchParams();
  params.set('limit', String(args.limit));
  if (workflowId) params.set('workflowId', workflowId);
  if (args.status) params.set('status', args.status);

  const data = await n8nFetch('GET', `/api/v1/executions?${params.toString()}`);
  const executions = listItems(data);
  console.log(JSON.stringify(
    executions.map((execution) => ({
      id: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      mode: execution.mode,
      startedAt: execution.startedAt,
      stoppedAt: execution.stoppedAt,
      finished: execution.finished,
    })),
    null,
    2,
  ));
}

main().catch((error) => {
  usage();
  console.error(`[list-executions] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
