---
name: n8n-workflow-builder
description: Use when creating, editing, reviewing, or debugging n8n workflows, workflow JSON, Code nodes, Webhook/API automations, credentials placeholders, or custom n8n nodes. Use this before writing n8n-related code or JSON.
---

# n8n Workflow Builder

## Goal

Build n8n workflows that are importable, maintainable, secure, and faithful to n8n runtime conventions.

Primary expected output is an importable workflow JSON file under:

`workflows/*.json`

## First classify the task

Before writing output, decide which artifact the user needs:

- Workflow JSON for import/export
- Code node JavaScript
- Expression snippets
- Webhook/API automation design
- Existing workflow review/debugging
- Custom node package
- Operational runbook for n8n Cloud

If the task touches more than one artifact, state the order briefly and keep each artifact separate.

## Source of truth

Use official n8n docs first. Do not invent node parameters, credential types, or workflow fields.

Load only the needed reference:

- Node parameter syntax resolution: `references/node-syntax-resolution.md`
- Known node shapes: `references/node-shapes/known-nodes.md`
- Code node work: `references/code-node-patterns.md`
- Workflow JSON import/export: `references/workflow-json.md`
- Export-first workflow authoring: `references/export-based-authoring.md`
- Expressions and data access: `references/expressions-and-data.md`
- Webhook/API workflows: `references/webhook-http-patterns.md`
- Custom node development: `references/custom-node-authoring.md`
- Final review: `references/validation-checklist.md`

For unfamiliar built-in nodes, search the official n8n docs before generating final parameters:

- Node docs: https://docs.n8n.io/integrations/builtin/node-types/
- Code node: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/
- Expressions: https://docs.n8n.io/data/expression-reference/
- Workflow import/export: https://docs.n8n.io/workflows/export-import/
- Creating custom nodes: https://docs.n8n.io/integrations/creating-nodes/

## Defaults

- Prefer native n8n nodes over Code nodes.
- Before creating a node JSON, resolve its exact node syntax from existing exports, the local node shape catalog, or official n8n docs. Do not guess node parameters.
- Use Code nodes only for transformations, aggregation, validation, or logic that is awkward in native nodes.
- Use credentials placeholders, never real secrets.
- Use environment variables only when the n8n instance is known to provide them.
- Keep node names stable and unique. Connection keys must match node names exactly.
- Prefer Webhook input -> validation -> action -> notification/logging.
- When creating deployable workflows, generate or update a `.json` workflow artifact, not only prose.
- Prefer cloning patterns from existing exported workflows in `workflows/`.

## Code node hard rules

- Use `$input.all()` when processing all items.
- Return an array of n8n items: `[{ json: { ... } }]`.
- Preserve item shape unless intentionally transforming.
- Do not return a plain object, string, or array of raw objects.
- Do not use browser-only APIs.
- Do not assume external npm modules are available unless the user says the n8n instance is self-hosted and configured for them.

## Workflow JSON hard rules

- Importable workflow JSON must include `name`, `nodes`, `connections`, and `settings`.
- For n8n Cloud import, exported-style JSON may also include `pinData`, `active`, `versionId`, `meta`, `id`, and `tags`; omit or sanitize these when generating a reusable template unless patching an existing export.
- Credentials must be placeholders or omitted with setup notes.
- Every connection target must reference an existing node name.
- Avoid embedding API keys in HTTP Request headers.
- If generated from scratch, include concise sticky note nodes only when they help setup.

## Node syntax hard rules

- Every node type must have a syntax source before final JSON is produced.
- Preferred source is an actual n8n export JSON from the same n8n instance/version.
- If a node type is not in existing exports, read `references/node-syntax-resolution.md`.
- If exact parameter shape remains uncertain, ask for a tiny exported workflow containing that node instead of guessing.
- In final answers for generated workflows, list node syntax sources.

## Build workflow

1. Read any user-provided export JSON and identify node types, type versions, credentials shape, and connection shape.
2. Run or consult `extract-node-shapes.mjs` for existing node shapes.
3. Reuse known-good exported node shapes from existing workflows when possible.
4. Resolve any unknown node syntax through official docs or a user-provided export.
5. Generate the workflow JSON file.
6. Run `node .claude/skills/n8n-workflow-builder/scripts/validate-workflow.mjs <workflow.json>`.
7. Fix validation failures before finalizing.
8. In the final answer, give import/test steps, credential setup notes, and node syntax sources.

## Final response

Include:

- What artifact was created or changed
- Any credentials/env vars the user must configure
- How to import or test it in n8n
- Known assumptions

Before finalizing, run the validation checklist.
