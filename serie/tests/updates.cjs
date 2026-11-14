const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const code = fs.readFileSync(path.join(__dirname, '..', 'updates.js'), 'utf8');
function harness(options = {}) {
  const calls = {reload: 0, check: 0, save: 0, render: 0};
  const events = {window: {}, document: {}, worker: {}, registration: {}};
  const store = new Map(options.restore ? [['serie.pwa.update.restore.v1', JSON.stringify(options.restore)]] : []);
  const head = {querySelectorAll: () => [{tagName:'SCRIPT', getAttribute: x => x === 'src' ? 'app.js?v=4' : null}]};
  let banner = null;
  const document = {
    visibilityState: 'visible',
    head,
    activeElement: {matches: () => !!options.editing, blur: () => {options.editing = false;}},
    querySelector: expression => expression === 'dialog[open]' && options.modal ? {} : null,
    createElement: () => ({
      id: '', innerHTML: '',
      setAttribute() {},
      querySelector: () => ({addEventListener: (event, fn) => {calls.manualClick = fn;}}),
      remove: () => {banner = null;}
    }),
    getElementById: () => banner,
    body: {appendChild: value => {banner = value;}},
    addEventListener: (name, fn) => {events.document[name] = fn;}
  };
  const registration = {
    waiting: null, installing: null,
    update: async () => {calls.check++;},
    addEventListener: (name, fn) => {events.registration[name] = fn;}
  };
  const sw = {
    controller: options.controlled === false ? null : {},
    register: async (url, settings) => {
      calls.register = {url, settings};
      return registration;
    },
    addEventListener: (name, fn) => {events.worker[name] = fn;}
  };
  const ctx = {
    navigator: {serviceWorker: sw}, document,
    location: {protocol: 'https:', reload: () => {calls.reload++;}},
    window: {addEventListener: (name, fn) => {events.window[name] = fn;}},
    sessionStorage: {
      getItem: key => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
      removeItem: key => store.delete(key)
    },
    fetch: async () => ({ok: true, text: async () => options.changed ? 'new' : 'same'}),
    DOMParser: class {
      parseFromString(html) {
        return {head: {querySelectorAll: () => [{tagName: 'SCRIPT', getAttribute: x => x === 'src' ? (html === 'new' ? 'app.js?v=5' : 'app.js?v=4') : null}]}};
      }
    },
    confirm: () => {calls.confirmed = true;return options.confirm !== false;},
    save: () => {calls.save++;return options.save !== false;},
    render: () => {calls.render++;},
    db: {sessions: [{id:'active_1'}]}, tab: 'progress', selectedDate: '2026-11-19',
    sessionId: options.active ? 'active_1' : null,
    restEnd: options.rest ? Date.now() + 100000 : 0,
    setTimeout: fn => fn(), setInterval: fn => {calls.interval = fn;},
    Promise, Date, JSON, setImmediate
  };
  vm.runInNewContext(code, ctx);
  const flush = async () => {for(let i=0;i<6;i++)await Promise.resolve();};
  return {calls,ctx,sw,store,events,flush,document};
}

test('checks for updates and reloads immediately only when idle', async () => {
  const h = harness();
  await h.flush();
  assert.equal(h.calls.register.url, './sw.js');
  assert.equal(h.calls.register.settings.updateViaCache, 'none');
  assert.ok(h.calls.check > 0);
  assert.equal(h.calls.reload, 0);
  h.events.worker.controllerchange();
  assert.equal(h.calls.reload, 1);
  assert.deepEqual(JSON.parse(h.store.get('serie.pwa.update.restore.v1')),
    {tab:'progress',date:'2026-11-19',session:null});
  h.events.worker.controllerchange();
  assert.equal(h.calls.reload, 1, 'never trigger reload loops');
});

test('workout session remains safe and update applies after leaving it', async () => {
  const h = harness({active: true});
  await h.flush();
  h.events.worker.controllerchange();
  assert.equal(h.calls.reload, 0);
  assert.ok(h.document.getElementById('serie-update-banner'));
  h.ctx.sessionId = null;
  h.events.document.click();
  assert.equal(h.calls.reload, 1);
});

test('manual update confirms, saves and preserves current workout', async () => {
  const h = harness({active:true, editing:true});
  await h.flush();
  h.events.worker.controllerchange();
  assert.equal(h.calls.reload, 0);
  h.calls.manualClick();
  assert.equal(h.calls.confirmed, true);
  assert.equal(h.calls.save, 1);
  assert.equal(h.calls.reload, 1);
  assert.equal(JSON.parse(h.store.get('serie.pwa.update.restore.v1')).session, 'active_1');
});

test('never forces reload if saving an active session fails', async () => {
  const h = harness({active:true, save:false});
  await h.flush();
  h.events.worker.controllerchange();
  h.calls.manualClick();
  assert.equal(h.calls.reload, 0);
});

test('detects newer online HTML and ignores initial worker claim', async () => {
  const online = harness({changed:true, controlled:false});
  await online.flush();
  assert.equal(online.calls.reload, 1, 'newer HTML forces a reload even without an older worker');
  const initial = harness({controlled:false});
  await initial.flush();
  initial.events.worker.controllerchange();
  assert.equal(initial.calls.reload, 0, 'freshly installing the first worker does not reload');
});

test('restores last view and date only once after an update', async () => {
  const h = harness({restore:{tab:'settings',date:'2026-11-20',session:'active_1'}});
  await h.flush();
  assert.equal(h.ctx.tab, 'train');
  assert.equal(h.ctx.sessionId, 'active_1');
  assert.equal(h.ctx.selectedDate, '2026-11-20');
  assert.equal(h.calls.render, 1);
  assert.equal(h.store.has('serie.pwa.update.restore.v1'), false);
});

test('does not interrupt notes editing or an open dialog', async () => {
  const h = harness({editing: true, modal: true});
  await h.flush();
  h.events.worker.controllerchange();
  assert.equal(h.calls.reload, 0);
  h.ctx.document.activeElement.matches = () => false;
  h.ctx.document.querySelector = () => null;
  h.calls.interval();
  assert.equal(h.calls.reload, 1);
});
