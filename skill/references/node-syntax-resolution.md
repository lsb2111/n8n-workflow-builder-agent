# Node Syntax Resolution

Use this before creating or changing any n8n node type whose parameter JSON shape is not already known.

## Core rule

Do not guess node parameters.

For each node type in the workflow, Claude must obtain a known-good shape from one of these sources before generating final JSON:

1. Existing workflow export in `workflows/`
2. User-provided n8n export JSON
3. Local node shape catalog in `references/node-shapes/`
4. Official n8n docs for that exact node type
5. If still uncertain, generate a placeholder node plus setup note instead of inventing fields

## Recommended workflow

1. List required nodes and their exact `type` names.
2. If existing exports are available, run the extractor against them:

```bash
node skill/scripts/extract-node-shapes.mjs workflows
```

3. Check whether the needed `type` exists in the output.
4. If found, reuse:
   - `type`
   - `typeVersion`
   - top-level `parameters` shape
   - `credentials` shape
   - common expression format
5. If not found, consult official n8n docs for that built-in node.
6. If the docs do not expose enough JSON detail, ask the user for a small exported workflow containing that node.

Shape extraction is a shortcut for reusing known-good local exports, not a
requirement when no relevant exports exist.

## Good output discipline

When finalizing a workflow, include a short "Node syntax sources" note:

```text
Node syntax sources:
- Webhook: existing workflow export
- HTTP Request: existing workflow export
- Slack: existing workflow export
- New node X: official n8n docs / user-provided export
```

## When to ask the user for an export

Ask for an export when:

- The node is uncommon.
- The node has complex nested parameters.
- The official docs describe UI fields but not JSON shape.
- The workflow must be importable on first try.

Request format:

```text
Please create a tiny n8n workflow with just this node configured once,
export it as JSON, and share it. I will use it as the exact node shape.
```

## Known trap

n8n UI field names do not always map cleanly to JSON parameter names. The visible UI label is not enough. Prefer export JSON.
