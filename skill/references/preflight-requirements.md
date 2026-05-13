# Preflight Requirements

Use this before implementing or modifying an n8n workflow.

## Rule

Do not start deployable workflow JSON implementation until required runtime
inputs are known. If something is missing, stop and ask the user to create or
provide it. You may still create a skeleton/template only when the user
explicitly asks for one.

Never ask the user to paste secrets into chat. Ask for credential names, env var
names, resource IDs, test IDs, or confirmation that a secret has been added to
n8n/AWS/GitHub/Meta/etc.

## Preflight output

Before implementation, produce a short checklist:

- Required n8n credentials
- Required API permissions/scopes
- Required resource IDs/URLs
- Required sample input for a test run
- Deployment mode and credential mode
- Missing items and who must create them

## Common requirements

### n8n deployment

- `N8N_URL`
- `N8N_API_KEY`
- Target workflow name
- Whether deployment is same-instance (`--keep-creds`) or reusable/cross-instance

### Webhook workflow

- Public webhook path or desired path
- Request body example
- Expected response shape
- Auth strategy, if any

### Slack

- Incoming Webhook URL credential name, or Slack credential name
- Target channel
- Message format: plain text or Block Kit

Prefer HTTP Request + Incoming Webhook for Block Kit.

### Meta Marketing API

- Meta app and access token storage location
- Required permission: `ads_read` for reporting
- Required permission: `ads_management` for pausing/updating ads
- Ad account ID, for example `act_...`
- Report level: account, campaign, adset, or ad
- Date range and fields

### Instagram publishing

- Instagram account is Business or Creator
- Instagram account is connected to a Facebook Page
- Permissions such as `instagram_content_publish` are approved/available
- IG user ID
- Public HTTPS image URLs
- Caption text and posting cadence

### Google APIs

- OAuth client/credential name
- Required scopes
- Redirect URI is registered
- Test account has access
- Account/resource ID, such as AdSense account ID

### AWS/S3 assets

- Bucket name
- Upload prefix
- Public URL strategy: CloudFront or public S3 object URL
- IAM credential or role available to the runtime

## Stop conditions

Stop before implementation and ask for setup when:

- A required credential does not exist in n8n.
- An API permission/scope is not granted.
- A required resource ID is unknown.
- There is no sample payload to test a webhook.
- The workflow must be executed after deploy but has only Schedule/Manual
  triggers and no test Webhook or Execute Workflow wrapper.
