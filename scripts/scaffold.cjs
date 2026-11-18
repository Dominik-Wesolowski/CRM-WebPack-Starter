const fs = require('node:fs');
const path = require('node:path');
const Handlebars = require('handlebars');
const { readConfig, publicName } = require('./project-config.cjs');
const { entitiesRoot, describeWebResource } = require('./web-resources.cjs');

const columnPattern = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
const usage = [
  'npm run generate -- entity <entity> [initial-form] [--field <logical-column>]',
  'npm run generate -- form <entity> <form> [--field <logical-column>]',
  'npm run generate -- ribbon <entity>',
].join('\n');

function renderTemplate(name, data = {}) {
  const template = fs.readFileSync(path.join(__dirname, 'templates', `${name}.ts.hbs`), 'utf8');
  return Handlebars.compile(template, { strict: true, noEscape: true })(data).trimEnd() + '\n';
}

function createDirectory(directory) {
  const parent = path.dirname(directory);
  const name = path.basename(directory);
  if (fs.readdirSync(parent).some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    throw new Error(`Already exists: ${directory}`);
  }
  fs.mkdirSync(directory);
}

function addForm(forms, form, field) {
  const exportName = publicName(form);
  const directory = path.join(forms, form);
  const entry = path.join(forms, 'index.ts');
  const source = fs.readFileSync(entry, 'utf8');
  const handlerName = 'on' + (field ?? '').split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('') + 'Change';
  const onChange = renderTemplate('on-change', { field, handlerName });
  const onLoad = renderTemplate('on-load');
  const formExport = renderTemplate('form-export', { exportName, form });

  createDirectory(directory);
  const onLoadFile = path.join(directory, 'on-load.ts');
  const onChangeFile = path.join(directory, 'on-change.ts');
  try {
    fs.writeFileSync(onChangeFile, onChange, { flag: 'wx' });
    fs.writeFileSync(onLoadFile, onLoad, { flag: 'wx' });
    const separator = source.length && !source.endsWith('\n') ? '\n' : '';
    fs.appendFileSync(entry, separator + formExport);
  } catch (error) {
    fs.rmSync(onLoadFile, { force: true });
    fs.rmSync(onChangeFile, { force: true });
    fs.rmdirSync(directory);
    throw error;
  }
}

function generate() {
  const [operation, entity, ...args] = process.argv.slice(2);
  if (!['entity', 'form', 'ribbon'].includes(operation) || !entity) throw new Error(usage);

  const requestedForm = args[0]?.startsWith('--') ? undefined : args.shift();
  const [option, field, ...extra] = args;
  if ((operation === 'ribbon' && (requestedForm || args.length)) ||
      (operation === 'form' && !requestedForm) || extra.length ||
      (option !== undefined && (option !== '--field' || !columnPattern.test(field ?? '')))) {
    throw new Error(usage);
  }
  publicName(entity);
  const form = requestedForm ?? 'main';
  if (operation !== 'ribbon') publicName(form);

  const config = readConfig();
  const kind = operation === 'ribbon' ? 'ribbon' : 'forms';
  const entityPath = path.join(entitiesRoot, entity);
  const forms = path.join(entityPath, 'forms');
  const resource = describeWebResource(entity, kind, config);
  if (operation === 'entity') {
    fs.mkdirSync(entitiesRoot, { recursive: true });
    createDirectory(entityPath);
    const services = path.join(entityPath, 'services');
    const serviceFile = path.join(services, `${entity}Service.ts`);
    try {
      fs.mkdirSync(services);
      fs.writeFileSync(serviceFile, renderTemplate('entity-service'), { flag: 'wx' });
      fs.mkdirSync(forms);
      fs.writeFileSync(resource.file, '', { flag: 'wx' });
      addForm(forms, form, field);
    } catch (error) {
      fs.rmSync(resource.file, { force: true });
      if (fs.existsSync(forms)) fs.rmdirSync(forms);
      if (fs.existsSync(services)) {
        fs.rmSync(serviceFile, { force: true });
        fs.rmdirSync(services);
      }
      fs.rmdirSync(entityPath);
      throw error;
    }
    console.log(`Entity service: src/entities/${entity}/services/${entity}Service.ts`);
  } else {
    if (!fs.existsSync(entitiesRoot) || !fs.readdirSync(entitiesRoot).includes(entity) ||
        !fs.statSync(entityPath).isDirectory()) {
      throw new Error(`Entity does not exist: ${entity}. Run npm run generate -- entity ${entity} first.`);
    }
    if (operation === 'form') {
      addForm(forms, form, field);
    } else {
      const directory = path.dirname(resource.file);
      createDirectory(directory);
      try {
        fs.writeFileSync(resource.file, renderTemplate('ribbon'), { flag: 'wx' });
      } catch (error) {
        fs.rmSync(resource.file, { force: true });
        fs.rmdirSync(directory);
        throw error;
      }
    }
  }

  console.log(`Build output: dist/${resource.outputFile}`);
  console.log(`Dataverse web resource: ${resource.outputFile}`);
  console.log(operation === 'ribbon'
    ? `Command handler: ${resource.handlerPath.join('.')}.refreshForm (PrimaryControl)`
    : `OnLoad handler: ${resource.handlerPath.join('.')}.${publicName(form)}.onLoad (Pass execution context)`);
}

try {
  generate();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
