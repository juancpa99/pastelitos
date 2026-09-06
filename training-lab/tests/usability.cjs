const { JSDOM } = require("jsdom"),
  fs = require("fs"),
  assert = require("node:assert/strict");
const root = require("node:path").join(__dirname, "../");
const dom = new JSDOM(
  fs
    .readFileSync(root + "index.html", "utf8")
    .replace(/<script[^>]*src=[^>]*><\/script>/g, ""),
  {
    url: "https://example.test/training-lab/",
    runScripts: "outside-only",
    pretendToBeVisual: true,
  },
);
const w = dom.window;
w.matchMedia = () => ({ matches: false, addEventListener() {} });
w.scrollTo = () => {};
w.structuredClone = structuredClone;
w.ResizeObserver = class {
  observe() {}
};
const vm = require("node:vm"),
  ctx = dom.getInternalVMContext();
const run = (s) => vm.runInContext(s, ctx);
// Load every production module in the same order as the page.
for (const match of fs.readFileSync(root + "index.html", "utf8").matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g)) {
  run(fs.readFileSync(root + match[1], "utf8"));
}
run(
  `document.getElementById('selectedDate').value='2026-09-07';renderAll();showView('Workout');state.extraSessions.push({id:'test',date:currentDate(),startedAt:Date.now(),exercises:[{key:'one_row',name:'Remo unilateral',sets:2,min:8,max:12,rir:'1–2',rest:'2 min',type:'strength',loadProfile:{mode:'dumbbell',base:'',machine:'Banco 1',unilateral:true},recordedSets:[{kg:'10',reps:'10',rir:'2',rightKg:'10',rightReps:'9',rightRir:'2',attemptType:'effective'}]}]});editExtraSession('test');`,
);
run(`completeSide('test',0,0,'left')`);
assert.equal(
  run(
    `effectiveCount(state.extraSessions.find(s=>s.id==='test').exercises[0])`,
  ),
  0,
);
run(`completeSide('test',0,0,'right')`);
assert.equal(
  run(
    `effectiveCount(state.extraSessions.find(s=>s.id==='test').exercises[0])`,
  ),
  1,
);
assert.equal(run(`state.restTimer.scope`), "test");
run(`closeModal();saveScopeInputs('test')`);
assert.equal(
  run(
    `state.extraSessions.find(s=>s.id==='test').exercises[0].recordedSets[0].rightReps`,
  ),
  "9",
);
assert.equal(
  run(`nominalLoad({loadProfile:{mode:'sideplates',base:'20'}},'15')`),
  50,
);
assert.equal(
  run(
    `classifyAttempt({min:8,max:12,rir:'1–2'},{reps:'7',rir:'0',attemptType:'effective'}).status`,
  ),
  "effective",
);
run(`editExtraSession('test');toggleExtraPause('test')`);
assert.equal(run(`state.restTimer.paused`), true);
const elapsed = run(
  `sessionElapsedSeconds(state.extraSessions.find(s=>s.id==='test'))`,
);
run(`toggleExtraPause('test')`);
assert.equal(run(`state.restTimer.paused`), false);
assert.equal(
  run(`sessionElapsedSeconds(state.extraSessions.find(s=>s.id==='test'))`),
  elapsed,
);
run(`addSetAttempt('test',0,'effective');copySet('test',0,1,'previous')`);
assert.equal(
  run(
    `state.extraSessions.find(s=>s.id==='test').exercises[0].recordedSets[1].kg`,
  ),
  "10",
);
assert.equal(
  run(
    `state.extraSessions.find(s=>s.id==='test').exercises[0].recordedSets[1].rir`,
  ),
  "",
);
run(`saveState(true)`);
assert.equal(
  JSON.parse(w.localStorage.getItem("training_lab_v4")).extraSessions.find(
    (s) => s.id === "test",
  ).exercises[0].recordedSets[0].rightReps,
  "9",
);
assert.equal(run(`validSet({kg:'-1',reps:'10',rir:'2'})`), false);
assert.equal(run(`validSet({kg:'0',reps:'10',rir:'0'})`), true);
assert.equal(run(`validSet({kg:'10',reps:'2.5',rir:'2'})`), false);
run(`closeModal();startGym()`);
assert.match(w.document.getElementById("modalRoot").textContent, /smartwatch/);
assert.equal(run(`normalizePlannedSession().startedAt`), null);
w.document.getElementById("watchReady").click();
assert.ok(run(`normalizePlannedSession().startedAt`));
assert.equal(run(`pendingWorkouts().length`),0);
run(`document.getElementById('selectedDate').value='2026-09-13';renderAll();openPendingWorkouts()`);
assert.ok(run(`pendingWorkouts().every(x=>x.date>='2026-09-07'&&x.date<'2026-09-13')`));
assert.match(
  w.document.getElementById("modalRoot").textContent,
  /no realizado/,
);
run(`recoverWorkout(0)`);
w.document.getElementById("watchReady").click();
assert.ok(
  run(`state.extraSessions.some(s=>s.sourceDate&&s.date===currentDate())`),
);
run(
  `const testExercise={key:'progress_test',name:'Press',type:'strength',sets:2,min:8,max:12,rir:'1–2',loadProfile:{mode:'total',base:'',machine:'M1',unilateral:false},recordedSets:[]};for(const date of ['2026-09-01','2026-09-03'])state.sessions.push({date,completed:true,exercises:[{...structuredClone(testExercise),recordedSets:[{kg:'20',reps:'12',rir:'2',completedAt:1,attemptType:'effective'},{kg:'20',reps:'12',rir:'2',completedAt:2,attemptType:'effective'}]}]})`,
);
assert.match(run(`exerciseAdvice(testExercise)`), /Dos sesiones/);
assert.match(
  run(
    `exerciseAdvice({...testExercise,loadProfile:{...testExercise.loadProfile,machine:'M2'}})`,
  ),
  /Primera referencia/,
);
assert.match(
  run(`exerciseAdvice({...testExercise,min:6,max:8})`),
  /Primera referencia/,
);
assert.equal(
  run(`loadProfile({name:'Press con mancuernas'}).mode`),
  "dumbbell",
);
assert.equal(
  run(
    `effectiveCount({loadProfile:{unilateral:true},recordedSets:[{completedAt:1,rightCompletedAt:1,reps:'10',rightReps:'10',attemptType:'effective'}]})`,
  ),
  1,
);
assert.equal(run(`strengthChartGroups('2026-09-13').find(g=>g.exercise.key==='progress_test').points.length`),2);
assert.match(run(`strengthProgressHTML('2026-09-13')`),/strengthExercise/);
assert.doesNotMatch(run(`strengthProgressHTML('2026-09-13')`),/<svg/);
assert.match(run(`strengthProgressHTML('2026-09-13')`),/<details class="strength-region"/);
assert.doesNotMatch(run(`strengthProgressHTML('2026-09-13')`),/<details open/);
assert.match(run(`strengthEvolutionSVG([{date:'2026-09-01',left:0,right:0}],true)`),/Derecha/);
assert.doesNotMatch(run(`strengthEvolutionSVG([{date:'2026-09-01',left:0,right:0}],true)`),/NaN|Infinity/);
run(`setStrengthChartRange('28')`);
assert.equal(run(`state.settings.strengthChartRange`),'28');
run(`activeStrengthChartKey=null;renderProgress()`);
assert.ok(w.document.querySelector('.strength-muscle-group'));
assert.equal(w.document.querySelectorAll('.strength-muscle-group[open]').length,0);
assert.equal(w.document.querySelector('select#strengthExercise'),null);
assert.ok(w.document.querySelector('.strength-region'));
assert.equal(w.document.querySelectorAll('.strength-inline-chart').length,0);
run(`setStrengthChartExercise(0)`);
assert.equal(w.document.querySelectorAll('.strength-inline-chart').length,1);
const chart=w.document.querySelector('.strength-inline-chart');
assert.ok(chart.previousElementSibling.matches('.strength-exercise-choice[aria-expanded="true"]'));
assert.ok(chart.closest('.strength-region[open]'));
run(`setStrengthChartRange('all')`);
assert.equal(w.document.querySelectorAll('.strength-inline-chart').length,1);
run(`setStrengthChartExercise(0)`);
assert.equal(w.document.querySelectorAll('.strength-inline-chart').length,0);
assert.ok(run(`typeof buildSep26Report==='function' && typeof enforceChronologicalWorkoutOrder==='function'`));
run(`state.settings.mode='season';document.getElementById('selectedDate').value='2026-09-09';renderAll();showView('Workout')`);
assert.equal(run(`planFor(currentDate()).type`),'swim');
assert.ok(w.document.querySelector('.season-complement-card'));
assert.ok(w.document.querySelector('.pending-workout-card'));
run(`showView('Settings')`);
assert.equal(w.document.body.dataset.view,'Settings');
run(`showView('Food')`);
assert.equal(w.document.body.dataset.view,'Food');
console.log(
  "PASS: bilateral/unilateral accounting, rest, persistence, copy, nominal load, validation, smartwatch and recovery",
);
setTimeout(() => {
  w.close();
  process.exit(0);
}, 0);
