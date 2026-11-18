const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { getWebResources } = require('./web-resources.cjs');
const { readConfig } = require('./project-config.cjs');

const dist = path.resolve(__dirname, '../dist');
const resources = getWebResources();
const window = {};

test.before(() => {
  const context = vm.createContext({ window });

  for (const { outputFile } of resources) {
    vm.runInContext(fs.readFileSync(path.join(dist, outputFile), 'utf8'), context, { filename: outputFile });
  }
});

test('build emits one standalone JavaScript file per web resource', () => {
  assert.ok(resources.length > 0);
  const files = fs.readdirSync(dist, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(dist, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'));

  assert.deepEqual(files.sort(), resources.map(({ outputFile }) => outputFile).sort());
});

test('entity bundles share the configured namespace without overwriting each other', () => {
  for (const { name, handlerPath } of resources) {
    const handlers = handlerPath.reduce((parent, key) => parent?.[key], window);
    assert.ok(handlers, handlerPath.join('.'));
    if (name.endsWith('/forms')) {
      for (const [form, api] of Object.entries(handlers)) {
        assert.equal(typeof api.onLoad, 'function', `${handlerPath.join('.')}.${form}.onLoad`);
      }
    }
  }
});

const { publisherPrefix, namespace } = readConfig();
test('generated forms and ribbon use the publisher path and coexist with Account', {
  skip: !resources.some(({ name }) => name === 'sampleOrder/ribbon'),
}, async () => {
  assert.ok(fs.existsSync(path.join(dist, `${publisherPrefix}_/sampleOrder/forms.js`)));
  assert.ok(fs.existsSync(path.join(dist, `${publisherPrefix}_/sampleOrder/ribbon.js`)));
  const { SampleOrder } = window[namespace];
  assert.equal(typeof SampleOrder.Forms.Main.onLoad, 'function');
  assert.equal(typeof SampleOrder.Forms.OrderApproval.onLoad, 'function');
  let loadState = 1;
  const registrations = [];
  const executionContext = {
    getEventArgs: () => ({ getDataLoadState: () => loadState }),
    getFormContext: () => ({
      getAttribute: (column) => ({ addOnChange: (handler) => registrations.push({ column, handler }) }),
    }),
  };
  SampleOrder.Forms.Main.onLoad(executionContext);
  loadState = 2;
  SampleOrder.Forms.Main.onLoad(executionContext);
  SampleOrder.Forms.OrderApproval.onLoad(executionContext);
  assert.equal(registrations.length, 1);
  assert.equal(registrations[0].column, 'name');
  assert.equal(typeof registrations[0].handler, 'function');
  let save;
  await SampleOrder.Ribbon.refreshForm({ data: { refresh: async (value) => { save = value; } } });
  assert.equal(save, false);
  assert.equal(typeof window[namespace].Account.Forms.Main.onLoad, 'function');
});

test('the Account example shows and clears a warning', {
  skip: !resources.some(({ name }) => name === 'account/forms'),
}, () => {
  assert.ok(fs.existsSync(path.join(dist, `${publisherPrefix}_/account/forms.js`)));
  const { onLoad } = window[namespace].Account.Forms.Main;
  assert.equal(typeof window[namespace].Account.Forms.QuickCreate.onLoad, 'function');
  let description = 'a'.repeat(251);
  let dataLoadState = 1;
  const changeHandlers = [];
  const attribute = {
    getValue: () => description,
    addOnChange: (handler) => changeHandlers.push(handler),
  };
  const notifications = new Map();
  const executionContext = {
    getEventArgs: () => ({ getDataLoadState: () => dataLoadState }),
    getFormContext: () => ({
      getAttribute: (name) => name === 'description' ? attribute : null,
      ui: {
        setFormNotification: (message, level, id) => notifications.set(id, level),
        clearFormNotification: (id) => notifications.delete(id),
      },
    }),
  };

  onLoad(executionContext);
  assert.equal(changeHandlers.length, 1);
  assert.equal(notifications.get('crm_account_description_warning'), 'WARNING');
  description = 'Short description';
  changeHandlers[0](executionContext);
  assert.equal(notifications.size, 0);

  for (const state of [2, 3]) {
    dataLoadState = state;
    onLoad(executionContext);
    assert.equal(changeHandlers.length, 1);
  }
});
