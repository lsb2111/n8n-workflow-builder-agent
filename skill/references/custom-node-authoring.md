# Custom Node Authoring

Official docs:

- Creating nodes overview: https://docs.n8n.io/integrations/creating-nodes/
- Node file structure: https://docs.n8n.io/integrations/creating-nodes/build/reference/node-file-structure/

## Use custom nodes only when needed

Prefer built-in nodes and HTTP Request nodes unless:

- The integration will be reused often.
- Credentials and operations need a polished UI.
- The workflow needs many repeated API calls with the same schema.
- A team will maintain the integration as a package.

## Expected structure

n8n recommends using the `n8n-node` tool to scaffold expected node structure.

Typical files include:

```text
nodes/
  MyService/
    MyService.node.ts
    MyService.node.json
credentials/
  MyServiceApi.credentials.ts
```

## Authoring rules

- Do not invent `INodeTypeDescription` fields. Check official docs or existing n8n nodes.
- Keep operations small and explicit.
- Put secrets in credentials classes.
- Use typed request helpers where possible.
- Add clear error messages for API failures.

## When generating for Claude

If the user asks for custom node code, first ask whether the target is:

- n8n community node package
- local self-hosted custom node
- quick workflow using HTTP Request instead

Default to HTTP Request workflow unless custom node packaging is explicitly needed.

