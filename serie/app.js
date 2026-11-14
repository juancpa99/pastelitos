'use strict';
const KEY='serie.public.v1';
const uid=()=>crypto.randomUUID();
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=x=>x===''||x==null?null:Number(String(x).replace(',','.'));
const today=()=>new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const weekday=d=>new Date(d+'T12:00:00').getDay();
const pretty=d=>new Intl.DateTimeFormat('es',{weekday:'short',day:'numeric',month:'short'}).format(new Date(d+'T12:00:00'));
const blank=()=>({version:1,sessions:[],templates:null,custom:[],theme:'light',days:[1,2,4,6]});
let db=blank(),storageError=false;
try {const raw=localStorage.getItem(KEY);if(raw)db=validateData(JSON.parse(raw));}catch(error){storageError=true;}
let tab='train',sessionId=null,selectedDate=today(),restEnd=0,restLabel='',toastTimer,libraryLink=null;
let volumeMode='week', volumeZone='all', progressGroup='';
const current=()=>db.sessions.find(s=>s.id===sessionId);
const allCatalog=()=>[...SERIE_CATALOG,...db.custom];
const catalogue=k=>allCatalog().find(e=>e.key===k);
const plans=()=>db.templates||SERIE_PLANS;
function modeFor(e){return {'Barra':'barbell','Mancuernas':'dumbbell','Máquina':'machine','Polea':'machine','Multipower':'barbell','Asistencia':'assisted','Peso corporal':'bodyweight','Banda':'unknown'}[e.equipment]||'unknown';}
function instantiate(source){
 const cat=catalogue(source.key)||{};
 const e={...cat,...structuredClone(source),id:uid(),recordedSets:[],superset:source.superset||null};
 e.kind=cat.kind||source.kind||'strength';
 e.muscle=cat.muscle||source.muscle||'Abdomen y oblicuos';
 e.name=source.name||cat.name;
 e.rest=typeof source.rest==='number'?source.rest:(String(source.rest).includes('2–3')?150:90);
 e.sets=Number(source.sets)||3;e.min=Number(source.min)||8;e.max=Number(source.max)||12;
 e.rir=source.rir||'1–2';e.equipment=source.equipment||cat.equipment||'Otro';e.type='strength';
 // An explicit saved choice overrides the catalogue default. Legacy templates inherit it.
 const unilateral=source.sideMode==='both'?true:source.sideMode==='single'?false:
   !!(cat.unilateral||source.unilateral||source.loadProfile?.unilateral);
 e.sideMode=unilateral?'both':'single';e.unilateral=unilateral;
 e.loadProfile={...(source.loadProfile||{mode:modeFor(e),machine:e.equipment,base:'',increment:null}),unilateral};
 if(e.kind==='timed'){e.min=30;e.max=60;}
 for(let i=0;i<e.sets;i++)e.recordedSets.push(newSet(e));
 return e;
}
function newSet(e){
 const a={kg:e.loadProfile?.mode==='bodyweight'?0:'',reps:'',rir:'',attemptType:'effective',completedAt:null};
 if(e.loadProfile?.unilateral)Object.assign(a,{rightKg:e.loadProfile.mode==='bodyweight'?0:'',rightReps:'',rightRir:'',rightCompletedAt:null});
 return a;
}
function roundDone(e,a){return !!a?.completedAt&&(!e.loadProfile?.unilateral||!!a.rightCompletedAt);}
function sideCount(e,a){return (a?.completedAt?1:0)+(e.loadProfile?.unilateral&&a?.rightCompletedAt?1:0);}

function save(){if(storageError){toast('El registro anterior no se pudo leer. Exporta una copia de recuperación desde Ajustes antes de continuar.');return false;}try{const previous=localStorage.getItem(KEY);if(previous)localStorage.setItem(KEY+'.backup',previous);localStorage.setItem(KEY,JSON.stringify(db));return true;}catch(e){toast('No se ha podido guardar en este dispositivo. Exporta una copia desde Ajustes.');return false;}}
function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),4500);}
function touch(){const s=current();if(s){s.updatedAt=new Date().toISOString();s.revision=(s.revision||0)+1;}save();}
function navigate(page){tab=page;sessionId=null;closeDialog();render();window.scrollTo(0,0);}
function render(){document.body.classList.toggle('dark',db.theme==='dark');document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));document.getElementById('app').innerHTML=sessionId?sessionHTML():({train:trainHTML,history:historyHTML,progress:progressHTML,settings:settingsHTML}[tab]||trainHTML)();}
function toggleTheme(){db.theme=db.theme==='dark'?'light':'dark';save();render();}
function weekStart(date){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return new Intl.DateTimeFormat('en-CA').format(d);}
function orderedPlanIndexes(){return db.days.map((day,i)=>({day,i})).sort((a,b)=>((a.day+6)%7)-((b.day+6)%7)).map(x=>x.i);}
function trainHTML(){const week=weekStart(selectedDate),done=new Set(db.sessions.filter(s=>s.completed&&weekStart(s.date)===week).map(s=>s.planKey));const active=db.sessions.filter(s=>!s.completed),order=orderedPlanIndexes();return `<section class="hero"><div><div class="eyebrow">Fuerza e hipertrofia · 4 días</div><h1>Tu próxima<br>buena serie.</h1><p class="muted">Registra lo que haces. Encuentra tu ritmo.<br>Progresa a partir de tus sesiones.</p></div><div class="hero-aside"><div><div class="big-stat">${done.size}<span style="opacity:.5"> / 4</span></div><small>sesiones de esta semana</small></div><div><small>Tu plan</small><p>${order.map(i=>['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][db.days[i]]).join(' · ')}</p></div></div></section><div class="row between space"><h2>Elige tu sesión</h2><label>Fecha<input aria-label="Fecha del entrenamiento" type="date" value="${selectedDate}" onchange="if(this.value){selectedDate=this.value;render()}"></label></div>${active.length?`<div class="card"><div class="eyebrow">En curso</div>${active.map(s=>`<div class="active-session-row"><button class="history-item" onclick="openSession('${s.id}')"><span><strong>${esc(s.title)}</strong><small>${pretty(s.date)}</small></span>Continuar →</button><button class="small danger" onclick="discardSession('${s.id}')" aria-label="Descartar sesión ${esc(s.title)}">Descartar</button></div>`).join('')}</div>`:''}<div class="grid">${order.map((i,position)=>{const p=plans()[i];return `<article class="card plan-card"><span class="plan-number">0${position+1}</span><div class="eyebrow">${['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][db.days[i]]}</div><h2>${esc(p.title)}</h2><p class="muted small">${p.exercises.length} ejercicios · ${done.has(p.key)?'Hecha esta semana':weekday(selectedDate)===db.days[i]?'Programada para hoy':'Disponible'}</p><button class="${weekday(selectedDate)===db.days[i]?'primary':'small'}" onclick="startSession(${i})">${db.sessions.some(s=>s.date===selectedDate&&s.planKey===p.key)?'Abrir sesión':'Empezar'} ↗</button></article>`;}).join('')}</div><p class="muted small">Puedes cambiar el orden, añadir ejercicios o crear superseries dentro de cada sesión. Tu calendario es una guía; puedes entrenar otro día.</p>`;}
function startSession(index){const p=plans()[index];if(!p)return;const existing=db.sessions.find(s=>s.date===selectedDate&&s.planKey===p.key);if(existing){openSession(existing.id);return;}const s={id:uid(),planKey:p.key,title:p.title,date:selectedDate,startedAt:Date.now(),completed:false,exercises:p.exercises.map(instantiate),notes:'',revision:0};db.sessions.push(s);save();openSession(s.id);}
function openSession(id){if(!db.sessions.some(s=>s.id===id))return;sessionId=id;tab='train';render();window.scrollTo(0,0);}
function exercise(id){return current()?.exercises.find(e=>e.id===id);}
function groupMembers(e){return e.superset?current().exercises.filter(x=>x.superset===e.superset):[e];}
function groupLabel(e){const groups=[...new Set(current().exercises.map(x=>x.superset).filter(Boolean))];return e.superset?String.fromCharCode(65+groups.indexOf(e.superset)):'';}
function recommendation(e){const input={...e,variant:(e.variant||'')+(e.superset?'|superset':'|straight')};const sessions=db.sessions.filter(s=>s.id!==sessionId).map(s=>({...s,exercises:s.exercises.map(x=>({...x,variant:(x.variant||'')+(x.superset?'|superset':'|straight')}))}));return SerieCoach.recommend({sessions},input,current().date);}
function dose(e){return e.kind==='timed'?`${e.min}–${e.max} s`:e.repPolicy==='failure'?'al fallo técnico':`${e.min===e.max?e.min:e.min+'–'+e.max} reps`;}
function sessionHTML(){const s=current();if(!s)return '';const count=s.exercises.reduce((n,e)=>n+e.recordedSets.filter(a=>roundDone(e,a)&&a.attemptType!=='warmup').length,0);return `<button class="small back" onclick="navigate('train')">← Entrenamientos</button><div class="session-top"><div class="eyebrow">${pretty(s.date)} · ${s.completed?'Guardado · editable':'En curso'}</div><h1>${esc(s.title)}</h1><div class="row between"><span class="muted">${count} series registradas · ${s.exercises.length} ejercicios</span><button class="small" onclick="saveTemplate()">Guardar como mi rutina</button></div>${s.completed?'<p class="notice">Puedes añadir o editar ejercicios aquí. Se guardarán en esta misma sesión, con su fecha original.</p>':'<p class="muted small">Arrastra ⠿ para ordenar. Abre «Editar / superserie» para agrupar ejercicios.</p>'}</div><div id="exercises">${renderExerciseBlocks()}</div><button class="footer-add" onclick="openLibrary()">＋ Añadir ejercicio</button><label>Notas de la sesión<textarea rows="2" onchange="current().notes=this.value;touch()">${esc(s.notes)}</textarea></label><div class="row space"><button class="primary" onclick="finishSession()">${s.completed?'Guardar cambios':'Terminar entrenamiento'}</button><button class="small" onclick="navigate('history')">Ver historial</button>${s.completed?'':'<button class="small danger" onclick="discardSession()">Descartar sesión</button>'}</div>`;}

function supersetBlocks(){
 const seen=new Set();
 return current().exercises.reduce((result,e)=>{
   if(e.superset && groupMembers(e).length>1){
     if(seen.has(e.superset))return result;
     seen.add(e.superset);
     result.push({group:e.superset,members:groupMembers(e)});
   }else result.push({group:null,members:[e]});
   return result;
 },[]);
}
function renderExerciseBlocks(){
 return supersetBlocks().map(({group,members})=>group?
   supersetHTML(members):exerciseHTML(members[0],current().exercises.indexOf(members[0]))).join('');
}
function workSet(e,round){
 return e.recordedSets.map((a,index)=>({a,index})).filter(({a})=>a.attemptType!=='warmup')[round]||null;
}
function supersetHTML(members){
 const first=members[0],s=current(),group=first.superset,label=groupLabel(first);
 const total=Math.max(1,...members.map(e=>e.recordedSets.filter(a=>a.attemptType!=='warmup').length));
 const data=Array.from({length:total},(_,round)=>{
   const entries=members.map(e=>({e,item:workSet(e,round)})).filter(({item})=>!!item);
   const completed=entries.filter(({e,item})=>roundDone(e,item.a)).length;
   return {round,entries,completed,done:entries.length>0&&completed===entries.length};
 });
 const finished=data.filter(x=>x.done).length,firstPending=data.findIndex(x=>!x.done);
 const openRound=firstPending<0?data.length-1:firstPending;
 const warmups=members.flatMap(e=>e.recordedSets.map((a,index)=>({e,a,index})).filter(x=>x.a.attemptType==='warmup'));
 return `<details class="exercise superset-card" data-eid="${first.id}" open>
  <summary><button class="drag-handle" aria-label="Mover superserie ${label}" data-drag="${first.id}" onclick="event.preventDefault()">⠿</button>
    <span class="exercise-title"><strong>Superserie ${label} · ${members.length} ejercicios</strong><small>Una serie de cada ejercicio por ronda · descansa al terminar todos</small></span>
    <span class="pill">${finished}/${total} rondas</span>
  </summary>
  <div class="exercise-body superset-body">
    ${warmups.length?`<details class="superset-warmups"><summary>Calentamientos · ${warmups.length} series</summary><div class="superset-warmups-body">
      ${warmups.map(({e,a,index})=>`<div class="superset-member"><strong>${esc(e.name)}</strong>${setHTML(e,a,index)}</div>`).join('')}
    </div></details>`:''}
    ${data.map(({round,entries,completed,done})=>`<details class="superset-round" data-round-key="${group}:${round}" ${round===openRound?'open':''}>
      <summary><strong>Serie ${round+1}</strong><span class="pill">${done?'✓ Completada':completed+'/'+entries.length+' ejercicios'}</span></summary>
      <div class="superset-round-body">
        ${entries.map(({e,item},position)=>`<section class="superset-member" data-member="${e.id}">
          <div class="superset-member-title"><strong>${position+1}. ${esc(e.name)}</strong>
            <small>${dose(e)} · ${esc(e.equipment)}${e.loadProfile?.unilateral?' · ambos lados':''}</small></div>
          ${e.loadProfile?.unilateral?'':`<div class="set-head"><span>Serie</span><span>kg</span><span>${e.kind==='timed'?'seg':'reps'}</span><span>RIR</span><span>Hecha</span></div>`}
          ${setHTML(e,item.a,item.index)}
        </section>`).join('')}
        ${entries.length<members.length?'<p class="muted small">Algunos ejercicios tienen menos series configuradas.</p>':''}
      </div>
    </details>`).join('')}
    <div class="row superset-actions">
      <button class="small" onclick="addSupersetRound('${group}')">＋ Añadir ronda completa</button>
      <span class="muted small">Cada ronda registra un set por ejercicio, con pesos y repeticiones independientes.</span>
    </div>
    <details class="superset-edit"><summary>Editar ejercicios y calentamientos</summary>
      <div class="superset-edit-body">
        ${members.map(e=>`<div class="superset-edit-member">
          <div><strong>${esc(e.name)}</strong><small>${e.sets} series · ${e.rest} s</small></div>
          <div class="row">
            <button class="small" onclick="editExercise('${e.id}')">Editar</button>
            <button class="small" onclick="addSet('${e.id}',true)">＋ Calentamiento</button>
            <button class="small danger" onclick="removeExercise('${e.id}')">Quitar</button>
          </div>
        </div>`).join('')}
      </div>
    </details>
  </div>
 </details>`;
}
function addSupersetRound(group){
 const members=current()?.exercises.filter(e=>e.superset===group)||[];
 if(members.length<2)return;
 for(const e of members){e.recordedSets.push(newSet(e));e.sets=e.recordedSets.filter(a=>a.attemptType!=='warmup').length;}
 touch();rerenderSession();
}
function moveBlock(id,to){
 const s=current();if(!s)return;
 const blocks=supersetBlocks(),from=blocks.findIndex(b=>b.members.some(e=>e.id===id));
 if(from<0||to<0||to>=blocks.length||from===to)return;
 const [block]=blocks.splice(from,1);blocks.splice(to,0,block);
 s.exercises=blocks.flatMap(b=>b.members);
 touch();rerenderSession();
}

function exerciseHTML(e,i){const s=current(),members=groupMembers(e),tag=groupLabel(e);const count=e.recordedSets.filter(a=>roundDone(e,a)).length;const rec=e.kind==='strength'&&!s.completed?recommendation(e):null;const target=rec?.targets[0],unilat=!!e.loadProfile?.unilateral;return `<details class="exercise ${e.superset?'superset':''}" data-eid="${e.id}" ${i===0?'open':''}><summary><button class="drag-handle" aria-label="Mover ${esc(e.name)}" data-drag="${e.id}" onclick="event.preventDefault()">⠿</button><span class="exercise-title"><strong>${esc(e.name)}</strong><small>${e.sets} × ${dose(e)} · ${e.kind==='timed'?'Resistencia':`RIR ${esc(e.rir)}`} · ${e.rest} s</small></span>${tag?`<span class="group-letter">${tag}${members.indexOf(e)+1}</span>`:''}<span class="pill">${count}/${e.recordedSets.length}</span></summary><div class="exercise-body">${tag?`<p class="superset-label"><strong>Superserie ${tag}</strong> · ${members.map(x=>esc(x.name)).join(' → ')}. Descansa ${members.at(-1).rest} s al terminar la ronda.</p>`:''}${rec?`<div class="target"><strong>Próximo objetivo</strong><p>${unilat?`Izquierda: ${target?.kg??'—'} kg × ${target?.reps??'—'} · Derecha: ${target?.rightKg??'—'} kg × ${target?.rightReps??'—'} · RIR ${target?.rir??e.rir}`:`${target?.kg!=null?esc(target.kg)+' kg':'Elige tu carga'} · ${target?.reps??dose(e)} ${target?.reps!=null?'reps':''} · RIR ${target?.rir??e.rir}`}</p><details><summary>Ver objetivos y motivo</summary><p>${esc(rec.reason)}</p>${rec.targets.map((t,j)=>`<p>Serie ${j+1}: ${unilat?`I: ${t.kg??'—'} kg × ${t.reps??'—'}, D: ${t.rightKg??'—'} kg × ${t.rightReps??'—'}`:`${t.kg??'—'} kg × ${t.reps??'al fallo'}`} · RIR ${t.rir}</p>`).join('')}</details></div>`:''}<small>${esc(e.equipment)}${e.loadProfile.mode==='dumbbell'?' · kg por mancuerna':e.loadProfile.mode==='assisted'?' · kg de asistencia':e.loadProfile.mode==='bodyweight'?' · usa 0 kg sin lastre':' · carga total o indicada por la máquina'}${unilat?' · registra izquierda y derecha por separado':''}</small>${unilat?'':'<div class="set-head"><span>Serie</span><span>kg</span><span>Reps / seg</span><span>RIR</span><span>Hecha</span></div>'}${e.recordedSets.map((a,j)=>setHTML(e,a,j)).join('')}<div class="row space"><button class="small" onclick="addSet('${e.id}')">＋ Serie</button><button class="small" onclick="addSet('${e.id}',true)">＋ Calentamiento</button></div><div class="row exercise-actions"><button class="small" onclick="editExercise('${e.id}')">Editar / superserie</button><button class="small danger" onclick="removeExercise('${e.id}')">Quitar</button></div>${e.note?`<p class="muted small">${esc(e.note)}</p>`:''}</div></details>`;}
function sideRow(e,a,j,side){
 const right=side==='right',done=!!a[right?'rightCompletedAt':'completedAt'];
 const inputs=['kg','reps','rir'].map(base=>{
   const field=right?{kg:'rightKg',reps:'rightReps',rir:'rightRir'}[base]:base;
   const label=base==='kg'?'Peso':base==='reps'?(e.kind==='timed'?'Segundos':'Repeticiones'):'RIR';
   return `<input aria-label="${label} · ${side==='right'?'Derecha':'Izquierda'} · ${esc(e.name)} · serie ${j+1}" inputmode="${base==='reps'?'numeric':'decimal'}" data-ex="${e.id}" data-set="${j}" data-side="${side}" data-field="${field}" value="${esc(a[field]??'')}" placeholder="—" ${e.kind==='timed'&&base==='rir'?'disabled':''}>`;
 }).join('');
 return `<div class="set-row ${done?'saved':''}"><span class="muted small">${right?'Der.':'Izq.'}</span>${inputs}<button aria-label="${done?'Desmarcar':'Guardar'} lado ${right?'derecho':'izquierdo'} · serie ${j+1}" class="${done?'lime':''}" onclick="toggleSet('${e.id}',${j},'${side}')">${done?'✓':'○'}</button></div>`;
}
function setHTML(e,a,j){
 if(e.loadProfile?.unilateral){
   const done=sideCount(e,a),max=2;
   return `<div class="unilateral-round" data-round="${j}"><div class="row between unilateral-heading"><strong>${a.attemptType==='warmup'?'Calentamiento':'Serie '+(j+1)}</strong><span class="pill">${done}/${max} lados</span></div><div class="set-head"><span>Lado</span><span>kg</span><span>${e.kind==='timed'?'seg':'reps'}</span><span>RIR</span><span>Hecha</span></div>${sideRow(e,a,j,'left')}${sideRow(e,a,j,'right')}<div class="set-note"><span>${done===2?'Ambos lados registrados':done===1?'Falta registrar un lado':'Ambos lados pendientes'}</span><button onclick="removeSet('${e.id}',${j})" aria-label="Quitar ${a.attemptType==='warmup'?'calentamiento':'serie'} ${j+1}">Quitar ${a.attemptType==='warmup'?'calentamiento':'serie'}</button></div></div>`;
 }
 return `<div class="set-row ${a.completedAt?'saved':''}"><span class="muted small">${a.attemptType==='warmup'?'C':j+1}</span>${['kg','reps','rir'].map(field=>`<input aria-label="${field==='kg'?'Peso':field==='reps'?(e.kind==='timed'?'Segundos':'Repeticiones'):'RIR'} · ${esc(e.name)} · serie ${j+1}" inputmode="${field==='reps'?'numeric':'decimal'}" data-ex="${e.id}" data-set="${j}" data-field="${field}" value="${esc(a[field])}" placeholder="—" ${e.kind==='timed'&&field==='rir'?'disabled':''}>`).join('')}<button aria-label="${a.completedAt?'Desmarcar':'Guardar'} serie ${j+1}" class="${a.completedAt?'lime':''}" onclick="toggleSet('${e.id}',${j})">${a.completedAt?'✓':'○'}</button></div><div class="set-note"><span>${a.attemptType==='warmup'?'Calentamiento':a.completedAt?'Registrada':'Pendiente'}</span><button onclick="removeSet('${e.id}',${j})" aria-label="Quitar serie ${j+1}">Quitar serie</button></div>`;
}

function rerenderSession(){const y=window.scrollY,open=[...document.querySelectorAll('.exercise[open]')].map(n=>n.dataset.eid);render();document.querySelectorAll('.exercise').forEach(n=>n.open=open.includes(n.dataset.eid));window.scrollTo(0,y);}
document.addEventListener('input',ev=>{const n=ev.target;if(!n.dataset.ex)return;const e=exercise(n.dataset.ex),a=e?.recordedSets[+n.dataset.set];if(!a)return;a[n.dataset.field]=n.value.replace(',','.');const completionField=n.dataset.side==='right'?'rightCompletedAt':'completedAt';if(a[completionField])a[completionField]=null;touch();const row=n.closest('.set-row');row?.classList.remove('saved');const button=row?.querySelector('button');if(button){button.textContent='○';button.classList.remove('lime');button.setAttribute('aria-label','Guardar serie '+(+n.dataset.set+1));}});
function addSet(id,warmup=false){const e=exercise(id);e.recordedSets.push({...newSet(e),attemptType:warmup?'warmup':'effective'});if(!warmup)e.sets=e.recordedSets.filter(a=>a.attemptType!=='warmup').length;touch();rerenderSession();}
function toggleSet(id,index,side='left'){
 const e=exercise(id),a=e?.recordedSets[index];if(!e||!a)return;
 const right=!!e.loadProfile?.unilateral&&side==='right';
 const kgField=right?'rightKg':'kg',repsField=right?'rightReps':'reps',rirField=right?'rightRir':'rir',doneField=right?'rightCompletedAt':'completedAt';
 if(a[doneField]){a[doneField]=null;touch();rerenderSession();return;}
 const kg=number(a[kgField]),reps=number(a[repsField]),rir=number(a[rirField]);
 if(kg==null||!Number.isFinite(kg)||kg<0||!Number.isInteger(reps)||reps<=0||(a[rirField]!==''&&a[rirField]!=null&&e.kind!=='timed'&&(!Number.isFinite(rir)||rir<0||rir>10))){
   toast('Introduce kg válidos, repeticiones o segundos enteros y RIR entre 0 y 10.');return;
 }
 a[kgField]=kg;a[repsField]=reps;a[rirField]=e.kind==='timed'?null:rir;a[doneField]=Date.now();
 touch();
 if(e.loadProfile?.unilateral&&!roundDone(e,a)){
   rerenderSession();toast('Lado '+(right?'derecho':'izquierdo')+' registrado. Falta el otro lado.');return;
 }
 if(!current().completed){
   if(a.attemptType==='warmup'){startRest(e.rest,'Descanso de calentamiento');rerenderSession();return;}
   const members=groupMembers(e),ordinal=e.recordedSets.slice(0,index+1).filter(z=>z.attemptType!=='warmup').length-1;
   const pending=a.attemptType==='warmup'?[]:members.filter(x=>{
     const z=x.recordedSets.filter(z=>z.attemptType!=='warmup')[ordinal];
     return !!z&&!roundDone(x,z);
   });
   if(e.superset&&a.attemptType!=='warmup'&&pending.length){restEnd=0;updateRest();toast('Sigue con '+pending[0].name);}
   else startRest(members.at(-1).rest,e.superset?'Descanso entre rondas':'Descanso');
 }
 rerenderSession();
}
function removeSet(id,index){const e=exercise(id);if((e.recordedSets[index].completedAt||e.recordedSets[index].rightCompletedAt)&&!confirm('¿Quitar esta serie registrada?'))return;e.recordedSets.splice(index,1);e.sets=Math.max(1,e.recordedSets.filter(a=>a.attemptType!=='warmup').length);touch();rerenderSession();}
function discardSession(id=sessionId){
 const index=db.sessions.findIndex(s=>s.id===id);
 if(index<0||db.sessions[index].completed)return;
 const s=db.sessions[index],hasWork=s.exercises.some(e=>e.recordedSets.some(a=>a.completedAt||a.rightCompletedAt));
 const warning=hasWork?'¿Descartar este entrenamiento en curso? Se perderán las series registradas y no se guardará en el historial.':'¿Descartar este entrenamiento en curso? Podrás empezarlo de nuevo cuando quieras.';
 if(!confirm(warning))return;
 db.sessions.splice(index,1);
 if(!save()){db.sessions.splice(index,0,s);return;}
 if(sessionId===id){sessionId=null;restEnd=0;updateRest();}
 closeDialog();render();toast('Sesión descartada. Puedes empezarla de nuevo.');
}
function finishSession(){const s=current();if(!s.completed){const pending=s.exercises.some(e=>e.recordedSets.some(a=>!roundDone(e,a)));if(pending&&!confirm('Quedan series sin registrar. ¿Guardar la sesión con esas series pendientes?'))return;s.completed=true;s.completedAt=Date.now();s.duration=Math.max(1,Math.round((Date.now()-s.startedAt)/60000));}restEnd=0;updateRest();touch();render();toast('Entrenamiento guardado. Puedes seguir editándolo.');}
function startRest(seconds,label){restEnd=Date.now()+seconds*1000;restLabel=label;updateRest();}
function updateRest(){const el=document.getElementById('rest'),seconds=Math.ceil((restEnd-Date.now())/1000);if(seconds<=0){if(restEnd){restEnd=0;toast('Descanso terminado');}el.hidden=true;return;}el.hidden=false;el.className='rest';el.innerHTML=`<div class="row"><strong>${esc(restLabel)} · ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}</strong><button class="small" onclick="restEnd=0;updateRest()">Omitir</button></div>`;}
setInterval(updateRest,1000);
function closeDialog(){document.getElementById('dialog').close();}
function modal(title,body){const d=document.getElementById('dialog');d.innerHTML=`<div class="dialog-head"><h2>${esc(title)}</h2><button aria-label="Cerrar" class="icon-button" onclick="closeDialog()">×</button></div>${body}`;if(!d.open)d.showModal();}
function openLibrary(link=null){libraryLink=link;modal(link?'Añadir a la superserie':'Añadir ejercicio',`<div class="fields"><label class="wide">Buscar<input id="library-search" type="search" placeholder="Ejercicio, músculo o material" oninput="renderLibrary()"></label><label>Zona muscular<select id="library-group" onchange="renderLibrary()"><option value="">Todas las zonas</option>${SERIE_GROUPS.map(g=>`<option>${esc(g)}</option>`).join('')}</select></label><label>Material<select id="library-equipment" onchange="renderLibrary()"><option value="">Todo el material</option>${[...new Set(allCatalog().map(e=>e.equipment))].sort().map(g=>`<option>${esc(g)}</option>`).join('')}</select></label></div><p class="muted catalog-count" id="catalog-count"></p><div id="library-list"></div><button class="full" onclick="customExercise()">＋ Crear ejercicio personalizado</button>`);renderLibrary();}
const searchKey=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function renderLibrary(){const q=searchKey(document.getElementById('library-search').value),g=document.getElementById('library-group').value,m=document.getElementById('library-equipment').value;const rows=allCatalog().filter(e=>(!g||e.muscle===g)&&(!m||e.equipment===m)&&searchKey(e.name+' '+e.muscle+' '+e.equipment).includes(q));document.getElementById('catalog-count').textContent=rows.length+(rows.length===1?' ejercicio disponible':' ejercicios disponibles');document.getElementById('library-list').innerHTML=SERIE_GROUPS.map(group=>{const entries=rows.filter(e=>e.muscle===group);return entries.length?`<details class="library-group" ${q||g?'open':''}><summary>${esc(group)} <span class="pill">${entries.length}</span></summary>${entries.map(e=>`<button class="library-item" onclick="addExercise('${e.key}')"><span><strong>${esc(e.name)}</strong><small>${esc(e.equipment)}${e.kind==='timed'?' · por tiempo':''}</small></span>＋</button>`).join('')}</details>`:'';}).join('')||'<p class="empty">No hay coincidencias. Puedes crear tu propia variante.</p>';}
function addExercise(key){const source=catalogue(key);if(!source||!current())return;const e=instantiate(source);current().exercises.push(e);if(libraryLink&&exercise(libraryLink))linkExercises(libraryLink,e.id);touch();closeDialog();rerenderSession();const node=document.querySelector(`[data-eid="${e.id}"]`);if(node){node.open=true;node.scrollIntoView({block:'center',behavior:'smooth'});}toast('Ejercicio añadido');}
function customExercise(){modal('Nuevo ejercicio',`<form onsubmit="saveCustom(event)"><div class="fields"><label class="wide">Nombre<input id="custom-name" required maxlength="120"></label><label>Zona<select id="custom-muscle">${SERIE_GROUPS.map(g=>`<option>${g}</option>`).join('')}</select></label><label>Material<select id="custom-equipment">${['Barra','Mancuernas','Máquina','Polea','Peso corporal','Asistencia','Banda','Otro'].map(x=>`<option>${x}</option>`).join('')}</select></label><label>Registro<select id="custom-kind"><option value="strength">Repeticiones</option><option value="timed">Segundos</option></select></label><label class="wide">Registro por lados<select id="custom-side-mode"><option value="single">Una sola serie</option><option value="both">Izquierda y derecha</option></select></label></div><button class="primary full space">Crear y añadir</button></form>`);}
function saveCustom(event){event.preventDefault();const name=document.getElementById('custom-name').value.trim();if(!name)return;const e={key:'custom_'+uid(),name,muscle:document.getElementById('custom-muscle').value,equipment:document.getElementById('custom-equipment').value,kind:document.getElementById('custom-kind').value,sideMode:document.getElementById('custom-side-mode').value,sets:3,min:8,max:12,rir:'1–2',rest:90};db.custom.push(e);save();addExercise(e.key);}
function editExercise(id){const e=exercise(id);modal('Editar ejercicio',`<form onsubmit="saveExercise(event,'${id}')"><div class="fields"><label class="wide">Nombre<input id="edit-name" maxlength="120" required value="${esc(e.name)}"></label><label>Series objetivo<input id="edit-sets" type="number" min="1" max="30" required value="${e.sets}"></label><label>Descanso (s)<input id="edit-rest" type="number" min="0" max="1200" required value="${e.rest}"></label><label>${e.kind==='timed'?'Segundos':'Repeticiones'} mínimas<input id="edit-min" type="number" min="1" max="3600" required value="${e.min}"></label><label>Máximas<input id="edit-max" type="number" min="1" max="3600" required value="${e.max}"></label><label>RIR mínimo<input id="edit-rir-min" type="number" min="0" max="10" required value="${SerieCoach.range(e.rir)[0]}"></label><label>RIR máximo<input id="edit-rir-max" type="number" min="0" max="10" required value="${SerieCoach.range(e.rir)[1]}"></label><label>Modalidad de carga<select id="edit-mode">${Object.entries({barbell:'Barra · kg totales',dumbbell:'Mancuernas · kg por mancuerna',machine:'Máquina / polea',bodyweight:'Peso corporal',weighted:'Lastre añadido',assisted:'Asistencia',unknown:'Otro / sin definir'}).map(([k,v])=>`<option value="${k}" ${e.loadProfile.mode===k?'selected':''}>${v}</option>`).join('')}</select></label><label>Incremento mínimo (kg)<input id="edit-step" inputmode="decimal" value="${e.loadProfile.increment??''}" placeholder="Ej. 2,5"></label><label class="wide">Equipo o máquina de referencia<input id="edit-machine" value="${esc(e.loadProfile.machine)}" maxlength="100"></label><label>Registro por lados<select id="edit-side-mode"><option value="single" ${e.loadProfile.unilateral?'':'selected'}>Una sola serie</option><option value="both" ${e.loadProfile.unilateral?'selected':''}>Izquierda y derecha</option></select></label><label class="wide">Superserie con<select id="edit-link"><option value="">${e.superset?'Mantener grupo actual':'Sin superserie'}</option>${e.superset?'<option value="unlink">Separar este ejercicio</option>':''}${current().exercises.filter(x=>x.id!==id).map(x=>`<option value="${x.id}">${esc(x.name)}${x.superset?' · grupo '+groupLabel(x):''}</option>`).join('')}</select></label></div><p class="muted small">Cambiar el número objetivo no borra series registradas. Las superseries se comparan con otras superseries para no mezclar condiciones.</p><button class="primary full">Guardar ejercicio</button></form><button class="full space" onclick="openLibrary('${id}')">＋ Añadir otro ejercicio a esta superserie</button>`);}
function saveExercise(event,id){event.preventDefault();const e=exercise(id);const val=k=>document.getElementById('edit-'+k).value;const min=+val('min'),max=+val('max'),lo=+val('rir-min'),hi=+val('rir-max'),increment=number(val('step'));if(min>max||lo>hi||(increment!==null&&(!Number.isFinite(increment)||increment<=0))){toast('Revisa los rangos y el incremento de carga.');return;}const both=val('side-mode')==='both';if(e.loadProfile.unilateral&&!both&&e.recordedSets.some(a=>a.rightCompletedAt)&&!confirm('Hay series registradas del lado derecho. Al cambiar a registro único dejarán de mostrarse, aunque sus datos se conservarán. ¿Continuar?'))return;e.name=val('name').trim();e.sets=+val('sets');e.min=min;e.max=max;e.rest=+val('rest');e.rir=lo+'–'+hi;e.sideMode=both?'both':'single';e.unilateral=both;e.loadProfile={...e.loadProfile,mode:val('mode'),machine:val('machine').trim(),increment,unilateral:both};while(e.recordedSets.filter(a=>a.attemptType!=='warmup').length<e.sets)e.recordedSets.push(newSet(e));const link=val('link');if(link==='unlink'){e.superset=null;cleanGroups();}else if(link)linkExercises(id,link);touch();closeDialog();rerenderSession();}
function cleanGroups(){const s=current();const counts={};s.exercises.forEach(e=>{if(e.superset)counts[e.superset]=(counts[e.superset]||0)+1;});s.exercises.forEach(e=>{if(counts[e.superset]<2)e.superset=null;});}
function linkExercises(a,b){const first=exercise(a),second=exercise(b);if(!first||!second||a===b)return;const groups=[first.superset,second.superset].filter(Boolean),id=first.superset||second.superset||uid();current().exercises.forEach(e=>{if(e.id===a||e.id===b||groups.includes(e.superset))e.superset=id;});const s=current(),members=s.exercises.filter(e=>e.superset===id),position=s.exercises.findIndex(e=>e.superset===id);s.exercises=s.exercises.filter(e=>e.superset!==id);s.exercises.splice(position,0,...members);cleanGroups();}
function removeExercise(id){const e=exercise(id);if(!confirm('¿Quitar '+e.name+' y sus series de esta sesión?'))return;current().exercises=current().exercises.filter(x=>x.id!==id);cleanGroups();touch();rerenderSession();}
function saveTemplate(){const s=current();if(!confirm('¿Usar los ejercicios, orden y superseries de esta sesión para las próximas sesiones de '+s.title+'? Los registros anteriores no cambiarán.'))return;db.templates=plans().map(p=>({...structuredClone(p),exercises:p.exercises.map(source=>{const copy=instantiate(source);delete copy.id;delete copy.recordedSets;return copy;})}));const p=db.templates.find(p=>p.key===s.planKey);p.exercises=s.exercises.map(e=>{const copy=structuredClone(e);delete copy.id;delete copy.recordedSets;return copy;});save();toast('Rutina actualizada para las próximas sesiones');}
function moveExercise(id,to){const s=current(),from=s.exercises.findIndex(e=>e.id===id);if(from<0||to<0||to>=s.exercises.length||from===to)return;const [e]=s.exercises.splice(from,1);s.exercises.splice(to,0,e);touch();rerenderSession();}
function historyHTML(){return `<div class="eyebrow">Tu registro</div><h1>Lo que ya has hecho.</h1><p class="muted">Abre cualquier sesión para revisarla, añadir ejercicios o editar sus superseries.</p>${db.sessions.length?db.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(s=>`<button class="history-item card" onclick="openSession('${s.id}')"><span><strong>${esc(s.title)}</strong><small>${pretty(s.date)} · ${s.exercises.length} ejercicios${s.revision?' · actualizado':''}</small></span><span class="pill">${s.completed?'Guardado':'En curso'} →</span></button>`).join(''):'<p class="empty">Tu primera sesión aparecerá aquí.</p>'}`;}
function progressHTML(){
 const finished=db.sessions.filter(s=>s.completed);
 const total=finished.reduce((sum,s)=>sum+s.exercises.reduce((n,e)=>n+SerieProgress.workSets(e).length,0),0);
 const entries=[...new Map(finished.flatMap(s=>s.exercises.filter(e=>e.kind!=='timed'&&SerieProgress.workSets(e).length>0)
   .map(e=>[SerieCoach.identity({...e,variant:e.superset?'superset':'straight'})+'|'+e.min+'|'+e.max,e]))).entries()];
 window.progressEntries=entries;
 const groups=SerieProgress.AXES.filter(([group])=>entries.some(([,e])=>SerieProgress.zone(e,SERIE_CATALOG)===group));
 if(!groups.some(([g])=>g===progressGroup)) progressGroup=groups[0]?.[0]||'';
 const groupOptions=groups.map(([key,label])=>'<option value="'+esc(key)+'"'+(progressGroup===key?' selected':'')+'>'+esc(label)+'</option>').join('');
 const exerciseOptions=entries.map(([identity,e],i)=>({e,i,group:SerieProgress.zone(e,SERIE_CATALOG)}))
  .filter(item=>item.group===progressGroup)
  .map(({e,i})=>'<option value="'+i+'">'+esc(e.name)+' · '+e.min+'–'+e.max+
   ' · '+esc(e.loadProfile?.machine||e.equipment)+(e.loadProfile?.unilateral?' · izq./der.':'')+
   (e.superset?' · superserie':'')+'</option>').join('');
 const modeOptions=[['week','Semanal'],['month','Mensual']].map(([mode,label])=>
   '<option value="'+mode+'"'+(volumeMode===mode?' selected':'')+'>'+label+'</option>').join('');
 const zoneOptions=[['all','Todas las zonas'],...SerieProgress.AXES].map(([key,label])=>
   '<option value="'+esc(key)+'"'+(volumeZone===key?' selected':'')+'>'+esc(label)+'</option>').join('');
 let html='<div class="eyebrow">Evolución del entrenamiento</div><h1>Tu progreso,<br>con perspectiva.</h1>'+
  '<div class="grid progress-summary-grid"><div class="card"><div class="big-stat">'+finished.length+
  '</div><small>entrenamientos guardados</small></div><div class="card"><div class="big-stat">'+
  total+'</div><small>series de trabajo registradas</small></div></div>';
 if(finished.length){
   html+='<div class="progress-volume-grid">'+
     '<section class="card progress-volume-card" aria-labelledby="volume-radar-title">'+
       '<div class="progress-volume-head"><div><div class="eyebrow">Distribución muscular</div>'+
       '<h2 id="volume-radar-title">Volumen por zona</h2></div>'+
       '<label class="progress-small-select">Periodo<select id="volume-period" aria-label="Periodo del volumen muscular" onchange="setVolumeMode(this.value)">'+modeOptions+'</select></label></div>'+
       '<p class="muted small">Series efectivas registradas por zona principal. Compara el periodo actual con el anterior.</p>'+
       '<div id="volume-radar" class="progress-radar"></div>'+
       '<div class="volume-legend"><span><i class="legend-now"></i><span id="volume-now-label">Actual</span></span>'+
       '<span><i class="legend-before"></i><span id="volume-before-label">Anterior</span></span></div>'+
       '<details class="progress-volume-table"><summary>Ver cifras de todas las zonas</summary>'+
       '<div class="table-wrap"><table><thead><tr><th>Zona</th><th>Actual</th><th>Anterior</th></tr></thead>'+
       '<tbody id="volume-muscle-rows"></tbody></table></div></details></section>'+
     '<section class="card progress-volume-card" aria-labelledby="volume-trend-title">'+
       '<div class="eyebrow">Semana a semana / mes a mes</div><h2 id="volume-trend-title">Evolución del volumen</h2>'+
       '<label class="progress-small-select volume-zone-select">Zona corporal<select id="volume-muscle" aria-label="Zona para el historial de volumen" onchange="setVolumeZone(this.value)">'+zoneOptions+'</select></label>'+
       '<div class="progress-volume-kpi"><strong id="volume-series-total">—</strong><span>series en el periodo actual</span></div>'+
       '<div id="volume-trend" class="progress-trend"></div>'+
       '<details class="progress-volume-table"><summary>Ver datos por periodo</summary>'+
       '<div class="table-wrap"><table><thead><tr><th>Periodo</th><th>Series</th></tr></thead>'+
       '<tbody id="volume-trend-rows"></tbody></table></div></details>'+
     '</section></div>'+
   '<p class="muted small progress-method">Se cuentan las series de trabajo completadas, sin calentamientos. Cada serie de un ejercicio unilateral cuenta una vez al terminar ambos lados. Un ejercicio se atribuye a su zona principal, sin sumar de nuevo el trabajo indirecto de otros músculos. Esto describe tu entrenamiento registrado, no mide crecimiento muscular. El periodo actual puede estar incompleto.</p>';
 }else{
   html+='<div class="empty progress-empty">Todavía no hay sesiones terminadas. Cuando guardes entrenamientos, aquí verás la distribución muscular y su evolución semanal y mensual.</div>';
 }
 if(entries.length){
   html+='<details class="card progress-exercise-details" id="exercise-analysis">'+
     '<summary><div><div class="eyebrow">Análisis detallado</div><strong>Progreso por ejercicio</strong>'+
     '<span class="muted small">Abre una zona muscular para comparar las cargas de sus ejercicios.</span></div></summary>'+
     '<div class="progress-exercise-picker">'+
       '<label>Zona corporal<select id="progress-muscle-group" aria-label="Filtrar ejercicios por zona corporal" onchange="setProgressGroup(this.value)">'+groupOptions+'</select></label>'+
       '<label>Ejercicio<select id="progress-exercise" aria-label="Ejercicio para analizar" onchange="renderChart()">'+exerciseOptions+'</select></label></div>'+
     '<div id="chart"></div></details>';
 }
 return html;
}
function setVolumeMode(value){
 if(value!=='week'&&value!=='month')return;
 volumeMode=value;renderVolume();
}
function setVolumeZone(value){
 if(value!=='all'&&!SerieProgress.AXES.some(([zone])=>zone===value))return;
 volumeZone=value;renderVolume();
}
function renderVolume(){
 const radar=document.getElementById('volume-radar'),trend=document.getElementById('volume-trend');
 if(!radar||!trend)return;
 const snap=SerieProgress.snapshot(db.sessions,SERIE_CATALOG,today(),volumeMode);
 const previousKey=SerieProgress.previousKey(snap.rows.at(-1).key,volumeMode);
 radar.innerHTML=SerieProgress.radarSvg(snap.current,snap.previous);
 const names=Object.fromEntries(SerieProgress.AXES);
 document.getElementById('volume-now-label').textContent='Actual · '+SerieProgress.periodLabel(snap.rows.at(-1).key,volumeMode);
 document.getElementById('volume-before-label').textContent='Anterior · '+SerieProgress.periodLabel(previousKey,volumeMode);
 document.getElementById('volume-muscle-rows').innerHTML=SerieProgress.AXES.map(([zone,label])=>
  '<tr><td>'+esc(label)+'</td><td>'+snap.current[zone]+'</td><td>'+snap.previous[zone]+'</td></tr>').join('');
 const selected=volumeZone==='all'?snap.total:snap.current[volumeZone]||0;
 document.getElementById('volume-series-total').textContent=selected;
 trend.innerHTML=SerieProgress.trendSvg(snap.rows,volumeZone,volumeMode);
 document.getElementById('volume-trend-rows').innerHTML=snap.rows.slice().reverse().map(r=>
  '<tr><td>'+SerieProgress.periodLabel(r.key,volumeMode)+'</td><td>'+
  (volumeZone==='all'?r.total:r.values[volumeZone]||0)+'</td></tr>').join('');
}
function setProgressGroup(value){
 if(!SerieProgress.AXES.some(([zone])=>zone===value))return;
 progressGroup=value;
 const picker=document.getElementById('progress-exercise');if(!picker)return;
 picker.innerHTML=progressEntries.map(([identity,e],i)=>({e,i,zone:SerieProgress.zone(e,SERIE_CATALOG)}))
  .filter(item=>item.zone===progressGroup)
  .map(({e,i})=>'<option value="'+i+'">'+esc(e.name)+' · '+e.min+'–'+e.max+
   ' · '+esc(e.loadProfile?.machine||e.equipment)+(e.loadProfile?.unilateral?' · izq./der.':'')+
   (e.superset?' · superserie':'')+'</option>').join('');
 renderChart();
}
function renderChart(){
 const root=document.getElementById('chart');if(!root)return;
 const selected=progressEntries[+document.getElementById('progress-exercise').value];if(!selected)return;
 const [identity,e]=selected,both=!!e.loadProfile?.unilateral;
 const rows=db.sessions.filter(s=>s.completed).sort((a,b)=>a.date.localeCompare(b.date)).flatMap(s=>
   s.exercises.filter(x=>SerieCoach.identity({...x,variant:x.superset?'superset':'straight'})+'|'+x.min+'|'+x.max===identity)
     .map(x=>({date:s.date,sets:x.recordedSets.filter(a=>a.attemptType!=='warmup'&&roundDone(x,a))}))
 ).filter(r=>r.sets.length);
 const maximum=Math.max(1,...rows.flatMap(r=>r.sets.flatMap(a=>both?[number(a.kg)||0,number(a.rightKg)||0]:[number(a.kg)||0])));
 const peak=(r,field)=>Math.max(...r.sets.map(a=>number(a[field])||0));
 const points=(field)=>rows.map((r,i)=>[30+(i/Math.max(1,rows.length-1))*540,180-peak(r,field)/maximum*145]);
 const line=(field,color,label)=>`<polyline points="${points(field).map(p=>p.join(',')).join(' ')}" stroke="${color}" stroke-width="3" fill="none" stroke-linejoin="round"/>${points(field).map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="4" fill="${color}"><title>${label}: ${peak(rows[i],field)} kg · ${rows[i].date}</title></circle>`).join('')}`;
 const legend=both?'<p class="muted small"><strong>● Izquierda</strong> · <span style="color:#bf7d38"><strong>● Derecha</strong></span> · carga máxima por lado</p>':'';
 const details=rows.map(r=>`<tr><td>${esc(r.date)}</td><td>${r.sets.map(a=>both?
   `<span class="side-history"><strong>Izq.</strong> ${esc(a.kg)} kg × ${esc(a.reps)} · RIR ${a.rir==null?'—':esc(a.rir)}<br><strong>Der.</strong> ${esc(a.rightKg)} kg × ${esc(a.rightReps)} · RIR ${a.rightRir==null?'—':esc(a.rightRir)}</span>`:
   `${esc(a.kg)} × ${esc(a.reps)} · ${a.rir==null?'—':esc(a.rir)}`
 ).join('<br>')}</td></tr>`).join('');
 root.innerHTML=`<div class="card"><h2>${esc(e.name)}</h2><p class="muted small">Mayor carga registrada por sesión (kg)${both?', con izquierda y derecha independientes':''}. ${e.loadProfile.mode==='assisted'?'Menos asistencia supone más dificultad.':''}</p>${legend}${rows.length?`<svg class="chart" viewBox="0 0 600 210" role="img" aria-label="Evolución de carga máxima${both?' de cada lado':''}; datos detallados en la tabla"><path d="M30 20V180H580" fill="none" stroke="currentColor" opacity=".25"/>${line('kg','#8aaf35',both?'Izquierda':'Carga')}${both?line('rightKg','#bf7d38','Derecha'):''}</svg>`:''}<div class="table-wrap"><table><thead><tr><th>Fecha</th><th>${both?'Series · izquierda y derecha':'Series · kg × reps · RIR'}</th></tr></thead><tbody>${details}</tbody></table></div></div>`;
}

function settingsHTML(){return `<div class="eyebrow">A tu manera</div><h1>Tu entrenamiento.<br>Tus datos.</h1><section class="card"><h2>Calendario de cuatro días</h2><p class="muted small">Elige un día para cada rutina. Si ya está ocupado, se intercambian los días automáticamente. «Entrenar» se ordena de lunes a domingo.</p><div class="fields">${plans().map((p,i)=>`<label>${esc(p.title)}<select onchange="changeDay(${i},this.value)">${['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map((d,j)=>`<option value="${j}" ${db.days[i]===j?'selected':''}>${d}</option>`).join('')}</select></label>`).join('')}</div></section><section class="card"><h2>Biblioteca de ejercicios</h2><p>${allCatalog().length} ejercicios en ${SERIE_GROUPS.length} zonas musculares, más tus variantes personalizadas.</p><p class="muted">Se añaden desde el botón al final de cada entrenamiento. En «Editar / superserie» puedes cambiar el objetivo o agruparlos.</p></section><section class="card"><h2>Copia de seguridad</h2><p>Los registros se guardan en este navegador. Cada persona empieza con un registro vacío; no se comparten ni se sincronizan entre dispositivos.</p><div class="row"><button onclick="exportData()">Exportar mis datos</button><label class="button">Importar copia<input type="file" accept="application/json,.json" onchange="importData(this.files[0])" hidden></label></div><p class="muted small">Exporta una copia antes de cambiar de móvil o borrar los datos del navegador.</p></section><section class="card"><h2>Apariencia e instalación</h2><button onclick="toggleTheme()">${db.theme==='dark'?'Usar tema claro':'Usar tema oscuro'}</button><button class="small" onclick="openInstallGuide(false)">Cómo instalar SERIE en el móvil</button><p class="muted small">Añádela a la pantalla de inicio para usarla como una aplicación. También puedes instalarla desde el navegador compatible.</p></section><p class="muted small">SERIE · Versión pública 1.0 · Fuerza e hipertrofia.</p>`;}
function changeDay(i,value){const day=Number(value);if(!Number.isInteger(i)||i<0||i>=db.days.length||!Number.isInteger(day)||day<0||day>6){toast('Día no válido.');return;}if(db.days[i]===day)return;const previous=db.days.slice(),other=db.days.findIndex((d,j)=>j!==i&&d===day);if(other>=0)db.days[other]=previous[i];db.days[i]=day;if(!save()){db.days=previous;render();return;}render();if(other>=0)toast('Días intercambiados. Entrenar se ha actualizado.');}
function exportData(){const blob=new Blob([storageError?(localStorage.getItem(KEY)||'{}'):JSON.stringify(db,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='SERIE_'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function validateData(data){if(data?.version!==1||!Array.isArray(data.sessions)||!Array.isArray(data.custom)||!Array.isArray(data.days)||data.days.length!==4||new Set(data.days).size!==4||data.days.some(d=>!Number.isInteger(d)||d<0||d>6))throw Error('Formato incorrecto');const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]+$/.test(x);const validExercise=e=>e&&validId(e.key)&&typeof e.name==='string'&&typeof e.muscle==='string'&&e.sets>0&&e.sets<=30&&Number.isFinite(+e.min)&&Number.isFinite(+e.max)&&+e.min>0&&+e.max>=+e.min;for(const e of data.custom)if(!validExercise(e)||!SERIE_GROUPS.includes(e.muscle))throw Error('Ejercicio incorrecto');const ids=new Set();for(const s of data.sessions){if(!validId(s.id)||ids.has(s.id)||!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||!Number.isFinite(Date.parse(s.date+'T12:00:00'))||typeof s.title!=='string'||!SERIE_PLANS.some(p=>p.key===s.planKey)||!Array.isArray(s.exercises))throw Error('Sesión incorrecta');ids.add(s.id);const eids=new Set();for(const e of s.exercises){if(!validExercise(e)||!validId(e.id)||eids.has(e.id)||(e.superset&&!validId(e.superset))||!Array.isArray(e.recordedSets)||!e.loadProfile)throw Error('Registro incorrecto');eids.add(e.id);
 // Only upgrade unrecorded, in-progress legacy movements. Historical values
 // have no known side and must never be reinterpreted as left-side records.
 const preset=SERIE_CATALOG.find(item=>item.key===e.key);
 if(!s.completed&&preset?.unilateral&&!e.sideMode&&!e.loadProfile.unilateral&&
    e.recordedSets.every(a=>!a.completedAt&&!a.rightCompletedAt)){
   e.sideMode='both';e.unilateral=true;e.loadProfile.unilateral=true;
   for(const a of e.recordedSets){
     if(a.rightKg===undefined)a.rightKg=e.loadProfile.mode==='bodyweight'?0:'';
     if(a.rightReps===undefined)a.rightReps='';
     if(a.rightRir===undefined)a.rightRir='';
     if(a.rightCompletedAt===undefined)a.rightCompletedAt=null;
   }
 }
 for(const a of e.recordedSets)if(!a||typeof a!=='object')throw Error('Serie incorrecta');}}if(data.templates&&(!Array.isArray(data.templates)||data.templates.length!==4||data.templates.some((p,i)=>p.key!==SERIE_PLANS[i].key||!Array.isArray(p.exercises)||p.exercises.some(e=>!validExercise(e)||(e.superset&&!validId(e.superset))))))throw Error('Rutina incorrecta');return {...blank(),...data,theme:data.theme==='dark'?'dark':'light'};}
async function importData(file){if(!file)return;try{if(file.size>10000000)throw Error('La copia supera 10 MB');const candidate=validateData(JSON.parse(await file.text()));if(!confirm('¿Reemplazar los datos de SERIE con esta copia? Exporta antes los actuales si quieres conservarlos.'))return;db=candidate;storageError=false;save();sessionId=null;render();toast('Copia importada');}catch(error){toast('No se ha importado: '+error.message);}}
// Touch-only drag handles leave normal page scrolling available everywhere else.
let dragging=null;
function endDrag(commit){if(!dragging)return;const d=dragging;dragging=null;cancelAnimationFrame(d.frame);document.querySelectorAll('.is-dragging,.drop-target').forEach(n=>n.classList.remove('is-dragging','drop-target'));if(d.handle.hasPointerCapture?.(d.pointer))d.handle.releasePointerCapture(d.pointer);if(commit&&d.moved)moveBlock(d.id,d.to);}
function dragTick(){if(!dragging)return;const d=dragging,rows=[...document.querySelectorAll('#exercises>.exercise')];if(d.moved){if(d.y<90)window.scrollBy(0,-10);else if(d.y>innerHeight-100)window.scrollBy(0,10);}let slot=rows.length;rows.forEach(n=>n.classList.remove('drop-target'));for(let i=0;i<rows.length;i++){const r=rows[i].getBoundingClientRect();if(d.y<r.top+r.height/2){slot=i;break;}}d.to=Math.max(0,Math.min(rows.length-1,slot-(slot>d.from?1:0)));if(d.to!==d.from)rows[d.to]?.classList.add('drop-target');d.frame=requestAnimationFrame(dragTick);}
document.addEventListener('pointerdown',ev=>{const handle=ev.target.closest?.('[data-drag]');if(!handle||ev.button!==0||ev.isPrimary===false||dragging)return;ev.preventDefault();document.activeElement?.blur();const id=handle.dataset.drag;dragging={id,handle,pointer:ev.pointerId,from:supersetBlocks().findIndex(b=>b.members.some(e=>e.id===id)),to:0,y:ev.clientY,start:ev.clientY,moved:false};handle.setPointerCapture?.(ev.pointerId);handle.closest('.exercise').classList.add('is-dragging');dragTick();});
document.addEventListener('pointermove',ev=>{if(dragging&&ev.pointerId===dragging.pointer){ev.preventDefault();dragging.y=ev.clientY;if(Math.abs(ev.clientY-dragging.start)>6)dragging.moved=true;}},{passive:false});
document.addEventListener('pointerup',ev=>{if(dragging&&ev.pointerId===dragging.pointer)endDrag(true);});
for(const name of ['pointercancel','lostpointercapture'])document.addEventListener(name,ev=>{if(dragging&&ev.pointerId===dragging.pointer)endDrag(false);});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape')endDrag(false);const h=ev.target.closest?.('[data-drag]');if(h&&['ArrowUp','ArrowDown'].includes(ev.key)){ev.preventDefault();const index=supersetBlocks().findIndex(b=>b.members.some(e=>e.id===h.dataset.drag));moveBlock(h.dataset.drag,index+(ev.key==='ArrowUp'?-1:1));document.querySelector(`[data-drag="${h.dataset.drag}"]`)?.focus({preventScroll:true});}});
window.addEventListener('blur',()=>endDrag(false));
const baseRender=render;render=function(){baseRender();if(tab==='progress'&&!sessionId){renderVolume();renderChart();}};
render();if(storageError)toast('No se pudo leer el registro guardado. Conserva una copia antes de introducir nuevos datos.');
