// Final integration for the September 2026 block.
// Activate season mode once when the requested block begins; the user can still change it manually afterwards.
if(todayISO()>=SEP26_PHASE.start&&todayISO()<=SEP26_PHASE.evalEnd&&!state.settings.sep26PhaseActivated){
 state.settings.mode="season";
 state.settings.sep26PhaseActivated=true;
 saveState(true);
}

// v6.4 added its own complement assumptions to the planned-volume radar.
// During this date-specific block, calculate planned exposure from the actual phase plan and phase complements instead.
const sep26PreviousWeeklyPlannedMuscleSets=weeklyPlannedMuscleSets;
weeklyPlannedMuscleSets=function(){
 if(!sep26Active(currentDate()))return sep26PreviousWeeklyPlannedMuscleSets();
 const out=Object.fromEntries(MUSCLE_AXES.map(([name])=>[name,0]));
 const ref=currentDate(),back=(weekday(ref)+6)%7,monday=addDaysISO(ref,-back);
 for(let i=0;i<7;i++){
  const date=addDaysISO(monday,i),plan=planFor(date),comp=seasonComplementTemplate(date);
  if(plan?.type==="gym"){
   (plan.exercises||[]).filter(e=>e.type==="strength").forEach(e=>{
    muscleGroupsForExercise(e).forEach(group=>{if(group in out)out[group]+=(+e.sets||0)});
   });
  }
  (comp?.exercises||[]).filter(e=>e.type==="strength").forEach(e=>{
   muscleGroupsForExercise(e).forEach(group=>{if(group in out)out[group]+=(+e.sets||0)});
  });
 }
 return out;
};
