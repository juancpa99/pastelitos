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
 run("document.getElementById('selectedDate').value='2026-11-16';oct26StartWeeklySession('four_shoulders')");
 const scope=run('state.extraSessions.at(-1).id');
 run(`state.extraSessions.at(-1).exercises[0].recordedSets=[{kg:20,reps:8,rir:2,completedAt:123,attemptType:'effective'},{kg:'',reps:'',rir:'',attemptType:'effective'}];state.restTimer={scope:'${scope}',exerciseIndex:0,attemptIndex:0,endAt:9999999999999};editExtraSession('${scope}')`);
 const original=run('state.extraSessions.at(-1).exercises.map(e=>e.key)');
 const input=w.document.getElementById(scope+'_kg_0_1');input.value='22,5';
 assert.equal(run(`moveSessionExercise('${scope}',0,2)`),true);
 assert.equal(run('state.extraSessions.at(-1).exercises[2].key'),original[0]);
 assert.equal(run('state.extraSessions.at(-1).exercises[2].recordedSets[0].completedAt'),123);
 assert.equal(run('state.extraSessions.at(-1).exercises[2].recordedSets[1].kg'),'22.5');
 assert.equal(run('state.restTimer.exerciseIndex'),2);
 assert.equal(run('JSON.parse(storageGet(STORAGE_KEY)).extraSessions.at(-1).exercises[2].key'),original[0]);
 // Keyboard order changes use the same persistence path.
 let handle=w.document.querySelector('[data-order-index="2"] .exercise-drag-handle');
 handle.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));
 assert.equal(run('state.extraSessions.at(-1).exercises[1].key'),original[0]);
 assert.equal(run('state.restTimer.exerciseIndex'),1);
 function geometry(){const rows=[...w.document.querySelectorAll('#modalRoot [data-order-index]')];rows.forEach((r,i)=>r.getBoundingClientRect=()=>({top:i*100,bottom:i*100+100,height:100}));w.document.querySelector('#modalRoot .sheet').getBoundingClientRect=()=>({top:0,bottom:1000});return rows;}
 function pointer(target,type,y){const ev=new w.Event(type,{bubbles:true,cancelable:true});Object.assign(ev,{pointerId:7,button:0,isPrimary:true,clientY:y});target.dispatchEvent(ev);}
 let rows=geometry();handle=rows[1].querySelector('.exercise-drag-handle');const before=run('JSON.stringify(state.extraSessions)');
 pointer(handle,'pointerdown',150);pointer(handle,'pointermove',450);pointer(handle,'pointercancel',450);
 assert.equal(run('JSON.stringify(state.extraSessions)'),before);
 assert.ok(!w.document.querySelector('.is-reordering'));
 rows=geometry();handle=rows[1].querySelector('.exercise-drag-handle');
 pointer(handle,'pointerdown',150);pointer(handle,'pointermove',450);pointer(handle,'pointerup',450);
 assert.equal(run('state.extraSessions.at(-1).exercises[4].key'),original[0]);
 assert.equal(run('state.restTimer.exerciseIndex'),4);
 run('state.extraSessions.at(-1).completed=true');
 assert.equal(run(`moveSessionExercise('${scope}',0,1)`),false);
 run(`editExtraSession('${scope}')`);assert.equal(w.document.querySelectorAll('.exercise-drag-handle').length,0);
 // Planned PPL sessions have the same handles and retain their own exercise objects.
 run("state.coach={programHistory:[{date:'2026-11-14',days:3}]};document.getElementById('selectedDate').value='2026-11-17';marevoChooseCompany('nov26_push','acompaniado')");
 w.document.getElementById('watchReady')?.click();
 const first=run("findSession('2026-11-17','nov26_push').exercises[0].key");
 assert.equal(run("moveSessionExercise('planned',0,1)"),true);
 assert.equal(run("findSession('2026-11-17','nov26_push').exercises[1].key"),first);
 assert.ok(w.document.querySelector('#workoutWorkspace .exercise-drag-handle'));
 assert.equal(run("moveSessionExercise('planned',-1,0)"),false);
 console.log('PASS touch drag/drop, cancellation, keyboard, input preservation, rest timer, persistence, planned/extra sessions and locked history');
} finally {w.closeTestWindow();}
