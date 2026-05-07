#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2] ?? 'workflows';

function listJsonFiles(input) {
  const stat = fs.statSync(input);
  if (stat.isFile()) return [input];
  const files = [];
  for (const entry of fs.readdirSync(input)) {
    const full = path.join(input, entry);
    const entryStat = fs.statSync(full);
    if (entryStat.isDirectory()) files.push(...listJsonFiles(full));
    else if (entry.endsWith('.json')) files.push(full);
  }
  return files;
}

function compact(value, depth = 0) {
  if (depth > 3) return Array.isArray(value) ? '[Array]' : '[Object]';
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    return [compact(value[0], depth + 1)];
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      if (key === 'jsCode') {
        out[key] = typeof child === 'string'
          ? `[Code string, ${child.length} chars]`
          : compact(child, depth + 1);
      } else if (key === 'body' && typeof child === 'string' && child.length > 500) {
        out[key] = `[Body string, ${child.length} chars]`;
      } else {
        out[key] = compact(child, depth + 1);
      }
    }
    return out;
  }
  return value;
}

const shapes = new Map();

for (const file of listJsonFiles(target)) {
  let workflow;
  try {
    workflow = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    continue;
  }
  for (const node of workflow.nodes ?? []) {
    if (!node.type) continue;
    const key = `${node.type}@${node.typeVersion ?? 'unknown'}`;
    if (!shapes.has(key)) {
      shapes.set(key, {
        type: node.type,
        typeVersion: node.typeVersion ?? null,
        examples: [],
      });
    }
    const shape = shapes.get(key);
    shape.examples.push({
      workflow: workflow.name ?? path.basename(file),
      file,
      name: node.name,
      parameterKeys: Object.keys(node.parameters ?? {}),
      parametersShape: compact(node.parameters ?? {}),
      credentialsShape: node.credentials ? compact(node.credentials) : null,
    });
  }
}

const result = [...shapes.values()].sort((a, b) => a.type.localeCompare(b.type));
console.log(JSON.stringify(result, null, 2));
