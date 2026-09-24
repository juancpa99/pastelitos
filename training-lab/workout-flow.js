// The landing page never creates a workout. Only explicit selection starts one.
let plannedWorkspaceOpen=false;
function workoutLandingHTML(date){
 const p=planFor(date),planned=p.type==='gym'?findSession(date,p.key):null;
 const activeExtra=state.extraSessions.find(s=>s.date===date&&s.startedAt&&!s.completed&&s.exercises?.some(e=>e.type==='strength'));
 const plannedActive=!!(planned?.startedAt&&!planned.completed),strengthActive=plannedActive||!!activeExtra;
 const strengthAction=plannedActive?'openPlannedWorkspace()':activeExtra?`editExtraSession('${activeExtra.id}')`:'openTrainingSelector()';
 const swimRecord=(state.swim||[]).find(s=>s.date===date&&s.completed);
 return `<div class="training-entry training-hub">
  <span class="context-label">Entrenamiento</span>
  <h2>Registrar entrenamiento</h2>
  <div class="training-mode-list">
   <button type="button" class="training-mode-choice" onclick="${strengthAction}"><span class="training-mode-icon" aria-hidden="true">F</span><span class="training-mode-copy"><strong>Fuerza</strong><small>${strengthActive?'Sesión en curso · continuar':'Elegir e iniciar una sesión'}</small></span><span class="training-mode-chevron" aria-hidden="true">›</span></button>
   <button type="button" class="training-mode-choice" onclick="openSwimRegistration()"><span class="training-mode-icon" aria-hidden="true">N</span><span class="training-mode-copy"><strong>Natación</strong><small>${swimRecord?'Sesión registrada · revisar o editar':'Registrar al terminar'}</small></span><span class="training-mode-chevron" aria-hidden="true">›</span></button>
  </div>
 </div>
 ${disclosureHTML('workout-week','Semana y planificación',typeof oct26FlexContext==='function'&&oct26FlexContext(date)?oct26WeeklyPoolHTML(date):'<button class="btn secondary" onclick="openPendingWorkouts()">Ver sesiones pendientes</button>')}
 ${disclosureHTML('workout-extras','Otras sesiones e historial',extraSessionsHTML(date)+(typeof seasonComplementHTML==='function'?seasonComplementHTML(date):'')+ (p.type==='cardio'?cardioHTML(date):''))}`;
}
function trainingChoices(){
 const date=currentDate(),recommended=planFor(date).key;
 const prioritize=rows=>rows.sort((a,b)=>Number(b.key===recommended)-Number(a.key===recommended));
 if(typeof oct26FlexContext==='function'&&oct26FlexContext(date))return prioritize(oct26WeekOrder(date).map(key=>oct26TemplateForKey(key,date))); 
 return prioritize([...new Map(Object.values(getPlans()[state.settings.mode]||{}).filter(p=>p.type==='gym').map(p=>[p.key,p])).values()]);
}
function openTrainingSelector(){
 const recommended=planFor(currentDate()).key;
 document.getElementById('modalRoot').innerHTML=`<div class="modal"><div class="sheet" role="dialog" aria-modal="true" aria-label="Elegir entrenamiento"><div class="row between"><h2>Elige tu sesión</h2><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><p class="subtitle">La recomendada sigue tu calendario. Puedes elegir otra.</p><div class="training-choices">${trainingChoices().map((p,i)=>{const st=typeof oct26FlexContext==='function'&&oct26FlexContext(currentDate())?oct26SessionStatus(currentDate(),p.key):null;return `<button class="training-choice" onclick="chooseTraining(${i})"><span>${p.key===recommended?'<small>Recomendada para hoy</small>':''}<strong>${esc(p.title)}</strong><small>${p.exercises.length} ejercicios${st?' · '+st.label:''}</small></span><span aria-hidden="true">›</span></button>`}).join('')}</div></div></div>`;
}
function chooseTraining(index){
 const p=trainingChoices()[index];if(!p)return;
 if(typeof oct26FlexContext==='function'&&oct26FlexContext(currentDate())){oct26StartWeeklySession(p.key);return;}
 if(planFor(currentDate()).key===p.key){closeModal();startGym();return;}
 const existing=state.extraSessions.find(s=>s.date===currentDate()&&s.sourceKey===p.key&&!s.completed);
 if(existing){editExtraSession(existing.id);return;}
 watchReminder(()=>{const id='chosen_'+Date.now().toString(36);state.extraSessions.push({id,date:currentDate(),sourceKey:p.key,title:p.title,startedAt:Date.now(),completed:false,exercises:p.exercises.map(e=>normalizeSessionExercise({...structuredClone(e),recordedSets:[]}))});saveState();editExtraSession(id);});
}
function openPlannedWorkspace(){
 const p=planFor(currentDate()),s=p.type==='gym'?findSession(currentDate(),p.key):null;
 if(p.type!=='gym'){openTrainingSelector();return;}
 if(!s?.startedAt){startGym();return;}
 plannedWorkspaceOpen=true;refreshPlannedWorkspace();
}
function closePlannedWorkspace(){
 if(document.querySelector('[data-gym="planned"]'))saveScopeInputs('planned');
 plannedWorkspaceOpen=false;document.getElementById('workoutWorkspace')?.remove();renderWorkout();
 document.querySelector('[onclick="openTrainingSelector()"]')?.focus({preventScroll:true});
}
function refreshPlannedWorkspace(){
 const p=planFor(currentDate()),s=p.type==='gym'?findSession(currentDate(),p.key):null;
 if(!plannedWorkspaceOpen)return;
 if(!s?.startedAt||s.completed){plannedWorkspaceOpen=false;document.getElementById('workoutWorkspace')?.remove();return;}
 let root=document.getElementById('workoutWorkspace');
 if(!root){root=document.createElement('section');root.id='workoutWorkspace';root.className='workout-workspace';root.setAttribute('aria-label','Entrenamiento en curso');document.body.append(root);}
 const y=root.scrollTop;rememberDisclosures(root);
 root.innerHTML=`<div class="workspace-inner"><div class="workspace-toolbar"><span>Entrenamiento en curso</span><button class="btn ghost small" onclick="closePlannedWorkspace()">Volver a Entreno</button></div>${gymHTML(p,currentDate())}</div>`;
 root.scrollTop=y;
}
function openSwimRegistration(){
 document.getElementById('modalRoot').innerHTML=`<div class="modal"><div class="sheet" role="dialog" aria-modal="true" aria-label="Registrar natación"><div class="row between"><h2>Registrar natación</h2><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div>${swimHTML(currentDate())}</div></div>`;
}
