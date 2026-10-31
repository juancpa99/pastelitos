// Calendar presentation from 31 October onward. Saved training history is never migrated.
(function () {
  const applies = date => date >= '2026-10-31';
  const swim = date => [1,3,5].includes(weekday(date));
  const weekend = date => [0,6].includes(weekday(date));
  const pending = date => oct26WeekOrder(date).filter(key => !oct26WeeklyCompleted(date,key));
  const basePlan = planFor;
  planFor = function(date) {
    if (!applies(date) || (!swim(date) && !weekend(date))) return basePlan(date);
    return {key:'marevo_recovery_'+weekday(date), type:'rest', title:swim(date)?'Natación':'Recuperación opcional', subtitle:swim(date)?'Hoy, solo natación.':'Puedes recuperar una sesión pendiente de esta semana.', exercises:[]};
  };
  const baseSlots = oct26SlotIndicesForDate;
  oct26SlotIndicesForDate = date => applies(date) && (swim(date)||weekend(date)) ? [] : baseSlots(date);
  const baseLabel = homeWeekLabel;
  homeWeekLabel = date => applies(date) && (swim(date)||weekend(date)) ? (swim(date)?'Natación':'Recuperación opcional') : baseLabel(date);
  const baseChoices = trainingChoices;
  trainingChoices = function() {
    const date=currentDate();
    if (!applies(date)) return baseChoices();
    if (swim(date)) return [];
    return baseChoices().filter(p=>!oct26WeeklyCompleted(date,p.key));
  };
  const baseStart = oct26StartWeeklySession;
  oct26StartWeeklySession = function(key) {
    if (applies(currentDate()) && swim(currentDate())) {toast('Hoy, solo natación. Recupera fuerza el martes, jueves o fin de semana.');return;}
    return baseStart(key);
  };
  const basePending = openPendingWorkouts;
  openPendingWorkouts = function() {
    if (applies(currentDate()) && swim(currentDate())) {toast('Las sesiones de fuerza se recuperan en días sin natación.');return;}
    return basePending();
  };
  const baseLanding = workoutLandingHTML;
  workoutLandingHTML = function(date) {
    if (!applies(date)) return baseLanding(date);
    let html=baseLanding(date);
    if (swim(date)) {
      html=html.replace(/<button type="button" class="training-mode-choice"[^]*?<\/button>/,'');
      // History stays editable, but new strength sessions are not offered on swimming days.
      html=html.replace(/<button[^>]*onclick="(?:openExtraSession|openTrainingSelector|openPendingWorkouts)\([^]*?<\/button>/g,'');
    } else if (weekend(date)) {
      const left=pending(date).length;
      html=html.replace(/<button type="button" class="training-mode-choice"[^]*?<\/button>/,
        left ? '<button type="button" class="training-mode-choice" onclick="openTrainingSelector()"><span class="training-mode-icon" aria-hidden="true">F</span><span class="training-mode-copy"><strong>Recuperar una sesión</strong><small>Opcional · '+left+' pendientes esta semana</small></span><span class="training-mode-chevron" aria-hidden="true">›</span></button>' : '<p class="callout good">Fuerza completada esta semana. Hoy puedes descansar.</p>');
    }
    if (swim(date) || weekend(date)) html=html.replace(/<button[^>]*onclick="openExtraSession\([^]*?<\/button>/g,'');
    return html;
  };
  const baseExtra = openExtraSession;
  openExtraSession = function() {
    if (applies(currentDate()) && swim(currentDate())) {toast('Hoy, solo natación.');return;}
    return baseExtra();
  };
  renderAll();
})();
