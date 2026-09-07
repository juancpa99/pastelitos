const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g,''),{url:'https://example.test/training-lab/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,doc=w.document,ctx=dom.getInternalVMContext(),run=s=>vm.runInContext(s,ctx);
const frames=[],scrolls=[];
w.requestAnimationFrame=fn=>frames.push(fn);
w.matchMedia=()=>({matches:false,addEventListener(){}});
w.ResizeObserver=class{observe(){}};
w.structuredClone=structuredClone;
w.scrollTo=(x,y)=>{w.scrollY=typeof x==='object'?x.top:y;scrolls.push(w.scrollY)};
w.scrollBy=(x,y)=>w.scrollTo(0,w.scrollY+y);
for(const match of html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g))run(fs.readFileSync(path.join(root,match[1]),'utf8'));
const tick=()=>new Promise(resolve=>queueMicrotask(resolve));
const flushFrames=()=>{const current=frames.splice(0);current.forEach(fn=>fn())};
async function test(){
 run(`document.getElementById('selectedDate').value='2026-09-08';showView('Workout')`);
 flushFrames();scrolls.length=0;w.scrollY=650;
 run(`showView('Workout')`);flushFrames();
 assert.equal(w.scrollY,650,'revisiting same view must not jump to top');
 assert.deepEqual(scrolls,[],'no delayed scroll resets');
 // Session/rest controls survive both time ticks and pause label changes.
 run(`state.extraSessions.push({id:'ui-test',date:currentDate(),startedAt:Date.now()-10000,exercises:[]});editExtraSession('ui-test')`);
 const pause=doc.querySelector('#extraClock button');pause.focus();
 run(`updateExtraClock();toggleExtraPause('ui-test');updateExtraClock()`);
 assert.equal(doc.querySelector('#extraClock button'),pause);
 assert.equal(doc.activeElement,pause);
 assert.equal(pause.textContent,'Reanudar');
 run(`closeModal();state.restTimer={date:currentDate(),scope:'planned',endAt:Date.now()+90000,exercise:'Remo',feedback:{text:'Mantén'}};updateRestTimerPanel()`);
 const rest=doc.querySelector('[onclick="addRestTime(30)"]');rest.focus();
 run(`updateRestTimerPanel();addRestTime(30);updateRestTimerPanel()`);
 assert.equal(doc.querySelector('[onclick="addRestTime(30)"]'),rest);
 assert.equal(doc.activeElement,rest);
 // Finished cardio fields must survive the runtime ticker while being edited.
 run(`document.getElementById('viewWorkout').insertAdjacentHTML('beforeend','<div id="cardioRuntimePanel"></div>');state.cardioRuntime={date:currentDate(),templateKey:'z2',startedAt:Date.now()-600000,completedAt:Date.now(),completed:true};updateCardioRuntimePanel()`);
 const rpe=doc.getElementById('caDoneRPE'),kcal=doc.getElementById('caDoneKcal');
 rpe.value='7';kcal.value='350';rpe.focus();rpe.setSelectionRange(1,1);
 run(`updateCardioRuntimePanel();updateCardioRuntimePanel()`);
 assert.equal(doc.getElementById('caDoneRPE'),rpe);
 assert.equal(rpe.value,'7');assert.equal(kcal.value,'350');assert.equal(doc.activeElement,rpe);assert.equal(rpe.selectionStart,1);
 // Chart selection must preserve the actual disclosure nodes and other open groups.
 run(`state.restTimer=null;state.cardioRuntime=null;state.sessions.push({date:currentDate(),completed:true,exercises:[{key:'bench_press',name:'Press banca',recordedSets:[{kg:'30',reps:'10',completedAt:1,attemptType:'effective'}]},{key:'one_row',name:'Remo unilateral',recordedSets:[{kg:'20',reps:'10',completedAt:1,attemptType:'effective'}]}]});showView('Progress')`);
 const menus=[...doc.querySelectorAll('.strength-explorer details')];menus.forEach(e=>e.open=true);
 const choices=[...doc.querySelectorAll('.strength-exercise-choice')];assert.equal(choices.length,2);
 run(`setStrengthChartExercise(${choices[0].dataset.exerciseIndex});setStrengthChartRange('all')`);
 menus.forEach(e=>{assert.ok(e.isConnected);assert.equal(e.open,true)});
 assert.equal(doc.querySelector('.strength-exercise-choice'),choices[0]);
 run(`setStrengthChartExercise(${choices[1].dataset.exerciseIndex})`);
 assert.equal(doc.querySelectorAll('.strength-inline-chart').length,1);
 assert.equal(doc.querySelector('.strength-inline-chart').previousElementSibling,choices[1]);
 // A replaced button is anchored once, including a changed label.
 run(`showView('Workout');closeModal()`);await tick();
 const view=doc.getElementById('viewWorkout');
 view.innerHTML='<button onclick="void 0">Serie hecha</button>';
 const before=view.firstElementChild;
 before.getBoundingClientRect=()=>({top:250});
 before.addEventListener('click',()=>{
  view.innerHTML='<button onclick="void 0">Deshacer serie</button>';
  view.firstElementChild.getBoundingClientRect=()=>({top:420});
 });
 scrolls.length=0;w.scrollY=500;before.click();await tick();
 assert.equal(w.scrollY,670);assert.equal(scrolls.length,1);assert.equal(doc.activeElement,view.firstElementChild);
 flushFrames();assert.equal(scrolls.length,1,'no later competing correction');
 // A different dialog must open at its own top, not inherit workout sheet scroll.
 run(`editExtraSession('ui-test')`);await tick();
 const sheet=doc.querySelector('.sheet');sheet.scrollTop=450;
 const finish=[...sheet.querySelectorAll('button')].find(b=>b.textContent.includes('Finalizar y guardar'));
 finish.addEventListener('click',()=>run(`openFinishExtra('ui-test')`));finish.click();await tick();
 assert.equal(doc.querySelector('.sheet').scrollTop,0);
 // Returning from configuration restores the same extra workout position.
 run(`editExtraSession('ui-test')`);await tick();
 const extra=doc.querySelector('.sheet');extra.scrollTop=400;
 const button=extra.querySelector('button');button.getBoundingClientRect=()=>({top:100});
 button.addEventListener('click',()=>{doc.getElementById('modalRoot').innerHTML='<div class="modal"><div class="sheet"><h2>Equipo</h2></div></div>'});
 button.click();await tick();
 run(`editExtraSession('ui-test')`);doc.querySelector('.sheet button').getBoundingClientRect=()=>({top:500});await tick();
 // Geometry is mocked: restoration follows the saved anchor, not the equipment form's scroll.
 assert.equal(doc.querySelector('.sheet').scrollTop,400);
 // A pending resume cannot reopen a workout over a subsequently selected view.
 run(`closeModal();showView('Home');showView('Workout');showView('Food')`);
 flushFrames();await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(run('activeView'),'Food');assert.equal(doc.querySelector('.sheet'),null);
 console.log('PASS: stable timer controls, cardio drafts, chart menus, viewport anchoring, dialog transitions and canceled resume');
}
test().then(()=>setTimeout(()=>{dom.window.close();process.exit(0)},0)).catch(error=>{console.error(error);setTimeout(()=>{dom.window.close();process.exit(1)},0)});
