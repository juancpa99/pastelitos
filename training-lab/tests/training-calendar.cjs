const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g,''),{url:'https://example.test/training-lab/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,doc=w.document,ctx=dom.getInternalVMContext(),run=s=>vm.runInContext(s,ctx);
w.matchMedia=()=>({matches:false,addEventListener(){}});w.ResizeObserver=class{observe(){}};w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
for(const m of html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g))run(fs.readFileSync(path.join(root,m[1]),'utf8'));
try {
 for(const date of ['2026-11-02','2026-11-04','2026-11-06']) {
  run(`document.getElementById('selectedDate').value='${date}';showView('Workout')`);
  assert.equal(run(`planFor('${date}').type`),'rest');
  assert.equal(run('trainingChoices().length'),0);
  assert.ok(!doc.querySelector('#viewWorkout [onclick="openTrainingSelector()"]'));
  assert.ok(doc.querySelector('#viewWorkout [onclick="openSwimRegistration()"]'));
  const before=run('JSON.stringify(state.extraSessions)');
  run(`oct26StartWeeklySession('nov26_push')`);
  assert.equal(run('JSON.stringify(state.extraSessions)'),before);
  assert.ok(!doc.querySelector('#viewWorkout [onclick^="oct26StartWeeklySession"]'));
 }
 run(`document.getElementById('selectedDate').value='2026-11-07';showView('Workout')`);
 assert.equal(run('trainingChoices().length'),3);
 assert.match(doc.getElementById('viewWorkout').textContent,/Opcional · 3 pendientes/);
 assert.equal(run(`dayActivities('2026-11-07').filter(a=>a.kind==='Fuerza').length`),0);
 run(`state.extraSessions.push({id:'completed-push',date:'2026-11-03',weeklyTemplateKey:'nov26_push',completed:true,exercises:[]});showView('Workout')`);
 assert.equal(run('trainingChoices().length'),2);
 assert.ok(!run('trainingChoices().map(p=>p.key)').includes('nov26_push'));
 run(`state.extraSessions.push({id:'completed-pull',date:'2026-11-05',weeklyTemplateKey:'nov26_pull',completed:true,exercises:[]},{id:'completed-legs',date:'2026-11-07',weeklyTemplateKey:'nov26_legs',completed:true,exercises:[]});document.getElementById('selectedDate').value='2026-11-08';showView('Workout')`);
 assert.equal(run('trainingChoices().length'),0);
 assert.equal(run(`trainingDoubleSessionAvailable('2026-11-08')`),false);
 assert.match(doc.getElementById('viewWorkout').textContent,/Fuerza completada/);
 assert.ok(!doc.querySelector('#viewWorkout [onclick="openTrainingSelector()"]'));
 assert.equal(run(`oct26WeekOrder('2026-11-10').length`),3);
 // Rendering every view must preserve saved history, including the previous block.
 const saved=run('JSON.stringify(state.extraSessions)');
 for(const date of ['2026-09-22','2026-10-31','2026-11-02','2026-11-03','2026-11-07','2026-11-30'])for(const view of ['Home','Workout','Food','Progress','Settings']) {
  run(`document.getElementById('selectedDate').value='${date}';showView('${view}')`);
  assert.ok(doc.getElementById('view'+view).textContent.trim());
 }
 assert.equal(run('JSON.stringify(state.extraSessions)'),saved);
 console.log('PASS: swimming-only days, optional weekend recovery, weekly deduplication, full-week completion, all views and retained history');
} finally {w.close()}
