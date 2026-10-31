// MAREVO November 2026: three realistic weekly sessions.
// Applied only from 2 to 29 November. Earlier training plans and saved records stay untouched.
(function(){
  const START="2026-11-02", END="2026-11-29";
  const KEYS=["nov26_push","nov26_pull","nov26_legs"];
  const DAYS=[{day:2,label:"Martes · Push"},{day:4,label:"Jueves · Pull"},{day:6,label:"Pierna · pendiente semanal"}];
  function inBlock(date){return typeof date==="string"&&date>=START&&date<=END}
  function weekOf(date){return inBlock(date)?Math.min(4,Math.floor((Date.parse(date+"T12:00:00Z")-Date.parse(START+"T12:00:00Z"))/604800000)+1):0}
  function strength(key,name,sets,min,max,muscle,rest,note,rir="1–2"){
    return {key:key,name:name,type:"strength",sets:sets,min:min,max:max,rir:rir,rest:rest,muscle:muscle,note:note};
  }
  const PLANS={
    nov26_push:{key:"nov26_push",title:"PUSH · Pecho, hombro y tríceps",type:"gym",subtitle:"Entreno compartido · 19 series · máximo 90 min",exercises:[
      strength("bench_press","Press de banca plano",3,6,8,"Pectoral + tríceps + deltoide anterior","2–3 min","Mantén el press de banca compartido. Calienta con aproximaciones sin contarlas como efectivas."),
      strength("incline_db_press","Press inclinado con mancuernas · 20–30°",4,8,12,"Pectoral superior + tríceps","2–3 min","Prioridad al pectoral superior; controla la bajada y progresa repeticiones antes de peso."),
      strength("incline_db_fly","Aperturas con mancuernas en banco inclinado",3,10,15,"Pectoral","90–120 s","Apertura estable con codos semiflexionados. No fuerces el estiramiento del hombro."),
      strength("cable_lateral_raise","Elevaciones laterales · polea o mancuernas",3,12,20,"Deltoide lateral","60–90 s","Sustituye al squeeze press: ya hay banca, inclinado y aperturas. Hasta altura del hombro, sin impulso."),
      strength("triceps_pushdown","Extensión de tríceps en polea alta",3,10,15,"Tríceps","60–90 s","Brazos al costado; extensión completa sin balanceos."),
      strength("overhead_triceps","Extensión de tríceps por encima de cabeza · polea",3,10,15,"Tríceps","60–90 s","Codo elevado; énfasis en cabeza larga. Si molesta el hombro cambia la variante.")
    ]},
    nov26_pull:{key:"nov26_pull",title:"PULL · Espalda, bíceps y hombro",type:"gym",subtitle:"Entreno compartido · 22 series · máximo 90 min",exercises:[
      strength("pull_up","Dominadas en barra",3,6,10,"Dorsal + bíceps + espalda","2–3 min","Sin balanceo. Utiliza asistencia si es necesaria para completar el rango."),
      strength("chest_supported_row","Remo con barra, pecho apoyado en banco elevado",4,8,12,"Espalda media + dorsal + deltoide posterior","2–3 min","Conservar el remo que ya hacéis; evita impulso y prioriza retracción escapular."),
      strength("single_arm_cable_row","Remo unilateral en polea · codo hacia cadera",3,10,15,"Dorsal + espalda media + bíceps","90–120 s","Sustituye las dominadas en anillas por un patrón horizontal con énfasis dorsal. Tres series por lado; no son seis series semanales."),
      strength("face_pull","Face pull en polea alta",3,12,20,"Deltoide posterior + espalda alta","60–90 s","Tira hacia la cara abriendo la cuerda; no necesita ser una serie al fallo."),
      strength("bayesian_cable_curl","Curl de bíceps en polea con codo detrás",3,8,12,"Bíceps","60–90 s","Codo ligeramente detrás del tronco; no balancees el hombro."),
      strength("hammer_curl","Curl martillo",3,10,15,"Bíceps + braquial + braquiorradial","60–90 s","Agarre neutro. Sustituye el tercer curl redundante."),
      strength("cable_lateral_raise","Elevaciones laterales en polea",3,12,20,"Deltoide lateral","60–90 s","Segunda exposición semanal del deltoide lateral.")
    ]},
    nov26_legs:{key:"nov26_legs",title:"LEGS · Pierna completa + hombro y core",type:"gym",subtitle:"Sábado o domingo · 26 series objetivo · máximo 90 min",exercises:[
      strength("hack_squat","Sentadilla hack",4,6,10,"Cuádriceps + glúteo","2–3 min","Empieza por la variante estable y profunda que controles. Evita ir al fallo."),
      strength("rdl","Peso muerto rumano",3,8,10,"Isquios + glúteo","2–3 min","Bisagra de cadera controlada, barra cerca del cuerpo; nunca forzar repeticiones técnicas."),
      strength("leg_press","Prensa de piernas",4,10,15,"Cuádriceps + glúteo","2–3 min","Recorrido amplio sin despegar la pelvis."),
      strength("seated_leg_curl","Curl femoral sentado",3,10,15,"Isquios","75–120 s","Sin rebotes, controla la fase de estiramiento."),
      strength("hip_thrust","Hip thrust",3,8,12,"Glúteo","90–120 s","Pausa breve arriba, sin hiperextensión lumbar."),
      strength("standing_calf","Gemelos de pie",3,10,15,"Gemelos","60–90 s","Recorrido completo y pausa en estiramiento; alternar con crunch si hay tiempo."),
      strength("cable_lateral_raise","Elevaciones laterales en polea",3,12,20,"Deltoide lateral","60–90 s","Tercera exposición semanal; serie estricta y estable."),
      strength("cable_crunch","Crunch abdominal en polea",3,10,15,"Abdomen + recto abdominal","60–90 s","Flexiona el tronco, no solo la cadera. Alternar con gemelos si la estación lo permite.")
    ]}
  };
  function template(key,date){
    const base=PLANS[key]; if(!base)return null;
    const plan=structuredClone(base),w=weekOf(date);
    if(key==="nov26_legs"){
      // 20 -> 24 -> 26 -> 26. Torso stays at its usual volume.
      const reductions=w===1?{hack_squat:3,rdl:2,leg_press:3,seated_leg_curl:2,hip_thrust:2,standing_calf:2}:
        w===2?{leg_press:3,standing_calf:2}:{};
      plan.exercises.forEach(function(e){
        if(Object.prototype.hasOwnProperty.call(reductions,e.key))e.sets=reductions[e.key];
        e.rir=w===1?"2–3":"1–2";
      });
      if(w===1)plan.subtitle="Adaptación de piernas · 20 series · 2–3 RIR · máximo 90 min";
      if(w===2)plan.subtitle="Progresión de piernas · 24 series · 1–2 RIR · máximo 90 min";
    }
    plan.block="MAREVO PPL 3 días · noviembre 2026";
    plan.progressionWeek=w;
    return plan;
  }
  function title(date){
    const n=weekOf(date);
    return ["","Semana 1 · Volver a cargar","Semana 2 · Acumular volumen","Semana 3 · Volumen completo","Semana 4 · Consolidar"][n]||"";
  }
  function focus(date){
    const n=weekOf(date);
    return ["",
      "Pecho y espalda al volumen habitual; pierna con 20 series y RIR 2–3. Aprende las cargas sin perseguir el fallo.",
      "Mantén el torso y sube piernas a 24 series si la recuperación es adecuada; busca sumar repeticiones.",
      "Objetivo: 67 series en tres sesiones (19 Push, 22 Pull, 26 Legs). Progresa cargas solo al completar el rango con técnica y RIR correctos.",
      "Consolida el volumen y compara pesos, repeticiones, tiempo y recuperación. Reduce series si las sesiones superan 90 minutos o cae el rendimiento."
    ][n]||"";
  }
  function weeklyStatus(date,key){return oct26SessionStatus(date,key)}
  function weekendAlreadyCompletedOtherDate(date){
    if(![0,6].includes(weekday(date)))return false;
    const rows=oct26WeeklyRecords(date,"nov26_legs");
    return rows.some(function(s){return s.completed&&s.date!==date});
  }
  function rest(date){
    return {key:"nov26_rest_"+weekday(date),title:oct26SwimDay(date)?"Natación":"Descanso",type:"rest",subtitle:oct26SwimDay(date)?"Registrar natación al terminar":"Sin gimnasio obligatorio",exercises:[]};
  }
  function dayPlan(date){
    const day=weekday(date);
    const key=day===2?KEYS[0]:day===4?KEYS[1]:[0,6].includes(day)&&!weekendAlreadyCompletedOtherDate(date)?KEYS[2]:null;
    return key?template(key,date):rest(date);
  }
  const oldTemplate=oct26TemplateForKey;
  oct26TemplateForKey=function(key,date=currentDate()){
    if(inBlock(date)&&PLANS[key])return template(key,date);
    return oldTemplate(key,date);
  };
  const oldWeekOrder=oct26WeekOrder;
  oct26WeekOrder=function(date=currentDate()){
    return inBlock(date)?KEYS.slice():oldWeekOrder(date);
  };
  const oldSlotIndices=oct26SlotIndicesForDate;
  oct26SlotIndicesForDate=function(date){
    if(!inBlock(date))return oldSlotIndices(date);
    const day=weekday(date);
    if(day===2)return [0];
    if(day===4)return [1];
    if([0,6].includes(day)&&!weekendAlreadyCompletedOtherDate(date))return [2];
    return [];
  };
  const oldPlanFor=planFor;
  planFor=function(date){return inBlock(date)?dayPlan(date):oldPlanFor(date)};
  const oldPlanForDate=oct26PlanForDate;
  oct26PlanForDate=function(date){return inBlock(date)?dayPlan(date):oldPlanForDate(date)};
  const oldWeek=oct26Week,oldTitle=oct26WeekTitle,oldFocus=oct26WeekFocus;
  oct26Week=function(date=currentDate()){return inBlock(date)?weekOf(date):oldWeek(date)};
  oct26WeekTitle=function(date=currentDate()){return inBlock(date)?title(date):oldTitle(date)};
  oct26WeekFocus=function(date=currentDate()){return inBlock(date)?focus(date):oldFocus(date)};
  const oldLabel=oct26FlexibleWeekLabel;
  oct26FlexibleWeekLabel=function(date){
    if(!inBlock(date))return oldLabel(date);
    if(weekday(date)===2)return PLANS.nov26_push.title;
    if(weekday(date)===4)return PLANS.nov26_pull.title;
    if([0,6].includes(weekday(date))&&!weekendAlreadyCompletedOtherDate(date))return PLANS.nov26_legs.title;
    return oct26SwimDay(date)?"Natación":"Descanso / recuperar";
  };
  oct26WeekLabel=oct26FlexibleWeekLabel;
  const oldHomeWeekLabel=homeWeekLabel;
  homeWeekLabel=function(date){return inBlock(date)?oct26FlexibleWeekLabel(date):oldHomeWeekLabel(date)};
  const oldSecondary=oct26SecondaryTuesdayHTML;
  oct26SecondaryTuesdayHTML=function(date=currentDate()){return inBlock(date)?"":oldSecondary(date)};
  const oldStart=oct26StartWeeklySession;
  oct26StartWeeklySession=function(key){
    const date=currentDate();
    if(!inBlock(date)||!PLANS[key])return oldStart(key);
    const status=weeklyStatus(date,key);
    if(status.state==="done"){toast("Esta sesión ya está hecha esta semana");return}
    if(status.state==="active"){
      if(status.record.id){closeModal();editExtraSession(status.record.id)}
      else{closeModal();document.getElementById("selectedDate").value=status.record.date;showView("Workout");openPlannedWorkspace()}
      return;
    }
    if(planFor(date).key===key){closeModal();showView("Workout");startGym();return}
    const p=template(key,date);
    const id="nov26_"+Date.now().toString(36);
    state.extraSessions.push({id:id,date:date,title:p.title,weeklyTemplateKey:key,weeklyWeekStart:mondayOf(date),completed:false,startedAt:Date.now(),duration:null,rpe:null,activeKcal:null,exercises:p.exercises.map(function(e){return normalizeSessionExercise(Object.assign({},e,{recordedSets:[]}))})});
    saveState();closeModal();renderAll();editExtraSession(id);
  };
  function actionButton(key,date){
    const st=weeklyStatus(date,key);
    if(oct26SwimDay(date))return '<span class="pill">'+st.label+'</span>';
    if(st.state==="done")return '<span class="pill good">Hecha</span>';
    return '<button class="btn secondary small" onclick="oct26StartWeeklySession(\''+key+'\')">'+(st.state==="active"?"Continuar":"Iniciar")+'</button>';
  }
  function pool(date){
    const rows=DAYS.map(function(slot,i){
      const key=KEYS[i],s=weeklyStatus(date,key),p=PLANS[key];
      return '<div class="task"><div class="ico">'+(i+1)+'</div><div style="min-width:0"><strong>'+esc(slot.label)+' · '+esc(p.title)+'</strong><small>'+s.label+' · '+(i===2?"Recuperación opcional el fin de semana":"Sesión principal compartible")+'</small></div>'+actionButton(key,date)+'</div>';
    }).join("");
    const count=KEYS.filter(function(k){return oct26WeeklyCompleted(date,k)}).length;
    return '<div class="section oct26-week-pool-section">Tus 3 sesiones · noviembre</div><div class="card oct26-week-pool"><div class="row between"><div><div class="eyebrow">Semana de hipertrofia</div><strong>Martes · Jueves · Recuperación opcional</strong></div><span class="pill">'+count+'/3</span></div><p class="subtitle" style="margin-top:8px">Máximo 90 min por sesión. Natación lunes, miércoles y viernes. El fin de semana puedes recuperar sesiones pendientes, incluida pierna; las ya completadas no se repiten.</p>'+rows+'<div class="callout" style="margin-top:10px">'+esc(focus(date))+'</div></div>';
  }
  const oldPool=oct26WeeklyPoolHTML;
  oct26WeeklyPoolHTML=function(date=currentDate()){return inBlock(date)?pool(date):oldPool(date)};
  const oldRules=oct26RulesHTML;
  oct26RulesHTML=function(date=currentDate()){
    if(!inBlock(date))return oldRules(date);
    return '<div class="card oct26-cycle-card"><div class="eyebrow">Bloque MAREVO · 3 nov–29 nov 2026</div><div class="hero-title" style="font-size:19px">'+esc(title(date))+'</div><div class="callout" style="margin-top:8px">'+esc(focus(date))+'</div><details style="margin-top:10px"><summary>Progresión y reglas del mes</summary><p class="subtitle">Semana 1: 19 + 22 + 20 = 61 series. Semana 2: 19 + 22 + 24 = 65. Semanas 3–4: 19 + 22 + 26 = 67. Series de calentamiento no cuentan. En torso, 1–2 RIR; en piernas, 2–3 RIR la primera semana y 1–2 después. Suma repeticiones antes de subir peso. Respeta descansos de 2–3 min en compuestos; el tiempo límite son 90 min. Si no cabe, recorta accesorios antes de acelerar la técnica. Los registros anteriores permanecen intactos.</p></details></div>';
  };
  const oldPending=openPendingWorkouts;
  openPendingWorkouts=function(){
    if(!inBlock(currentDate()))return oldPending();
    const date=currentDate(),pending=KEYS.filter(function(key){return !oct26WeeklyCompleted(date,key)});
    const buttons=pending.map(function(key){const status=weeklyStatus(date,key);return '<button class="btn secondary pending-choice" onclick="oct26StartWeeklySession(\''+key+'\')">'+(status.state==="active"?"Continuar":"Hacer hoy")+' · '+esc(PLANS[key].title)+'</button>'}).join("");
    document.getElementById("modalRoot").innerHTML='<div class="modal"><div class="sheet"><div class="row between"><h2>Pendientes de esta semana</h2><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div>'+(buttons||'<p>3/3 sesiones completadas.</p>')+'</div></div>';
  };
  const oldMuscleSets=weeklyPlannedMuscleSets;
  weeklyPlannedMuscleSets=function(){
    const date=currentDate();if(!inBlock(date))return oldMuscleSets();
    const out=Object.fromEntries(MUSCLE_AXES.map(function(x){return [x[0],0]}));
    KEYS.forEach(function(key){
      template(key,date).exercises.forEach(function(e){
        muscleGroupsForExercise(e).forEach(function(group){if(group in out)out[group]+=e.sets});
      });
    });
    return out;
  };
  const oldAdvice=exerciseAdvice;
  exerciseAdvice=function(exercise,date=currentDate()){
    if(!inBlock(date)||!exercise||!exercise.key)return oldAdvice(exercise,date);
    return 'Noviembre: completa el rango de repeticiones con el RIR indicado; sube la carga mínima cuando completes todas las series con técnica correcta. '+(exercise.note||'');
  };
  const oldCompleted=oct26CompletedSessions;
  oct26CompletedSessions=function(end){
    if(end<START)return oldCompleted(end);
    return [...(state.sessions||[]),...(state.extraSessions||[])].filter(function(s){
      const key=s.weeklyTemplateKey||s.key||s.sourceKey;
      return s.completed&&s.date>=START&&s.date<=end&&KEYS.includes(key);
    });
  };
  function adherence(end){
    const items=[];
    for(let monday=START;monday<=END&&monday<=end;monday=addDaysISO(monday,7)){
      DAYS.forEach(function(slot,i){
        const due=addDaysISO(monday,slot.day===6?5:slot.day-1);
        if(due>end)return;
        const key=KEYS[i],rec=oct26WeeklyRecords(monday,key).find(function(s){return s.completed&&s.date<=end});
        items.push({type:"gym",key:key,title:PLANS[key].title,assignedDate:due,actualDate:rec?rec.date:null,completed:!!rec,duration:rec?rec.duration:null,rpe:rec?rec.rpe:null});
      });
      [0,2,4].forEach(function(offset){
        const date=addDaysISO(monday,offset);
        if(date>end)return;
        const rec=(state.swim||[]).find(function(s){return s.completed&&s.date===date});
        items.push({type:"swim",assignedDate:date,title:"Natación",completed:!!rec,actualDate:rec?date:null});
      });
    }
    const summary={};
    ["gym","swim"].forEach(function(type){
      const rows=items.filter(function(x){return x.type===type}),done=rows.filter(function(x){return x.completed}).length;
      summary[type]={planned:rows.length,completed:done,adherencePct:rows.length?Math.round(1000*done/rows.length)/10:null};
    });
    return {summary:summary,items:items};
  }
  const oldReport=buildOct26Report;
  buildOct26Report=function(){
    if(!inBlock(currentDate()))return oldReport();
    const end=todayISO()<START?START:todayISO()>END?END:todayISO();
    const completed=oct26CompletedSessions(end);
    const nutrition=(state.foods||[]).filter(function(f){return f.date>=START&&f.date<=end});
    return {app:"MAREVO · Training Lab",reportVersion:3,reportType:"ppl-3-days-november-2026",
      generatedAt:new Date().toISOString(),phase:{start:START,end:END,availableThrough:end,currentWeek:weekOf(end),currentStage:title(end)},
      program:{frequency:"3 días de fuerza por semana",slots:["Martes: Push","Jueves: Pull","Sábado o domingo: Legs"],weekPlans:Object.fromEntries([1,2,3,4].map(function(w){const date=addDaysISO(START,7*(w-1));return ["week"+w,KEYS.map(function(k){return template(k,date)})]})),trainingLimitMinutes:90},
      adherence:adherence(end),performance:{completedSessions:completed,exerciseProgress:oct26Performance(end)},
      swimming:(state.swim||[]).filter(function(x){return x.date>=START&&x.date<=end}),
      body:(state.body||[]).filter(function(x){return x.date>=START&&x.date<=end}),
      daily:(state.daily||[]).filter(function(x){return x.date>=START&&x.date<=end}),
      foods:nutrition,notes:"Las series de ejercicios compuestos pueden contar parcialmente para músculos secundarios. El plan es un objetivo, no una obligación de alcanzar el fallo."};
  };
  const oldDownload=downloadOct26Report;
  downloadOct26Report=function(){
    if(!inBlock(currentDate()))return oldDownload();
    download("MAREVO_informe_PPL_3dias_noviembre_2026.json",JSON.stringify(buildOct26Report(),null,2),"application/json");
    toast("Informe de noviembre descargado");
  };
  const oldReportHTML=oct26ReportHTML;
  oct26ReportHTML=function(){
    if(!inBlock(currentDate()))return oldReportHTML();
    const a=adherence(todayISO()>END?END:todayISO()),s=a.summary.gym;
    return '<div class="section oct26-report-section">Informe del bloque · noviembre</div><div class="card oct26-report-card"><strong>Rutina Push / Pull / Legs · 3 días por semana</strong><p class="subtitle">'+s.completed+' de '+s.planned+' sesiones programadas hasta hoy. Incluye cargas, repeticiones, natación y recuperación.</p><button class="btn secondary" onclick="downloadOct26Report()">Exportar informe de noviembre</button></div>';
  };
  // No migration of completed or started sessions. New weekly keys prevent old five-day drafts from being overwritten.
  renderAll();
})();