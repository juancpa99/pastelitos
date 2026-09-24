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
 assert.match(doc.querySelector('#viewHome .day-lead').textContent,/Registrar entrenamiento/);
 assert.ok(!doc.querySelector('#viewHome .day-lead').textContent.includes(run(`dayActivities(currentDate())[0].title`)),'Home hides the recommended workout name');
 assert.equal(doc.querySelectorAll('#viewHome .day-tasks .task-action').length,0,'training sessions are not duplicated as Home tasks before check-in');
 assert.equal(doc.querySelectorAll('#viewHome [onclick^="openFoodModal"]').length,0,'meals are not repeated as tasks');
 run(`const oldCheckHour=afterCheckHour;afterCheckHour=()=>false;renderHome()`);
 assert.ok(!doc.getElementById('viewHome').textContent.includes('Check-in final'));
 run(`afterCheckHour=()=>true;renderHome()`);
 assert.ok(doc.getElementById('viewHome').textContent.includes('Check-in final'));
 run(`afterCheckHour=oldCheckHour`);
 date('2026-09-23');assert.equal(run(`dayActivities(currentDate())[0].title`),'Natación');
 run(`showView('Home')`);assert.match(doc.querySelector('#viewHome .day-lead').textContent,/Registrar entrenamiento/);assert.ok(!doc.querySelector('#viewHome .day-lead').textContent.includes('Natación'),'Home uses one generic training entry');
 run(`showView('Workout')`);assert.equal(doc.querySelectorAll('#viewWorkout .training-entry').length,1);assert.equal(doc.querySelectorAll('#viewWorkout .training-mode-choice').length,2);assert.ok(!doc.getElementById('swM'),'swim form hidden until requested');run(`openSwimRegistration()`);assert.ok(doc.getElementById('swM'));run(`closeModal()`);
 date('2026-09-27');run(`showView('Home')`);assert.match(doc.getElementById('viewHome').textContent,/Peso y cintura/);
 date('2026-09-24');run(`showView('Workout')`);
 assert.ok(doc.querySelector('#viewWorkout').firstElementChild.classList.contains('training-hub'));assert.equal(doc.querySelectorAll('#viewWorkout .training-mode-choice').length,2);assert.equal(doc.querySelectorAll('#viewWorkout .exercise').length,0);run(`openTrainingSelector()`);assert.equal(doc.querySelectorAll('.training-choice').length,5);run(`closeModal()`);
 assert.equal(doc.querySelector('[data-disclosure="workout-week"]').open,false);
 run(`startGym()`);doc.getElementById('watchReady').click();
 assert.ok(doc.getElementById('workoutWorkspace'));
 let exercises=[...doc.querySelectorAll('#workoutWorkspace .workspace-inner > details[data-disclosure^="exercise:"]')];
 assert.equal(exercises.filter(e=>e.open).length,1,'one exercise initially open');
 exercises[1].open=true;
 run(`addSetAttempt('planned',1,'effective')`);
 exercises=[...doc.querySelectorAll('#workoutWorkspace .workspace-inner > details[data-disclosure^="exercise:"]')];
 assert.equal(exercises[1].open,true,'adding a set preserves exercise disclosure');
 const input=doc.querySelector('[data-gym="planned"]');input.value='17';
 run(`closePlannedWorkspace();showView('Food');showView('Workout');openPlannedWorkspace()`);
 assert.equal(doc.getElementById(input.id).value,'17','navigation preserves unsubmitted set input');
 // Landing has no side effects and swimming works on any selected day.
 run(`closePlannedWorkspace();closeModal()`);
 const countBefore=run(`state.sessions.length`);run(`renderWorkout();renderWorkout()`);
 assert.equal(run(`state.sessions.length`),countBefore);
 assert.equal(doc.querySelectorAll('#viewWorkout [data-gym]').length,0);
 run(`openSwimRegistration()`);doc.getElementById('swM').value='1250';doc.getElementById('swD').value='40';run(`saveSwim()`);
 assert.equal(run(`state.swim.find(s=>s.date===currentDate()).meters`),1250);
 assert.equal(doc.getElementById('modalRoot').children.length,0);
 // Calendar windows handle short months, leap years and year boundaries.
 assert.equal(run(`progressBuckets('2024-03-15','month')[2].end`),'2024-02-29');
 assert.equal(run(`progressBuckets('2026-01-02','month')[2].start`),'2025-12-01');
 assert.equal(run(`progressBuckets('2026-01-02','week').at(-1).start`),'2025-12-29');
 assert.equal(run(`progressBuckets('2026-01-02','week').at(-1).end`),'2026-01-02');
 assert.equal(run(`progressBuckets('2026-01-02','day').length`),1);
 run(`showView('Progress')`);assert.equal(doc.querySelectorAll('.chart-slide').length,4);
 assert.ok(!doc.getElementById('viewProgress').textContent.includes('v2'));
 assert.ok(doc.querySelector('.date-nav').classList.contains('hidden'));
 run(`showView('Settings')`);assert.ok(doc.querySelector('.date-nav').classList.contains('hidden'));
 run(`showView('Workout')`);assert.ok(!doc.querySelector('.date-nav').classList.contains('hidden'));
 // Settings shortcuts expand the parent category, keeping all forms reachable.
 run(`goToNutritionSettings()`);assert.ok(doc.querySelector('[data-disclosure="settings-nutrition"]').open);
 run(`goToPlanSettings()`);assert.ok(doc.querySelector('[data-disclosure="settings-training"]').open);
 run(`goToMetabolismSettings()`);assert.ok(doc.querySelector('[data-disclosure="settings-nutrition"]').open);
 assert.ok(doc.querySelector('[data-disclosure="settings-data"] .marevo-data-safety'));
 assert.ok(doc.querySelector('[data-disclosure="settings-notifications"]'));
 run(`todayISO=()=> '2026-09-24'`);
 // Charts compare records only on or before the selected date, and include swimming.
 run(`state.body.push({date:'2026-09-20',weight:60,waist:75},{date:'2026-09-24',weight:61,waist:74},{date:'2026-10-10',weight:90,waist:99});state.swim.push({date:'2026-09-23',completed:true,meters:1800,duration:60,rpe:6,pain:0});showView('Progress')`);
 const overview=doc.querySelector('.progress-overview').textContent;
 assert.match(overview,/61/);assert.ok(!overview.includes('90'));
 assert.match(doc.querySelector('[data-disclosure="progress-swim"]').textContent,/3050|3\.050/);
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
