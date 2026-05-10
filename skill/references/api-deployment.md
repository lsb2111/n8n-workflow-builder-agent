# API Deployment Mode

Use API mode when the target n8n instance exposes the Public API and the user
has configured:

- `N8N_URL`
- `N8N_API_KEY`

## Tools

- `scripts/deploy-workflow.mjs`
- `scripts/backup-workflow.mjs`
- `scripts/list-executions.mjs`
- `scripts/inspect-execution.mjs`

## Loop

1. Validate the local workflow JSON.
2. Backup the current remote workflow when editing an existing workflow.
3. Run deploy with `--dry-run`.
4. Deploy with `deploy-workflow.mjs`.
5. Trigger the workflow through webhook or manual execution.
6. Read execution history with `list-executions.mjs`.
7. Inspect failed executions with `inspect-execution.mjs`.
8. Patch the workflow JSON and repeat.

## Credential mode

`deploy-workflow.mjs` strips credential IDs by default because IDs differ across
n8n instances. That is safer for reusable templates and cross-instance
deployment.

For same-instance self-hosted deployments, use `--keep-creds` so existing
credential bindings survive the update:

```bash
node scripts/deploy-workflow.mjs workflows/<workflow>.json --keep-creds
```

Use this rule:

- Same n8n instance export -> deploy back to same instance: use `--keep-creds`.
- Reusable template or different n8n instance: omit `--keep-creds`.

## Update method

Self-hosted n8n Public API updates workflows with `PUT /api/v1/workflows/:id`.
Do not switch this script back to `PATCH` unless the target n8n API version is
verified to support it.

## Limits

- This mode does not work on n8n Cloud plans without Public API access.
- Credentials must already exist in the n8n instance.
- New node types that are not present in existing exports still require official
  docs or a tiny exported test workflow as the syntax source.
