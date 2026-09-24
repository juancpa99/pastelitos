// Presentation helpers only. Domain rules and storage remain in their original modules.
const viewDisclosures = new Map();
function rememberDisclosures(root){
 root?.querySelectorAll('details[data-disclosure]').forEach(el=>viewDisclosures.set(el.dataset.disclosure,el.open));
}
function disclosureHTML(id,title,body,open=false,description=''){
 const expanded=viewDisclosures.has(id)?viewDisclosures.get(id):open;
 return `<details class="view-disclosure" data-disclosure="${esc(id)}" ${expanded?'open':''}><summary><span><strong>${esc(title)}</strong>${description?`<small>${esc(description)}</small>`:''}</span><span class="disclosure-chevron" aria-hidden="true">⌄</span></summary><div class="disclosure-content">${body}</div></details>`;
}
function openViewSection(id){
 const node=document.getElementById(id);if(!node)return;
 for(let parent=node;parent;parent=parent.parentElement)if(parent.matches('details'))parent.open=true;
 node.scrollIntoView?.({behavior:'smooth',block:'start'});
}
function dayActivities(date){
 const activities=[],p=planFor(date);
 const flex=typeof oct26FlexContext==='function'&&oct26FlexContext(date);
 if(flex){
  const order=oct26WeekOrder(date);
  oct26SlotIndicesForDate(date).forEach(i=>{
   const key=order[i],s=oct26SessionStatus(date,key),tpl=oct26TemplateForKey(key,date);
   activities.push({title:tpl.title,subtitle:`${tpl.exercises.length} ejercicios · ${weekday(date)===2?'sesión '+(activities.length+1)+' del día':'gimnasio'}`,done:s.state==='done',active:s.state==='active',action:s.state==='done'?(s.record?.id?`editExtraSession('${s.record.id}')`:s.record?`openRecordedDay('${s.record.date}')`:"showView('Workout')"): `oct26StartWeeklySession('${key}')`,kind:'Fuerza'});
  });
 }else{
  const comp=typeof homeComplementFor==='function'?homeComplementFor(date):null;
  if(comp){const s=homeComplementSession(date,comp);activities.push({title:comp.title,subtitle:comp.timing||'',done:!!s?.completed,active:!!(s?.startedAt&&!s.completed),action:"showView('Workout')",kind:'Complemento'});}
  if(p.type!=='rest'){
   const s=p.type==='gym'?findSession(date,p.key):state.cardioRuntime;
   activities.push({title:p.title,subtitle:p.exercises?`${p.exercises.length} ejercicios`:p.subtitle||'',done:sessionDone(date,p),active:!!(s?.startedAt&&!s.completed&&(!s.date||s.date===date)),action:"showView('Workout')",kind:p.type==='swim'?'Natación':p.type==='gym'?'Fuerza':'Cardio'});
  }
 }
 if(flex&&oct26SwimDay(date))activities.push({title:'Natación',subtitle:'22–23 h · sesión con tu entrenador',done:!!state.swim.find(s=>s.date===date&&s.completed),active:false,action:"showView('Workout');openViewSection('swimToday')",kind:'Natación'});
 // A recovered/extra session can be active even when today has no planned gym.
 const activeExtra=state.extraSessions.find(s=>s.date===date&&s.startedAt&&!s.completed);
 if(activeExtra&&!activities.some(a=>a.active))activities.unshift({title:activeExtra.title||'Sesión extra',subtitle:'Sesión en curso',done:false,active:true,action:`editExtraSession('${activeExtra.id}')`,kind:'Fuerza'});
 return activities;
}
function nutritionSummaryHTML(date){
 const n=dayNutrition(date),g=state.settings.nutritionGoals||{},foods=foodsFor(date),meals=[...new Set(foods.map(f=>f.meal))];
 const value=(k,unit)=>`${Math.round(n[k]||0).toLocaleString('es-ES')}${+g[k]>0?` <span>/ ${Math.round(g[k]).toLocaleString('es-ES')}</span>`:''} <small>${unit}</small>`;
 return `<div class="nutrition-summary"><div><span>Energía registrada</span><strong>${value('kcal','kcal')}</strong>${+g.kcal>0?`<progress aria-label="Energía registrada respecto al objetivo" max="${g.kcal}" value="${Math.min(n.kcal,g.kcal)}"></progress>`:''}</div><div><span>Proteína</span><strong>${value('p','g')}</strong></div><p class="nutrition-secondary">Carbohidratos ${Math.round(n.c||0)} g · Grasas ${Math.round(n.f||0)} g</p>${meals.length?`<p class="meal-status">${meals.map(m=>esc(m)+' ✓').join(' · ')}</p>`:'<p class="meal-status">Aún no hay comidas registradas.</p>'}</div>`;
}
function weekActivitySummary(date){
 const sessions=allCompletedTraining().filter(s=>inWeek(s.date,date)&&s.date<=date),gym=sessions.filter(s=>s._kind==='gym'||(s._kind==='extra'&&s.exercises?.some(e=>e.type==='strength'))).length,swim=sessions.filter(s=>s._kind==='swim').length;
 return `Fuerza ${gym} · Natación ${swim}`;
}
function workoutPlanningHTML(date,week){
 const flex=typeof oct26FlexContext==='function'&&oct26FlexContext(date);
 const rules=typeof oct26InRange==='function'&&oct26InRange(date)?oct26RulesHTML(date):typeof sep26RulesHTML==='function'?sep26RulesHTML(date):'';
 return disclosureHTML('workout-week','Semana y planificación',(flex?oct26WeeklyPoolHTML(date):week)+`<button class="btn ghost" onclick="openPendingWorkouts()">Hacer una sesión pendiente de esta semana</button>`,false,'Ver el calendario o recuperar una sesión')+
 disclosureHTML('workout-rules','Objetivo de esta semana',rules+weeklyGuideHTML(date),false,typeof oct26Week==='function'&&oct26InRange(date)?`Semana ${oct26Week(date)} del bloque`:'Reglas y progresión');
}
function activeSessionExerciseHTML(e,i,scope,session){
 const card=exerciseCardHTML(e,i,scope);
 if(!session.startedAt||session.completed)return card;
 const first=session.exercises.findIndex(e=>e.type==='mobility'?!e.done:effectiveCount(e)<(+e.sets||0));
 const key=`exercise:${session.date}:${scope==='planned'?session.key:scope}:${i}`;
 const count=e.type==='mobility'?(e.done?'Realizado':'Pendiente'):`${effectiveCount(e)}/${e.sets} series`;
 return disclosureHTML(key,`${i+1}. ${e.name}`,card+(i<session.exercises.length-1?`<button class="btn secondary next-exercise" onclick="openNextExercise(this)">Siguiente ejercicio</button>`:''),i===(first<0?0:first),count);
}
function openNextExercise(button){
 const current=button.closest('details[data-disclosure]'),next=current?.nextElementSibling;
 if(next?.matches('details')){next.open=true;next.scrollIntoView?.({behavior:'smooth',block:'start'});next.querySelector('summary')?.focus({preventScroll:true});}
}
function progressOverviewHTML(ref,period,sessions){
 const groups=typeof strengthChartGroups==='function'?strengthChartGroups(ref):[];
 let increases=0,comparable=0;
 groups.forEach(g=>{
  const points=g.points.filter(p=>p.date<=ref),last=points.at(-1),prev=points.at(-2);
  if(!prev||!last||!inProgressPeriod(last.date,ref,period))return;
  comparable++;
  if(last.left>prev.left&&(last.right==null||prev.right==null||last.right>=prev.right))increases++;
 });
 const body=(key,unit)=>{
  const vals=state.body.filter(b=>b.date<=ref&&b[key]!=null&&b[key]!==''&&+b[key]>0).sort((a,b)=>a.date.localeCompare(b.date)),last=vals.at(-1),prev=vals.at(-2);
  return `<div class="progress-readout"><span>${key==='weight'?'Peso':'Cintura'}</span><strong>${last?`${(+last[key]).toLocaleString('es-ES')} <small>${unit}</small>`:'—'}</strong><small>${prev?`${(+last[key]-prev[key]>=0?'+':'')}${(+last[key]-prev[key]).toFixed(1)} ${unit} desde ${pretty(prev.date)}`:last?'Primera medición':'Sin mediciones'}${last?` · ${pretty(last.date)}`:''}</small></div>`;
 };
 return `<div class="progress-overview"><div class="progress-readout"><span>Cargas registradas</span><strong>${comparable?increases:'—'} <small>${comparable?'ejercicios con más kg':''}</small></strong><small>${comparable?`De ${comparable} comparables con su sesión anterior. Revisa también reps y RIR.`:'Necesitas dos sesiones del mismo ejercicio y equipo para comparar.'}</small></div>${body('weight','kg')}${body('waist','cm')}<div class="progress-readout"><span>Sesiones realizadas</span><strong>${sessions.length}</strong><small>${weekActivitySummary(ref)} esta semana</small></div></div>`;
}
function swimmingProgressHTML(ref,period){
 const rows=state.swim.filter(s=>s.completed&&s.date<=ref&&inProgressPeriod(s.date,ref,period));
 const meters=rows.reduce((n,s)=>n+(+s.meters||0),0),rpe=avgRPEFor(rows),pain=rows.filter(s=>s.pain!=null&&s.pain!=='').map(s=>+s.pain);
 let weeks=[];
 for(let n=3;n>=0;n--){const d=addDaysISO(ref,-7*n),start=mondayOf(d),end=n===0?ref:addDaysISO(start,6),rs=state.swim.filter(s=>s.completed&&s.date>=start&&s.date<=end);weeks.push({label:pretty(start),value:rs.reduce((sum,s)=>sum+(+s.meters||0),0)});}
 const max=Math.max(1,...weeks.map(w=>w.value));
 return `<div class="swim-summary"><strong>${meters.toLocaleString('es-ES')} <small>m</small></strong><span>${rows.length} sesiones · ${periodMinutes(rows)} min</span><p>RPE medio ${rpe==null?'—':rpe.toFixed(1)} · Hombro máximo ${pain.length?Math.max(...pain)+'/10':'—'}</p></div>${!rows.length?'<p class="subtitle">No hay sesiones de natación registradas en este periodo.</p>':''}<h3 class="section-sub">Metros por semana</h3><p class="subtitle">Últimas cuatro semanas; la actual, hasta la fecha seleccionada.</p><div class="data-bars">${weeks.map(w=>`<div><span>${esc(w.label)}</span><meter min="0" max="${max}" value="${w.value}" aria-label="Metros semana ${esc(w.label)}"></meter><strong>${w.value.toLocaleString('es-ES')} m</strong></div>`).join('')}</div>`;
}
function muscleVolumeHTML(sessions){
 const totals=Object.fromEntries(MUSCLE_AXES.map(([name])=>[name,0]));
 sessions.forEach(s=>(s.exercises||[]).forEach(e=>{if(e.type==='mobility')return;const n=getEffectiveRecordedSets(e).length;muscleGroupsForExercise(e).forEach(g=>{if(g in totals)totals[g]+=n;});}));
 const max=Math.max(1,...Object.values(totals));
 return `<p class="subtitle">Series realizadas. Un ejercicio compuesto puede contribuir a varios grupos; no mide crecimiento muscular.</p><div class="data-bars">${Object.entries(totals).map(([g,n])=>`<div><span>${esc(g)}</span><meter min="0" max="${max}" value="${n}" aria-label="Series de ${esc(g)}"></meter><strong>${n}</strong></div>`).join('')}</div>${disclosureHTML('muscle-index','Índice de estímulo anterior',`<p class="subtitle">Índice relativo ponderado por RIR.</p>${radarSVG(muscleStimulus(sessions))}${muscleValueList(muscleStimulus(sessions))}`)}`;
}

function openRecordedDay(date){document.getElementById('selectedDate').value=date;renderAll();showView('Workout');}
