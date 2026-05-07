#!/usr/bin/env node
import { n8nFetch } from './lib/n8n-api.mjs';

function usage() {
  console.error(`Usage:
  N8N_URL=https://your-instance.n8n.cloud N8N_API_KEY=n8n_api_xxx \\
    node scripts/inspect-execution.mjs <executionId> [--json]

Options:
  --json  Print raw execution JSON with includeData=true.
`);
}

function parseArgs(argv) {
  const args = { id: '', json: false };
  for (const arg of argv) {
    if (arg === '--json') args.json = true;
    else if (!args.id) args.id = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.id) throw new Error('executionId is required');
  return args;
}

function summarizeRunData(runData = {}) {
  const rows = [];
  for (const [nodeName, runs] of Object.entries(runData)) {
    const run = Array.isArray(runs) ? runs[runs.length - 1] : null;
    if (!run) continue;
    rows.push({
      nodeName,
      status: run.error ? 'error' : 'success',
      startTime: run.startTime,
      executionTime: run.executionTime,
      errorMessage: run.error?.message ?? run.error?.description ?? null,
      errorName: run.error?.name ?? null,
      itemCount: Array.isArray(run.data?.main?.[0]) ? run.data.main[0].length : null,
    });
  }
  return rows;
}

function summarizeExecution(execution) {
  const runData = execution.data?.resultData?.runData ?? {};
  const nodeErrors = summarizeRunData(runData).filter((row) => row.status === 'error');
  return {
    id: execution.id,
    workflowId: execution.workflowId,
    status: execution.status,
    mode: execution.mode,
    startedAt: execution.startedAt,
    stoppedAt: execution.stoppedAt,
    finished: execution.finished,
    error: execution.data?.resultData?.error
      ? {
          message: execution.data.resultData.error.message,
          name: execution.data.resultData.error.name,
          node: execution.data.resultData.error.node?.name,
        }
      : null,
    nodeErrors,
    nodes: summarizeRunData(runData),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const execution = await n8nFetch('GET', `/api/v1/executions/${encodeURIComponent(args.id)}?includeData=true`);
  if (args.json) {
    console.log(JSON.stringify(execution, null, 2));
    return;
  }
  console.log(JSON.stringify(summarizeExecution(execution), null, 2));
}

main().catch((error) => {
  usage();
  console.error(`[inspect-execution] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
