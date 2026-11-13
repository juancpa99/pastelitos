const { JSDOM } = require("jsdom"),
  fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm"),
  assert = require("node:assert/strict");
const root = path.join(__dirname, ".."),
  html = fs.readFileSync(path.join(root, "index.html"), "utf8");
function app(snapshot) {
  const dom = new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g, ""), {
      url: "https://example.test/training-lab/",
      runScripts: "outside-only",
      pretendToBeVisual: true,
    }),
    w = dom.window,
    ctx = dom.getInternalVMContext(),
    run = (s) => vm.runInContext(s, ctx);
// Track real observers so teardown cannot notify callbacks after the window is closed.
  const observers = [], NativeObserver = w.MutationObserver;
  w.MutationObserver = class extends NativeObserver {
    constructor(callback) { super(callback); observers.push(this); }
  };
  w.closeTestWindow = () => setImmediate(() => {
    observers.forEach(observer => observer.disconnect());
    w.close();
  });
  w.matchMedia = () => ({ matches: false, addEventListener() {} });
  w.ResizeObserver = class {
    observe() {}
  };
  w.structuredClone = structuredClone;
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  if (snapshot) w.localStorage.setItem("trainingLab_v5", snapshot);
  for (const m of html.matchAll(
    /<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g,
  ))
    run(fs.readFileSync(path.join(root, m[1]), "utf8"));
  return { dom, w, run };
}
const { dom, w, run } = app();
run("state.coach={programHistory:[{date:'2026-11-14',days:3}]}");
let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log("PASS", name);
}
try {
  check(
    "all views render without mutating history at year and cycle transitions",
    () => {
      const before = run(
        "JSON.stringify([state.sessions,state.extraSessions])",
      );
      for (const d of [
        "2026-11-29",
        "2026-11-30",
        "2026-12-01",
        "2027-01-01",
        "2027-05-30",
        "2027-05-31",
        "2028-01-04",
      ])
        for (const v of ["Home", "Workout", "Progress", "Settings"]) {
          run(
            `document.getElementById('selectedDate').value='${d}';showView('${v}')`,
          );
          assert.ok(w.document.getElementById("view" + v).textContent.trim());
        }
      assert.equal(
        run("JSON.stringify([state.sessions,state.extraSessions])"),
        before,
      );
    },
  );
  check("new cycle keeps three PPL and no gym on swim days", () => {
    assert.equal(run("oct26WeekOrder('2027-06-01').length"), 3);
    run("document.getElementById('selectedDate').value='2026-11-30'");
    assert.equal(run("trainingChoices().length"), 0);
    assert.equal(run("planFor('2026-12-01').key"), "nov26_push");
    assert.equal(run("planFor('2026-12-05').key"), "nov26_legs");
  });
  check(
    "holiday can advance PPL; companion keeps base only and weekly dedup works",
    () => {
      run(
        "marevoSetNoSwimDay();marevoChooseCompany('nov26_push','acompaniado')",
      );
      const s = run("state.extraSessions.at(-1)");
      assert.equal(s.marevoCompanionMode, "acompaniado");
      assert.equal(s.exercises.length, 6);
      assert.ok(!s.exercises.some((e) => e.marevoFlexTarget));
      run(
        "state.extraSessions.at(-1).completed=true;document.getElementById('selectedDate').value='2026-12-01'",
      );
      assert.equal(run("trainingChoices().length"), 2);
      assert.equal(run("planFor('2026-12-01').type"), "rest");
    },
  );
  check("solo session receives pending extras and prescription", () => {
    run(
      "document.getElementById('selectedDate').value='2026-12-03';marevoChooseCompany('nov26_pull','solo')",
    );
    const s = run("state.extraSessions.at(-1)");
    assert.equal(s.marevoCompanionMode, "solo");
    assert.ok(s.exercises.some((e) => e.marevoFlexTarget === "chest"));
    assert.ok(w.document.querySelector(".coach-prescription"));
  });
  check(
    "completed extra work outside rep range is credited; Sunday does not duplicate core",
    () => {
      run(
        `state.extraSessions.at(-1).exercises.filter(e=>e.marevoFlexTarget).forEach(e=>e.recordedSets=Array.from({length:e.sets},()=>({kg:10,reps:5,rir:2,attemptType:'effective',completedAt:1})));state.extraSessions.at(-1).completed=true;document.getElementById('selectedDate').value='2026-12-06';marevoStartSunday()`,
      );
      const s = run("state.extraSessions.at(-1)");
      assert.ok(s.marevoSunday);
      assert.ok(!s.exercises.some((e) => e.marevoFlexTarget === "chest"));
      assert.ok(!s.exercises.some((e) => e.marevoFlexTarget === "core"));
    },
  );
  check("accepted adjustment applies only to new solo session once", () => {
    run(
      `state.coach={version:1,decisions:[{action:'accepted',at:'2026-12-06',proposal:{id:'test-add',delta:1,exerciseKey:'incline_db_press',expires:'2026-12-13'},placement:{date:'2026-12-08',status:'scheduled'}}]}`,
    );
    assert.equal(
      run(
        "coachApplyChanges(coachBasePlans()[0].exercises,'2026-12-08','acompaniado')[1].sets",
      ),
      4,
    );
    assert.equal(
      run(
        "(()=>{const exercises=coachApplyChanges(coachBasePlans()[0].exercises,'2026-12-08','solo');coachRecordApplied({exercises});return exercises[1].sets})()",
      ),
      5,
    );
    assert.equal(
      run(
        "coachApplyChanges(coachBasePlans()[0].exercises,'2026-12-08','solo')[1].sets",
      ),
      4,
    );
    assert.equal(run("coachLog().at(-1).action"), "applied");
  });
  check("rejected deload never changes planned sets", () => {
    run(
      "state.coach.decisions=[{action:'rejected',proposal:{id:'deload',delta:-1,exerciseKey:'incline_db_press',expires:'2026-12-13'},placement:{date:'2026-12-08'}}]",
    );
    assert.equal(
      run(
        "coachApplyChanges(coachBasePlans()[0].exercises,'2026-12-08','solo')[1].sets",
      ),
      4,
    );
  });
  check(
    "persisted state and normalisation retain decisions and historical records",
    () => {
      run("saveState(true)");
      const before = run("JSON.stringify(state)");
      assert.equal(
        run(
          "JSON.stringify(normalizeState(JSON.parse(storageGet(STORAGE_KEY))))",
        ),
        before,
      );
      assert.equal(
        run(
          "JSON.stringify(normalizeState(JSON.parse(JSON.stringify(state))).coach)",
        ),
        run("JSON.stringify(state.coach)"),
      );
    },
  );
  check("all script/css references are in service worker and exist", () => {
    const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
    for (const m of html.matchAll(
      /(?:src|href)="([^"?#]+\.(?:js|css))(\?[^\"]*)?"/g,
    )) {
      assert.ok(fs.existsSync(path.join(root, m[1])), m[1]);
      assert.ok(sw.includes(m[1] + (m[2] || "")), m[1] + " missing cache");
    }
    assert.ok(sw.includes("./docs/adaptive-coach.md"));
    assert.ok(!sw.includes("localStorage.clear"));
  });
  check("post-session summary records outcome and preserves all sets", () => {
    run(
      "state.coach.decisions=[{action:'applied',at:'2026-12-01',proposal:{id:'outcome-test',reason:'Test'},placement:{date:'2026-12-06'}}];state.extraSessions.at(-1).exercises.find(e=>e.type==='strength').coachDecisionId='outcome-test'",
    );
    const before = run("JSON.stringify(state.extraSessions)");
    run("coachAfterSession(state.extraSessions.at(-1))");
    assert.match(
      w.document.getElementById("modalRoot").textContent,
      /Lo que has hecho hoy/,
    );
    assert.equal(run("coachLog().at(-1).action"), "outcome");
    assert.equal(run("JSON.stringify(state.extraSessions)"), before);
  });
  console.log(`${passed} integration scenarios passed`);
} finally {
  w.closeTestWindow();
}
