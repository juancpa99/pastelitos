// MAREVO PPLUL v2 override based on the reviewed workbook.
// Loaded after the flexible-week module. Preserves completed history and upgrades future/unstarted prescriptions.

function V2STR(key,name,sets,s6,min,max,rirs,rest,muscle,note,meta){
  return Object.assign({key:key,name:name,type:"strength",sets:sets,v2S6:s6,min:min,max:max,rir:rirs[1]||rirs[0],v2Rirs:rirs,rest:rest,muscle:muscle,note:note},meta||{});
}
function V2POWER(key,name,dose,note){
  return {key:key,name:name,type:"mobility",group:"Potencia",dose:dose,note:note,v2Power:true};
}
const V2_RIR={
  compound:["2","1–2","1–2","1–2","1","2"],
  isolation:["1–2","1","1","1","1","1–2"],
  upper:["2","2","2","2","2","2–3"],
  preventive:["2–3","2–3","2–3","2–3","2–3","2–3"],
  core2:["2","2","2","2","2","2"]
};

const OCT26_V2_PLANS={
  oct26_legs_a:{key:"oct26_legs_a",title:"Pierna A · cuádriceps + isquios + abdomen",type:"gym",subtitle:"Pierna completa · natación 22–23 h",exercises:[
    V2POWER("vertical_jump","Salto vertical","3 × 3 · 60–90 s","Máxima velocidad y aterrizaje limpio; parar si cae la altura. No cuenta como serie efectiva."),
    V2STR("hack_squat","Hack squat",4,3,5,8,V2_RIR.compound,"3 min","Cuádriceps + glúteo + aductores","2–3 s de bajada, ROM profundo, pelvis estable.",{v2Role:"compound"}),
    V2STR("leg_press","Prensa",3,2,8,12,V2_RIR.compound,"2,5–3 min","Cuádriceps + glúteo","ROM amplio; subir con intención rápida sin bloquear rodillas.",{v2Role:"compound"}),
    V2STR("leg_extension","Extensión de cuádriceps",3,2,10,15,V2_RIR.isolation,"90 s","Cuádriceps · recto femoral","Pausa arriba y excéntrica controlada. Vía directa para recto femoral; no eliminar.",{v2Role:"isolation"}),
    V2STR("seated_leg_curl","Curl femoral sentado",4,3,8,12,V2_RIR.isolation,"90–120 s","Isquios","Aprovecha el estiramiento; no rebotes.",{v2Role:"isolation"}),
    V2STR("standing_calf","Gemelo de pie · máquina o Smith",5,3,8,12,V2_RIR.isolation,"90 s","Gemelo + sóleo","Estiramiento 1–2 s abajo, pausa y subida completa. Si hay calambres en piscina, dejar a RIR 2.",{v2Role:"isolation"}),
    V2STR("hip_abduction_a","Abducción de cadera en máquina",4,3,12,20,V2_RIR.isolation,"75–90 s","Glúteo medio","Pelvis quieta, pausa en apertura y regreso controlado.",{v2Role:"isolation"}),
    V2STR("reverse_crunch_bench","Crunch inverso en banco",3,2,10,15,V2_RIR.isolation,"75–90 s","Abdomen · porción inferior","Retroversión pélvica: acerca pelvis a costillas sin balancear piernas. Sustituye a elevaciones colgado para no cargar hombro en día de piscina.",{v2Role:"isolation"}),
    V2STR("loaded_dead_bug","Dead bug con mancuerna o disco",3,2,8,12,V2_RIR.core2,"60–75 s","Core anti-extensión","Lumbar pegada al suelo; carga ligera en manos. Sustituye al ab wheel.",{v2Role:"core"})
  ]},
  oct26_push:{key:"oct26_push",title:"Push · pecho + tríceps + deltoide lateral",type:"gym",subtitle:"Pecho prioritario · tríceps · deltoide lateral · sin piscina ese día",exercises:[
    V2POWER("med_ball_slam","Slam con balón medicinal","3 × 3 · 60–90 s","Desde brazos arriba, lanzar al suelo con todo el tronco. Parar si cae la velocidad. No cuenta como serie efectiva."),
    V2STR("incline_db_press","Press inclinado con mancuernas · ~30°",4,3,5,8,V2_RIR.compound,"2,5–3 min","Pectoral superior + deltoide anterior","Ejercicio principal. Excéntrica controlada; no fuerces el estiramiento más allá de donde no haya dolor.",{v2Role:"compound",v2ShoulderSensitive:true}),
    V2STR("machine_chest_press","Press de pecho en máquina",3,2,6,10,V2_RIR.compound,"2–3 min","Pectoral medio/inferior","Máxima estabilidad y carga reproducible; controla la excéntrica.",{v2Role:"compound"}),
    V2STR("pec_deck","Pec-deck / aperturas en polea",2,2,10,15,V2_RIR.isolation,"90–120 s","Pectoral","Estiramiento controlado y aducción completa; sin dolor anterior de hombro.",{v2Role:"isolation"}),
    V2STR("cable_lateral_raise","Elevación lateral en polea",5,3,12,20,V2_RIR.isolation,"75–90 s","Deltoide lateral","Plano escapular, pulgar neutro, hasta altura del hombro. Superserie con pushdown solo si ambas poleas están en la misma estación.",{v2Role:"isolation"}),
    V2STR("triceps_pushdown","Extensión de tríceps en polea",3,2,8,12,V2_RIR.isolation,"75–90 s","Tríceps · cabezas lateral y medial","Codos fijos y extensión completa. Puede superseriar con laterales solo en la misma estación.",{v2Role:"isolation"}),
    V2STR("overhead_triceps","Extensión de tríceps por encima de la cabeza · polea",2,2,10,15,V2_RIR.isolation,"75–90 s","Tríceps · cabeza larga","Posición estirada. Es el estímulo principal de cabeza larga; sustituir si provoca dolor anterior de hombro.",{v2Role:"isolation",v2ShoulderSensitive:true}),
    V2STR("push_up_plus","Flexiones con empuje final de escápulas · push-up plus",2,2,10,12,V2_RIR.preventive,"60 s","Serrato anterior","Flexión normal y, arriba, empuja el suelo separando las escápulas 2–3 cm. Preventivo, nunca al fallo.",{v2Role:"preventive",preventive:true})
  ]},
  oct26_pull:{key:"oct26_pull",title:"Pull · espalda + bíceps + hombro preventivo",type:"gym",subtitle:"Dorsal y espalda media · bíceps · bloque preventivo",exercises:[
    V2STR("pull_up","Dominadas lastradas / jalón al pecho",4,3,5,8,V2_RIR.compound,"2,5–3 min","Dorsal + bíceps","Tracción pesada sin balanceo; excéntrica controlada.",{v2Role:"compound"}),
    V2STR("chest_supported_row","Remo con pecho apoyado",4,3,6,10,V2_RIR.compound,"2–3 min","Espalda media + dorsal","Cero impulso lumbar. Trayectoria reproducible.",{v2Role:"compound"}),
    V2STR("straight_arm_pulldown","Pullover en polea / jalón con brazos rectos",3,2,10,15,V2_RIR.isolation,"90 s","Dorsal","Costillas controladas y hombro estable; para antes de la posición en la que moleste.",{v2Role:"isolation",v2ShoulderSensitive:true}),
    V2STR("reverse_pec_deck","Reverse pec-deck",2,2,12,20,V2_RIR.isolation,"75–90 s","Deltoide posterior","No convertirlo en remo; tensión continua.",{v2Role:"isolation"}),
    V2STR("preacher_curl","Curl predicador",3,2,6,10,V2_RIR.isolation,"90–120 s","Bíceps · porción corta","Pesado y estable; extensión completa sin elevar hombro.",{v2Role:"isolation"}),
    V2STR("incline_db_curl","Curl inclinado con mancuernas",3,2,8,12,V2_RIR.isolation,"90 s","Bíceps · porción larga","Trabajo en longitud larga; sin balanceo. Si molesta delante del hombro, sube el respaldo.",{v2Role:"isolation"}),
    V2STR("hammer_curl","Curl martillo",2,2,10,15,V2_RIR.isolation,"75–90 s","Braquial + braquiorradial","Muñeca neutra; único estímulo específico de braquial.",{v2Role:"isolation"}),
    V2STR("cable_external_rotation","Rotación externa en polea",2,2,12,15,V2_RIR.preventive,"45–60 s","Manguito rotador","Polea a altura del codo, codo pegado al costado con toalla. Superserie con face pull.",{v2Role:"preventive",preventive:true}),
    V2STR("face_pull","Face pull con cuerda",2,2,12,15,V2_RIR.preventive,"45–60 s","Deltoide posterior + manguito","Polea alta; tira hacia la cara abriendo la cuerda y termina con manos por encima de codos. Superserie con rotación externa.",{v2Role:"accessory"}),
    V2STR("prone_y_raise","Elevación en Y en banco inclinado",2,2,10,12,V2_RIR.preventive,"60 s","Trapecio inferior","Banco 30–45°, boca abajo, mancuernas ligeras, brazos en Y y pulgares arriba. Siempre aparte.",{v2Role:"preventive",preventive:true})
  ]},
  oct26_upper:{key:"oct26_upper",title:"Upper · pecho + hombros + brazos",type:"gym",subtitle:"Torso completo a RIR conservador · natación al día siguiente",exercises:[
    V2STR("incline_smith_press","Press inclinado en Smith · ~30°",3,2,8,10,V2_RIR.upper,"2–3 min","Pectoral superior + deltoide anterior","Segundo estímulo de pectoral superior; progresión reproducible.",{v2Role:"upper"}),
    V2STR("pec_deck_upper","Pec-deck / aperturas en polea",3,2,10,15,V2_RIR.upper,"90 s","Pectoral","Pectoral puro; recorrido completo sin dolor.",{v2Role:"upper"}),
    V2STR("machine_shoulder_press","Press de hombro en máquina",2,2,6,10,V2_RIR.upper,"2 min","Deltoide anterior","Agarre neutro si es posible; sin hiperextender lumbar. Primer ejercicio a sustituir si aparece dolor.",{v2Role:"upper",v2ShoulderSensitive:true}),
    V2STR("machine_lateral_raise","Elevación lateral en máquina",5,3,12,20,V2_RIR.upper,"75–90 s","Deltoide lateral","Controlar subida y bajada; hasta altura de hombro.",{v2Role:"upper"}),
    V2STR("reverse_pec_deck_upper","Reverse pec-deck",2,2,15,20,V2_RIR.upper,"75–90 s","Deltoide posterior","Poco peso si hace falta; recorrido limpio.",{v2Role:"upper"}),
    V2STR("low_cable_row_neutral","Remo en polea baja · agarre neutro",3,2,8,12,V2_RIR.upper,"2 min","Dorsal + espalda media","Codos pegados; lleva el agarre al ombligo. Segunda exposición semanal de espalda.",{v2Role:"upper"}),
    V2STR("cable_curl","Curl de bíceps en polea",3,2,8,12,V2_RIR.upper,"75–90 s","Bíceps","Superserie con pushdown solo si hay dos poleas en la misma estación.",{v2Role:"upper"}),
    V2STR("triceps_pushdown_upper","Pushdown de tríceps",3,2,8,12,V2_RIR.upper,"75–90 s","Tríceps · cabezas lateral y medial","Codos quietos y extensión completa.",{v2Role:"upper"}),
    V2STR("overhead_triceps_upper","Extensión de tríceps overhead · polea",2,2,10,15,V2_RIR.upper,"75–90 s","Tríceps · cabeza larga","Segunda exposición semanal de cabeza larga. Sustituir si da dolor.",{v2Role:"upper",v2ShoulderSensitive:true}),
    V2STR("cable_external_rotation_upper","Rotación externa en polea",2,2,12,15,V2_RIR.preventive,"45–60 s","Manguito rotador","Misma técnica que en Pull. Superserie con face pull.",{v2Role:"preventive",preventive:true}),
    V2STR("face_pull_upper","Face pull con cuerda",2,2,12,15,V2_RIR.preventive,"45–60 s","Deltoide posterior + manguito","Misma técnica que en Pull. Superserie con rotación externa.",{v2Role:"accessory"}),
    V2STR("push_up_plus_upper","Flexiones con empuje final de escápulas · push-up plus",2,2,10,12,V2_RIR.preventive,"60 s","Serrato anterior","Misma técnica que en Push. Preventivo, nunca al fallo.",{v2Role:"preventive",preventive:true})
  ]},
  oct26_legs_b:{key:"oct26_legs_b",title:"Pierna B · glúteo/isquio + gemelo + core",type:"gym",subtitle:"Cadena posterior y glúteo · natación 22–23 h",exercises:[
    V2STR("rdl","Peso muerto rumano",3,2,5,8,V2_RIR.compound,"3 min","Glúteo + isquios","Pesado y técnico; nunca al fallo.",{v2Role:"compound"}),
    V2STR("hip_thrust","Hip thrust",3,2,6,10,V2_RIR.compound,"2–3 min","Glúteo mayor","Subida explosiva, pausa 1 s arriba y bajada controlada.",{v2Role:"compound"}),
    V2STR("bulgarian_split_squat","Sentadilla búlgara",3,2,8,12,V2_RIR.compound,"2 min","Glúteo + cuádriceps + aductores","Unilateral estable y ROM completo.",{v2Role:"compound"}),
    V2STR("leg_curl","Curl femoral · sentado si hay",3,2,10,15,V2_RIR.isolation,"90–120 s","Isquios","Última serie dura.",{v2Role:"isolation"}),
    V2STR("hip_abduction","Abducción de cadera en máquina",5,3,12,20,V2_RIR.isolation,"75–90 s","Glúteo medio","Pelvis quieta, pausa en apertura y regreso controlado.",{v2Role:"isolation"}),
    V2STR("calf_press","Gemelo en prensa",5,3,10,15,V2_RIR.isolation,"90 s","Gemelo + sóleo","Rodilla extendida sin bloquear; estiramiento real abajo. Sustituye al gemelo sentado.",{v2Role:"isolation"}),
    V2STR("cable_crunch_fri","Crunch en polea",3,2,10,15,V2_RIR.isolation,"75–90 s","Abdomen","Progresar carga y reps; flexión real del tronco.",{v2Role:"isolation"}),
    V2STR("pallof_press","Pallof press",2,2,10,15,V2_RIR.core2,"60–75 s","Core anti-rotación","Caja torácica y pelvis quietas.",{v2Role:"core"})
  ]}
};

function oct26V2ApplyWeek(plan,date){
  const p=structuredClone(plan),week=oct26Week(date)||1;
  p.exercises=(p.exercises||[]).map(function(e){
    if(e.type!=="strength")return e;
    e.sets=week===6?e.v2S6:e.sets;
    e.rir=e.v2Rirs[Math.max(0,week-1)]||e.rir;
    if(week===4&&e.v2Role==="isolation")e.note+=" Semana 4: última serie puede acercarse a RIR 0–1 con técnica limpia.";
    if(week===5&&e.v2Role==="compound")e.note+=" Semana 5: buscar PR de reps/carga sin grindear.";
    return e;
  });
  if(week===6)p.subtitle+=" · descarga: menos series, cargas serias";
  return p;
}
function oct26TemplateForKey(key,date=currentDate()){
  const p=OCT26_V2_PLANS[key];
  return p?oct26V2ApplyWeek(p,date):null;
}
oct26ReducedPlan=function(base){
  const key=base&&base.key;
  return key&&OCT26_V2_PLANS[key]?oct26V2ApplyWeek(OCT26_V2_PLANS[key],"2026-10-26"):structuredClone(base);
};
oct26PlanForDate=function(date){
  const map={1:"oct26_legs_a",2:"oct26_push",4:"oct26_upper",5:"oct26_legs_b"};
  const key=map[weekday(date)];
  if(key)return oct26TemplateForKey(key,date);
  return {key:"oct26_rest_"+weekday(date),title:weekday(date)===3?"Natación":"Descanso",type:"rest",subtitle:weekday(date)===3?"Sin gimnasio · natación 22–23 h":"Sin gimnasio obligatorio; recuperar pendiente si hace falta.",exercises:[]};
};

Object.keys(OCT26_BASE_PLANS).forEach(function(k){delete OCT26_BASE_PLANS[k];});
OCT26_BASE_PLANS["1"]=OCT26_V2_PLANS.oct26_legs_a;
OCT26_BASE_PLANS["2"]=OCT26_V2_PLANS.oct26_push;
OCT26_BASE_PLANS["3"]={key:"oct26_wed_swim_only",title:"Natación",type:"rest",subtitle:"Sin gimnasio · natación 22–23 h",exercises:[]};
OCT26_BASE_PLANS["4"]=OCT26_V2_PLANS.oct26_upper;
OCT26_BASE_PLANS["5"]=OCT26_V2_PLANS.oct26_legs_b;
OCT26_BASE_PLANS["6"]={key:"oct26_rest_sat",title:"Descanso",type:"rest",subtitle:"Descanso o recuperar pendiente",exercises:[]};
OCT26_BASE_PLANS["0"]={key:"oct26_rest_sun",title:"Descanso",type:"rest",subtitle:"Descanso o recuperar pendiente",exercises:[]};
OCT26_BASE_PLANS["pull"]=OCT26_V2_PLANS.oct26_pull;

OCT26_WEEKLY_KEYS.splice(0,OCT26_WEEKLY_KEYS.length,"oct26_legs_a","oct26_push","oct26_pull","oct26_upper","oct26_legs_b");
OCT26_DEFAULT_ORDER.splice(0,OCT26_DEFAULT_ORDER.length,"oct26_legs_a","oct26_push","oct26_pull","oct26_upper","oct26_legs_b");
OCT26_SLOT_DEFS[0].note="Natación 22–23 h · preferencia por pierna";
OCT26_SLOT_DEFS[1].note="Push o Pull · primera sesión del doble";
OCT26_SLOT_DEFS[2].note="Pull o Push · segunda sesión; separar varias horas";
OCT26_SLOT_DEFS[3].note="Upper a RIR 2 · natación al día siguiente";
OCT26_SLOT_DEFS[4].note="Natación 22–23 h · preferencia por pierna";

oct26WeekFocus=function(date=currentDate()){
  const w=oct26Week(date);
  return ({
    1:"Cargas de referencia: compuestos RIR 2; aislamientos RIR 1–2; preventivos RIR 2–3. Trabaja en el extremo bajo del rango y registra dolor de hombro.",
    2:"Acumula repeticiones con la misma carga: compuestos RIR 1–2; aislamientos RIR 1. Upper sigue a RIR 2.",
    3:"Sobrecarga: al completar el techo con técnica y RIR correctos, sube el menor incremento y vuelve al extremo bajo.",
    4:"Intensificación: compuestos RIR 1–2; aislamientos RIR 1 y última serie segura ≈0–1. Upper y preventivos mantienen margen.",
    5:"Máximo estímulo: compuestos principales RIR 1 buscando PR limpio; aislamientos RIR 1. Upper permanece a RIR 2.",
    6:"Descarga y evaluación: mismas cargas serias que S5 con menos series. Compuestos RIR 2; Upper RIR 2–3."
  })[w]||"";
};

const oct26V2BaseAdvice=oct26BaseExerciseAdvice;
exerciseAdvice=function(e){
  const base=oct26V2BaseAdvice(e),w=oct26Week(currentDate());
  if(!w||e.type==="mobility")return base;
  if(e.preventive)return "Preventivo: RIR 2–3, nunca al fallo. Prioriza control escapular/rotador y ausencia de dolor. "+base;
  if(e.v2Role==="upper")return "Upper: mantén el RIR prescrito del plan; no lo intensifiques por encima del plan porque nadas al día siguiente. "+base;
  if(w===4&&e.v2Role==="isolation")return "Semana 4: última serie segura puede quedar en RIR 0–1; las anteriores alrededor de RIR 1. "+base;
  if(w===5&&e.v2Role==="compound")return "Semana 5: busca PR de reps o carga a RIR 1 con ROM y técnica limpios. "+base;
  if(w===6)return "Semana 6: menos series a propósito; conserva cargas y no conviertas la descarga en una sesión al fallo. "+base;
  return base;
};

function oct26V2ShoulderWeekStatus(date=currentDate()){
  const start=mondayOf(date),end=addDaysISO(start,6);
  const strength=[...(state.sessions||[]),...(state.extraSessions||[])].filter(function(s){
    return s.completed&&s.date>=start&&s.date<=end&&s.shoulderPain!=null;
  });
  const swims=(state.swim||[]).filter(function(s){return s.completed&&s.date>=start&&s.date<=end&&s.pain!=null;});
  const vals=strength.map(function(s){return +s.shoulderPain;}).concat(swims.map(function(s){return +s.pain;})).filter(Number.isFinite);
  return {max:vals.length?Math.max.apply(null,vals):null,records:vals.length};
}
oct26RulesHTML=function(date=currentDate()){
  if(!oct26InRange(date))return"";
  const shoulder=oct26V2ShoulderWeekStatus(date),warn=shoulder.max!=null&&shoulder.max>3;
  return '<div class="card oct26-cycle-card"><div class="eyebrow">Bloque de entrenamiento · 21 sep–30 oct</div><div class="hero-title" style="font-size:19px">'+esc(oct26WeekTitle(date))+'</div><div class="callout" style="margin-top:8px">'+esc(oct26WeekFocus(date))+'</div>'+
    (warn?'<div class="callout warn" style="margin-top:8px"><strong>Hombro >3/10 esta semana.</strong> No progreses presses/overhead a ciegas; aplica la regla de dolor del plan.</div>':'')+
    '<details style="margin-top:10px"><summary>Reglas de progresión y dolor</summary><div class="subtitle" style="margin-top:8px"><strong>Distribución:</strong> preferencia por Pierna A lunes, Push + Pull martes, miércoles solo piscina, Upper jueves y Pierna B viernes. Evita Push/Pull/Upper en día de piscina salvo necesidad real.<br><br><strong>Reps/peso:</strong> mejora reps dentro del rango; cuando llegues al techo con técnica y RIR correctos, sube el menor incremento y vuelve abajo en reps.<br><br><strong>Jueves:</strong> Upper conserva RIR 2 en S1–S5; no se intensifica como los otros días.<br><br><strong>Preventivos:</strong> RIR 2–3, nunca al fallo.<br><br><strong>Hombro 0–10:</strong> objetivo ≤3 durante gym/piscina, volver al nivel habitual a la mañana siguiente y no aumentar semana a semana. Si falla una condición, reduce temporalmente series de press y trabajo overhead y mantén el bloque preventivo. Si persiste 2–3 semanas pese a ajustar, valoración profesional.<br><br><strong>Superseries:</strong> solo pares de polea previstos y únicamente si comparten estación; los ejercicios de banco van aparte.</div></details></div>';
};

const oct26V2OldPoolHTML=oct26WeeklyPoolHTML;
oct26WeeklyPoolHTML=function(date=currentDate()){
  return oct26V2OldPoolHTML(date)
    .replace("Recomendación inicial: Push lunes; Pull + Pierna A el martes; miércoles solo natación; Upper jueves; Pierna B viernes.","Distribución recomendada: Pierna A lunes; Push + Pull el martes (orden intercambiable); miércoles solo natación; Upper jueves a RIR 2; Pierna B viernes.")
    .replace("Dobles sesiones:</strong> el martes puedes decidir cuál haces primero.","Dobles sesiones:</strong> el martes puedes decidir si haces Push o Pull primero.");
};

function oct26V2UpperBodyKey(key){return ["oct26_push","oct26_pull","oct26_upper"].includes(key);}
function oct26V2SwimSlot(index){return index!=null&&[1,5].includes(OCT26_SLOT_DEFS[index]?.day);}
const oct26V2OldSetSlot=setOct26Slot;
setOct26Slot=function(index,key){
  if(oct26V2SwimSlot(index)&&oct26V2UpperBodyKey(key)){
    openAppConfirm("Tren superior + piscina","El plan recomienda reservar lunes y viernes para pierna porque hay natación por la noche. Puedes hacerlo si tu agenda lo exige, pero aumenta la carga del hombro ese día.","Mover igualmente",function(){oct26V2OldSetSlot(index,key);},function(){openOct26SlotChooser(index);});
    return;
  }
  oct26V2OldSetSlot(index,key);
};
const oct26V2OldStartWeekly=oct26StartWeeklySession;
oct26StartWeeklySession=function(key){
  if(oct26SwimDay(currentDate())&&oct26V2UpperBodyKey(key)&&oct26SessionStatus(currentDate(),key).state==="pending"){
    openAppConfirm("Sesión de torso en día de piscina","El plan recomienda evitar Push, Pull y Upper en lunes/miércoles/viernes. Si hoy es el único hueco, puedes recuperarla igualmente.","Hacer hoy",function(){oct26V2OldStartWeekly(key);},function(){closeModal();});
    return;
  }
  oct26V2OldStartWeekly(key);
};

function oct26V2HasExerciseData(e){
  if(e.type==="mobility")return !!e.done;
  return (e.recordedSets||[]).some(function(a){return a.completedAt||a.leftCompletedAt||a.rightCompletedAt||a.kg||a.reps||a.rir;});
}
function oct26V2MigrateEmptyDrafts(){
  let changed=false;
  (state.sessions||[]).forEach(function(s){
    if(s.completed||s.startedAt||!OCT26_WEEKLY_KEYS.includes(s.key)||s.date<OCT26_PHASE.start||s.date>OCT26_PHASE.end)return;
    if((s.exercises||[]).some(oct26V2HasExerciseData))return;
    const p=oct26TemplateForKey(s.key,s.date);if(!p)return;
    s.title=p.title;s.exercises=(p.exercises||[]).map(function(e){return normalizeSessionExercise(Object.assign({},e,{recordedSets:[]}));});changed=true;
  });
  if(changed)saveState(true);
}
oct26V2MigrateEmptyDrafts();

const oct26V2PreviousWeeklySets=weeklyPlannedMuscleSets;
weeklyPlannedMuscleSets=function(){
  if(!oct26InRange(currentDate()))return oct26V2PreviousWeeklySets();
  const out=Object.fromEntries(MUSCLE_AXES.map(function(x){return[x[0],0];}));
  OCT26_WEEKLY_KEYS.forEach(function(key){
    const p=oct26TemplateForKey(key,currentDate());
    (p?.exercises||[]).filter(function(e){return e.type==="strength"&&!e.preventive;}).forEach(function(e){
      muscleGroupsForExercise(e).forEach(function(group){if(group in out)out[group]+=(+e.sets||0);});
    });
  });
  return out;
};

const oct26V2OldBuildReport=buildOct26Report;
buildOct26Report=function(){
  const r=oct26V2OldBuildReport();
  r.reportVersion=2;
  r.reportType="pplul-v2-2026-09-21-to-2026-10-30";
  r.program.version="v2";
  r.program.reviewNotes={
    recommendedOrder:["Pierna A + natación","Push + Pull","Natación","Upper a RIR 2","Pierna B + natación"],
    shoulderRule:"Pain <=3/10 during gym/swim, return to usual baseline by next morning, and no week-to-week upward trend. If not met, reduce press/overhead volume while maintaining preventive work.",
    supersets:"Only planned cable pairs when both stations are immediately available; bench exercises remain separate."
  };
  r.program.weeklyPrescriptions={};
  for(let w=1;w<=6;w++){
    const date=["","2026-09-21","2026-09-28","2026-10-05","2026-10-12","2026-10-19","2026-10-26"][w];
    r.program.weeklyPrescriptions["week"+w]=OCT26_WEEKLY_KEYS.map(function(key){return oct26TemplateForKey(key,date);});
  }
  return r;
};

renderAll();
