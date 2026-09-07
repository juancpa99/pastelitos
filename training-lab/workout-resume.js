(function(){
  'use strict';

  const STORAGE_KEY='marevo_workout_resume_v1';
  let currentExtraScope=null;
  let extraModalOpen=false;
  let restorePending=true;
  let captureTimer=null;
  let restoreGeneration=0;
  ['pointerdown','touchstart','wheel','keydown','change','click'].forEach(type=>
    document.addEventListener(type,()=>{restoreGeneration++;},{capture:true,passive:true}));

  function readSnapshot(){
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}
    catch(error){return null;}
  }

  function writeSnapshot(snapshot){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(snapshot));}catch(error){}
  }

  function clearSnapshot(){
    try{localStorage.removeItem(STORAGE_KEY);}catch(error){}
  }

  function workoutDate(){
    const input=document.getElementById('selectedDate');
    return input?.value||(typeof currentDate==='function'?currentDate():null);
  }

  function plannedSessionFor(date){
    try{
      const plan=planFor(date);
      if(!plan||plan.type!=='gym')return null;
      return state.sessions?.find(session=>session.date===date&&session.key===plan.key)||null;
    }catch(error){return null;}
  }

  function extraSessionFor(id){
    return state.extraSessions?.find(session=>session.id===id)||null;
  }

  function snapshotIsActive(snapshot){
    if(!snapshot?.date||!snapshot?.scope)return false;
    if(snapshot.scope==='planned'){
      const session=plannedSessionFor(snapshot.date);
      return !!(session?.startedAt&&!session.completed);
    }
    const session=extraSessionFor(snapshot.scope);
    return !!(session?.startedAt&&!session.completed);
  }

  function detectActiveScope(){
    if(currentExtraScope){
      const extra=extraSessionFor(currentExtraScope);
      if(extra?.startedAt&&!extra.completed)return currentExtraScope;
    }

    const modalGym=document.querySelector('#modalRoot [data-gym]')?.getAttribute('data-gym');
    if(modalGym&&modalGym!=='planned'){
      const extra=extraSessionFor(modalGym);
      if(extra?.startedAt&&!extra.completed){
        currentExtraScope=modalGym;
        return modalGym;
      }
    }

    const date=workoutDate();
    const planned=plannedSessionFor(date);
    if(planned?.startedAt&&!planned.completed)return 'planned';

    const extra=(state.extraSessions||[]).find(session=>session.date===date&&session.startedAt&&!session.completed);
    if(extra){currentExtraScope=extra.id;return extra.id;}
    return null;
  }

  function captureAnchor(root,isModal){
    if(!root)return null;
    const viewportTop=isModal?root.getBoundingClientRect().top:0;
    const exercises=[...root.querySelectorAll('.exercise')];
    let best=null;

    exercises.forEach((exercise,exerciseIndex)=>{
      const attempts=[...exercise.querySelectorAll('.attempt-block')];
      const candidates=attempts.length?attempts:[exercise];
      candidates.forEach((node,index)=>{
        const rect=node.getBoundingClientRect();
        const relativeTop=rect.top-viewportTop;
        const score=Math.abs(relativeTop-110);
        if(!best||score<best.score){
          best={
            score,
            exerciseIndex,
            attemptIndex:attempts.length?index:-1,
            relativeTop
          };
        }
      });
    });

    if(!best)return null;
    delete best.score;
    return best;
  }

  function findAnchor(root,anchor){
    if(!root||!anchor)return null;
    const exercise=root.querySelectorAll('.exercise')[anchor.exerciseIndex];
    if(!exercise)return null;
    if(anchor.attemptIndex>=0)return exercise.querySelectorAll('.attempt-block')[anchor.attemptIndex]||exercise;
    return exercise;
  }

  function captureWorkoutPosition(){
    if(typeof activeView==='undefined'||activeView!=='Workout')return;
    const date=workoutDate();
    const scope=detectActiveScope();
    if(!date||!scope)return;

    const isExtra=scope!=='planned';
    const sheet=isExtra&&extraModalOpen?document.querySelector('#modalRoot .sheet'):null;
    const root=sheet||document.getElementById('viewWorkout');
    writeSnapshot({
      version:1,
      date,
      scope,
      modalOpen:!!sheet,
      pageX:window.scrollX,
      pageY:window.scrollY,
      sheetY:sheet?sheet.scrollTop:null,
      anchor:captureAnchor(root,!!sheet),
      savedAt:Date.now()
    });
  }

  function scheduleCapture(){
    clearTimeout(captureTimer);
    captureTimer=setTimeout(captureWorkoutPosition,120);
  }

  function restorePosition(snapshot){
    const sheet=snapshot.modalOpen?document.querySelector('#modalRoot .sheet'):null;
    const root=sheet||document.getElementById('viewWorkout');
    if(!root)return;

    const anchorNode=findAnchor(root,snapshot.anchor);
    if(sheet){
      if(anchorNode&&snapshot.anchor){
        const current=anchorNode.getBoundingClientRect().top-sheet.getBoundingClientRect().top;
        sheet.scrollTop+=current-snapshot.anchor.relativeTop;
      }else if(Number.isFinite(snapshot.sheetY)){
        sheet.scrollTop=snapshot.sheetY;
      }
      return;
    }

    if(anchorNode&&snapshot.anchor){
      window.scrollBy(0,anchorNode.getBoundingClientRect().top-snapshot.anchor.relativeTop);
    }else{
      window.scrollTo(Number(snapshot.pageX)||0,Number(snapshot.pageY)||0);
    }
  }

  function restoreRepeatedly(snapshot){
    const generation=restoreGeneration;
    requestAnimationFrame(()=>{
      if(generation===restoreGeneration&&activeView==='Workout'&&workoutDate()===snapshot.date&&snapshotIsActive(snapshot))restorePosition(snapshot);
    });
  }

  if(typeof window.editExtraSession==='function'){
    const previousEditExtraSession=window.editExtraSession;
    window.editExtraSession=function marevoEditExtraSessionWithResume(id,...args){
      currentExtraScope=id;
      extraModalOpen=true;
      const result=previousEditExtraSession.call(this,id,...args);
      scheduleCapture();
      return result;
    };
  }

  if(typeof window.closeModal==='function'){
    const previousCloseModal=window.closeModal;
    window.closeModal=function marevoCloseModalWithResume(...args){
      const result=previousCloseModal.apply(this,args);
      extraModalOpen=false;
      scheduleCapture();
      return result;
    };
  }

  if(typeof window.showView==='function'){
    const previousShowView=window.showView;
    window.showView=function marevoShowViewWithWorkoutResume(view,...args){
      const generation=++restoreGeneration;
      if(typeof activeView!=='undefined'&&activeView==='Workout'&&view!=='Workout'){
        captureWorkoutPosition();
        restorePending=true;
      }

      let snapshot=null;
      if(view==='Workout'&&restorePending){
        snapshot=readSnapshot();
        if(snapshot&&!snapshotIsActive(snapshot)){
          clearSnapshot();
          snapshot=null;
        }
        if(snapshot){
          const input=document.getElementById('selectedDate');
          if(input)input.value=snapshot.date;
        }
      }

      const result=previousShowView.call(this,view,...args);

      if(view==='Workout'&&snapshot){
        restorePending=false;
        if(snapshot.scope!=='planned')currentExtraScope=snapshot.scope;
        if(snapshot.scope!=='planned'&&snapshot.modalOpen&&typeof window.editExtraSession==='function'){
          setTimeout(()=>{
            const extra=extraSessionFor(snapshot.scope);
            if(generation===restoreGeneration&&activeView==='Workout'&&workoutDate()===snapshot.date&&extra?.startedAt&&!extra.completed){
              window.editExtraSession(snapshot.scope);
              restoreRepeatedly(snapshot);
            }
          },0);
        }else{
          extraModalOpen=false;
          restoreRepeatedly(snapshot);
        }
      }
      return result;
    };
  }

  document.addEventListener('scroll',scheduleCapture,true);
  window.addEventListener('scroll',scheduleCapture,{passive:true});
  document.addEventListener('input',scheduleCapture,true);
  document.addEventListener('click',()=>setTimeout(scheduleCapture,0),true);

  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden'){
      try{
        const scope=detectActiveScope();
        if(scope&&typeof saveScopeInputs==='function')saveScopeInputs(scope);
      }catch(error){}
      captureWorkoutPosition();
      restorePending=true;
    }
  },{passive:true});

  window.addEventListener('pagehide',()=>{
    try{
      const scope=detectActiveScope();
      if(scope&&typeof saveScopeInputs==='function')saveScopeInputs(scope);
    }catch(error){}
    captureWorkoutPosition();
  },{passive:true});

  const existing=readSnapshot();
  if(existing&&!snapshotIsActive(existing))clearSnapshot();
})();
