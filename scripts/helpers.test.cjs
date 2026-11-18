const assert = require('node:assert/strict');
const test = require('node:test');
const { QueryHelper } = require('../src/common/QueryHelper.ts');
const { EnvironmentVariableHelper } = require('../src/common/EnvironmentVariableHelper.ts');
const { Helper } = require('../src/common/Helper.ts');
const { NavigationHelper } = require('../src/common/NavigationHelper.ts');
const { NotificationHelper } = require('../src/common/NotificationHelper.ts');
const { SubgridHelper } = require('../src/common/SubgridHelper.ts');
const { BpfHelper } = require('../src/common/BpfHelper.ts');
const { ValidationHelper } = require('../src/common/ValidationHelper.ts');

function useXrm(t, api) {
  globalThis.Xrm = api;
  t.after(() => { delete globalThis.Xrm; });
}

test('query options encode values and preserve the next page token', async (t) => {
  const filter = QueryHelper.filterEquals('name', "O'Brien & Sons");
  assert.equal(new URLSearchParams(QueryHelper.build({ filter, top: 2 })).get('$filter'), "name eq 'O''Brien & Sons'");
  assert.equal(QueryHelper.build({ top: 0 }), '?$top=0');
  for (const top of [-1, 2.5, NaN, Infinity]) assert.throws(() => QueryHelper.build({ top }), RangeError);

  const nextLink = 'https://org.example/api/data/v9.2/accounts?$skiptoken=%253Ccookie%253E';
  const calls = [];
  useXrm(t, { WebApi: {
    retrieveRecord: (...args) => { calls.push(args); return { name: 'Example' }; },
    retrieveMultipleRecords: (...args) => { calls.push(args); return { entities: [], nextLink }; },
  } });
  await QueryHelper.retrieve('account', '{example-id}', { select: ['name'], top: 2 });
  const page = await QueryHelper.retrieveMultiple('account', { select: ['name'] }, 20);
  await QueryHelper.retrieveNextPage('account', page.nextLink, 20);
  assert.deepEqual(calls, [
    ['account', 'example-id', '?$select=name'],
    ['account', '?$select=name', 20],
    ['account', '?$skiptoken=%253Ccookie%253E', 20],
  ]);
  await assert.rejects(QueryHelper.retrieveNextPage('account', 'invalid'), /paging query/);
});

test('environment variable reads share requests, clear the cache and retry failures', async (t) => {
  let calls = 0;
  let value = ' ';
  let fail = false;
  useXrm(t, { WebApi: { online: { execute: async (request) => {
    calls += 1;
    assert.equal(request.DefinitionSchemaName, 'example_setting');
    assert.equal(request.getMetadata().operationName, 'RetrieveEnvironmentVariableValue');
    if (fail) throw new Error('Read failed');
    return { ok: true, json: async () => ({ Value: value }) };
  } } } });
  t.after(() => EnvironmentVariableHelper.clearCache());
  const name = 'example_setting';
  assert.deepEqual(await Promise.all([
    EnvironmentVariableHelper.getNumberValue(name),
    EnvironmentVariableHelper.getBooleanValue(name),
  ]), [null, null]);
  assert.equal(calls, 1);

  EnvironmentVariableHelper.clearCache(name);
  fail = true;
  await assert.rejects(EnvironmentVariableHelper.getValue(name), /Read failed/);
  fail = false;
  value = 'Infinity';
  await assert.rejects(EnvironmentVariableHelper.getNumberValue(name), /valid number/);
  assert.equal(calls, 3);

  EnvironmentVariableHelper.clearCache(name);
  value = '0';
  assert.equal(await EnvironmentVariableHelper.getNumberValue(name), 0);
});

test('setting a lookup only writes and fires OnChange when the referenced record changes', () => {
  let current = [{ id: '{ABCDE}', entityType: 'account', name: 'Example' }];
  let changed = 0;
  const form = { getAttribute: () => ({
    getValue: () => current,
    setValue: (value) => { current = value; },
    fireOnChange: () => { changed += 1; },
  }) };
  assert.equal(Helper.setLookup(form, 'customerid', { id: 'abcde', entityType: 'account' }, true), false);
  assert.equal(Helper.setLookup(form, 'customerid', { id: 'abcde', entityType: 'contact' }, true), true);
  assert.equal(changed, 1);
  assert.equal(current[0].entityType, 'contact');
});

test('grid and control helpers accept only supported operations', () => {
  const control = { getControl: () => ({}) };
  assert.equal(SubgridHelper.getTotalRecordCount(control, 'example'), null);
  assert.equal(NotificationHelper.setControl(control, 'example', 'Warning', 'example'), false);
  assert.equal(NotificationHelper.clearControl(control, 'example', 'example'), false);

  const registrations = new Set();
  const grid = { getControl: () => ({
    getGrid: () => ({ getTotalRecordCount: () => 8 }),
    addOnLoad: (handler) => registrations.add(handler),
    removeOnLoad: (handler) => registrations.delete(handler),
  }) };
  const handler = () => {};
  assert.equal(SubgridHelper.getTotalRecordCount(grid, 'example'), 8);
  assert.equal(SubgridHelper.addOnLoad(grid, 'example', handler), true);
  assert.ok(registrations.has(handler));
  assert.equal(SubgridHelper.removeOnLoad(grid, 'example', handler), true);
  assert.equal(registrations.size, 0);
});

test('navigation and process helpers preserve results exposed by the Client API', async (t) => {
  const reference = { id: 'example-id', entityType: 'account', name: 'Example' };
  useXrm(t, { Navigation: { openForm: async (options) => {
    assert.equal(options.useQuickCreateForm, true);
    return { savedEntityReference: [reference] };
  } } });
  assert.deepEqual(await NavigationHelper.openQuickCreate('account'), [reference]);

  const form = { data: { process: { moveNext: (callback) => callback('stageGate') } } };
  assert.equal(await BpfHelper.moveNext(form), 'stageGate');
});

test('phone validation requires digits and an empty value meets a zero minimum', () => {
  assert.equal(ValidationHelper.isPhoneLikelyValid('+++++++'), false);
  assert.equal(ValidationHelper.isPhoneLikelyValid('+48 123 456 789'), true);
  assert.equal(ValidationHelper.minLengthNotMet('', 0), false);
  assert.equal(ValidationHelper.minLengthNotMet(' ', 1), true);
});
