/* Selectable programmes. Templates never migrate recorded sessions. */
(function () {
  const START = '2026-11-14', days = [1,2,4,6];
  const keys = ['four_shoulders','four_legs','four_back','four_chest'];
  const active = d => MarevoCoach.programFor(state,d) === 4;
  const e = (key,name,sets,min,max,muscle,note='') => ({key,name,type:'strength',sets,min,max,muscle,rir:'1–2',rest:min<=12?'2–3 min':'60–90 s',note});
  const plans = [
    {title:'Día 1 · Hombros, pecho y brazos',exercises:[
      e('military_press','Press militar',3,6,10,'Hombros + tríceps'),
      e('cable_lateral_raise','Elevaciones laterales',3,15,20,'Deltoide lateral'),
      e('reverse_fly','Pájaros',3,15,20,'Deltoide posterior'),
      e('incline_db_press','Press de banca inclinado con mancuernas',3,6,10,'Pectoral superior + tríceps'),
      e('cable_fly','Aperturas en polea',3,15,20,'Pectoral'),
      e('bayesian_cable_curl','Curl de bíceps en polea con codo detrás',3,10,10,'Bíceps'),
      e('hammer_curl','Curl martillo',3,15,20,'Bíceps + braquial'),
      e('triceps_pushdown','Tríceps en polea alta',3,10,10,'Tríceps'),
      e('overhead_triceps','Tríceps por encima de la cabeza en polea',3,15,20,'Tríceps'),
      {...e('wrist_curl','Curl de muñeca · antebrazo',4,1,50,'Antebrazo','4 series al fallo técnico. Registra las repeticiones reales; el rango abierto es solo para el registro, no un objetivo de 50.'),rir:'0',repPolicy:'failure'}
    ]},
    {title:'Día 2 · Pierna y espalda',exercises:[
      e('back_squat','Sentadilla',4,10,15,'Cuádriceps + glúteo'),e('leg_press','Prensa',4,10,15,'Cuádriceps + glúteo'),
      e('hip_thrust','Hip thrust',3,10,12,'Glúteo'),e('leg_extension','Extensión de rodilla',3,15,20,'Cuádriceps'),
      e('seated_cable_row','Remo bajo en polea',3,6,10,'Espalda'),e('cable_pullover','Pullover en polea',3,15,20,'Dorsal'),
      e('standing_calf','Gemelo de pie',3,15,15,'Gemelos'),
      {key:'four_core_resistance',name:'Abdominales y oblicuos · resistencia',type:'mobility',group:'Core',dose:'Plancha frontal y lateral · duración libre',note:'La imagen no fija series ni tiempo. Registra la duración en notas; termina al perder la posición.',done:false}
    ]},
    {title:'Día 4 · Espalda y pierna',exercises:[
      e('pull_up','Dominadas',3,6,10,'Dorsal + bíceps'),e('lat_pulldown','Jalón al pecho',3,8,12,'Dorsal + bíceps'),
      e('barbell_row','Remo con barra',3,15,20,'Espalda'),e('sumo_deadlift','Peso muerto sumo',3,8,10,'Glúteo + isquios'),
      {...e('bulgarian_split_squat','Sentadilla búlgara',3,8,12,'Cuádriceps + glúteo'),unilateral:true},
      e('seated_leg_curl','Curl femoral sentado',3,15,15,'Isquios'),
      {...e('pallof_press','Pallof press en polea',3,20,20,'Core'),unilateral:true},
      {...e('cable_woodchop','Rotación diagonal en polea',3,20,20,'Oblicuos'),unilateral:true},
      {...e('side_bend','Flexión lateral con mancuerna',3,20,20,'Oblicuos'),unilateral:true}
    ]},
    {title:'Día 5 · Pecho y hombros',exercises:[
      e('bench_press','Press de banca',3,6,10,'Pectoral + tríceps'),e('cable_fly','Aperturas en polea',3,8,12,'Pectoral'),
      e('incline_db_press','Press inclinado con mancuernas',3,15,20,'Pectoral superior + tríceps'),
      e('military_press','Press militar',3,15,20,'Hombros + tríceps'),
      e('full_lateral_raise','Elevaciones laterales completas',3,15,20,'Deltoide lateral'),e('standing_calf','Gemelo de pie',3,15,15,'Gemelos'),
      e('cable_crunch','Crunch abdominal en polea',3,20,20,'Abdomen'),
      e('machine_crunch','Crunch en máquina',3,20,20,'Abdomen'),
      e('weighted_reverse_crunch','Crunch inverso con carga',3,20,20,'Abdomen')
    ]}
  ].map((p,i)=>({...p,key:keys[i],type:'gym',block:'Fuerza e hipertrofia · 4 días',subtitle:'Progresión según cargas, repeticiones y RIR'}));
  function template(k,d){const p=structuredClone(plans.find(p=>p.key===k));if(!p)return null;p.exercises.forEach(e=>{e.loadProfile=state.equipmentProfiles?.[e.key]||loadProfile(e);if(e.type==='strength')e.variant='four:'+e.min+'-'+e.max;});return p;}
  window.marevoSetProgram=function(value){
    const count=Number(value);if(![3,4].includes(count))return;
    const date=todayISO()<START?START:todayISO();
    state.coach={...coachStore(),programHistory:[...(coachStore().programHistory||[]).filter(x=>x.date!==date),{date,days:count}].sort((a,b)=>a.date.localeCompare(b.date))};
    saveState(true);closeModal();renderAll();toast('Plan de '+count+' días seleccionado');
  };
  function selector(d){return '<div class="card"><label for="marevo-program"><strong>Tu rutina</strong></label><select id="marevo-program" onchange="marevoSetProgram(this.value)" style="width:100%;margin-top:10px;padding:12px"><option value="3" '+(!active(d)?'selected':'')+'>3 días · Push / Pull / Legs</option><option value="4" '+(active(d)?'selected':'')+'>4 días · Fuerza e hipertrofia</option></select><p class="subtitle">'+(active(d)?'Lunes, martes, jueves y sábado. Lunes también puedes registrar natación.':'Martes, jueves y sábado. Domingo opcional.')+' El cambio se aplica desde hoy a nuevas sesiones; tus registros se conservan.</p></div>';}
  const old={plan:planFor,template:oct26TemplateForKey,order:oct26WeekOrder,slots:oct26SlotIndicesForDate,choices:trainingChoices,start:oct26StartWeeklySession,landing:workoutLandingHTML,pool:oct26WeeklyPoolHTML,plans:coachPlans,label:homeWeekLabel,pending:openPendingWorkouts,settings:renderSettings,planHTML:coachPlanHTML,flex:oct26FlexContext,rules:oct26RulesHTML,focus:oct26WeekFocus};
  oct26FlexContext=d=>active(d||currentDate())||old.flex(d);
  oct26WeekOrder=(d=currentDate())=>active(d)?keys.slice():old.order(d);
  oct26TemplateForKey=(k,d=currentDate())=>keys.includes(k)?template(k,d):old.template(k,d);
  oct26SlotIndicesForDate=d=>active(d)?(days.includes(weekday(d))?[days.indexOf(weekday(d))]:[]):old.slots(d);
  planFor=function(d){if(!active(d))return old.plan(d);const k=keys[days.indexOf(weekday(d))];return k&&!oct26WeeklyRecords(d,k).some(s=>s.completed&&s.date!==d)?template(k,d):{key:'four_rest_'+weekday(d),title:oct26SwimDay(d)?'Natación':'Descanso',type:'rest',exercises:[]};};
  oct26PlanForDate=planFor;
  homeWeekLabel=d=>active(d)?planFor(d).title:old.label(d);
  const allowed=d=>![3,5].includes(weekday(d))||marevoNoSwimOnDate(d);
  trainingChoices=()=>active(currentDate())?(allowed(currentDate())?keys.filter(k=>!oct26WeeklyCompleted(currentDate(),k)).map(k=>template(k,currentDate())):[]):old.choices();
  oct26StartWeeklySession=function(k){
    const d=currentDate();if(!active(d))return old.start(k);if(!keys.includes(k)||!allowed(d))return;
    const st=oct26SessionStatus(d,k);if(st.state==='done'){toast('Sesión completada esta semana');return;}
    if(st.state==='active'){closeModal();if(st.record.id)editExtraSession(st.record.id);else{document.getElementById('selectedDate').value=st.record.date;showView('Workout');openPlannedWorkspace();}return;}
    const p=template(k,d),id='four_'+Date.now().toString(36);
    const exercises=coachApplyChanges(p.exercises.map(e=>normalizeSessionExercise({...e,recordedSets:[]})),d,'solo');
    const s={id,date:d,title:p.title,weeklyTemplateKey:k,weeklyWeekStart:mondayOf(d),completed:false,startedAt:Date.now(),duration:null,rpe:null,exercises};
    state.extraSessions.push(s);coachRecordApplied(s);saveState(true);closeModal();showView('Workout');editExtraSession(id);
  };
  openPendingWorkouts=()=>active(currentDate())?openTrainingSelector():old.pending();
  oct26WeeklyPoolHTML=function(d=currentDate()){if(!active(d))return old.pool(d);return '<div class="card"><strong>4 sesiones · fuerza e hipertrofia</strong>'+keys.map((k,i)=>'<p>'+['Lunes','Martes','Jueves','Sábado'][i]+' · '+esc(plans[i].title)+' · '+esc(oct26SessionStatus(d,k).label)+'</p>').join('')+'<p>Miércoles, viernes y domingo: sin fuerza programada. Primero suma repeticiones; sube el peso cuando completes el rango con el RIR previsto.</p></div>';};
  workoutLandingHTML=function(d){if(!active(d))return selector(d)+old.landing(d);const rec=trainingStrengthRecords(d).find(s=>!s.completed);return selector(d)+'<div class="training-entry"><h2>Registrar entrenamiento</h2><div class="actions">'+(rec?'<button class="btn" onclick="'+(rec.id?"editExtraSession('"+rec.id+"')":'openPlannedWorkspace()')+'">Continuar sesión</button>':'')+(allowed(d)?'<button class="btn" onclick="openTrainingSelector()">Elegir sesión de fuerza</button>':'')+(trainingSwimAvailable(d)?'<button class="btn secondary" onclick="openSwimRegistration()">Registrar natación</button>':'')+'</div></div>'+disclosureHTML('workout-week','Semana y planificación',oct26WeeklyPoolHTML(d))+disclosureHTML('workout-extras','Otras sesiones e historial',extraSessionsHTML(d));};
  coachPlans=d=>active(d)?keys.map(k=>template(k,d)):old.plans(d);
  coachPlanHTML=d=>selector(d)+old.planHTML(d);
  renderSettings=function(){old.settings();document.getElementById('viewSettings').insertAdjacentHTML('afterbegin',selector(todayISO()));};
  oct26RulesHTML=(d=currentDate())=>active(d)?oct26WeeklyPoolHTML(d):old.rules(d);
  oct26WeekFocus=(d=currentDate())=>active(d)?'Cuatro sesiones. Conserva la técnica y el RIR; progresa con tus registros.':old.focus(d);
  const oldVolume=weeklyPlannedMuscleSets;
  weeklyPlannedMuscleSets=function(){if(!active(currentDate()))return oldVolume();const out=Object.fromEntries(MUSCLE_AXES.map(x=>[x[0],0]));coachPlans(currentDate()).forEach(p=>p.exercises.filter(e=>e.type==='strength').forEach(e=>muscleGroupsForExercise(e).forEach(g=>{if(g in out)out[g]+=e.sets;})));return out;};
  const oldCard=exerciseCardHTML;
  exerciseCardHTML=function(e,i,scope){const html=oldCard(e,i,scope);return e.repPolicy==='failure'?html.replaceAll('1–50','al fallo técnico').replaceAll('1-50','reps reales'):html;};
  renderAll();
})();
