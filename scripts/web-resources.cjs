const fs = require('node:fs');
const path = require('node:path');
const { root, readConfig, publicName } = require('./project-config.cjs');

const sourceRoot = path.join(root, 'src');
const entitiesRoot = path.join(sourceRoot, 'entities');

function describeWebResource(entity, kind, config) {
  return {
    file: path.join(entitiesRoot, entity, kind, 'index.ts'),
    name: `${entity}/${kind}`,
    outputFile: `${config.publisherPrefix}_/${entity}/${kind}.js`,
    handlerPath: [config.namespace, publicName(entity), kind === 'forms' ? 'Forms' : 'Ribbon'],
  };
}

function getWebResources() {
  const config = readConfig();
  const entities = fs.readdirSync(entitiesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  return entities.flatMap(({ name }) => ['forms', 'ribbon'].flatMap((kind) => {
    const file = path.join(entitiesRoot, name, kind, 'index.ts');
    return fs.existsSync(file) ? [describeWebResource(name, kind, config)] : [];
  }));
}

module.exports = { sourceRoot, entitiesRoot, describeWebResource, getWebResources };
