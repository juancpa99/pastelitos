// The landing page never creates a workout. Only explicit selection starts one.
let plannedWorkspaceOpen=false;
function workoutLandingHTML(date){
 const p=planFor(date),s=p.type==='gym'?findSession(date,p.key):null;
 return `<div class="training-entry"><span class="context-label">Gimnasio</span><h2>Entrenamiento de fuerza e hipertrofia</h2><p>Elige una sesión y registra tu entrenamiento.</p><button class="btn" onclick="openTrainingSelector()">Iniciar sesión</button>${s?.startedAt&&!s.completed?'<button class="btn secondary" onclick="openPlannedWorkspace()">Continuar entrenamiento</button>':''}</div>
 <div class="training-entry"><span class="context-label">Piscina</span><h2>Entrenamiento de natación</h2><p>Apunta lo que has hecho al terminar.</p><button class="btn secondary" onclick="openSwimRegistration()">Registrar sesión</button></div>
 ${disclosureHTML('workout-week','Semana y planificación',typeof oct26FlexContext==='function'&&oct26FlexContext(date)?oct26WeeklyPoolHTML(date):'<button class="btn secondary" onclick="openPendingWorkouts()">Ver sesiones pendientes</button>')}
 ${disclosureHTML('workout-extras','Otras sesiones e historial',extraSessionsHTML(date)+(typeof seasonComplementHTML==='function'?seasonComplementHTML(date):'')+ (p.type==='cardio'?cardioHTML(date):''))}`;
}
function trainingChoices(){
 const date=currentDate();
 if(typeof oct26FlexContext==='function'&&oct26FlexContext(date))return oct26WeekOrder(date).map(key=>oct26TemplateForKey(key,date));
 return [...new Map(Object.values(getPlans()[state.settings.mode]||{}).filter(p=>p.type==='gym').map(p=>[p.key,p])).values()];
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
