#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: validate-workflow.mjs <workflow.json>');
  process.exit(2);
}

const errors = [];
const warnings = [];

let workflow;
try {
  workflow = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  console.error(`Invalid JSON: ${error.message}`);
  process.exit(1);
}

function has(value) {
  return value !== undefined && value !== null;
}

if (typeof workflow.name !== 'string' || workflow.name.trim() === '') {
  errors.push('workflow.name must be a non-empty string');
}
if (!Array.isArray(workflow.nodes)) {
  errors.push('workflow.nodes must be an array');
}
if (!workflow.connections || typeof workflow.connections !== 'object' || Array.isArray(workflow.connections)) {
  errors.push('workflow.connections must be an object');
}
if (!workflow.settings || typeof workflow.settings !== 'object' || Array.isArray(workflow.settings)) {
  warnings.push('workflow.settings should be an object');
}

const nodes = Array.isArray(workflow.nodes) ? workflow.nodes : [];
const nodeNames = new Set();
const duplicateNames = new Set();

for (const node of nodes) {
  if (typeof node.name !== 'string' || node.name.trim() === '') {
    errors.push('every node must have a non-empty name');
    continue;
  }
  if (nodeNames.has(node.name)) duplicateNames.add(node.name);
  nodeNames.add(node.name);

  if (typeof node.type !== 'string' || node.type.trim() === '') {
    errors.push(`node "${node.name}" must have a type`);
  }
  if (!has(node.typeVersion)) {
    warnings.push(`node "${node.name}" has no typeVersion`);
  }
  if (!node.parameters || typeof node.parameters !== 'object' || Array.isArray(node.parameters)) {
    warnings.push(`node "${node.name}" should have parameters object`);
  }
  if (!Array.isArray(node.position) || node.position.length !== 2) {
    warnings.push(`node "${node.name}" should have position [x, y]`);
  }

  const credentials = node.credentials;
  if (credentials && typeof credentials === 'object') {
    for (const [type, credential] of Object.entries(credentials)) {
      if (credential && typeof credential === 'object' && 'id' in credential) {
        warnings.push(`node "${node.name}" credential "${type}" contains id; remove it for reusable templates`);
      }
    }
  }
}

for (const name of duplicateNames) {
  errors.push(`duplicate node name: ${name}`);
}

const connections = workflow.connections && typeof workflow.connections === 'object' ? workflow.connections : {};
for (const [sourceName, sourceConnections] of Object.entries(connections)) {
  if (!nodeNames.has(sourceName)) {
    errors.push(`connections has missing source node: ${sourceName}`);
  }
  const mains = sourceConnections?.main;
  if (!Array.isArray(mains)) {
    errors.push(`connections["${sourceName}"].main must be an array`);
    continue;
  }
  mains.forEach((branch, branchIndex) => {
    if (!Array.isArray(branch)) {
      errors.push(`connections["${sourceName}"].main[${branchIndex}] must be an array`);
      return;
    }
    branch.forEach((conn, connIndex) => {
      if (!conn || typeof conn !== 'object') {
        errors.push(`invalid connection at ${sourceName}.main[${branchIndex}][${connIndex}]`);
        return;
      }
      if (!nodeNames.has(conn.node)) {
        errors.push(`connection from "${sourceName}" targets missing node: ${conn.node}`);
      }
      if (conn.type !== 'main') {
        warnings.push(`connection from "${sourceName}" to "${conn.node}" has non-main type: ${conn.type}`);
      }
      if (typeof conn.index !== 'number') {
        warnings.push(`connection from "${sourceName}" to "${conn.node}" should have numeric index`);
      }
    });
  });
}

const serialized = JSON.stringify(workflow);
const secretPatterns = [
  /AIza[0-9A-Za-z_-]{20,}/,
  /ghp_[0-9A-Za-z_]{20,}/,
  /xox[baprs]-[0-9A-Za-z-]{20,}/,
  /sk-[0-9A-Za-z_-]{20,}/,
];
for (const pattern of secretPatterns) {
  if (pattern.test(serialized)) {
    errors.push(`possible secret detected: ${pattern}`);
  }
}

if (errors.length > 0) {
  console.error('n8n workflow validation failed');
  for (const error of errors) console.error(`ERROR: ${error}`);
  for (const warning of warnings) console.error(`WARN: ${warning}`);
  process.exit(1);
}

console.log('n8n workflow validation passed');
if (warnings.length > 0) {
  for (const warning of warnings) console.log(`WARN: ${warning}`);
}
