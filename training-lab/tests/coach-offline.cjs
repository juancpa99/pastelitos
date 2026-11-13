const test = require("node:test"),
  assert = require("node:assert/strict"),
  vm = require("node:vm"),
  fs = require("node:fs"),
  path = require("node:path");
test("service worker installs all assets and serves engine and page offline without deleting recovery data", async () => {
  const events = {},
    stores = new Map([
      ["marevo-delivered-notifications-v1", new Map()],
      ["training-lab-pages-old", new Map()],
    ]),
    removed = [];
  const caches = {
    open: async (k) => {
      if (!stores.has(k)) stores.set(k, new Map());
      const m = stores.get(k);
      return {
        addAll: async (assets) => {
          for (const a of assets) {
            const file =
              a === "./" ? "index.html" : a.replace(/^\.\//, "").split("?")[0];
            assert.ok(fs.existsSync(path.join(__dirname, "..", file)), a);
            m.set(a, fs.readFileSync(path.join(__dirname, "..", file), "utf8"));
          }
        },
        put: async (k, v) => m.set(k, v),
        match: async (k) => m.get(typeof k === "string" ? k : k.url),
        keys: async () => [...m.keys()],
      };
    },
    keys: async () => [...stores.keys()],
    delete: async (k) => {
      removed.push(k);
      return stores.delete(k);
    },
    match: async (k) => {
      for (const m of stores.values()) {
        const v = m.get(typeof k === "string" ? k : k.url);
        if (v) return v;
      }
    },
  };
  const ctx = {
    self: {
      addEventListener: (n, f) => (events[n] = f),
      skipWaiting() {},
      clients: { claim: async () => {} },
      registration: { scope: "https://example.test/" },
    },
    caches,
    fetch: async () => {
      throw Error("offline");
    },
    URL,
    Request,
    Response,
    Promise,
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(__dirname, "../sw.js"), "utf8"),
    ctx,
  );
  let work;
  events.install({ waitUntil: (p) => (work = p) });
  await work;
  events.activate({ waitUntil: (p) => (work = p) });
  await work;
  assert.deepEqual(removed, ["training-lab-pages-old"]);
  assert.ok(stores.has("marevo-delivered-notifications-v1"));
  let response;
  events.fetch({
    request: { method: "GET", mode: "navigate" },
    respondWith: (p) => (response = p),
  });
  assert.match(await response, /coach-engine/);
  for (const url of [
    "./coach-engine.js?v=801",
    "./coach-ui.js?v=801",
    "./coach-planner.js?v=800",
    "./coach.css?v=800",
    "./four-day-program.js?v=801",
  ]) {
    events.fetch({
      request: { method: "GET", url },
      respondWith: (p) => (response = p),
    });
    assert.ok((await response).length > 100);
  }
});
