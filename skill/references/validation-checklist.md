# n8n Validation Checklist

Use before finalizing any n8n artifact.

## Workflow JSON

- Preflight requirements were collected before implementation.
- Missing credentials, keys, permissions, resource IDs, and test inputs are listed instead of guessed.
- `name`, `nodes`, `connections`, and `settings` exist.
- Workflow file is written under `workflows/` when the user asks for a deployable workflow.
- Node names are unique.
- Every connection key matches an existing node name.
- Every connection target node exists.
- Trigger node exists.
- Respond to Webhook exists for webhook flows that must return HTTP response.
- Credentials are placeholders or omitted.
- No real API keys, tokens, passwords, or private URLs are embedded.
- Required manual setup steps are listed.
- `node .claude/skills/n8n-workflow-builder/scripts/validate-workflow.mjs <workflow.json>` passes.

## Code node

- Returns an array.
- Each output item is shaped as `{ json: ... }`.
- Uses `$input.all()` for all-items processing.
- Does not assume unavailable external packages.
- Throws clear errors for invalid required input.
- Preserves needed input fields.

## Expressions

- Uses exact node names.
- Keeps expressions short enough to maintain.
- Moves complex logic to a Code node.

## Final answer

- States assumptions.
- Lists credentials/env vars to configure.
- Explains how to import/test in n8n.
- Mentions official docs if parameters may vary by n8n version.
