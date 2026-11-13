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
const {w,run}=app();
try {
  run("todayISO=()=> '2026-11-16'");
  assert.equal(run("MarevoCoach.programFor(state,'2026-11-13')"),3);
  for(const [date,key] of [['2026-11-16','four_shoulders'],['2026-11-17','four_legs'],['2026-11-19','four_back'],['2026-11-21','four_chest']]) assert.equal(run(`planFor('${date}').key`),key);
  run("document.getElementById('selectedDate').value='2026-11-16';showView('Workout')");
  assert.equal(run('trainingChoices().length'),4);
  assert.ok(w.document.querySelector('[onclick="openSwimRegistration()"]'));
  assert.ok(w.document.querySelector('[onclick="openTrainingSelector()"]'));
  run("oct26StartWeeklySession('four_shoulders')");
  assert.equal(run('state.extraSessions.length'),1);
  assert.equal(run('state.extraSessions[0].exercises.length'),10);
  assert.ok(w.document.querySelector('.coach-prescription'));
  run("oct26StartWeeklySession('four_shoulders')");
  assert.equal(run('state.extraSessions.length'),1);
  const before=run('JSON.stringify(state.extraSessions)');
  run('marevoSetProgram(3)');assert.equal(run('oct26WeekOrder(currentDate()).length'),3);
  assert.equal(run('JSON.stringify(state.extraSessions)'),before);
  run('marevoSetProgram(4)');assert.equal(run('oct26WeekOrder(currentDate()).length'),4);
  assert.equal(run('JSON.stringify(state.extraSessions)'),before);
  assert.equal(run("normalizeState(JSON.parse(storageGet(STORAGE_KEY))).coach.programHistory.at(-1).days"),4);
  run('state.extraSessions[0].completed=true');
  assert.equal(run('coachReport(currentDate()).completed'),1);
  assert.equal(run('coachReport(currentDate()).plannedSessions'),4);
  assert.equal(run('trainingChoices().length'),3);
  assert.equal(run("coachPlans('2026-11-16')[3].exercises[2].name.includes('inclinado')"),true);
  assert.equal(run("coachPlans('2026-11-16')[3].exercises[3].name"),'Press militar');
  assert.notEqual(run("MarevoCoach.identity(coachPlans(currentDate())[0].exercises[0])"),run("MarevoCoach.identity(coachPlans(currentDate())[3].exercises[3])"));
  for(const date of ['2026-11-18','2026-11-20']){run(`document.getElementById('selectedDate').value='${date}'`);assert.equal(run('trainingChoices().length'),0);}
  run("document.getElementById('selectedDate').value='2026-11-22';showView('Workout')");
  assert.ok(!w.document.querySelector('[onclick="marevoStartSunday()"]'));
  const snapshot=run('JSON.stringify(state.extraSessions)');
  for(const date of ['2026-11-14','2026-11-16','2026-12-01','2027-06-01'])for(const view of ['Home','Workout','Progress','Settings'])run(`document.getElementById('selectedDate').value='${date}';showView('${view}')`);
  assert.equal(run('JSON.stringify(state.extraSessions)'),snapshot);
  console.log('PASS four-day schedule, Monday swimming, progression, substitutions, switching, persistence, deduplication, all views and history');
} finally {w.closeTestWindow();}
