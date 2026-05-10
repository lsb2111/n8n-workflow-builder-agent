# Known n8n Node Shapes

This directory is a local node shape catalog.

Before generating nodes, inspect existing workflow exports or run:

```bash
node skill/scripts/extract-node-shapes.mjs workflows
```

Use exported node shapes as the preferred source for:

- `type`
- `typeVersion`
- `parameters`
- `credentials`
- connection shape

Slack note:

- Use native Slack node shapes only for simple text notifications.
- For Block Kit or richer Slack reports, prefer `n8n-nodes-base.httpRequest`
  with Slack Incoming Webhook JSON.

For any node not represented in local exports, do not guess. Resolve syntax using `node-syntax-resolution.md`.
