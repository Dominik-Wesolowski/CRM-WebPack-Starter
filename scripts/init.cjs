const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { root, configPath, validateConfig } = require('./project-config.cjs');

async function init() {
  if (fs.existsSync(configPath)) throw new Error('Project is already initialized (crm.config.json exists).');

  let values = process.argv.slice(2);
  if (values.length === 0) {
    if (!process.stdin.isTTY) throw new Error('Usage: npm run init -- <project-name> <publisher-prefix> <namespace>');
    const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      values = [
        await prompt.question('Project name: '),
        await prompt.question('Publisher prefix: '),
        await prompt.question('JavaScript namespace: '),
      ].map((value) => value.trim());
    } finally {
      prompt.close();
    }
  }
  if (values.length !== 3) throw new Error('Usage: npm run init -- <project-name> <publisher-prefix> <namespace>');

  const [projectName, publisherPrefix, namespace] = values;
  const config = validateConfig({ projectName, publisherPrefix, namespace });
  const packageFiles = ['package.json', 'package-lock.json'].map((name) => {
    const file = path.join(root, name);
    const original = fs.readFileSync(file, 'utf8');
    const data = JSON.parse(original);
    data.name = projectName;
    if (data.packages?.['']) data.packages[''].name = projectName;
    return { file, original, updated: JSON.stringify(data, null, 2) + '\n' };
  });

  const descriptor = fs.openSync(configPath, 'wx');
  const attempted = [];
  let initialized = false;
  try {
    for (const entry of packageFiles) {
      attempted.push(entry);
      fs.writeFileSync(entry.file, entry.updated);
    }
    fs.writeFileSync(descriptor, JSON.stringify(config, null, 2) + '\n');
    initialized = true;
  } catch (error) {
    for (const { file, original } of attempted) fs.writeFileSync(file, original);
    throw error;
  } finally {
    fs.closeSync(descriptor);
    if (!initialized) fs.unlinkSync(configPath);
  }

  console.log(`Initialized ${projectName} with prefix ${publisherPrefix} and namespace ${namespace}.`);
}

init().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
