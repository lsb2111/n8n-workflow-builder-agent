# n8n Workflow JSON

Official docs:

- Export/import workflows: https://docs.n8n.io/workflows/export-import/
- n8n API workflow object notes: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.n8n/

## Importable workflow shape

When the user asks for workflow JSON, generate a JSON object with at least:

```json
{
  "name": "Workflow name",
  "nodes": [],
  "connections": {},
  "settings": {}
}
```

Exported workflows may contain more fields. Keep generated workflows minimal unless the user provides an existing export to patch.

## Node basics

Each node should have:

- `parameters`
- `type`
- `typeVersion`
- `position`
- `name`

Example:

```json
{
  "parameters": {},
  "type": "n8n-nodes-base.manualTrigger",
  "typeVersion": 1,
  "position": [0, 0],
  "name": "Manual Trigger"
}
```

## Connections

Connection keys must match node names exactly.

```json
{
  "Manual Trigger": {
    "main": [
      [
        {
          "node": "Next Node",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

## Credentials

Do not include real secrets. Prefer one of:

- Omit `credentials` and list setup steps.
- Use placeholder credential names if the user wants import scaffolding.

Exported workflow JSON may include credential names and IDs. Remove or anonymize before sharing.

## Safer generation strategy

If exact node parameters are uncertain:

1. Use common core nodes with stable schemas: Manual Trigger, Schedule Trigger, Webhook, HTTP Request, Code, IF, Switch, Set/Edit Fields, Respond to Webhook.
2. Add a setup note instead of inventing unknown parameters.
3. Tell the user which node must be configured in the n8n UI.

