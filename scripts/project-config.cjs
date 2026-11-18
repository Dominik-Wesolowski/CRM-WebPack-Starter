const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'crm.config.json');
const reserved = new Set(['constructor', 'prototype', '__proto__', 'window', 'self', 'globalThis']);
const modulePattern = /^[a-z][a-zA-Z0-9]*$/;
const windowsDevice = /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;

function validateConfig(config) {
  const { projectName, publisherPrefix, namespace } = config;
  if (typeof projectName !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectName) || projectName.length > 214) {
    throw new Error('Project name must use lowercase letters, digits and hyphens (max. 214 characters).');
  }
  if (typeof publisherPrefix !== 'string' || !/^[a-z][a-z0-9]{1,7}$/i.test(publisherPrefix) || /^mscrm/i.test(publisherPrefix)) {
    throw new Error('Publisher prefix must be 2-8 letters or digits, start with a letter, and must not start with mscrm.');
  }
  if (typeof namespace !== 'string' || !/^[A-Z][a-zA-Z0-9]*$/.test(namespace) || reserved.has(namespace)) {
    throw new Error('Namespace must be a PascalCase JavaScript identifier, e.g. HearingCare.');
  }
  return config;
}

function readConfig() {
  try {
    return validateConfig(JSON.parse(fs.readFileSync(configPath, 'utf8')));
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('Run npm run init to create crm.config.json first.');
    throw error;
  }
}

function publicName(name) {
  if (!modulePattern.test(name) || windowsDevice.test(name) || reserved.has(name)) {
    throw new Error(`Invalid module name: ${name}. Use camelCase letters and digits, starting with a lowercase letter.`);
  }
  return name[0].toUpperCase() + name.slice(1);
}

module.exports = { root, configPath, validateConfig, readConfig, publicName };
