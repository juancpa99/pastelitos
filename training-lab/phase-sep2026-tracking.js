// Tracking additions for the Sep 2026 three-week block.
// Keep the existing session/set model; only collect missing data needed for the post-block review.

function sep26TrackingApplies(date=currentDate()){
  return typeof sep26InRange==="function" && sep26InRange(date,SEP26_PHASE.start,SEP26_PHASE.evalEnd);
}

function sep26SessionTrackingFieldsHTML(prefix,session={}){
  return `<div class="field"><label>Hombro / molestias 0–10</label><input id="${prefix}Pain" inputmode="decimal" value="${session.shoulderPain??""}" placeholder="0"></div><div class="field wide"><label>Notas de la sesión (opcional)</label><textarea id="${prefix}Notes" placeholder="Técnica, molestias, ejercicio especialmente fácil/difícil…">${esc(session.sessionNotes??"")}</textarea></div>`;
}

// Planned gym sessions: add pain + notes to the existing finish screen.
const sep26TrackingOldOpenFinishGym=openFinishGym;
openFinishGym=function(){
  sep26TrackingOldOpenFinishGym();
  if(!sep26TrackingApplies())return;
  const s=findSession(currentDate(),planFor(currentDate()).key),grid=document.querySelector("#modalRoot .formgrid");
  if(grid&&!document.getElementById("sepGymPain"))grid.insertAdjacentHTML("beforeend",sep26SessionTrackingFieldsHTML("sepGym",s||{}));
};

let sep26PendingGymTracking=null;
const sep26TrackingOldFinishGym=finishGym;
finishGym=function(){
  if(sep26TrackingApplies()&&document.getElementById("sepGymPain")){
    const pain=num("sepGymPain");
    if(pain!==null&&(!Number.isFinite(pain)||pain<0||pain>10)){toast("Las molestias deben estar entre 0 y 10");return;}
    sep26PendingGymTracking={shoulderPain:pain,sessionNotes:val("sepGymNotes").trim()};
  }else sep26PendingGymTracking=null;
  sep26TrackingOldFinishGym();
};

const sep26TrackingOldCommitGymFinish=commitGymFinish;
commitGymFinish=function(values){
  const s=collectPlannedInputs();
  if(sep26PendingGymTracking&&sep26TrackingApplies(s?.date||currentDate()))Object.assign(s,sep26PendingGymTracking);
  sep26TrackingOldCommitGymFinish(values);
  sep26PendingGymTracking=null;
};

// Complementary sessions: same tracking fields before saving.
const sep26TrackingOldOpenFinishExtra=openFinishExtra;
openFinishExtra=function(id){
  sep26TrackingOldOpenFinishExtra(id);
  const s=state.extraSessions.find(x=>x.id===id);
  if(!s||!sep26TrackingApplies(s.date))return;
  const grid=document.querySelector("#modalRoot .formgrid");
  if(grid&&!document.getElementById("sepExtraPain"))grid.insertAdjacentHTML("beforeend",sep26SessionTrackingFieldsHTML("sepExtra",s));
};

const sep26TrackingOldFinishExtra=finishExtra;
finishExtra=function(id){
  const s=state.extraSessions.find(x=>x.id===id);
  if(s&&sep26TrackingApplies(s.date)&&document.getElementById("sepExtraPain")){
    const pain=num("sepExtraPain");
    if(pain!==null&&(!Number.isFinite(pain)||pain<0||pain>10)){toast("Las molestias deben estar entre 0 y 10");return;}
    s.shoulderPain=pain;
    s.sessionNotes=val("sepExtraNotes").trim();
  }
  sep26TrackingOldFinishExtra(id);
};

// A complete baseline and final body record makes the 3-week comparison interpretable.
function sep26AssessmentRecord(kind){
  return [...(state.body||[])].filter(x=>x.phaseAssessment===kind).sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
}
function sep26AssessmentLabel(kind){return kind==="baseline"?"Medición de referencia":"Medición final"}
function sep26AssessmentWindow(kind,date=currentDate()){
  return kind==="baseline"?(date>=SEP26_PHASE.start&&date<="2026-09-13"):(date>=SEP26_PHASE.evalStart&&date<=SEP26_PHASE.evalEnd);
}
function openSep26Assessment(kind){
  const old=sep26AssessmentRecord(kind)||state.body.find(x=>x.date===currentDate())||((typeof sep26LatestBody==="function"&&sep26LatestBody(currentDate()))||{});
  document.getElementById("modalRoot").innerHTML=`<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Ciclo septiembre 2026</div><div class="hero-title">${sep26AssessmentLabel(kind)}</div></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="callout">Haz referencia y final en condiciones lo más parecidas posible: por la mañana, después de ir al baño y antes de desayunar. Usa los mismos puntos anatómicos y la misma cinta.</div><div class="formgrid" style="margin-top:10px"><div class="field"><label>Peso (kg)</label><input id="paWeight" inputmode="decimal" value="${old.weight??""}"></div><div class="field"><label>Cintura (cm)</label><input id="paWaist" inputmode="decimal" value="${old.waist??""}"></div><div class="field"><label>Pecho (cm)</label><input id="paChest" inputmode="decimal" value="${old.chest??""}"></div><div class="field"><label>Brazo flexionado (cm)</label><input id="paArm" inputmode="decimal" value="${old.arm??""}"></div><div class="field"><label>Cadera / glúteo (cm)</label><input id="paHips" inputmode="decimal" value="${old.hips??""}"></div><div class="field"><label>Muslo derecho (cm)</label><input id="paThigh" inputmode="decimal" value="${old.thigh??""}"></div><div class="field"><label>Gemelo derecho (cm)</label><input id="paCalf" inputmode="decimal" value="${old.calf??""}"></div><div class="field wide"><label>Notas (opcional)</label><textarea id="paNotes" placeholder="Hora, hidratación, cualquier condición distinta…">${esc(old.phaseAssessmentNotes??"")}</textarea></div></div><div class="actions"><button class="btn" onclick="saveSep26Assessment('${kind}')">Guardar ${kind==="baseline"?"referencia":"medición final"}</button></div></div></div>`;
}
function saveSep26Assessment(kind){
  const values={weight:num("paWeight"),waist:num("paWaist"),chest:num("paChest"),arm:num("paArm"),hips:num("paHips"),thigh:num("paThigh"),calf:num("paCalf")};
  if(Object.values(values).some(v=>!Number.isFinite(v)||v<=0)){toast("Completa todas las medidas con valores válidos");return;}
  const previous=sep26AssessmentRecord(kind);
  if(previous&&previous.date!==currentDate())state.body=state.body.filter(x=>x!==previous);
  upsert(state.body,{date:currentDate(),...values,phaseAssessment:kind,phaseAssessmentNotes:val("paNotes").trim()});
  saveState(true);closeModal();renderAll();toast(`${sep26AssessmentLabel(kind)} guardada`);
}
function sep26AssessmentCard(date=currentDate()){
  if(!sep26TrackingApplies(date))return"";
  const kind=sep26AssessmentWindow("final",date)?"final":sep26AssessmentWindow("baseline",date)?"baseline":null;
  if(!kind)return"";
  const record=sep26AssessmentRecord(kind),label=sep26AssessmentLabel(kind);
  return `<div class="card"><div class="row between settings-status-row"><div><div class="eyebrow">Evaluación física del ciclo</div><strong>${label}</strong><small>${record?`Guardada el ${esc(record.date)} · puedes revisarla si necesitas corregir algo.`:"Peso, cintura y perímetros completos para comparar el bloque."}</small></div><span class="pill ${record?"good":"warn"}">${record?"Guardada":"Pendiente"}</span></div><div class="actions" style="margin-top:10px"><button class="btn ${record?"secondary":""}" onclick="openSep26Assessment('${kind}')">${record?"Revisar medición":"Registrar ahora"}</button></div></div>`;
}

const sep26TrackingOldRenderHome=renderHome;
renderHome=function(){
  sep26TrackingOldRenderHome();
  const root=document.getElementById("viewHome"),html=sep26AssessmentCard(currentDate());
  if(root&&html)root.insertAdjacentHTML("afterbegin",html);
};

// Re-render once so the phase assessment card is visible immediately after loading this module.
renderAll();
