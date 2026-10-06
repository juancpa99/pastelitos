(function(){
  'use strict';
  const replacements={
    med_ball_slam:{key:'cable_power_pullover',name:'Pullover rápido en polea alta · potencia',type:'mobility',group:'Potencia',dose:'3 × 5 · 2 min',note:'Carga ligera-moderada que permita acelerar: lleva la cuerda desde delante de la cabeza hasta los muslos con intención rápida, codos casi extendidos y abdomen firme. Frena antes del final y vuelve en 2 s; las placas no deben golpearse. Sin soltar la cuerda ni arquear la espalda. Para si cae la velocidad o molesta el hombro. Activación de potencia, no serie efectiva de hipertrofia.'},
    med_ball_chest_pass:{key:'power_incline_push_up',name:'Flexiones rápidas inclinadas · potencia',type:'mobility',group:'Potencia',dose:'3 × 5 · 2 min',note:'Manos apoyadas en una barra de Smith fijada o banco estable. Sube con intención rápida sin despegar las manos; frena antes de bloquear los codos y baja en 2 s. Sube la altura del apoyo para mantener velocidad y técnica. Para si cae la velocidad o molesta el hombro; no llegar al fallo. Activación de potencia, no serie efectiva de hipertrofia.'}
  };
  // Upgrade only unperformed drills, preserving every completed exercise and
  // recorded strength set in a session already in progress.
  function replaceExercises(plan,preserveDone){
    let changed=false;
    (plan?.exercises||[]).forEach(exercise=>{
      const replacement=replacements[exercise.key];
      if(!replacement)return;
      if(preserveDone&&(exercise.done||(exercise.recordedSets||[]).some(set=>set.completedAt||set.leftCompletedAt||set.rightCompletedAt||set.kg||set.reps)))return;
      Object.assign(exercise,structuredClone(replacement));changed=true;
    });
    return changed;
  }
  function replacePlanTree(tree){
    if(!tree||typeof tree!=='object')return false;
    let changed=replaceExercises(tree,false);
    Object.entries(tree).forEach(([key,value])=>{if(key!=='exercises'&&value&&typeof value==='object')changed=replacePlanTree(value)||changed});
    return changed;
  }
  for(let index=EXERCISE_LIBRARY.length-1;index>=0;index--)if(replacements[EXERCISE_LIBRARY[index].key])EXERCISE_LIBRARY.splice(index,1);
  Object.values(replacements).forEach(exercise=>{if(!EXERCISE_LIBRARY.some(existing=>existing.key===exercise.key))EXERCISE_LIBRARY.push(structuredClone(exercise))});
  replacePlanTree(DEFAULT_PLANS);
  let changed=replacePlanTree(state.customPlans);
  [...(state.sessions||[]),...(state.extraSessions||[])].forEach(session=>{
    if(session.completed||session.date<todayISO())return;
    changed=replaceExercises(session,true)||changed;
  });
  if(changed)saveState(true);
  renderAll();
})();
