// Make Hoy reflect the complete day: primary session, complement/mobility and core meals.
// The September Sunday remains a recovery day internally, but it is presented as the programmed mobility/core session.
if(typeof SEP26_PLANS!=="undefined"&&SEP26_PLANS["0"]){
  SEP26_PLANS["0"].title="Movilidad completa + faja abdominal";
  SEP26_PLANS["0"].subtitle="Recuperación activa · sesión principal de movilidad del ciclo";
}

const HOME_CORE_MEALS=["Desayuno","Almuerzo","Cena"];

function homeComplementFor(date){
  return typeof seasonComplementTemplate==="function"?seasonComplementTemplate(date):null;
}
function homeComplementSession(date,template){
  if(!template)return null;
  return (state.extraSessions||[]).find(s=>s.date===date&&s.templateKey===template.key)||null;
}
function homeDayPresentation(date){
  const p=planFor(date),comp=homeComplementFor(date),primaryDone=p.type==="rest"?true:sessionDone(date,p),compSession=homeComplementSession(date,comp),compDone=!comp||!!compSession?.completed;
  const gymSession=p.type==="gym"?findSession(date,p.key):null;
  const primaryActive=!!(gymSession?.startedAt&&!gymSession.completed)||(state.cardioRuntime?.date===date&&!state.cardioRuntime.completed);
  const compActive=!!(compSession?.startedAt&&!compSession.completed);
  const hasActivity=p.type!=="rest"||!!comp;
  const allDone=hasActivity&&primaryDone&&compDone;
  const anyActive=primaryActive||compActive;

  let title=p.title,subtitle=p.subtitle||"",kind="Recuperación";
  if(comp&&p.type==="swim"){
    title=`${p.title} + ${comp.title}`;
    subtitle=comp.timing||p.subtitle||"";
    kind="Natación + complemento";
  }else if(comp&&p.type==="rest"){
    title=comp.title;
    subtitle=comp.timing||p.subtitle||"";
    kind="Movilidad + core";
  }else if(p.type==="gym")kind="Gimnasio";
  else if(p.type==="swim")kind="Natación";
  else if(p.type==="cardio")kind="Cardio";

  return {p,comp,compSession,primaryDone,compDone,hasActivity,allDone,anyActive,title,subtitle,kind};
}

function homeTaskHTML(date,presentation){
  const {p,comp,compSession,primaryDone,compDone}=presentation;
  let html="";

  if(p.type!=="rest"){
    html+=task("E",p.title,primaryDone?`${p.title} registrado`:`${p.title} pendiente`,primaryDone,"showView('Workout')");
  }
  if(comp){
    const desc=compDone?`${comp.title} registrado`:compSession?.startedAt?`${comp.title} en curso`:(comp.timing||`${comp.title} pendiente`);
    html+=task("+",comp.title,desc,compDone,"showView('Workout')");
  }

  if(isSunday(date)){
    html+=task("M","Peso y cintura",measurementDone(date)?"Mediciones registradas":"Mediciones semanales pendientes",measurementDone(date),"openMeasurements()");
    if(!monthlyReviewDone(date)){
      const desc=monthlyMeasurementDone(date)&&!monthlyPhotosDone(date)?"Faltan las fotos del mes":!monthlyMeasurementDone(date)&&monthlyPhotosDone(date)?"Faltan los perímetros del mes":"Perímetros y fotos mensuales pendientes";
      html+=task("R","Revisión corporal mensual",desc,false,"openMonthlyReview()");
    }
  }

  const foods=foodsFor(date);
  HOME_CORE_MEALS.forEach((meal,index)=>{
    const done=foods.some(item=>item.meal===meal);
    const icon=["D","A","C"][index];
    const action=done?"showView('Food')":`openFoodModal('${meal}')`;
    html+=task(icon,meal,done?`${meal} registrado`:`Añadir ${meal.toLowerCase()}`,done,action);
  });

  if(afterCheckHour(date))html+=task("✓","Check-in final",dailyDone(date)?"Día cerrado":"Pendiente al final del día",dailyDone(date),"openDailyCheck()");
  else html+=`<div class="task"><div class="ico">✓</div><div><strong>Check-in final</strong><small>Aparecerá a partir de las ${state.settings.checkHour}:00.</small></div></div>`;
  return html;
}

function enhanceHomeDayOverview(){
  const root=document.getElementById("viewHome");
  if(!root)return;
  const date=currentDate(),presentation=homeDayPresentation(date),hero=root.querySelector(".card.hero");
  if(hero){
    const title=hero.querySelector(".hero-title"),subtitle=hero.querySelector(".subtitle"),status=hero.querySelector(".hero-status"),actions=hero.querySelector(".hero-actions");
    if(title)title.textContent=presentation.title;
    if(subtitle)subtitle.textContent=presentation.subtitle;
    if(status){
      status.innerHTML=`<span class="pill teal">${esc(presentation.kind)}</span>${presentation.allDone?'<span class="pill good">Completado</span>':presentation.anyActive?'<span class="pill warn">En curso</span>':""}`;
    }
    if(actions){
      const foodCount=foodsFor(date).length;
      actions.innerHTML=`${presentation.hasActivity?`<button class="btn" onclick="showView('Workout')">${presentation.allDone?"Ver sesiones":presentation.anyActive?"Continuar":"Abrir entrenamiento"}</button>`:""}<button class="btn secondary" onclick="showView('Food')">${foodCount?"Ver comidas":"Añadir comida"}</button><button class="btn ghost" onclick="goToPlanSettings()">Plan</button>`;
    }
  }

  const pending=[...root.querySelectorAll(".section")].find(el=>el.textContent.trim()==="Pendiente");
  if(!pending)return;
  let node=pending.nextSibling;
  while(node&&!(node.nodeType===1&&node.classList.contains("section"))){
    const next=node.nextSibling;
    node.remove();
    node=next;
  }
  pending.insertAdjacentHTML("afterend",homeTaskHTML(date,presentation));
}

const homeOverviewRenderHome=renderHome;
renderHome=function(){
  homeOverviewRenderHome();
  enhanceHomeDayOverview();
};

enhanceHomeDayOverview();
