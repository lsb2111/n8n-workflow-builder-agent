# Webhook and HTTP Request Patterns

Official docs:

- Core nodes overview: https://docs.n8n.io/integrations/builtin/node-types/
- Code in n8n: https://docs.n8n.io/code/

## Basic webhook workflow

Recommended shape:

```text
Webhook
-> Validate/Normalize input
-> Action nodes
-> Notify/log
-> Respond to Webhook
```

## Webhook validation Code node

```js
const items = $input.all();

return items.map((item) => {
  const body = item.json.body ?? item.json;
  const message = body.message;

  if (typeof message !== 'string' || message.trim() === '') {
    throw new Error('message is required');
  }

  return {
    json: {
      message: message.trim(),
      userId: body.userId ?? null,
      receivedAt: new Date().toISOString(),
    },
  };
});
```

## HTTP Request guidance

- Prefer built-in service nodes when they exist and are configured.
- Use HTTP Request for generic APIs or when a built-in node lacks an operation.
- Put API keys in n8n credentials, not literal headers.
- If returning workflow JSON, describe credential setup separately.

## Known limitations

- Prefer HTTP Request with an Incoming Webhook for Slack Block Kit messages.
  Native Slack node support for rich Block Kit payloads can be unclear across
  n8n versions, while HTTP Request maps directly to Slack's webhook JSON shape.
- For APIs not represented in existing exports, such as Facebook Graph API /
  Meta Marketing API, build the node shape from official API docs plus a real
  test call. Do not invent request parameters or response parsing.

## Useful workflow patterns

- Feedback webhook -> classify -> GitHub issue
- Batch completion webhook -> Slack/email summary
- LLM usage daily report -> Slack/email
- Macro news collection -> classify -> File Search upload log
- Missing stock request -> validate ticker -> issue queue
