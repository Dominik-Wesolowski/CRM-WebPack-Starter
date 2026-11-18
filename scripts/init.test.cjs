const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

test('init rejects invalid prefixes and protects an initialized project', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'crm-template-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts'));
  for (const file of ['scripts/init.cjs', 'scripts/project-config.cjs', 'package.json', 'package-lock.json']) {
    fs.copyFileSync(path.resolve(__dirname, '..', file), path.join(root, file));
  }
  const init = (...options) => spawnSync(process.execPath, ['scripts/init.cjs', ...options], { cwd: root, encoding: 'utf8' });
  const config = path.join(root, 'crm.config.json');
  for (const prefix of ['a', '1test', 'test_', 'mscrmx', 'longprefix']) {
    const result = init('test-project', prefix, 'TestProject');
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /Publisher prefix/);
    assert.equal(fs.existsSync(config), false);
  }

  const result = init('test-project', 'test', 'TestProject');
  assert.equal(result.status, 0, result.stderr);
  const saved = fs.readFileSync(config, 'utf8');
  assert.deepEqual(JSON.parse(saved), { projectName: 'test-project', publisherPrefix: 'test', namespace: 'TestProject' });
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  assert.equal(manifest.name, 'test-project');
  assert.equal(lock.name, manifest.name);
  assert.equal(lock.packages[''].name, manifest.name);
  assert.match(init('other-project', 'other', 'OtherProject').stderr, /already initialized/);
  assert.equal(fs.readFileSync(config, 'utf8'), saved);
});
