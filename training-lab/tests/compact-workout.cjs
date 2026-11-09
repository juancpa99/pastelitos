const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g,''),{url:'https://example.test/training-lab/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,doc=w.document,run=s=>vm.runInContext(s,dom.getInternalVMContext());
// Track real observers so teardown cannot notify callbacks after the window is closed.
  const observers = [], NativeObserver = w.MutationObserver;
  w.MutationObserver = class extends NativeObserver {
    constructor(callback) { super(callback); observers.push(this); }
  };
  w.closeTestWindow = () => setImmediate(() => {
    observers.forEach(observer => observer.disconnect());
    w.close();
  });
w.matchMedia=()=>({matches:false,addEventListener(){}});w.ResizeObserver=class{observe(){}};w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
try{
 for(const m of html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g))run(fs.readFileSync(path.join(root,m[1]),'utf8'));
 run(`document.getElementById('selectedDate').value='2026-11-08';state.extraSessions.push({id:'compact_test',date:currentDate(),startedAt:Date.now(),title:'Prueba',exercises:[{key:'bench_press',name:'Press',type:'strength',sets:3,min:8,max:12,rir:'1–2',rest:'2 min',recordedSets:[]},{key:'row',name:'Remo',type:'strength',sets:2,min:8,max:12,rir:'1–2',rest:'2 min',recordedSets:[]}]});editExtraSession('compact_test')`);
 assert.equal(doc.querySelectorAll('.workout-exercise').length,2);
 assert.equal(doc.querySelectorAll('.workout-exercise[open]').length,1);
 run(`addSetAttempt('compact_test',0,'effective')`);
 doc.getElementById('compact_test_kg_0_0').value='22,5';
 doc.getElementById('compact_test_rp_0_0').value='10';
 doc.getElementById('compact_test_rr_0_0').value='2';
 // Opening a picker must save fields even before the autosave timer has fired.
 run(`openExercisePicker('add','compact_test')`);
 assert.equal(run(`scopeExercise('compact_test',0).recordedSets[0].kg`),'22.5');
 assert.ok(doc.querySelectorAll('.library-family').length>0);
 assert.equal(doc.querySelectorAll('.library-family[open]').length,0);
 doc.getElementById('libSearch').value='press';run(`renderLibrary('add','compact_test',null)`);
 assert.ok(doc.querySelectorAll('.library-family[open]').length>0);
 run(`closeExercisePicker('compact_test');completeStrengthSet('compact_test',0,0)`);
 assert.equal(run(`effectiveCount(scopeExercise('compact_test',0))`),1);
 assert.equal(run(`state.restTimer.scope`),'compact_test');
 assert.equal(doc.querySelectorAll('.compact-check.checked').length,1);
 run(`repeatWorkoutSet('compact_test',0)`);
 assert.equal(doc.getElementById('compact_test_kg_0_1').value,'22.5');
 assert.equal(doc.getElementById('compact_test_rr_0_1').value,'');
 run(`toggleWorkoutExercises(document.querySelector('.workout-display-controls button'),false);editExtraSession('compact_test')`);
 assert.equal(doc.querySelectorAll('.workout-exercise[open]').length,0);
 assert.equal(doc.getElementById('compact_test_kg_0_1').value,'22.5');
 run(`toggleWorkoutExercises(document.querySelector('.workout-display-controls button'),true);editExtraSession('compact_test')`);
 assert.equal(doc.querySelectorAll('.workout-exercise[open]').length,2);
 run(`openExercisePicker('add','compact_test');selectLibraryExercise('lat_pulldown','add','compact_test',null)`);
 assert.equal(run(`state.extraSessions.find(s=>s.id==='compact_test').exercises.length`),3);
 const saved=JSON.parse(w.localStorage.getItem('training_lab_v4'));
 assert.equal(saved.extraSessions.find(s=>s.id==='compact_test').exercises[0].recordedSets[0].kg,'22.5');
 // Archived dates must also render after November introduced different plan keys.
 run(`document.getElementById('selectedDate').value='2026-09-07';renderAll()`);
 console.log('PASS: compact registration, decimal save, rest, repeat, folding, picker groups/search/add/cancel, stored records and archived dates');
}finally{w.closeTestWindow()}
