# Export-Based n8n Workflow Authoring

Use this when the user wants workflow JSON that can be imported into n8n.

## Preferred approach

Start from a real n8n export whenever available. Exported workflows reveal the exact node type, typeVersion, parameter shape, credential shape, and connection format for the user's n8n version.

For this project, inspect:

- `workflows/*.json`
- User-provided exports such as feedback pipelines

## Workflow file location

Create deployable workflow artifacts under:

```text
workflows/<workflow-name>.json
```

Use lowercase hyphenated filenames.

## Exported top-level keys

Real exports often contain:

```json
{
  "name": "...",
  "nodes": [],
  "pinData": {},
  "connections": {},
  "active": false,
  "settings": {},
  "versionId": "...",
  "meta": {},
  "id": "...",
  "tags": []
}
```

For reusable templates:

- Keep `name`, `nodes`, `connections`, `settings`, `pinData`, `active`, `tags`.
- Omit `id` and `versionId` unless patching a specific existing workflow.
- Keep `active: false` for import safety.
- Do not include real credential IDs.

## Credential placeholders

Use placeholder credential names that the user can remap after import:

```json
"credentials": {
  "githubApi": {
    "name": "GitHub API"
  }
}
```

If a real export contains credential IDs, remove them for reusable templates.
Keep them for same-instance self-hosted deployment when the workflow is being
updated back into the n8n instance it came from.

## Code node style

Use n8n-compatible item output:

```js
const items = $input.all();

return items.map((item) => ({
  json: {
    ...item.json,
  },
}));
```

## Delivery expectation

When asked to build an n8n workflow, produce:

1. A workflow JSON file in `workflows/`.
2. A short list of credentials to configure after import.
3. Test steps in n8n.
4. Validation result from `scripts/validate-workflow.mjs`.
5. Dry-run result from the project deploy script.

## Project deploy script

Use this script for local validation and n8n API deployment:

```bash
node scripts/deploy-workflow.mjs \
  workflows/<workflow>.json \
  --dry-run
```

Deploy with:

```bash
N8N_URL=https://your-instance.n8n.cloud \
N8N_API_KEY=n8n_api_xxxxx \
node scripts/deploy-workflow.mjs \
  workflows/<workflow>.json \
  --keep-creds
```

Use `--keep-creds` for same-instance self-hosted deployments. Omit it when the
artifact is meant to be reusable across n8n instances.

Add `--activate` only when the user explicitly wants the workflow activated after deployment.

## Agent loop scripts

For server-aware debugging, use these project scripts:

```bash
node scripts/backup-workflow.mjs --name "<Workflow Name>"
node scripts/list-executions.mjs --workflow-name "<Workflow Name>" --status error --limit 10
node scripts/inspect-execution.mjs <executionId>
```

Recommended agent loop:

1. Backup server workflow.
2. Modify local workflow JSON.
3. Validate and dry-run.
4. Deploy.
5. Trigger a test run.
6. Inspect latest execution.
7. Use node error/output to patch JSON.
8. Repeat until successful.
