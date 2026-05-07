# n8n Expressions and Data Access

Official docs:

- Expressions: https://docs.n8n.io/data/expression-reference/
- Expressions vs Code nodes: https://docs.n8n.io/data/code/

## Expressions

n8n expressions use `{{ ... }}` inside node parameters.

Common examples:

```text
{{ $json.email }}
{{ $json.message.trim() }}
{{ new Date().toISOString() }}
{{ $('Fetch User').item.json.id }}
```

## Use expressions for simple mapping

Good expression use:

- Copying fields
- Formatting strings
- Simple date formatting
- Simple conditional values

Use a Code node instead for:

- Aggregating many items
- Deduplication
- Complex validation
- Multi-step transformations
- Non-trivial JSON restructuring

## Data access guidance

- `$json` refers to the current item's JSON data.
- `$('Node Name').item.json.field` references another node's item data.
- If referencing another node, use the exact node name.
- Avoid long expressions when a Code node would be clearer.

