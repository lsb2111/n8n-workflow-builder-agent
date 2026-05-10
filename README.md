# n8n Workflow Builder Agent

Export-based tooling for building, validating, deploying, backing up, and debugging n8n workflow JSON.

This repository is designed for AI-assisted workflow authoring. It gives an agent deterministic scripts for the risky parts and a skill prompt that tells the agent not to guess n8n node parameters.

## What It Does

- Extracts node parameter shapes from existing n8n exports
- Validates workflow JSON structure and connection references
- Deploys workflow JSON to an n8n instance with create/update by workflow name
- Backs up workflows from an n8n instance
- Lists execution history
- Inspects execution details and summarizes failed nodes
- Provides a Claude/Codex-style skill in `skill/`

## Requirements

- Node.js 18 or newer
- n8n Public API key
- Existing n8n credentials configured on the target n8n instance

## Environment

```bash
export N8N_URL=https://your-instance.n8n.cloud
export N8N_API_KEY=n8n_api_xxxxx
```

Never commit real API keys.

## Directory Layout

```text
scripts/
  deploy-workflow.mjs
  backup-workflow.mjs
  list-executions.mjs
  inspect-execution.mjs
  lib/n8n-api.mjs
skill/
  SKILL.md
  scripts/
    extract-node-shapes.mjs
    validate-workflow.mjs
  references/
workflows/
  .gitkeep
backups/
  .gitkeep
```

## Workflow Authoring Loop

1. Put exported or generated workflow JSON in `workflows/`.
2. Extract known node shapes:

```bash
node skill/scripts/extract-node-shapes.mjs workflows
```

You can also try the bundled example:

```bash
node skill/scripts/validate-workflow.mjs examples/workflows/manual-code-example.json
node scripts/deploy-workflow.mjs examples/workflows/manual-code-example.json --dry-run
```

3. Validate:

```bash
node skill/scripts/validate-workflow.mjs workflows/my-workflow.json
```

4. Dry-run deploy payload:

```bash
node scripts/deploy-workflow.mjs workflows/my-workflow.json --dry-run
```

5. Back up the server workflow:

```bash
node scripts/backup-workflow.mjs --name "My Workflow"
```

6. Deploy:

```bash
node scripts/deploy-workflow.mjs workflows/my-workflow.json --keep-creds
```

Use `--keep-creds` when deploying a workflow exported from the same n8n
instance back into that instance. Omit it for reusable templates or
cross-instance deployment.

7. Inspect failures:

```bash
node scripts/list-executions.mjs --workflow-name "My Workflow" --status error --limit 10
node scripts/inspect-execution.mjs <executionId>
```

## Activate After Deploy

```bash
node scripts/deploy-workflow.mjs workflows/my-workflow.json --activate
```

Use `--activate` only when you really want the workflow enabled on the server.

## Security Notes

- Credentials must already exist in n8n.
- Deployment removes credential `id` fields from workflow nodes by default because IDs are environment-specific.
- Use `--keep-creds` for same-instance self-hosted deployment so credential bindings do not get disconnected.
- The validator warns about credential IDs and blocks common secret/token patterns.
- Execution data may contain sensitive payloads. Be careful with `inspect-execution.mjs --json`.

## Known Limitations

- Self-hosted n8n workflow updates use `PUT /api/v1/workflows/:id`; `PATCH`
  is not reliable across n8n versions.
- Prefer HTTP Request with Slack Incoming Webhooks for Block Kit messages.
  Native Slack node support for rich payloads can vary by n8n version.
- For APIs not present in existing exports, such as Meta Marketing API, use
  official API docs plus a real test call before finalizing node parameters.

## Agent Definition

The agent is the combination of:

- `skill/SKILL.md`: workflow authoring procedure and guardrails
- `skill/scripts/extract-node-shapes.mjs`: node syntax discovery from real exports
- `skill/scripts/validate-workflow.mjs`: static workflow lint
- `scripts/*.mjs`: n8n API actions for deploy/backup/execution inspection

This is a script-based agent, not a fully autonomous service. It supports an observe -> edit -> validate -> deploy -> inspect -> fix loop.
