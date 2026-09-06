// Final analysis report for the Sep 2026 three-week block.
// Loaded after tracking so the report can use the explicit baseline/final assessments.

function sep26SafeNumber(value){
  const n=+value;
  return Number.isFinite(n)?n:null;
}
function sep26Mean(values){
  const nums=values.map(sep26SafeNumber).filter(v=>v!==null);
  return nums.length?+(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2):null;
}
function sep26PercentChange(a,b){
  return a!=null&&b!=null&&a!==0?+((b-a)/a*100).toFixed(2):null;
}
function sep26BodyAssessment(kind,end){
  if(typeof sep26AssessmentRecord==="function"){
    const tagged=sep26AssessmentRecord(kind);
    if(tagged&&tagged.date<=end)return tagged;
  }
  if(kind==="baseline")return [...(state.body||[])].filter(x=>x.date>=SEP26_PHASE.start&&x.date<="2026-09-13"&&x.date<=end).sort((a,b)=>a.date.localeCompare(b.date))[0]||null;
  return [...(state.body||[])].filter(x=>x.date>=SEP26_PHASE.evalStart&&x.date<=SEP26_PHASE.evalEnd&&x.date<=end).sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
}
function sep26CompletedPhaseSessions(end){
  return [...(state.sessions||[]),...(state.extraSessions||[])].filter(s=>s?.completed&&s.date>=SEP26_PHASE.start&&s.date<=end);
}
function sep26SessionKind(session){
  if(session.templateKey)return session.templateKey.includes("mob")||session.templateKey.includes("sun_")?"mobility-complement":"strength-complement";
  if(session.key?.includes("sep26_"))return "planned-gym";
  return "other-strength";
}
function sep26ExerciseSetRows(exercise){
  if(exercise.type==="mobility")return [];
  const attempts=typeof effectiveAttempts==="function"?effectiveAttempts(exercise):(exercise.recordedSets||[]).filter(a=>a.completedAt&&a.attemptType!=="warmup");
  const unilateral=typeof loadProfile==="function"?!!loadProfile(exercise).unilateral:false;
  return attempts.map((a,index)=>({
    set:index+1,
    enteredLoadKg:sep26SafeNumber(a.kg),
    reps:sep26SafeNumber(a.reps),
    rir:sep26SafeNumber(a.rir),
    rightLoadKg:unilateral?sep26SafeNumber(a.rightKg):null,
    rightReps:unilateral?sep26SafeNumber(a.rightReps):null,
    rightRir:unilateral?sep26SafeNumber(a.rightRir):null,
    completedAt:a.completedAt||null
  }));
}
function sep26ExposureSummary(exercise,session){
  const sets=sep26ExerciseSetRows(exercise);
  if(!sets.length)return null;
  const leftLoads=sets.map(s=>s.enteredLoadKg).filter(v=>v!==null),rightLoads=sets.map(s=>s.rightLoadKg).filter(v=>v!==null);
  const maxLeft=leftLoads.length?Math.max(...leftLoads):null,maxRight=rightLoads.length?Math.max(...rightLoads):null;
  const repsAtBestLeft=maxLeft==null?null:sets.filter(s=>s.enteredLoadKg===maxLeft).reduce((n,s)=>n+(s.reps||0),0);
  const repsAtBestRight=maxRight==null?null:sets.filter(s=>s.rightLoadKg===maxRight).reduce((n,s)=>n+(s.rightReps||0),0);
  return {
    date:session.date,
    sessionTitle:session.title||session.key||"Sesión",
    sessionKind:sep26SessionKind(session),
    prescribed:{sets:+exercise.sets||null,repsMin:+exercise.min||null,repsMax:+exercise.max||null,rir:exercise.rir||null},
    loadConvention:typeof loadLabel==="function"?loadLabel(exercise):null,
    effectiveSets:sets.length,
    bestEnteredLoadKg:maxLeft,
    repsAtBestLoad:repsAtBestLeft,
    totalReps:sets.reduce((n,s)=>n+(s.reps||0),0),
    avgRIR:sep26Mean(sets.map(s=>s.rir)),
    bestRightEnteredLoadKg:maxRight,
    rightRepsAtBestLoad:repsAtBestRight,
    totalRightReps:sets.reduce((n,s)=>n+(s.rightReps||0),0),
    avgRightRIR:sep26Mean(sets.map(s=>s.rightRir)),
    sets
  };
}
function sep26PerformanceByExercise(end){
  const groups=new Map();
  sep26CompletedPhaseSessions(end).forEach(session=>(session.exercises||[]).forEach(exercise=>{
    if(exercise.type==="mobility")return;
    const exposure=sep26ExposureSummary(exercise,session);
    if(!exposure)return;
    const signature=typeof profileSignature==="function"?profileSignature(exercise):JSON.stringify(exercise.loadProfile||{});
    const key=JSON.stringify([exercise.key,signature]);
    if(!groups.has(key))groups.set(key,{key:exercise.key,exercise:exercise.name,loadConvention:exposure.loadConvention,muscle:exercise.muscle||exercise.group||null,exposures:[]});
    groups.get(key).exposures.push(exposure);
  }));
  return [...groups.values()].map(group=>{
    group.exposures.sort((a,b)=>a.date.localeCompare(b.date));
    const first=group.exposures[0],last=group.exposures.at(-1);
    return {...group,sessions:group.exposures.length,first,last,change:{bestEnteredLoadKg:first.bestEnteredLoadKg!=null&&last.bestEnteredLoadKg!=null?+(last.bestEnteredLoadKg-first.bestEnteredLoadKg).toFixed(2):null,bestEnteredLoadPct:sep26PercentChange(first.bestEnteredLoadKg,last.bestEnteredLoadKg),repsAtBestLoad:first.repsAtBestLoad!=null&&last.repsAtBestLoad!=null?last.repsAtBestLoad-first.repsAtBestLoad:null,totalReps:first.totalReps!=null&&last.totalReps!=null?last.totalReps-first.totalReps:null,avgRIR:first.avgRIR!=null&&last.avgRIR!=null?+(last.avgRIR-first.avgRIR).toFixed(2):null}};
  }).sort((a,b)=>a.exercise.localeCompare(b.exercise));
}
function sep26PlannedItems(end){
  const items=[];
  for(let date=SEP26_PHASE.start;date<=end;date=addDaysISO(date,1)){
    const plan=planFor(date),comp=seasonComplementTemplate(date);
    if(plan?.type==="gym")items.push({date,type:"gym",key:plan.key,title:plan.title});
    if(plan?.type==="swim")items.push({date,type:"swim",key:plan.key,title:plan.title});
    if(comp)items.push({date,type:"complement",key:comp.key,title:comp.title});
  }
  return items;
}
function sep26Adherence(end){
  const planned=sep26PlannedItems(end);
  const completed=planned.map(item=>{
    let record=null;
    if(item.type==="gym")record=(state.sessions||[]).find(s=>s.date===item.date&&s.key===item.key&&s.completed);
    else if(item.type==="swim")record=(state.swim||[]).find(s=>s.date===item.date&&s.completed);
    else record=(state.extraSessions||[]).find(s=>s.date===item.date&&s.templateKey===item.key&&s.completed);
    return {...item,completed:!!record,incomplete:!!record?.incomplete,duration:record?.duration??null,rpe:record?.rpe??null,shoulderPain:record?.shoulderPain??record?.pain??null};
  });
  const byType=Object.fromEntries(["gym","swim","complement"].map(type=>{
    const rows=completed.filter(x=>x.type===type),done=rows.filter(x=>x.completed).length;
    return [type,{planned:rows.length,completed:done,adherencePct:rows.length?+(done/rows.length*100).toFixed(1):null}];
  }));
  return {byType,items:completed};
}
function sep26MobilityCompletion(end){
  let prescribed=0,done=0;
  sep26CompletedPhaseSessions(end).forEach(session=>(session.exercises||[]).forEach(e=>{
    if(e.type!=="mobility")return;
    prescribed++;
    if(e.done)done++;
  }));
  return {completedExercises:done,prescribedExercisesInCompletedSessions:prescribed,completionPct:prescribed?+(done/prescribed*100).toFixed(1):null};
}
function sep26ActualMuscleSets(end){
  const out={};
  sep26CompletedPhaseSessions(end).forEach(session=>(session.exercises||[]).forEach(exercise=>{
    if(exercise.type==="mobility")return;
    const count=sep26ExerciseSetRows(exercise).length;
    if(!count)return;
    const groups=typeof muscleGroupsForExercise==="function"?muscleGroupsForExercise(exercise):[exercise.muscle||"Otros"];
    groups.forEach(group=>out[group]=(out[group]||0)+count);
  }));
  return out;
}
function sep26WeeklyReport(end){
  const periods=[["Semana 1","2026-09-07","2026-09-13"],["Semana 2","2026-09-14","2026-09-20"],["Semana 3","2026-09-21","2026-09-27"],["Evaluación","2026-09-28","2026-10-04"]];
  return periods.filter(([,start])=>start<=end).map(([label,start,finish])=>{
    const stop=finish<end?finish:end;
    const strength=sep26CompletedPhaseSessions(stop).filter(s=>s.date>=start);
    const swims=(state.swim||[]).filter(s=>s.completed&&s.date>=start&&s.date<=stop);
    const daily=(state.daily||[]).filter(d=>d.date>=start&&d.date<=stop);
    return {label,start,end:stop,completedStrengthOrComplementSessions:strength.length,completedSwims:swims.length,swimMeters:swims.reduce((n,s)=>n+(+s.meters||0),0),effectiveStrengthSets:typeof strengthSeriesCount==="function"?strengthSeriesCount(strength):null,avgStrengthRPE:sep26Mean(strength.map(s=>s.rpe)),avgStrengthShoulderPain:sep26Mean(strength.map(s=>s.shoulderPain)),avgSwimRPE:sep26Mean(swims.map(s=>s.rpe)),avgSwimShoulderPain:sep26Mean(swims.map(s=>s.pain)),avgEnergy:sep26Mean(daily.map(d=>d.energy)),avgFatigue:sep26Mean(daily.map(d=>d.fatigue)),avgGeneralPain:sep26Mean(daily.map(d=>d.pain)),avgSleepHours:sep26Mean(daily.map(d=>d.sleep)),avgHunger:sep26Mean(daily.map(d=>d.hunger)),avgCigarettes:sep26Mean(daily.map(d=>d.cigs)),checkins:daily.length};
  });
}
function sep26ProgramSnapshot(){
  const days={};
  for(let wd=0;wd<7;wd++){
    const sample=addDaysISO(SEP26_PHASE.start,wd),plan=SEP26_PLANS[String(weekday(sample))],comp=SEP26_COMPLEMENTS[String(weekday(sample))]||null;
    days[String(weekday(sample))]={plan:plan?structuredClone(plan):null,complement:comp?structuredClone(comp):null};
  }
  return {days,progression:{week1:sep26WeekFocus("2026-09-07"),week2:sep26WeekFocus("2026-09-14"),week3:sep26WeekFocus("2026-09-21"),evaluation:sep26WeekFocus("2026-09-28")}};
}
function sep26DataCompleteness(end,baseline,final,adherence){
  const elapsedDays=Math.max(0,Math.round((Date.parse(end+"T12:00:00Z")-Date.parse(SEP26_PHASE.start+"T12:00:00Z"))/86400000)+1);
  const daily=(state.daily||[]).filter(d=>d.date>=SEP26_PHASE.start&&d.date<=end);
  const strength=sep26CompletedPhaseSessions(end);
  const strengthPain=strength.filter(s=>s.shoulderPain!=null).length;
  return {baselineAssessment:!!baseline,finalAssessment:!!final,dailyCheckins:{completed:daily.length,possible:elapsedDays,coveragePct:elapsedDays?+(daily.length/elapsedDays*100).toFixed(1):null},strengthSessionShoulderPain:{recorded:strengthPain,completedSessions:strength.length,coveragePct:strength.length?+(strengthPain/strength.length*100).toFixed(1):null},adherence:adherence.byType,readyForFinalReview:!!baseline&&!!final&&end>=SEP26_PHASE.evalStart};
}

buildSep26Report=function(){
  const end=sep26ReportEnd();
  const baseline=sep26BodyAssessment("baseline",end),final=sep26BodyAssessment("final",end);
  const latest=final||[...(state.body||[])].filter(x=>x.date<=end).sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
  const body=sep26Rows(state.body,"2026-09-01",end),daily=sep26Rows(state.daily,SEP26_PHASE.start,end),swim=sep26Rows(state.swim,SEP26_PHASE.start,end),foods=sep26Rows(state.foods,SEP26_PHASE.start,end),sessions=sep26CompletedPhaseSessions(end),adherence=sep26Adherence(end);
  const nutritionDays=[...new Set(foods.map(x=>x.date))].sort().map(date=>({date,...dayNutrition(date)}));
  return {
    app:"Training Lab",
    reportVersion:2,
    reportType:"sep-2026-three-week-block",
    generatedAt:new Date().toISOString(),
    purpose:"Upload this JSON to ChatGPT for the post-block review and October training-plan adjustment.",
    phase:{...SEP26_PHASE,availableThrough:end,currentStage:sep26WeekTitle(end)},
    program:sep26ProgramSnapshot(),
    body:{baselineAssessment:baseline,finalAssessment:final,latestAvailable:latest,deltaBaselineToFinal:final?sep26Delta(baseline,final):null,deltaBaselineToLatest:sep26Delta(baseline,latest),records:body},
    adherence:{...adherence,mobility:sep26MobilityCompletion(end)},
    weekly:sep26WeeklyReport(end),
    recovery:{records:daily,averages:{energy:sep26Mean(daily.map(d=>d.energy)),fatigue:sep26Mean(daily.map(d=>d.fatigue)),generalPain:sep26Mean(daily.map(d=>d.pain)),sleepHours:sep26Mean(daily.map(d=>d.sleep)),hunger:sep26Mean(daily.map(d=>d.hunger)),cigarettes:sep26Mean(daily.map(d=>d.cigs))}},
    swimming:{records:swim,totalMeters:swim.reduce((n,x)=>n+(+x.meters||0),0),avgRPE:sep26Mean(swim.map(x=>x.rpe)),avgShoulderPain:sep26Mean(swim.map(x=>x.pain))},
    nutrition:{goals:state.settings.nutritionGoals||{},loggedDays:nutritionDays,averages:{kcal:sep26Mean(nutritionDays.map(x=>x.kcal)),proteinG:sep26Mean(nutritionDays.map(x=>x.p)),carbsG:sep26Mean(nutritionDays.map(x=>x.c)),fatG:sep26Mean(nutritionDays.map(x=>x.f))},rawEntries:foods},
    performance:{exerciseProgress:sep26PerformanceByExercise(end),actualMuscleSetExposures:sep26ActualMuscleSets(end),completedSessions:sessions},
    dataCompleteness:sep26DataCompleteness(end,baseline,final,adherence),
    photos:{metadata:state.photoMonths||[],note:"Photo binaries stay in IndexedDB and are not included. Upload comparison photos separately if visual review is wanted."},
    interpretationNotes:["Entered loads are compared only within the same exercise/equipment profile.","Load × reps is not treated as a universal strength metric across machines or load conventions.","Compound exercises can contribute set exposure to more than one muscle group in the app's muscle-distribution logic.","Power drills are recorded as completion tasks; jump height and medicine-ball velocity are not measured."],
    appSettings:{mode:state.settings.mode,planName:state.settings.planName||null}
  };
};

downloadSep26Report=function(){
  const report=buildSep26Report();
  download(`Training_Lab_informe_ciclo_${SEP26_PHASE.start}_a_${SEP26_PHASE.evalEnd}.json`,JSON.stringify(report,null,2),"application/json");
  toast(report.dataCompleteness.readyForFinalReview?"Informe final descargado":"Informe provisional descargado");
};

sep26ReportHTML=function(){
  const r=buildSep26Report(),d=r.body.deltaBaselineToFinal||r.body.deltaBaselineToLatest||{},complete=r.dataCompleteness,finalWindow=todayISO()>=SEP26_PHASE.evalStart;
  const summary=[d.weight!=null?`peso ${d.weight>=0?"+":""}${d.weight} kg`:null,d.waist!=null?`cintura ${d.waist>=0?"+":""}${d.waist} cm`:null].filter(Boolean).join(" · ");
  const status=complete.readyForFinalReview?"Listo para analizar":finalWindow?"Falta medición final":"En construcción";
  return `<div class="section">Informe del ciclo</div><div class="card"><div class="row between settings-status-row"><div><strong>${status}</strong><small>Datos hasta ${esc(r.phase.availableThrough)}${summary?` · ${esc(summary)}`:""}</small></div><span class="pill ${complete.readyForFinalReview?"good":finalWindow?"warn":""}">${complete.readyForFinalReview?"Completo":finalWindow?"Revisar":"3 semanas"}</span></div><div class="subtitle" style="margin-top:10px">Incluye el plan prescrito, adherencia, referencia y medición final, recuperación, natación, nutrición, molestias de hombro y todas las exposiciones de fuerza con peso, repeticiones y RIR. Conserva además las sesiones y series originales.</div><div class="callout" style="margin-top:10px"><strong>Calidad del registro:</strong> check-ins ${complete.dailyCheckins.completed}/${complete.dailyCheckins.possible} · molestias en fuerza ${complete.strengthSessionShoulderPain.recorded}/${complete.strengthSessionShoulderPain.completedSessions} sesiones · referencia ${complete.baselineAssessment?"sí":"no"} · final ${complete.finalAssessment?"sí":"no"}.</div><div class="actions" style="margin-top:10px"><button class="btn" onclick="downloadSep26Report()">Descargar informe para analizar</button></div><div class="subtitle" style="margin-top:10px">Cuando termine el bloque, descarga este JSON y súbelo al chat. Las fotos se comparten aparte porque no salen del almacenamiento local de imágenes.</div></div>`;
};

renderAll();
