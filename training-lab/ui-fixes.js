(function(){
  'use strict';

  // Re-rendering an exercise after adding a set used to reset the viewport on iOS.
  // Preserve both the page and extra-session modal scroll positions.
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
        requestAnimationFrame(()=>{
          window.scrollTo(pageX,pageY);
          if(sheetY!==null){
            const nextSheet=document.querySelector('#modalRoot .sheet');
            if(nextSheet)nextSheet.scrollTop=sheetY;
          }
        });
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
