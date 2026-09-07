(function(){
  'use strict';

  // One correction before paint, only within the same screen/dialog. Never
  // replay old pixel positions after the user has already moved elsewhere.
  function fingerprint(control,root){
    const action=control.getAttribute('onclick');
    const peers=[...root.querySelectorAll('button')].filter(b=>action
      ?b.getAttribute('onclick')===action:b.textContent.trim()===control.textContent.trim());
    return {action,text:control.textContent.trim(),index:peers.indexOf(control)};
  }
  function matching(root,key){
    return [...root.querySelectorAll('button')].filter(b=>key.action
      ?b.getAttribute('onclick')===key.action:b.textContent.trim()===key.text)[key.index];
  }
  function dialogKey(sheet){
    if(!sheet)return null;
    return sheet.dataset.extraScope || sheet.querySelector('.hero-title,h2,h3')?.textContent || '';
  }
  let opener=null;
  const extraPositions=new Map();
  document.addEventListener('click',event=>{
    const control=event.target.closest('button');
    if(!control)return;
    const sheet=control.closest('#modalRoot .sheet');
    const view=activeView,date=currentDate();
    const root=sheet||control.closest('#view'+view);
    if(!sheet)opener=control;
    if(!root)return;
    const key=fingerprint(control,root),dialog=dialogKey(sheet);
    const top=control.getBoundingClientRect().top;
    const y=sheet?sheet.scrollTop:window.scrollY;
    if(sheet?.dataset.extraScope)extraPositions.set(dialog,{key,top,y,date});
    queueMicrotask(()=>{
      if(activeView!==view||currentDate()!==date)return;
      const nextSheet=document.querySelector('#modalRoot .sheet');
      if(sheet ? !nextSheet||dialogKey(nextSheet)!==dialog : !!nextSheet)return;
      const nextRoot=nextSheet||document.getElementById('view'+view);
      const next=matching(nextRoot,key);
      // Unchanged nodes need no intervention (e.g. timer pause, native menus).
      if(next===control&&Math.abs(next.getBoundingClientRect().top-top)<1)return;
      const target=next ? (nextSheet?nextSheet.scrollTop:window.scrollY)+next.getBoundingClientRect().top-top : y;
      if(nextSheet)nextSheet.scrollTop=target;
      else window.scrollTo({top:target,left:window.scrollX,behavior:'instant'});
      if(next)next.focus({preventScroll:true});
    });
  },true);

  // Keep keyboard focus inside dialogs without summoning the iPhone keyboard.
  let previousSheet=null;
  let previousDialog=null;
  const modalRoot=document.getElementById('modalRoot');
  new MutationObserver(()=>{
    const sheet=modalRoot.querySelector('.sheet');
    if(sheet===previousSheet)return;
    const wasOpen=!!previousSheet;
    const oldDialog=previousDialog;
    previousSheet=sheet;
    previousDialog=dialogKey(sheet);
    if(sheet){
      sheet.setAttribute('tabindex','-1');
      const saved=sheet.dataset.extraScope&&extraPositions.get(previousDialog);
      if(saved&&saved.date===currentDate()&&oldDialog!==previousDialog){
        const target=matching(sheet,saved.key);
        sheet.scrollTop=target?sheet.scrollTop+target.getBoundingClientRect().top-saved.top:saved.y;
      }
      if(!sheet.contains(document.activeElement))sheet.focus({preventScroll:true});
    }else if(wasOpen&&opener?.isConnected){
      opener.focus({preventScroll:true});
    }
  }).observe(modalRoot,{childList:true,subtree:true});
  document.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const sheet=modalRoot.querySelector('.sheet');
    if(!sheet)return;
    const focusable=[...sheet.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],summary,[tabindex="0"]')]
      .filter(el=>el.getClientRects().length);
    const first=focusable[0],last=focusable.at(-1),active=document.activeElement;
    if(!first){event.preventDefault();sheet.focus({preventScroll:true});return;}
    if(event.shiftKey&&(active===first||!focusable.includes(active))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(active===last||!focusable.includes(active))){event.preventDefault();first.focus();}
  });

  // Remove the last visible legacy name from the notification permission test.
  if(typeof window.showAppNotification==='function'){
    const previousShowAppNotification=window.showAppNotification;
    window.showAppNotification=function marevoNamedNotification(title,...args){
      return previousShowAppNotification.call(this,title==='Training Lab'?'MAREVO':title,...args);
    };
  }
})();
