const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g,''),{url:'https://example.test/training-lab/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,doc=w.document,ctx=dom.getInternalVMContext(),run=s=>vm.runInContext(s,ctx);
w.matchMedia=()=>({matches:false,addEventListener(){}});w.ResizeObserver=class{observe(){}};w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
for(const m of html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g))run(fs.readFileSync(path.join(root,m[1]),'utf8'));
const date=x=>run(`document.getElementById('selectedDate').value='${x}';renderAll()`);
try{
 // All screen builders must work before, within and after the active block.
 for(const d of ['2026-08-30','2026-09-09','2026-09-21','2026-09-22','2026-09-23','2026-09-24','2026-09-27','2026-10-31','2026-11-02']){
  date(d);
  for(const v of ['Home','Workout','Food','Progress','Settings']){
   run(`showView('${v}')`);
   assert.ok(doc.getElementById('view'+v).textContent.trim(),`${d} ${v} has content`);
   const ids=[...doc.getElementById('view'+v).querySelectorAll('[id]')].map(e=>e.id);
   assert.equal(new Set(ids).size,ids.length,`${d} ${v} duplicate ids`);
  }
 }
 date('2026-09-22');run(`showView('Home')`);
 assert.equal(run(`dayActivities(currentDate()).length`),2,'Tuesday has two gym sessions');
 assert.equal(doc.querySelectorAll('#viewHome .task-action').length>=1,true);
 assert.equal(doc.querySelectorAll('#viewHome [onclick^="openFoodModal"]').length,0,'meals are not repeated as tasks');
 run(`const oldCheckHour=afterCheckHour;afterCheckHour=()=>false;renderHome()`);
 assert.ok(!doc.getElementById('viewHome').textContent.includes('Check-in final'));
 run(`afterCheckHour=()=>true;renderHome()`);
 assert.ok(doc.getElementById('viewHome').textContent.includes('Check-in final'));
 run(`afterCheckHour=oldCheckHour`);
 date('2026-09-23');assert.equal(run(`dayActivities(currentDate())[0].title`),'Natación');
 run(`showView('Workout')`);assert.ok(doc.getElementById('swM'),'swim registration reachable on Wednesday');
 assert.ok(doc.getElementById('swM').closest('#swimToday'));
 date('2026-09-27');run(`showView('Home')`);assert.match(doc.getElementById('viewHome').textContent,/Peso y cintura/);
 date('2026-09-24');run(`showView('Workout')`);
 assert.ok(doc.querySelector('#viewWorkout').firstElementChild.classList.contains('session-heading'));
 assert.equal(doc.querySelector('[data-disclosure="workout-week"]').open,false);
 run(`startGym()`);doc.getElementById('watchReady').click();
 assert.ok(doc.getElementById('viewWorkout').classList.contains('workout-focus'));
 let exercises=[...doc.querySelectorAll('#viewWorkout > details[data-disclosure^="exercise:"]')];
 assert.equal(exercises.filter(e=>e.open).length,1,'one exercise initially open');
 exercises[1].open=true;
 run(`addSetAttempt('planned',1,'effective')`);
 exercises=[...doc.querySelectorAll('#viewWorkout > details[data-disclosure^="exercise:"]')];
 assert.equal(exercises[1].open,true,'adding a set preserves exercise disclosure');
 const input=doc.querySelector('[data-gym="planned"]');input.value='17';
 run(`showView('Food');showView('Workout')`);
 assert.equal(doc.getElementById(input.id).value,'17','navigation preserves unsubmitted set input');
 // Settings shortcuts expand the parent category, keeping all forms reachable.
 run(`goToNutritionSettings()`);assert.ok(doc.querySelector('[data-disclosure="settings-nutrition"]').open);
 run(`goToPlanSettings()`);assert.ok(doc.querySelector('[data-disclosure="settings-training"]').open);
 run(`goToMetabolismSettings()`);assert.ok(doc.querySelector('[data-disclosure="settings-nutrition"]').open);
 assert.ok(doc.querySelector('[data-disclosure="settings-data"] .marevo-data-safety'));
 assert.ok(doc.querySelector('[data-disclosure="settings-notifications"]'));
 // Charts compare records only on or before the selected date, and include swimming.
 run(`state.body.push({date:'2026-09-20',weight:60,waist:75},{date:'2026-09-24',weight:61,waist:74},{date:'2026-10-10',weight:90,waist:99});state.swim.push({date:'2026-09-23',completed:true,meters:1800,duration:60,rpe:6,pain:0});showView('Progress')`);
 const overview=doc.querySelector('.progress-overview').textContent;
 assert.match(overview,/61/);assert.ok(!overview.includes('90'));
 assert.match(doc.querySelector('[data-disclosure="progress-swim"]').textContent,/1800|1\.800/);
 assert.equal(doc.getElementById('viewProgress').lastElementChild.dataset.disclosure,'progress-reports');
 // History-copy ordinal is independent of warm-up rows.
 run(`state.sessions.push({date:'2026-09-20',completed:true,exercises:[{key:'ux_ref',type:'strength',name:'Test',min:8,max:12,rir:'2',loadProfile:{mode:'total',machine:'M',base:'',unilateral:false},recordedSets:[{attemptType:'effective',kg:'20',reps:'10',rir:'2',completedAt:1}]}]});state.extraSessions.push({id:'ux_extra',date:currentDate(),startedAt:Date.now(),exercises:[{key:'ux_ref',name:'Test',type:'strength',sets:2,min:8,max:12,rir:'2',loadProfile:{mode:'total',machine:'M',base:'',unilateral:false},recordedSets:[{attemptType:'warmup',kg:'10',reps:'10',rir:'3',completedAt:1},{attemptType:'effective',kg:'',reps:'',rir:''}]}]});editExtraSession('ux_extra')`);
 assert.match([...doc.querySelectorAll('.sheet .previous-set')].at(-1).textContent,/20 kg/);
 run(`copySet('ux_extra',0,1,'history')`);
 assert.equal(run(`state.extraSessions.find(s=>s.id==='ux_extra').exercises[0].recordedSets[1].kg`),'20');
 // Completing a planned workout still leaves review-only history and valid JSON.
 run(`closeModal();normalizePlannedSession().completed=true;normalizePlannedSession().duration=60;normalizePlannedSession().rpe=6;saveState(true);showView('Workout')`);
 assert.equal(doc.querySelectorAll('#viewWorkout [data-gym="planned"]').length,0);
 assert.ok(JSON.parse(w.localStorage.getItem('training_lab_v4')).sessions.some(s=>s.completed));
 console.log('PASS: screen states, gym+swim, double sessions, rest, Sunday, historical dates, focus, disclosures, copy, backups, read-only history');
}catch(e){console.error(e);process.exitCode=1;}finally{setTimeout(()=>{dom.window.close();process.exit(process.exitCode||0)},0)}
