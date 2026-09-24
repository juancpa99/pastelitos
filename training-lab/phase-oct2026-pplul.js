// High-volume PPL + Upper/Lower block: 21 Sep-30 Oct 2026.
// Five gym days (Mon-Fri); swim remains Mon/Wed/Fri at night. Weekends are recovery.
const OCT26_PHASE={start:"2026-09-21",end:"2026-10-30",tailEnd:"2026-11-01"};
const O26STR=(key,name,sets,min,max,rir,rest,muscle,note)=>({key,name,type:"strength",sets,min,max,rir,rest,muscle,note});
const O26POWER=(key,name,dose,note)=>({key,name,type:"mobility",group:"Potencia",dose,note});

function oct26InRange(date,a=OCT26_PHASE.start,b=OCT26_PHASE.end){return date>=a&&date<=b}
function oct26Active(date=currentDate()){return state.settings.mode==="season"&&oct26InRange(date)}
function oct26SwimDay(date){return oct26InRange(date)&&[1,3,5].includes(weekday(date))}
function oct26Week(date=currentDate()){
 if(!oct26InRange(date))return 0;
 if(date<="2026-09-25")return 1;
 if(date<="2026-10-02")return 2;
 if(date<="2026-10-09")return 3;
 if(date<="2026-10-16")return 4;
 if(date<="2026-10-23")return 5;
 return 6;
}
function oct26WeekTitle(date=currentDate()){
 return ({1:"Semana 1 · Cargas de referencia",2:"Semana 2 · Acumular repeticiones",3:"Semana 3 · Sobrecarga",4:"Semana 4 · Intensificación",5:"Semana 5 · Máximo estímulo",6:"Semana 6 · Rendimiento y evaluación"})[oct26Week(date)]||"";
}
function oct26WeekFocus(date=currentDate()){
 return ({
  1:"Entrena fuerte desde el inicio: compuestos alrededor de RIR 2 y aislamientos RIR 1–2. Encuentra cargas reproducibles sin sacrificar ROM ni técnica.",
  2:"Mantén la carga y supera el total de repeticiones de la semana anterior conservando el RIR. La progresión principal esta semana son las reps.",
  3:"Cuando completes el techo del rango con el RIR previsto, sube el menor incremento razonable y vuelve a la parte baja del rango. Si no llegas al techo, sigue sumando reps.",
  4:"Compuestos alrededor de RIR 1–2. En aislamientos seguros, la última serie puede ser especialmente exigente, sin perder técnica. Prioriza intensidad local, no fatiga caótica.",
  5:"Semana más dura: busca récords de repeticiones o carga con técnica limpia. Últimas series de máquinas/aislamientos cerca de RIR 1. No añadas series por impulso.",
  6:"Reduce aproximadamente 20–25% las series, pero conserva cargas serias. El objetivo es que aflore el rendimiento y comparar fuerza, reps, medidas, natación y recuperación."})[oct26Week(date)]||"";
}

const OCT26_BASE_PLANS={
 "1":{key:"oct26_push",title:"Push + abdomen",type:"gym",subtitle:"Pecho prioritario · tríceps · deltoide lateral · natación 22–23 h",exercises:[
  O26POWER("med_ball_chest_pass","Lanzamiento de balón medicinal al pecho","3 × 3 · 60–90 s","Primer de potencia para natación: cada repetición a máxima velocidad, cero fatiga. Para cuando pierdas explosividad."),
  O26STR("incline_db_press","Press inclinado con mancuernas · ~30°",4,5,8,"1–2","2,5–3 min","Pectoral superior + deltoide anterior","Ejercicio principal de fuerza del torso. Baja controlado, pecho alto y concéntrica con intención explosiva sin rebotar."),
  O26STR("machine_chest_press","Press de pecho en máquina",3,6,10,"1–2","2–3 min","Pectoral + deltoide anterior","Máxima estabilidad para cargar el pectoral. No conviertas la repetición en un press de hombro; controla la excéntrica."),
  O26STR("pec_deck","Pec-deck / aperturas en polea",2,10,15,"1","90–120 s","Pectoral","Hipertrofia local: estiramiento controlado y aducción completa. Última serie dura, pero sin dolor anterior de hombro."),
  O26STR("cable_lateral_raise","Elevación lateral en polea",3,12,20,"1","75–90 s","Deltoide lateral","Estricto y estable; nada de impulso. Busca tensión continua y no dejes que el trapecio domine."),
  O26STR("triceps_pushdown","Extensión de tríceps en polea",3,8,12,"1","75–90 s","Tríceps","Codos fijos y extensión completa. Fatiga local alta, sin balanceo."),
  O26STR("overhead_triceps","Tríceps por encima de la cabeza",2,10,15,"2","75–90 s","Tríceps","Prioriza cabeza larga en posición estirada. Mantén algo de margen porque nadas por la noche."),
  O26STR("cable_crunch","Crunch en polea",3,8,15,"1","75–90 s","Core","Hipertrofia abdominal real: flexiona el tronco acercando costillas a pelvis y progresa carga como en cualquier músculo.")
 ]},
 "2":{key:"oct26_pull",title:"Pull + bíceps",type:"gym",subtitle:"Espalda completa · deltoide posterior · bíceps de alto volumen",exercises:[
  O26STR("pull_up","Dominadas lastradas / jalón al pecho",3,5,8,"1–2","2,5–3 min","Espalda + bíceps","Tracción pesada. Pecho hacia la barra/agarre, sin balanceo; concéntrica potente y excéntrica controlada."),
  O26STR("chest_supported_row","Remo con pecho apoyado",4,6,10,"1–2","2–3 min","Espalda","Pecho apoyado y cero impulso lumbar. Tira fuerte pero mantén la trayectoria reproducible para progresar carga."),
  O26STR("straight_arm_pulldown","Pullover / jalón de brazos rectos",2,10,15,"1","90 s","Dorsal","Aislamiento de dorsal: costillas controladas, hombro estable y recorrido sin convertirlo en tríceps."),
  O26STR("reverse_pec_deck","Reverse pec-deck",3,12,20,"1","75–90 s","Deltoide posterior","Deltoide posterior prioritario. Abre con control sin retraer exageradamente las escápulas ni transformarlo en remo."),
  O26STR("preacher_curl","Curl predicador",3,6,10,"1","90–120 s","Bíceps","Curl pesado y estable. Extiende bien el codo y no levantes el hombro para terminar la repetición."),
  O26STR("incline_db_curl","Curl inclinado con mancuernas",3,8,12,"1","90 s","Bíceps","Bíceps en longitud larga. Hombro atrás, sin balanceo y excéntrica controlada."),
  O26STR("hammer_curl","Curl martillo",2,10,15,"1","75–90 s","Bíceps + braquial","Braquial y braquiorradial. Mantén muñeca neutra; la última serie puede ser muy exigente sin romper técnica.")
 ]},
 "3":{key:"oct26_legs_a",title:"Pierna A · cuádriceps + abdomen",type:"gym",subtitle:"Cuádriceps de alto volumen · isquio · gemelo · natación 22–23 h",exercises:[
  O26POWER("vertical_jump","Salto vertical","3 × 3 · 60–90 s","Potencia para salida/viraje: máxima altura, aterrizaje limpio y termina antes de que caiga la velocidad."),
  O26STR("hack_squat","Hack squat",4,5,8,"1–2","3 min","Cuádriceps + glúteo","Bajada de 2–3 s y ROM profundo con pelvis estable; desde abajo intenta acelerar sin rebotar."),
  O26STR("leg_press","Prensa",3,8,12,"1–2","2,5–3 min","Cuádriceps + glúteo","ROM amplio y control pélvico. Empuja con intención rápida pero sin bloquear violentamente la rodilla."),
  O26STR("leg_extension","Extensión de cuádriceps",3,10,15,"1","90 s","Cuádriceps","Hipertrofia pura. Pausa arriba y excéntrica controlada; aquí sí quiero fatiga local alta."),
  O26STR("seated_leg_curl","Curl femoral sentado",3,8,12,"1","90–120 s","Isquios","Mantén la cadera estable y aprovecha el estiramiento. No rebotes en la parte alargada."),
  O26STR("standing_calf","Gemelo de pie",4,8,12,"1","90 s","Gemelos","Estiramiento real abajo, pausa breve y subida completa. Nada de rebotes."),
  O26STR("hanging_knee_raise","Elevación de rodillas / piernas colgado",3,8,15,"1","75–90 s","Core","Compresión + recto abdominal. Termina cada repetición llevando pelvis hacia costillas; no solo flexiones la cadera."),
  O26STR("ab_wheel","Ab wheel",3,6,12,"1–2","90 s","Core","Anti-extensión. Costillas abajo y glúteos activos; amplía el recorrido solo si la pelvis permanece estable.")
 ]},
 "4":{key:"oct26_upper",title:"Upper · pecho + hombros + brazos",type:"gym",subtitle:"Especialización estética · pecho, deltoides y brazos",exercises:[
  O26STR("incline_smith_press","Press inclinado en Smith · ~30°",3,8,10,"1–2","2–3 min","Pectoral superior + deltoide anterior","Segundo estímulo fuerte de pectoral superior. Usa la estabilidad del Smith para progresar carga/reps de forma reproducible."),
  O26STR("pec_deck_upper","Pec-deck / aperturas en polea",3,10,15,"1","90 s","Pectoral","Pectoral puro. Estira sin dolor y termina cerca del límite técnico."),
  O26STR("machine_shoulder_press","Press de hombro en máquina",2,6,10,"1–2","2 min","Deltoide anterior","Estímulo directo del deltoide anterior. Máquina estable, sin hiperextender lumbar; empuja con intención rápida."),
  O26STR("lateral_raise","Elevación lateral máquina / polea",4,12,20,"1","75–90 s","Deltoide lateral","Volumen prioritario para anchura de hombro. Sin impulso; controla también la bajada."),
  O26STR("reverse_pec_deck_upper","Reverse pec-deck",2,15,20,"1","75–90 s","Deltoide posterior","Trabajo local del posterior. No hace falta mucho peso; sí recorrido limpio y tensión continua."),
  O26STR("cable_curl","Curl de bíceps en polea",3,8,12,"1","75–90 s","Bíceps","Segundo estímulo semanal de bíceps. Estable y cerca del límite técnico."),
  O26STR("triceps_pushdown_upper","Pushdown de tríceps",3,8,12,"1","75–90 s","Tríceps","Tríceps pesado/estable. Codos quietos y extensión completa."),
  O26STR("overhead_triceps_upper","Extensión de tríceps overhead",2,10,15,"1","75–90 s","Tríceps","Cabeza larga en longitud alta. Aquí puedes apretar más: no hay natación esa noche.")
 ]},
 "5":{key:"oct26_legs_b",title:"Pierna B · glúteo/isquio + core",type:"gym",subtitle:"Cadena posterior · glúteo completo · gemelo · natación 22–23 h",exercises:[
  O26STR("rdl","Peso muerto rumano",3,5,8,"1–2","3 min","Glúteo + isquios","Pesado y técnico. Excéntrica controlada, barra pegada y subida potente; nunca balístico ni al fallo."),
  O26STR("hip_thrust","Hip thrust",3,6,10,"1","2–3 min","Glúteo","Subida explosiva, pausa 1 s arriba y bajada controlada. No hiperextiendas la zona lumbar."),
  O26STR("bulgarian_split_squat","Sentadilla búlgara",3,8,12,"1–2","2 min","Glúteo + cuádriceps","Unilateral estable. Paso suficiente para cargar glúteo sin perder recorrido; controla la bajada."),
  O26STR("leg_curl","Curl femoral",3,10,15,"1","90–120 s","Isquios","Hipertrofia de isquio. Preferencia sentado si está disponible; última serie dura sin rebotes."),
  O26STR("hip_abduction","Abducción de cadera",3,12,20,"1","75–90 s","Glúteo medio","Glúteo medio/mínimo: pelvis quieta, pausa en apertura y regreso controlado."),
  O26STR("seated_calf","Gemelo sentado",3,10,15,"1","90 s","Gemelos","Énfasis sóleo. Estira abajo, sube completo y evita rebotes."),
  O26STR("cable_crunch_fri","Crunch en polea",3,10,15,"1","75–90 s","Core","Hipertrofia abdominal. Flexiona columna, no solo cadera, y progresa carga/reps."),
  O26STR("pallof_press","Pallof press",2,10,15,"2","60–75 s","Core","Anti-rotación. Caja torácica y pelvis quietas; la calidad de resistencia importa más que mover peso.")
 ]},
 "6":{key:"oct26_rest_sat",title:"Descanso",type:"rest",subtitle:"Sin gimnasio programado. Recupera para sostener el volumen de lunes a viernes.",exercises:[]},
 "0":{key:"oct26_rest_sun",title:"Descanso",type:"rest",subtitle:"Descanso completo o movilidad suave opcional, sin sesión obligatoria.",exercises:[]}
};

function oct26ReducedPlan(base){
 const reductions={
  oct26_push:{incline_db_press:3,machine_chest_press:2,pec_deck:2,cable_lateral_raise:2,triceps_pushdown:2,overhead_triceps:2,cable_crunch:2},
  oct26_pull:{pull_up:2,chest_supported_row:3,straight_arm_pulldown:2,reverse_pec_deck:2,preacher_curl:2,incline_db_curl:2,hammer_curl:2},
  oct26_legs_a:{hack_squat:3,leg_press:2,leg_extension:2,seated_leg_curl:2,standing_calf:3,hanging_knee_raise:2,ab_wheel:2},
  oct26_upper:{incline_smith_press:2,pec_deck_upper:2,machine_shoulder_press:2,lateral_raise:3,reverse_pec_deck_upper:2,cable_curl:2,triceps_pushdown_upper:2,overhead_triceps_upper:2},
  oct26_legs_b:{rdl:2,hip_thrust:2,bulgarian_split_squat:2,leg_curl:2,hip_abduction:2,seated_calf:2,cable_crunch_fri:2,pallof_press:2}
 };
 const plan=structuredClone(base),map=reductions[base.key]||{};
 plan.exercises=plan.exercises.map(e=>e.type==="strength"&&map[e.key]?{...e,sets:map[e.key]}:e);
 plan.subtitle=`${plan.subtitle} · semana de evaluación: volumen −20–25%`;
 return plan;
}
function oct26PlanForDate(date){
 const base=OCT26_BASE_PLANS[String(weekday(date))];
 if(!base)return null;
 return oct26Week(date)===6&&base.type==="gym"?oct26ReducedPlan(base):base;
}

const oct26PreviousPlanFor=planFor;
planFor=function(date){
 if(oct26InRange(date))return oct26PlanForDate(date)||oct26PreviousPlanFor(date);
 if(date==="2026-10-31"||date==="2026-11-01")return OCT26_BASE_PLANS[String(weekday(date))];
 return oct26PreviousPlanFor(date);
};

const oct26PreviousComplementTemplate=seasonComplementTemplate;
seasonComplementTemplate=function(date=currentDate()){
 if(oct26InRange(date))return null;
 return oct26PreviousComplementTemplate(date);
};

if(typeof sep26TrackingApplies==="function"){
 const previousTrackingApplies=sep26TrackingApplies;
 sep26TrackingApplies=function(date=currentDate()){return oct26InRange(date)||previousTrackingApplies(date)};
}

if(todayISO()>=OCT26_PHASE.start&&todayISO()<=OCT26_PHASE.end&&!state.settings.oct26PplulActivated){
 state.settings.mode="season";
 state.settings.oct26PplulActivated=true;
 saveState(true);
}

const oct26CompoundKeys=new Set(["incline_db_press","machine_chest_press","pull_up","chest_supported_row","hack_squat","leg_press","incline_smith_press","machine_shoulder_press","rdl","hip_thrust","bulgarian_split_squat"]);
const oct26BaseExerciseAdvice=typeof sep26OldAdvice==="function"?sep26OldAdvice:exerciseAdvice;
exerciseAdvice=function(e){
 const base=oct26BaseExerciseAdvice(e);
 const week=oct26Week(currentDate());
 if(!week||e.type==="mobility")return base;
 const compound=oct26CompoundKeys.has(e.key);
 const prefix={
  1:compound?"Semana 1: busca una referencia dura pero limpia; alrededor de RIR 2. ":"Semana 1: trabaja cerca de RIR 1–2 y aprende una carga estable. ",
  2:"Semana 2: mantén peso y supera las reps totales de la última exposición sin regalar técnica. ",
  3:"Semana 3: si confirmas el techo del rango, sube el menor salto posible y vuelve abajo en reps. ",
  4:compound?"Semana 4: intensidad alta, pero conserva 1–2 reps limpias de margen. ":"Semana 4: última serie muy exigente, alrededor de RIR 1; técnica antes que ego. ",
  5:compound?"Semana 5: busca un PR de reps/carga sin grindear repeticiones rotas. ":"Semana 5: semana más dura; última serie cerca del límite técnico. ",
  6:"Semana 6: hay menos series a propósito; conserva la carga y busca rendimiento de calidad. "
 }[week];
 return prefix+base;
};

function oct26RulesHTML(date=currentDate()){
 if(!oct26InRange(date))return"";
 return `<div class="card oct26-cycle-card"><div class="eyebrow">Bloque de hipertrofia · 21 sep–30 oct</div><div class="hero-title" style="font-size:19px">${esc(oct26WeekTitle(date))}</div><div class="callout" style="margin-top:8px">${esc(oct26WeekFocus(date))}</div><details style="margin-top:10px"><summary>Cómo progresar</summary><div class="subtitle" style="margin-top:8px"><strong>Reps primero:</strong> mientras no completes el techo del rango, conserva la carga y supera el total de reps con el RIR indicado.<br><br><strong>Subir peso:</strong> al completar el techo del rango con técnica y RIR correctos, usa el menor salto razonable y vuelve a la parte baja de reps.<br><br><strong>Bajar peso:</strong> si caes por debajo del mínimo o rompes ROM/técnica para completar la serie, reduce un pequeño paso.<br><br><strong>Series:</strong> semanas 1–5 mantienen el volumen alto. Semana 6 reduce aproximadamente 20–25% para evaluar rendimiento sin tanta fatiga.<br><br><strong>Intensidad:</strong> compuestos duros pero controlados; aislamientos y máquinas pueden terminar mucho más cerca del límite técnico.</div></details></div>`;
}

function oct26SwimBlockHTML(date=currentDate()){
 if(!oct26SwimDay(date))return"";
 const done=!!state.swim.find(s=>s.date===date&&s.completed);
 return `<div class="section oct26-swim-section">Natación · 22–23 h</div><div class="oct26-swim-block">${swimHTML(date)}</div>${done?'<div class="callout good" style="margin-top:8px">Natación registrada.</div>':""}`;
}
function oct26RemoveOldCycleCard(root){
 [...root.querySelectorAll(".card")].forEach(card=>{
  const eyebrow=card.querySelector(".eyebrow")?.textContent||"";
  if(eyebrow.includes("Ciclo 3 semanas · septiembre 2026"))card.remove();
 });
}
function oct26WeekLabel(date){
 if(date==="2026-10-31"||date==="2026-11-01")return"Descanso";
 if(!oct26InRange(date))return planFor(date).title;
 const p=oct26PlanForDate(date);
 if(!p)return"";
 if(oct26SwimDay(date)&&p.type==="gym")return `${p.title} + natación`;
 return p.title;
}
function oct26RelabelWeek(root,date){
 root.querySelectorAll(".compact-week-card .day").forEach(button=>{
  const match=(button.getAttribute("onclick")||"").match(/selectWeekday\((\d)\)/);
  if(!match)return;
  const target=dateForWeekday(date,+match[1]),label=button.querySelector(".w");
  if(label)label.textContent=oct26WeekLabel(target);
 });
}

const oct26PreviousWeeklyPlannedMuscleSets=weeklyPlannedMuscleSets;
weeklyPlannedMuscleSets=function(){
 if(!oct26InRange(currentDate()))return oct26PreviousWeeklyPlannedMuscleSets();
 const out=Object.fromEntries(MUSCLE_AXES.map(([name])=>[name,0]));
 const ref=currentDate(),monday=mondayOf(ref);
 for(let i=0;i<5;i++){
  const date=addDaysISO(monday,i),plan=oct26PlanForDate(date);
  (plan?.exercises||[]).filter(e=>e.type==="strength").forEach(e=>{
   muscleGroupsForExercise(e).forEach(group=>{if(group in out)out[group]+=(+e.sets||0)});
  });
 }
 return out;
};

function oct26AssessmentRecord(kind){return [...(state.body||[])].filter(x=>x.phaseAssessment===`oct26_${kind}`).sort((a,b)=>b.date.localeCompare(a.date))[0]||null}
function oct26AssessmentWindow(kind,date=currentDate()){
 return kind==="baseline"?(date>=OCT26_PHASE.start&&date<="2026-09-27"):(date>="2026-10-26"&&date<=OCT26_PHASE.end);
}
function openOct26Assessment(kind){
 const old=oct26AssessmentRecord(kind)||state.body.find(x=>x.date===currentDate())||[...(state.body||[])].filter(x=>x.date<=currentDate()).sort((a,b)=>b.date.localeCompare(a.date))[0]||{};
 const title=kind==="baseline"?"Referencia del nuevo bloque":"Medición final del bloque";
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Bloque 21 sep–30 oct</div><div class="hero-title">${title}</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="callout">Mide en condiciones comparables: por la mañana, tras ir al baño y antes de desayunar. Usa los mismos puntos anatómicos.</div><div class="formgrid" style="margin-top:10px"><div class="field"><label>Peso (kg)</label><input id="o26Weight" inputmode="decimal" value="${old.weight??""}"></div><div class="field"><label>Cintura (cm)</label><input id="o26Waist" inputmode="decimal" value="${old.waist??""}"></div><div class="field"><label>Pecho (cm)</label><input id="o26Chest" inputmode="decimal" value="${old.chest??""}"></div><div class="field"><label>Brazo flexionado (cm)</label><input id="o26Arm" inputmode="decimal" value="${old.arm??""}"></div><div class="field"><label>Cadera / glúteo (cm)</label><input id="o26Hips" inputmode="decimal" value="${old.hips??""}"></div><div class="field"><label>Muslo derecho (cm)</label><input id="o26Thigh" inputmode="decimal" value="${old.thigh??""}"></div><div class="field"><label>Gemelo derecho (cm)</label><input id="o26Calf" inputmode="decimal" value="${old.calf??""}"></div><div class="field wide"><label>Notas</label><textarea id="o26Notes">${esc(old.phaseAssessmentNotes??"")}</textarea></div></div><div class="actions"><button class="btn" onclick="saveOct26Assessment('${kind}')">Guardar medición</button></div></div></div>`;
}
function saveOct26Assessment(kind){
 const values={weight:num("o26Weight"),waist:num("o26Waist"),chest:num("o26Chest"),arm:num("o26Arm"),hips:num("o26Hips"),thigh:num("o26Thigh"),calf:num("o26Calf")};
 if(Object.values(values).some(v=>!Number.isFinite(v)||v<=0)){toast("Completa todas las medidas con valores válidos");return}
 const prev=oct26AssessmentRecord(kind);if(prev&&prev.date!==currentDate())state.body=state.body.filter(x=>x!==prev);
 upsert(state.body,{date:currentDate(),...values,phaseAssessment:`oct26_${kind}`,phaseAssessmentNotes:val("o26Notes").trim()});saveState(true);closeModal();renderAll();toast("Medición guardada");
}
function oct26AssessmentCard(date=currentDate()){
 const kind=oct26AssessmentWindow("final",date)?"final":oct26AssessmentWindow("baseline",date)?"baseline":null;if(!kind)return"";
 const r=oct26AssessmentRecord(kind),label=kind==="baseline"?"Referencia del bloque":"Medición final del bloque";
 return `<div class="card oct26-assessment-card"><div class="row between settings-status-row"><div><div class="eyebrow">Evaluación física · 21 sep–30 oct</div><strong>${label}</strong><small>${r?`Guardada el ${esc(r.date)}.`:"Peso, cintura y perímetros completos para comparar el ciclo."}</small></div><span class="pill ${r?"good":"warn"}">${r?"Guardada":"Pendiente"}</span></div><div class="actions" style="margin-top:10px"><button class="btn ${r?"secondary":""}" onclick="openOct26Assessment('${kind}')">${r?"Revisar medición":"Registrar ahora"}</button></div></div>`;
}
const oct26PreviousAssessmentCard=typeof sep26AssessmentCard==="function"?sep26AssessmentCard:null;
if(oct26PreviousAssessmentCard){sep26AssessmentCard=function(date=currentDate()){if(oct26InRange(date))return oct26AssessmentCard(date);return oct26PreviousAssessmentCard(date)}}

function oct26ReportEnd(){return todayISO()<OCT26_PHASE.end?todayISO():OCT26_PHASE.end}
function oct26Rows(rows,a=OCT26_PHASE.start,b=oct26ReportEnd()){return (rows||[]).filter(x=>x?.date>=a&&x?.date<=b)}
function oct26CompletedSessions(end){return (state.sessions||[]).filter(s=>s?.completed&&s.date>=OCT26_PHASE.start&&s.date<=end&&String(s.key||"").startsWith("oct26_"))}
function oct26Performance(end){
 const groups=new Map();
 oct26CompletedSessions(end).forEach(session=>(session.exercises||[]).forEach(exercise=>{
  if(exercise.type==="mobility")return;
  const exposure=typeof sep26ExposureSummary==="function"?sep26ExposureSummary(exercise,session):null;if(!exposure)return;
  const sig=typeof profileSignature==="function"?profileSignature(exercise):JSON.stringify(exercise.loadProfile||{}),key=JSON.stringify([exercise.key,sig]);
  if(!groups.has(key))groups.set(key,{key:exercise.key,exercise:exercise.name,muscle:exercise.muscle||null,loadConvention:exposure.loadConvention,exposures:[]});groups.get(key).exposures.push(exposure);
 }));
 return [...groups.values()].map(g=>{g.exposures.sort((a,b)=>a.date.localeCompare(b.date));const first=g.exposures[0],last=g.exposures.at(-1);return{...g,sessions:g.exposures.length,first,last,change:{bestEnteredLoadKg:first.bestEnteredLoadKg!=null&&last.bestEnteredLoadKg!=null?+(last.bestEnteredLoadKg-first.bestEnteredLoadKg).toFixed(2):null,repsAtBestLoad:first.repsAtBestLoad!=null&&last.repsAtBestLoad!=null?last.repsAtBestLoad-first.repsAtBestLoad:null,totalReps:first.totalReps!=null&&last.totalReps!=null?last.totalReps-first.totalReps:null,avgRIR:first.avgRIR!=null&&last.avgRIR!=null?+(last.avgRIR-first.avgRIR).toFixed(2):null}}}).sort((a,b)=>a.exercise.localeCompare(b.exercise));
}
function oct26PlannedItems(end){
 const out=[];for(let date=OCT26_PHASE.start;date<=end;date=addDaysISO(date,1)){const p=oct26PlanForDate(date);if(p?.type==="gym")out.push({date,type:"gym",key:p.key,title:p.title});if(oct26SwimDay(date))out.push({date,type:"swim",key:`swim_${date}`,title:"Natación"})}return out;
}
function oct26Adherence(end){
 const items=oct26PlannedItems(end).map(item=>{const record=item.type==="gym"?(state.sessions||[]).find(s=>s.date===item.date&&s.key===item.key&&s.completed):(state.swim||[]).find(s=>s.date===item.date&&s.completed);return{...item,completed:!!record,duration:record?.duration??null,rpe:record?.rpe??null,shoulderPain:record?.shoulderPain??record?.pain??null}});
 const summary=Object.fromEntries(["gym","swim"].map(type=>{const rows=items.filter(x=>x.type===type),done=rows.filter(x=>x.completed).length;return[type,{planned:rows.length,completed:done,adherencePct:rows.length?+(done/rows.length*100).toFixed(1):null}]}));return{summary,items};
}
function oct26Mean(values){const nums=values.filter(v=>v!==null&&v!==""&&Number.isFinite(+v)).map(Number);return nums.length?+(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2):null}
function oct26Delta(a,b){return Object.fromEntries(["weight","waist","chest","arm","hips","thigh","calf"].map(k=>[k,a?.[k]!=null&&b?.[k]!=null?+(+b[k]-+a[k]).toFixed(2):null]))}
function buildOct26Report(){
 const end=oct26ReportEnd(),baseline=oct26AssessmentRecord("baseline")||[...(state.body||[])].filter(x=>x.date<=OCT26_PHASE.start).sort((a,b)=>b.date.localeCompare(a.date))[0]||null,final=oct26AssessmentRecord("final")||null,latest=final||[...(state.body||[])].filter(x=>x.date<=end).sort((a,b)=>b.date.localeCompare(a.date))[0]||null,daily=oct26Rows(state.daily),swims=oct26Rows(state.swim),foods=oct26Rows(state.foods),sessions=oct26CompletedSessions(end),nutritionDays=[...new Set(foods.map(x=>x.date))].sort().map(date=>({date,...dayNutrition(date)})),adherence=oct26Adherence(end);
 return{app:"MAREVO · Training Lab",reportVersion:1,reportType:"pplul-2026-09-21-to-2026-10-30",generatedAt:new Date().toISOString(),purpose:"Upload this JSON to ChatGPT to review the 5-day hypertrophy block and design the next cycle.",phase:{...OCT26_PHASE,availableThrough:end,currentWeek:oct26Week(end),currentStage:oct26WeekTitle(end)},program:{days:structuredClone(OCT26_BASE_PLANS),progression:Object.fromEntries([1,2,3,4,5,6].map(w=>[w,oct26WeekFocus(["","2026-09-21","2026-09-28","2026-10-05","2026-10-12","2026-10-19","2026-10-26"][w])])),week6VolumeReduction:"~20–25% fewer prescribed strength sets"},body:{baselineAssessment:baseline,finalAssessment:final,latestAvailable:latest,deltaBaselineToFinal:final?oct26Delta(baseline,final):null,deltaBaselineToLatest:oct26Delta(baseline,latest),records:oct26Rows(state.body)},adherence,recovery:{records:daily,averages:{energy:oct26Mean(daily.map(x=>x.energy)),fatigue:oct26Mean(daily.map(x=>x.fatigue)),pain:oct26Mean(daily.map(x=>x.pain)),sleepHours:oct26Mean(daily.map(x=>x.sleep)),hunger:oct26Mean(daily.map(x=>x.hunger))}},swimming:{records:swims,totalMeters:swims.reduce((n,x)=>n+(+x.meters||0),0),avgRPE:oct26Mean(swims.map(x=>x.rpe)),avgShoulderPain:oct26Mean(swims.map(x=>x.pain))},nutrition:{goals:state.settings.nutritionGoals||{},loggedDays:nutritionDays,averages:{kcal:oct26Mean(nutritionDays.map(x=>x.kcal)),proteinG:oct26Mean(nutritionDays.map(x=>x.p)),carbsG:oct26Mean(nutritionDays.map(x=>x.c)),fatG:oct26Mean(nutritionDays.map(x=>x.f))},rawEntries:foods},performance:{exerciseProgress:oct26Performance(end),completedSessions:sessions},dataCompleteness:{baselineAssessment:!!baseline,finalAssessment:!!final,dailyCheckins:daily.length,gymAdherence:adherence.summary.gym,swimAdherence:adherence.summary.swim},photos:{metadata:state.photoMonths||[],note:"Las fotos siguen almacenadas localmente y se comparten aparte."}};
}
function downloadOct26Report(){download(`MAREVO_informe_PPLUL_${OCT26_PHASE.start}_a_${OCT26_PHASE.end}.json`,JSON.stringify(buildOct26Report(),null,2),"application/json");toast("Informe del bloque descargado")}
function oct26ReportHTML(){
 const r=buildOct26Report(),d=r.body.deltaBaselineToFinal||r.body.deltaBaselineToLatest||{},summary=[d.weight!=null?`peso ${d.weight>=0?"+":""}${d.weight} kg`:null,d.waist!=null?`cintura ${d.waist>=0?"+":""}${d.waist} cm`:null].filter(Boolean).join(" · ");
 return `<div class="section oct26-report-section">Informe del bloque 21 sep–30 oct</div><div class="card oct26-report-card"><div class="row between settings-status-row"><div><strong>${todayISO()>=OCT26_PHASE.end?"Listo para evaluar":"Informe en construcción"}</strong><small>Datos hasta ${esc(r.phase.availableThrough)}${summary?` · ${esc(summary)}`:""}</small></div><span class="pill ${todayISO()>=OCT26_PHASE.end?"good":""}">6 semanas</span></div><div class="subtitle" style="margin-top:10px">Incluye adherencia a los 5 días de gimnasio y natación, medidas corporales, recuperación, nutrición y evolución ejercicio por ejercicio con cargas, repeticiones y RIR.</div><div class="actions" style="margin-top:10px"><button class="btn" onclick="downloadOct26Report()">Descargar informe para analizar</button></div></div>`;
}
renderAll();
