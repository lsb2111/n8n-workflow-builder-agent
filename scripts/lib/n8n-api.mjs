export function baseUrl() {
  const url = process.env.N8N_URL;
  if (!url) throw new Error('N8N_URL is required');
  return url.replace(/\/+$/, '');
}

export function apiKey() {
  const key = process.env.N8N_API_KEY;
  if (!key) throw new Error('N8N_API_KEY is required');
  return key;
}

export async function n8nFetch(method, route, body) {
  const response = await fetch(`${baseUrl()}${route}`, {
    method,
    headers: {
      'X-N8N-API-KEY': apiKey(),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const detail = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`${method} ${route} failed: ${response.status} ${response.statusText} ${detail}`);
  }

  return data;
}

export function listItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function listWorkflows(limit = 250) {
  return listItems(await n8nFetch('GET', `/api/v1/workflows?limit=${limit}`));
}

export async function findWorkflowByName(name) {
  const workflows = await listWorkflows();
  return workflows.find((workflow) => workflow.name === name) ?? null;
}

export async function getWorkflow(id) {
  return n8nFetch('GET', `/api/v1/workflows/${encodeURIComponent(id)}`);
}

