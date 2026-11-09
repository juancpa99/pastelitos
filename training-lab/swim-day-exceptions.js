// Single-day override: exchange a scheduled swim for one of the three unfinished PPL sessions.
// The regular weekly calendar, completed sessions and historical swim records remain untouched.
function marevoNoSwimOnDate(date){
  return !!(state.trainingDayOverrides &&
    state.trainingDayOverrides[date] === "no_swim_gym");
}
(function(){
  const BEGIN = "2026-11-09";
  const REQUIRED = ["nov26_push", "nov26_pull", "nov26_legs"];
  const isSwimWeekday = date => [1,3,5].includes(weekday(date));
  function eligible(date){
    if(!date || date < BEGIN || !isSwimWeekday(date))return false;
    const week = typeof oct26WeekOrder === "function" ? oct26WeekOrder(date) : [];
    return REQUIRED.every(key => week.includes(key));
  }
  function available(date){
    return REQUIRED.filter(key => oct26SessionStatus(date,key).state === "pending");
  }
  function hasStrengthStarted(date){
    return [...(state.sessions||[]), ...(state.extraSessions||[])].some(s=>
      s.date===date && !!s.startedAt && (
        REQUIRED.includes(s.key) || REQUIRED.includes(s.weeklyTemplateKey) ||
        REQUIRED.includes(s.sourceKey)
      )
    );
  }
  function hasSwum(date){
    return (state.swim||[]).some(s=>s.date===date && s.completed);
  }
  const oldSwimDay=oct26SwimDay;
  oct26SwimDay = function(date){
    return oldSwimDay(date) && !marevoNoSwimOnDate(date);
  };
  const oldSwimAvailable=trainingSwimAvailable;
  trainingSwimAvailable = function(date){
    return !marevoNoSwimOnDate(date) && oldSwimAvailable(date);
  };
  const oldHomeWeekLabel=homeWeekLabel;
  homeWeekLabel = function(date){
    return marevoNoSwimOnDate(date) ? "Gimnasio opcional · hoy sin natación" : oldHomeWeekLabel(date);
  };
  const oldLanding=workoutLandingHTML;
  workoutLandingHTML=function(date){
    let html=oldLanding(date);
    if(!eligible(date))return html;
    const swapped=marevoNoSwimOnDate(date);
    const label=swapped
      ? '<span class="marevo-day-change-status">Hoy sin natación</span><button type="button" class="marevo-day-change-button" onclick="marevoRestoreSwimDay()">Restaurar natación</button>'
      : '<span class="marevo-day-change-status">¿Hoy no hay piscina?</span><button type="button" class="marevo-day-change-button" onclick="marevoHolidayPrompt()">Cambiar plan</button>';
    const summary=swapped?'<p class="marevo-day-change-note">Puedes recuperar un entrenamiento PPL pendiente esta semana.</p>':'';
    return html.replace('<h2>Registrar entrenamiento</h2>',
      '<h2>Registrar entrenamiento</h2><div class="marevo-day-change">'+label+'</div>'+summary);
  };
  window.marevoHolidayPrompt=function(){
    const date=currentDate();
    if(!eligible(date) || marevoNoSwimOnDate(date))return;
    if(hasSwum(date)){
      toast("Hoy ya tienes registrada una sesión de natación.");
      return;
    }
    const missing=available(date);
    document.getElementById("modalRoot").innerHTML =
      '<div class="modal"><div class="sheet" role="dialog" aria-modal="true" aria-label="Cambiar el plan de hoy">'+
      '<div class="row between"><div><div class="eyebrow">Excepción de un solo día</div><h2>¿Hoy no tienes natación?</h2></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div>'+
      '<p class="subtitle">Solo se modifica la fecha seleccionada. Tu horario habitual de natación no cambia y no se duplica ningún entrenamiento PPL.</p>'+
      '<div class="callout" style="margin-top:12px">'+
      (missing.length
        ? 'Sesiones de fuerza pendientes esta semana: '+missing.map(k=>k==="nov26_push"?"Push":k==="nov26_pull"?"Pull":"Legs").join(", ")+'.'
        : 'Esta semana ya has completado los tres entrenamientos PPL.')+
      '</div>'+
      '<div class="actions" style="margin-top:16px"><button class="btn secondary" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn" onclick="marevoSetNoSwimDay()">'+(missing.length?'Elegir un PPL':'Marcar sin natación')+'</button></div></div></div>';
  };
  window.marevoSetNoSwimDay=function(){
    const date=currentDate();
    if(!eligible(date) || hasSwum(date))return;
    if(!state.trainingDayOverrides || typeof state.trainingDayOverrides!=="object" ||
       Array.isArray(state.trainingDayOverrides))state.trainingDayOverrides={};
    state.trainingDayOverrides[date]="no_swim_gym";
    saveState(true);
    closeModal();
    renderAll();
    const choices=available(date);
    if(choices.length){
      openTrainingSelector(); // then choose PPL, then select solo/accompanied
    }else{
      toast("Hoy queda sin natación. Ya completaste los tres PPL.");
    }
  };
  window.marevoRestoreSwimDay=function(){
    const date=currentDate();
    if(!eligible(date)||!marevoNoSwimOnDate(date))return;
    if(hasStrengthStarted(date)){
      toast("No puedes restaurar la natación: ya iniciaste una sesión PPL hoy.");
      return;
    }
    delete state.trainingDayOverrides[date];
    saveState(true);
    closeModal();
    renderAll();
    toast("Natación restaurada para este día.");
  };
  renderAll();
})();
