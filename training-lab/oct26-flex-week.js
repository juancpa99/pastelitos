// Flexible weekly ordering for the Sep-Oct 2026 PPLUL block.
// Five required sessions per week; their recommended slots can be swapped without changing weekly volume.
const OCT26_WEEKLY_KEYS=["oct26_push","oct26_pull","oct26_legs_a","oct26_upper","oct26_legs_b"];
const OCT26_DEFAULT_ORDER=[...OCT26_WEEKLY_KEYS];
const OCT26_SLOT_DEFS=[
 {label:"Lunes",short:"Lun",day:1,position:1,note:"Natación 22–23 h"},
 {label:"Martes · sesión 1",short:"Mar 1",day:2,position:1,note:"Primera sesión del doble"},
 {label:"Martes · sesión 2",short:"Mar 2",day:2,position:2,note:"Segunda sesión · deja varias horas si puedes"},
 {label:"Jueves",short:"Jue",day:4,position:1,note:"Sin natación"},
 {label:"Viernes",short:"Vie",day:5,position:1,note:"Natación 22–23 h"}
];

function oct26FlexContext(date=currentDate()){return oct26InRange(date)}
function oct26WeekStart(ref=currentDate()){return mondayOf(ref)}
function oct26EnsureOrderStore(){state.oct26WeekOrders??={}}
function oct26ValidOrder(order){return Array.isArray(order)&&order.length===5&&new Set(order).size===5&&OCT26_WEEKLY_KEYS.every(k=>order.includes(k))}
function oct26WeekOrder(ref=currentDate()){
 oct26EnsureOrderStore();
 const week=oct26WeekStart(ref),saved=state.oct26WeekOrders[week];
 return oct26ValidOrder(saved)?[...saved]:[...OCT26_DEFAULT_ORDER];
}
function oct26SaveWeekOrder(ref,order){
 if(!oct26ValidOrder(order))return false;
 oct26EnsureOrderStore();state.oct26WeekOrders[oct26WeekStart(ref)]=[...order];saveState(true);return true;
}
function oct26BaseTemplateByKey(key){return Object.values(OCT26_BASE_PLANS).find(p=>p.key===key)||null}
function oct26TemplateForKey(key,date=currentDate()){
 const base=oct26BaseTemplateByKey(key);if(!base)return null;
 return oct26Week(date)===6?oct26ReducedPlan(base):structuredClone(base);
}
function oct26SlotDate(ref,index){return dateForWeekday(ref,OCT26_SLOT_DEFS[index].day)}
function oct26SlotIndicesForDate(date){
 const day=weekday(date);return OCT26_SLOT_DEFS.map((slot,i)=>slot.day===day?i:null).filter(i=>i!==null);
}
function oct26WeekBounds(ref=currentDate()){
 const start=oct26WeekStart(ref),end=addDaysISO(start,6);return{start,end};
}
function oct26WeeklyRecords(ref,key){
 const {start,end}=oct26WeekBounds(ref);
 const planned=(state.sessions||[]).filter(s=>s.date>=start&&s.date<=end&&s.key===key);
 const extras=(state.extraSessions||[]).filter(s=>s.date>=start&&s.date<=end&&(s.weeklyTemplateKey===key||s.sourceKey===key));
 return [...planned,...extras].sort((a,b)=>(a.date||"").localeCompare(b.date||""));
}
function oct26WeeklyRecord(ref,key){
 const rows=oct26WeeklyRecords(ref,key);
 return rows.find(r=>r.completed)||rows.find(r=>r.startedAt&&!r.completed)||rows[0]||null;
}
function oct26WeeklyCompleted(ref,key){return oct26WeeklyRecords(ref,key).some(r=>r.completed)}
function oct26WeeklyCompletedBefore(date,key){
 const {start}=oct26WeekBounds(date);
 return [...(state.sessions||[]),...(state.extraSessions||[])].some(s=>{
  const sessionKey=s.weeklyTemplateKey||s.key||s.sourceKey;
  return s.completed&&sessionKey===key&&s.date>=start&&s.date<date;
 });
}
function oct26PrimarySlotIndex(date){
 const indices=oct26SlotIndicesForDate(date);if(!indices.length)return null;
 const order=oct26WeekOrder(date);
 return indices.find(i=>!oct26WeeklyCompletedBefore(date,order[i]))??indices[0];
}
function oct26PrimaryKey(date){
 const i=oct26PrimarySlotIndex(date);return i===null?null:oct26WeekOrder(date)[i];
}

const oct26FlexPreviousPlanFor=planFor;
planFor=function(date){
 if(!oct26FlexContext(date))return oct26FlexPreviousPlanFor(date);
 const key=oct26PrimaryKey(date);
 if(key)return oct26TemplateForKey(key,date);
 const day=weekday(date);
 if(day===3)return{key:"oct26_wed_swim_only",title:"Natación",type:"rest",subtitle:"Sin gimnasio programado · natación 22–23 h",exercises:[]};
 return{key:`oct26_rest_${day}`,title:"Descanso",type:"rest",subtitle:"Sin gimnasio obligatorio. Puedes recuperar aquí una sesión semanal pendiente.",exercises:[]};
};

function oct26SlotLocked(ref,index){
 const order=oct26WeekOrder(ref),date=oct26SlotDate(ref,index),key=order[index];
 return [...(state.sessions||[]),...(state.extraSessions||[])].some(s=>{
  const sessionKey=s.weeklyTemplateKey||s.key||s.sourceKey;
  return s.date===date&&sessionKey===key&&(s.startedAt||s.completed);
 });
}
function openOct26SlotChooser(index){
 const ref=currentDate(),order=oct26WeekOrder(ref),slot=OCT26_SLOT_DEFS[index];
 const locked=oct26SlotLocked(ref,index);
 if(locked){toast("Ese hueco ya tiene una sesión iniciada o guardada");return}
 const options=OCT26_WEEKLY_KEYS.map(key=>{
  const p=oct26BaseTemplateByKey(key),selected=order[index]===key;
  return `<button class="btn ${selected?"":"secondary"}" style="width:100%;margin-top:7px" onclick="setOct26Slot(${index},'${key}')">${selected?"✓ ":""}${esc(p.title)}</button>`;
 }).join("");
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Orden semanal</div><div class="hero-title">${esc(slot.label)}</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="callout">Al elegir una sesión, se intercambia con el hueco donde estaba. No cambian el volumen ni las cinco sesiones obligatorias.</div><div style="margin-top:8px">${options}</div></div></div>`;
}
function setOct26Slot(index,key){
 const ref=currentDate(),order=oct26WeekOrder(ref),other=order.indexOf(key);
 if(other<0||other===index){closeModal();return}
 if(oct26SlotLocked(ref,index)||oct26SlotLocked(ref,other)){toast("No se puede mover una sesión ya iniciada/guardada");return}
 [order[index],order[other]]=[order[other],order[index]];
 oct26SaveWeekOrder(ref,order);closeModal();renderAll();if(activeView==="Workout")renderWorkout();toast("Orden semanal actualizado");
}

function oct26SessionStatus(ref,key){
 const rows=oct26WeeklyRecords(ref,key),completed=rows.find(r=>r.completed),active=rows.find(r=>r.startedAt&&!r.completed);
 if(completed)return{key,state:"done",label:"Hecha",record:completed};
 if(active)return{key,state:"active",label:"En curso",record:active};
 return{key,state:"pending",label:"Pendiente",record:null};
}
function oct26StartWeeklySession(key){
 const date=currentDate(),ref=date,status=oct26SessionStatus(ref,key);
 if(status.state==="done"){toast("Esta sesión ya está completada esta semana");return}
 if(status.state==="active"){
  if(status.record.id){closeModal();editExtraSession(status.record.id)}
  else{closeModal();document.getElementById("selectedDate").value=status.record.date;showView("Workout");openPlannedWorkspace()}
  return;
 }
 const current=planFor(date);
 if(current.type==="gym"&&current.key===key){
  closeModal();showView("Workout");startGym();return;
 }
 const template=oct26TemplateForKey(key,date);if(!template)return;
 const id="weekly_"+Date.now().toString(36);
 state.extraSessions.push({
  id,date,title:`${template.title} · sesión semanal`,weeklyTemplateKey:key,weeklyWeekStart:oct26WeekStart(date),
  completed:false,startedAt:Date.now(),duration:null,rpe:null,activeKcal:null,
  exercises:(template.exercises||[]).map(e=>normalizeSessionExercise({...e,recordedSets:[]}))
 });
 saveState();closeModal();renderAll();editExtraSession(id);
}

function oct26WeeklyPoolHTML(date=currentDate()){
 if(!oct26FlexContext(date))return"";
 const order=oct26WeekOrder(date),week=oct26WeekStart(date);
 const slotRows=OCT26_SLOT_DEFS.map((slot,i)=>{
  const key=order[i],p=oct26BaseTemplateByKey(key),status=oct26SessionStatus(date,key),locked=oct26SlotLocked(date,i);
  const dateLabel=pretty(oct26SlotDate(date,i));
  return `<div class="task"><div class="ico">${i+1}</div><div style="min-width:0"><strong>${esc(slot.label)} · ${esc(p.title)}</strong><small>${esc(dateLabel)} · ${esc(slot.note)} · ${status.label}</small></div><button class="btn ghost small" ${locked?"disabled":""} onclick="openOct26SlotChooser(${i})">Cambiar</button></div>`;
 }).join("");
 const pending=OCT26_WEEKLY_KEYS.filter(key=>!oct26WeeklyCompleted(date,key));
 const pendingButtons=pending.length?pending.map(key=>{
  const p=oct26BaseTemplateByKey(key),st=oct26SessionStatus(date,key);
  return `<button class="btn ${st.state==="active"?"":"secondary"} small" onclick="oct26StartWeeklySession('${key}')">${st.state==="active"?"Continuar":"Hacer hoy"} · ${esc(p.title)}</button>`;
 }).join(""):`<span class="pill good">5/5 completadas</span>`;
 return `<div class="section oct26-week-pool-section">Tus 5 sesiones · semana ${esc(week)}</div><div class="card oct26-week-pool"><div class="row between"><div><div class="eyebrow">Orden flexible</div><strong>Completa las 5; tú decides el orden</strong></div><span class="pill">${5-pending.length}/5</span></div><div class="subtitle" style="margin-top:7px">Recomendación inicial: Push lunes; Pull + Pierna A el martes; miércoles solo natación; Upper jueves; Pierna B viernes. Puedes intercambiar los cinco huecos antes de iniciar cada sesión.</div><div style="margin-top:10px">${slotRows}</div><div class="section" style="margin-top:12px">Pendientes que puedes hacer hoy</div><div class="actions">${pendingButtons}</div><div class="callout" style="margin-top:10px"><strong>Dobles sesiones:</strong> el martes puedes decidir cuál haces primero. Si recuperas una sesión sábado/domingo, contará para esta semana exactamente igual.</div></div>`;
}

function oct26SecondaryTuesdayHTML(date=currentDate()){
 if(!oct26FlexContext(date)||weekday(date)!==2)return"";
 const indices=oct26SlotIndicesForDate(date),order=oct26WeekOrder(date),primary=oct26PrimarySlotIndex(date);
 const secondary=indices.find(i=>i!==primary);if(secondary==null)return"";
 const key=order[secondary],p=oct26BaseTemplateByKey(key),status=oct26SessionStatus(date,key);
 return `<div class="section">Segunda sesión del martes</div><div class="card"><div class="row between"><div><div class="eyebrow">Doble sesión · orden editable</div><strong>${esc(p.title)}</strong><small>${status.state==="done"?"Completada esta semana":status.state==="active"?"En curso":"Hazla en el otro hueco del martes, idealmente separada varias horas."}</small></div><span class="pill ${status.state==="done"?"good":status.state==="active"?"warn":""}">${status.label}</span></div>${status.state!=="done"?`<div class="actions" style="margin-top:10px"><button class="btn" onclick="oct26StartWeeklySession('${key}')">${status.state==="active"?"Continuar":"Iniciar segunda sesión"}</button></div>`:""}</div>`;
}

function oct26FlexibleWeekLabel(date){
 if(!oct26FlexContext(date))return oct26FlexPreviousPlanFor(date).title;
 const order=oct26WeekOrder(date),indices=oct26SlotIndicesForDate(date);
 if(weekday(date)===3)return"Natación";
 if(!indices.length)return"Descanso / recuperar";
 const titles=indices.map(i=>oct26BaseTemplateByKey(order[i]).title);
 const gym=titles.join(" + ");
 return oct26SwimDay(date)?`${gym} + natación`:gym;
}
oct26WeekLabel=oct26FlexibleWeekLabel;
homeWeekLabel=oct26FlexibleWeekLabel;

const baseOpenPendingWorkouts=openPendingWorkouts;
openPendingWorkouts=function(){
 if(!oct26FlexContext(currentDate()))return baseOpenPendingWorkouts();
 const pending=OCT26_WEEKLY_KEYS.filter(key=>!oct26WeeklyCompleted(currentDate(),key));
 const buttons=pending.map(key=>{const p=oct26BaseTemplateByKey(key),st=oct26SessionStatus(currentDate(),key);return `<button class="btn secondary pending-choice" onclick="oct26StartWeeklySession('${key}')">${st.state==="active"?"Continuar":"Hacer hoy"} · ${esc(p.title)}</button>`}).join("")||"<p>Has completado las cinco sesiones de esta semana.</p>";
 document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Sesiones semanales</div><div class="hero-title">Pendientes de esta semana</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><p>Puedes hacer cualquiera hoy, aunque originalmente estuviera asignada a otro día. Cuenta para la semana y no se duplica.</p>${buttons}</div></div>`;
};

oct26CompletedSessions=function(end){
 return [...(state.sessions||[]),...(state.extraSessions||[])].filter(s=>{
  const key=s.weeklyTemplateKey||s.key||s.sourceKey;
  return s?.completed&&s.date>=OCT26_PHASE.start&&s.date<=end&&OCT26_WEEKLY_KEYS.includes(key);
 });
};
oct26SessionKind=function(session){return session.weeklyTemplateKey?"weekly-flex-session":session.id?"extra-session":"planned-gym"};

oct26Adherence=function(end){
 const items=[];let week=OCT26_PHASE.start;
 while(week<=end){
  const order=oct26WeekOrder(week);
  OCT26_SLOT_DEFS.forEach((slot,i)=>{
   const assignedDate=dateForWeekday(week,slot.day);if(assignedDate>end)return;
   const key=order[i],records=oct26WeeklyRecords(week,key),record=records.find(r=>r.completed&&r.date<=end)||null;
   items.push({weekStart:week,assignedDate,slot:slot.label,type:"gym",key,title:oct26BaseTemplateByKey(key).title,completed:!!record,actualDate:record?.date??null,duration:record?.duration??null,rpe:record?.rpe??null,shoulderPain:record?.shoulderPain??null});
  });
  for(const day of [1,3,5]){
   const date=dateForWeekday(week,day);if(date>end||date<OCT26_PHASE.start||date>OCT26_PHASE.end)continue;
   const record=(state.swim||[]).find(s=>s.date===date&&s.completed);
   items.push({weekStart:week,assignedDate:date,slot:["","Lunes","","Miércoles","","Viernes"][day],type:"swim",key:`swim_${date}`,title:"Natación",completed:!!record,actualDate:record?.date??null,duration:record?.duration??null,rpe:record?.rpe??null,shoulderPain:record?.pain??null});
  }
  week=addDaysISO(week,7);
 }
 const summary=Object.fromEntries(["gym","swim"].map(type=>{const rows=items.filter(x=>x.type===type),done=rows.filter(x=>x.completed).length;return[type,{planned:rows.length,completed:done,adherencePct:rows.length?+(done/rows.length*100).toFixed(1):null}]}));
 return{summary,items};
};

const oct26FlexPreviousBuildReport=buildOct26Report;
buildOct26Report=function(){
 const r=oct26FlexPreviousBuildReport();
 r.program.flexibleWeeklyOrdering={requiredSessions:OCT26_WEEKLY_KEYS.map(k=>({key:k,title:oct26BaseTemplateByKey(k).title})),defaultSlots:OCT26_SLOT_DEFS.map((s,i)=>({...s,defaultKey:OCT26_DEFAULT_ORDER[i]})),savedWeeklyOrders:structuredClone(state.oct26WeekOrders||{}),rule:"Each week requires the same five sessions; slot order may change and a pending session can be completed on another day, including the weekend."};
 r.adherence=oct26Adherence(r.phase.availableThrough);
 r.performance.completedSessions=oct26CompletedSessions(r.phase.availableThrough);
 r.performance.exerciseProgress=oct26Performance(r.phase.availableThrough);
 r.dataCompleteness.gymAdherence=r.adherence.summary.gym;
 r.dataCompleteness.swimAdherence=r.adherence.summary.swim;
 return r;
};

renderAll();
