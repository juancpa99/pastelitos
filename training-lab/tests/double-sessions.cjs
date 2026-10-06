const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function boot(saved){
 const dom=new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g,''),{url:'https://example.test/training-lab/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,doc=w.document,run=code=>vm.runInContext(code,dom.getInternalVMContext());
 w.matchMedia=()=>({matches:false,addEventListener(){}});w.ResizeObserver=class{observe(){}};w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 if(saved)w.localStorage.setItem('training_lab_v4',saved);
 for(const m of html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g))run(fs.readFileSync(path.join(root,m[1]),'utf8'));
 return {dom,doc,run};
}
for(const date of ['2026-10-06','2026-10-08','2026-10-10','2026-10-11']){
 const {dom,doc,run}=boot();
 try{
  run(`document.getElementById('selectedDate').value='${date}';showView('Workout');renderAll()`);
  assert.ok(!doc.querySelector('#viewWorkout [onclick="openSwimRegistration()"]'),`${date}: no swimming choice`);
  assert.ok(!run(`dayActivities(currentDate()).some(a=>a.kind==='Natación')`),`${date}: no swimming reminder`);
  assert.ok(doc.querySelector('#viewHome .home-training-cta'),`${date}: registration accessible from Today`);
  const firstKey=run(`planFor(currentDate()).type==='gym'?planFor(currentDate()).key:'oct26_push'`);
  run(`oct26StartWeeklySession('${firstKey}')`);
  doc.getElementById('watchReady')?.click();
  const firstId=run(`trainingStrengthRecords(currentDate())[0].id||null`);
  if(firstId){
   run(`openFinishExtra('${firstId}')`);doc.getElementById('exRPE').value='6';run(`finishExtra('${firstId}')`);
  }else run(`commitGymFinish({duration:45,rpe:6,kcal:null})`);
  run(`renderAll();showView('Home')`);
  assert.match(doc.querySelector('.home-training-cta').textContent,/Registrar segunda sesión/);
  run(`showView('Workout')`);
  assert.match(doc.querySelector('.training-mode-choice').textContent,/Iniciar segunda sesión/);
  const before=run(`JSON.stringify(trainingStrengthRecords(currentDate())[0])`);
  run(`openTrainingSelector()`);
  const secondIndex=run(`trainingChoices().findIndex(p=>p.key==='oct26_pull')`);
  assert.ok(doc.querySelectorAll('.training-choice')[secondIndex]);
  run(`chooseTraining(${secondIndex})`);
  const secondId=run(`state.extraSessions.find(s=>s.date===currentDate()&&s.weeklyTemplateKey==='oct26_pull').id`);
  run(`openFinishExtra('${secondId}')`);doc.getElementById('exDur').value='35';doc.getElementById('exRPE').value='7';run(`finishExtra('${secondId}')`);
  assert.equal(run(`JSON.stringify(trainingStrengthRecords(currentDate())[0])`),before,'second session does not overwrite first');
  assert.equal(run(`trainingStrengthRecords(currentDate()).filter(s=>s.completed).length`),2);
  assert.equal(run(`homeWeekSnapshot(currentDate()).strength`),2);
  assert.equal(run(`oct26CompletedSessions(currentDate()).length`),2,'both sessions appear in the report');
  assert.equal(doc.querySelectorAll('.home-progress-dots').length,0);
  assert.match(doc.querySelector('.home-progress-card').textContent,/2 sesiones registradas/);
  const restored=boot(dom.window.localStorage.getItem('training_lab_v4'));
  try{
   assert.equal(restored.run(`trainingStrengthRecords('${date}').filter(s=>s.completed).length`),2,'both sessions survive reload');
  }finally{restored.dom.window.close();}
 }finally{dom.window.close();}
}
const {dom,doc,run}=boot();
try{
 for(const date of ['2026-10-05','2026-10-07','2026-10-09']){
  run(`document.getElementById('selectedDate').value='${date}';renderAll();showView('Workout')`);
  assert.ok(doc.querySelector('#viewWorkout [onclick="openSwimRegistration()"]'));
  assert.ok(run(`dayActivities(currentDate()).some(a=>a.kind==='Natación')`));
 }
}finally{dom.window.close();}
console.log('Double sessions, swim days, progress and reload checks passed.');
