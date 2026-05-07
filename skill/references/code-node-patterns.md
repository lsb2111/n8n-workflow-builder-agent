# n8n Code Node Patterns

Official docs:

- Code in n8n: https://docs.n8n.io/code/
- Code node: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/
- Common Code node issues: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/common-issues/

## Core rule

n8n passes data between nodes as an array of items. A Code node must return an array of items. Each item should normally be an object with a `json` property.

## Process all input items

```js
const items = $input.all();

return items.map((item) => ({
  json: {
    ...item.json,
    processed: true,
  },
}));
```

## Return one aggregate item

```js
const items = $input.all();

return [
  {
    json: {
      count: items.length,
      generatedAt: new Date().toISOString(),
    },
  },
];
```

## Validate required fields

```js
const items = $input.all();

return items.map((item, index) => {
  const message = item.json.message;
  if (typeof message !== 'string' || message.trim() === '') {
    throw new Error(`Item ${index} is missing message`);
  }

  return {
    json: {
      ...item.json,
      message: message.trim(),
    },
  };
});
```

## HTTP response body shaping

Use this before a Respond to Webhook node.

```js
return [
  {
    json: {
      ok: true,
      receivedAt: new Date().toISOString(),
    },
  },
];
```

## Common mistakes

- Returning `{ ok: true }` instead of `[{ json: { ok: true } }]`.
- Returning `items.map(item => item.json)`, which loses n8n item wrappers.
- Reading `$json.body` when the previous node does not output `body`.
- Assuming `fetch` or external modules exist in every n8n deployment.
- Mutating input items in place when a clean mapped object is clearer.

