// Season complements layered on top of the existing plan without replacing swim or full-body sessions.
const SEASON_COMPLEMENT_TEMPLATES = {
  1: {
    key: "season_mon_aesthetic",
    title: "Complementario estético + movilidad",
    timing: "Ideal 16–17 h · natación 22–23 h",
    note: "Volumen de baja fatiga para brazos, gemelos, deltoide lateral y glúteo medio. Mantén margen para llegar fresco a la piscina.",
    exercises: [
      {key:"seated_calf",name:"Gemelo sentado",type:"strength",sets:3,min:10,max:15,rir:"2",rest:"90 s",muscle:"Gemelos",note:"ROM completo; pausa abajo y arriba."},
      {key:"cable_curl",name:"Curl de bíceps en polea",type:"strength",sets:3,min:10,max:15,rir:"2–3",rest:"90 s",muscle:"Bíceps",note:"Técnica estricta; no busques fallo antes de nadar."},
      {key:"triceps_pushdown",name:"Extensión de tríceps en polea",type:"strength",sets:3,min:10,max:15,rir:"2–3",rest:"90 s",muscle:"Tríceps",note:"Codos estables; deja margen para la natación."},
      {key:"cable_lateral_raise",name:"Elevación lateral en polea",type:"strength",sets:2,min:12,max:20,rir:"3",rest:"60–90 s",muscle:"Deltoide lateral",note:"Sin dolor ni compensación."},
      {key:"hip_abduction",name:"Abducción de cadera",type:"strength",sets:2,min:15,max:20,rir:"2–3",rest:"60–90 s",muscle:"Glúteo medio",note:"Pausa breve en apertura."},
      {key:"season_band_external_rotation",name:"Rotación externa con banda",type:"mobility",group:"Hombro/escápula",dose:"2 × 15–20",note:"Muy suave; deja aproximadamente 5 RIR."},
      {key:"season_wall_slides",name:"Wall slides",type:"mobility",group:"Hombro/escápula",dose:"2 × 10",note:"Control escapular sin forzar rango."},
      {key:"season_open_book",name:"Open book",type:"mobility",group:"Torácica",dose:"1 × 8 por lado",note:"Rotación torácica lenta."},
      {key:"season_lat_stretch",name:"Estiramiento dorsal",type:"mobility",group:"Torácica/hombro",dose:"1 × 30–45 s por lado",note:"Respiración tranquila."},
      {key:"season_pec_stretch",name:"Estiramiento suave de pectoral",type:"mobility",group:"Hombro/pectoral",dose:"1 × 30–45 s por lado",note:"Sin llevar el hombro a molestia."}
    ]
  },
  3: {
    key: "season_wed_mobility",
    title: "Movilidad completa",
    timing: "Ideal 16–17 h · natación 22–23 h",
    note: "Movilidad global para tobillo, cadera, columna torácica y cintura escapular. No es un entrenamiento al fallo.",
    exercises: [
      {key:"season_knee_to_wall",name:"Knee-to-wall",type:"mobility",group:"Tobillo",dose:"2 × 10 + 30 s por lado",note:"Talón apoyado; gana dorsiflexión sin dolor."},
      {key:"season_deep_squat",name:"Sentadilla profunda asistida",type:"mobility",group:"Tobillo/cadera",dose:"2 × 45 s",note:"Usa apoyo si permite una posición más limpia."},
      {key:"season_9090",name:"90/90 switches",type:"mobility",group:"Cadera",dose:"2 × 8 por lado",note:"Controla la rotación, sin rebotes."},
      {key:"season_couch",name:"Couch stretch",type:"mobility",group:"Cadera/cuádriceps",dose:"2 × 45 s por lado",note:"Pelvis neutra y glúteo contraído."},
      {key:"season_adductor",name:"Adductor rockback",type:"mobility",group:"Cadera/aductores",dose:"2 × 10 por lado",note:"Movimiento lento."},
      {key:"season_open_book_wed",name:"Open book",type:"mobility",group:"Torácica",dose:"2 × 8 por lado",note:"Respira al abrir."},
      {key:"season_lat_stretch_wed",name:"Estiramiento dorsal",type:"mobility",group:"Torácica/hombro",dose:"2 × 45 s por lado",note:"No fuerces el hombro."},
      {key:"season_wall_slides_wed",name:"Wall slides",type:"mobility",group:"Hombro/escápula",dose:"2 × 10",note:"Costillas controladas."},
      {key:"season_band_external_rotation_wed",name:"Rotación externa con banda",type:"mobility",group:"Hombro/escápula",dose:"2 × 15–20",note:"Resistencia ligera; aproximadamente 5 RIR."},
      {key:"season_pec_stretch_wed",name:"Estiramiento suave de pectoral",type:"mobility",group:"Hombro/pectoral",dose:"2 × 30–45 s por lado",note:"Sin dolor anterior del hombro."}
    ]
  },
  6: {
    key: "season_sat_aesthetic",
    title: "Finisher estético",
    timing: "Después del Full Body C",
    note: "Completa el volumen semanal donde el full body se queda corto sin añadir más espalda ni presses.",
    exercises: [
      {key:"leg_extension",name:"Extensión de cuádriceps",type:"strength",sets:2,min:12,max:15,rir:"2",rest:"90 s",muscle:"Cuádriceps",note:"Baja fatiga sistémica; control excéntrico."},
      {key:"standing_calf",name:"Gemelo de pie",type:"strength",sets:3,min:10,max:15,rir:"1–2",rest:"90 s",muscle:"Gemelos",note:"ROM completo y pausa en estiramiento."},
      {key:"hip_abduction",name:"Abducción de cadera",type:"strength",sets:2,min:15,max:20,rir:"1–2",rest:"60–90 s",muscle:"Glúteo medio",note:"Pausa breve en apertura."}
    ]
  }
};

function seasonComplementTemplate(date=currentDate()){
  if(state.settings.mode!=="season") return null;
  return SEASON_COMPLEMENT_TEMPLATES[weekday(date)] || null;
}
function seasonComplementSession(date=currentDate()){
  const tpl=seasonComplementTemplate(date);
  if(!tpl) return null;
  return state.extraSessions.find(s=>s.date===date && s.templateKey===tpl.key) || null;
}
function seasonComplementHTML(date=currentDate()){
  const tpl=seasonComplementTemplate(date);
  if(!tpl) return "";
  const existing=seasonComplementSession(date);
  const strength=tpl.exercises.filter(e=>e.type==="strength");
  const mobility=tpl.exercises.filter(e=>e.type==="mobility");
  const summary=[
    strength.length ? `${strength.reduce((n,e)=>n+(+e.sets||0),0)} series de fuerza` : "",
    mobility.length ? `${mobility.length} ejercicios de movilidad` : ""
  ].filter(Boolean).join(" · ");
  let action;
  if(existing?.completed) action=`<button class="btn secondary" onclick="editExtraSession('${existing.id}')">Ver complemento guardado</button>`;
  else if(existing?.startedAt) action=`<button class="btn secondary" onclick="editExtraSession('${existing.id}')">Abrir complemento</button>`;
  else action=`<button class="btn" onclick="startSeasonComplement(${existing?`'${existing.id}'`:""})">Iniciar complemento</button>`;
  return `<div class="card season-complement-card"><div class="eyebrow">Complemento programado</div><div class="hero-title" style="font-size:18px">${esc(tpl.title)}</div><div class="subtitle">${esc(tpl.timing)} · ${esc(summary)}</div><div class="callout" style="margin-top:8px">${esc(tpl.note)}</div><div class="actions" style="margin-top:10px">${action}</div></div>`;
}
function createSeasonComplementRecord(){
  const tpl=seasonComplementTemplate();
  if(!tpl) return null;
  const existing=seasonComplementSession();
  if(existing) return existing;
  const id="season_"+tpl.key+"_"+Date.now().toString(36);
  const session={
    id,
    date:currentDate(),
    title:tpl.title,
    templateKey:tpl.key,
    completed:false,
    startedAt:null,
    pausedAt:null,
    pausedDuration:0,
    duration:null,
    rpe:null,
    activeKcal:null,
    exercises:structuredClone(tpl.exercises).map(e=>normalizeSessionExercise({...e,recordedSets:[]}))
  };
  state.extraSessions.push(session);
  saveState(true);
  return session;
}
function mobilityStartReminder(next){
  document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><h2>Antes de empezar</h2><p>Si quieres contabilizar la sesión, activa en el smartwatch el entrenamiento que uses para movilidad.</p><p>El reloj y la app se inician y se pausan por separado.</p><button class="btn" id="mobilityReady">Listo · iniciar sesión</button><button class="btn ghost" onclick="closeModal()">Todavía no</button></div></div>`;
  document.getElementById("mobilityReady").onclick=()=>{closeModal();next()};
}
function startSeasonComplement(id=null){
  const tpl=seasonComplementTemplate();
  if(!tpl) return;
  let s=id?state.extraSessions.find(x=>x.id===id):seasonComplementSession();
  if(!s) s=createSeasonComplementRecord();
  if(!s) return;
  if(s.completed){editExtraSession(s.id);return;}
  if(s.startedAt){editExtraSession(s.id);return;}
  const begin=()=>{
    s.startedAt=Date.now();
    s.pausedAt=null;
    s.pausedDuration=+s.pausedDuration||0;
    saveState(true);
    renderWorkout();
    editExtraSession(s.id);
    startRuntimeTicker();
    updateExtraClock();
  };
  const hasStrength=tpl.exercises.some(e=>e.type==="strength");
  if(hasStrength) watchReminder(begin);
  else mobilityStartReminder(begin);
}
// Backwards-compatible entry point for any cached older button.
function createSeasonComplement(){startSeasonComplement()}

const seasonBaseEditExtraSession=editExtraSession;
editExtraSession=function(id){
  const s=state.extraSessions.find(x=>x.id===id);
  if(s?.templateKey?.startsWith("season_") && !s.completed && !s.startedAt){
    startSeasonComplement(id);
    return;
  }
  seasonBaseEditExtraSession(id);
};

const seasonBaseRenderWorkout = renderWorkout;
renderWorkout = function(){
  seasonBaseRenderWorkout();
  const root=document.getElementById("viewWorkout");
  const html=seasonComplementHTML(currentDate());
  if(root && html) root.insertAdjacentHTML("afterbegin",html);
};

const seasonBaseWeeklyPlannedMuscleSets = weeklyPlannedMuscleSets;
weeklyPlannedMuscleSets = function(){
  const out=seasonBaseWeeklyPlannedMuscleSets();
  if(state.settings.mode!=="season") return out;
  Object.values(SEASON_COMPLEMENT_TEMPLATES).forEach(tpl=>{
    tpl.exercises.filter(e=>e.type==="strength").forEach(e=>{
      muscleGroupsForExercise(e).forEach(group=>{
        if(group in out) out[group]+=(+e.sets||0);
      });
    });
  });
  return out;
};