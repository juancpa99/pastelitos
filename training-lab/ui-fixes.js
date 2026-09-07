(function(){
  'use strict';

  function controlFingerprint(control,exercise){
    if(!control||!exercise)return null;
    const onclick=control.getAttribute('onclick')||'';
    const text=(control.textContent||'').trim().replace(/\s+/g,' ');
    const candidates=[...exercise.querySelectorAll('button')].filter(button=>
      (button.getAttribute('onclick')||'')===onclick&&
      (button.textContent||'').trim().replace(/\s+/g,' ')===text
    );
    return {onclick,text,occurrence:Math.max(0,candidates.indexOf(control))};
  }

  function findMatchingControl(exercise,fingerprint){
    if(!exercise||!fingerprint)return null;
    const candidates=[...exercise.querySelectorAll('button')].filter(button=>
      (button.getAttribute('onclick')||'')===fingerprint.onclick&&
      (button.textContent||'').trim().replace(/\s+/g,' ')===fingerprint.text
    );
    return candidates[fingerprint.occurrence]||candidates[0]||null;
  }

  function captureWorkoutPosition(control){
    const workout=document.getElementById('viewWorkout');
    const modalSheet=control.closest('#modalRoot .sheet');
    const inWorkout=!!control.closest('#viewWorkout');
    if(!inWorkout&&!modalSheet)return null;
    if(inWorkout&&typeof activeView!=='undefined'&&activeView!=='Workout')return null;

    const root=modalSheet||workout;
    const exercise=control.closest('.exercise');
    const exercises=exercise?[...root.querySelectorAll('.exercise')]:[];
    const exerciseIndex=exercise?exercises.indexOf(exercise):-1;
    const controlTop=control.getBoundingClientRect().top;
    const exerciseTop=exercise?exercise.getBoundingClientRect().top:null;

    return {
      modal:!!modalSheet,
      pageX:window.scrollX,
      pageY:window.scrollY,
      sheetY:modalSheet?modalSheet.scrollTop:null,
      exerciseIndex,
      controlTop,
      exerciseTop,
      fingerprint:controlFingerprint(control,exercise)
    };
  }

  function restoreWorkoutPosition(snapshot){
    if(!snapshot)return;
    const workout=document.getElementById('viewWorkout');
    const sheet=snapshot.modal?document.querySelector('#modalRoot .sheet'):null;
    const root=sheet||workout;
    if(!root)return;

    const exercises=[...root.querySelectorAll('.exercise')];
    const exercise=snapshot.exerciseIndex>=0?exercises[snapshot.exerciseIndex]:null;
    const control=findMatchingControl(exercise,snapshot.fingerprint);

    if(snapshot.modal){
      if(!sheet)return;
      if(control){
        const delta=control.getBoundingClientRect().top-snapshot.controlTop;
        sheet.scrollTop+=delta;
      }else if(exercise&&snapshot.exerciseTop!==null){
        const delta=exercise.getBoundingClientRect().top-snapshot.exerciseTop;
        sheet.scrollTop+=delta;
      }else if(snapshot.sheetY!==null){
        sheet.scrollTop=snapshot.sheetY;
      }
      return;
    }

    if(typeof activeView!=='undefined'&&activeView!=='Workout')return;
    if(control){
      window.scrollBy(0,control.getBoundingClientRect().top-snapshot.controlTop);
    }else if(exercise&&snapshot.exerciseTop!==null){
      window.scrollBy(0,exercise.getBoundingClientRect().top-snapshot.exerciseTop);
    }else{
      window.scrollTo(snapshot.pageX,snapshot.pageY);
    }
  }

  // Any button used while recording a workout must keep the viewport stable,
  // even when its handler rebuilds the workout DOM. Navigation/date controls are outside these roots.
  document.addEventListener('click',event=>{
    const control=event.target.closest('button');
    if(!control)return;
    const snapshot=captureWorkoutPosition(control);
    if(!snapshot)return;
    requestAnimationFrame(()=>{
      restoreWorkoutPosition(snapshot);
      requestAnimationFrame(()=>restoreWorkoutPosition(snapshot));
    });
    setTimeout(()=>restoreWorkoutPosition(snapshot),40);
  },true);

  // Keep the explicit wrapper as a fallback for browsers that scroll during the synchronous add-set render.
  if(typeof window.addSetAttempt==='function'){
    const previousAddSetAttempt=window.addSetAttempt;
    window.addSetAttempt=function marevoAddSetAttemptWithoutJump(...args){
      const pageX=window.scrollX;
      const pageY=window.scrollY;
      const sheet=document.querySelector('#modalRoot .sheet');
      const sheetY=sheet?sheet.scrollTop:null;
      const result=previousAddSetAttempt.apply(this,args);
      requestAnimationFrame(()=>{
        window.scrollTo(pageX,pageY);
        if(sheetY!==null){
          const nextSheet=document.querySelector('#modalRoot .sheet');
          if(nextSheet)nextSheet.scrollTop=sheetY;
        }
      });
      return result;
    };
  }

  // Remove the last visible legacy name from the notification permission test.
  if(typeof window.showAppNotification==='function'){
    const previousShowAppNotification=window.showAppNotification;
    window.showAppNotification=function marevoNamedNotification(title,...args){
      return previousShowAppNotification.call(this,title==='Training Lab'?'MAREVO':title,...args);
    };
  }
})();
