/* Pointer events work with touch, pen and mouse. Only the handle blocks scrolling. */
(function () {
  const sessionFor = scope => scope === 'planned' ? findSession(currentDate(), planFor(currentDate()).key) : state.extraSessions.find(s => s.id === scope);
  const previous = activeSessionExerciseHTML;
  activeSessionExerciseHTML = function(e,i,scope,session) {
    const html = previous(e,i,scope,session);
    if(session.completed || session.exercises.length < 2) return html;
    return html.replace('<details ', '<details data-order-scope="'+esc(scope)+'" data-order-index="'+i+'" ')
      .replace(/<span class="exercise-order">[^<]*<\/span>/, '<button type="button" class="exercise-drag-handle" aria-label="Mover '+esc(e.name)+'" title="Arrastra para cambiar el orden. Con teclado: flechas arriba y abajo."><span aria-hidden="true">⠿</span></button>');
  };
  function announce(message) {
    let status=document.getElementById('exercise-order-status');
    if(!status){status=document.createElement('div');status.id='exercise-order-status';status.className='order-sr-only';status.setAttribute('role','status');document.body.append(status);}
    status.textContent=message;
  }
  window.moveSessionExercise=function(scope,from,to) {
    const session=sessionFor(scope);
    if(!session || session.completed || !Number.isInteger(from) || !Number.isInteger(to) || from<0 || to<0 || from>=session.exercises.length || to>=session.exercises.length || from===to)return false;
    saveScopeInputs(scope);
    const before=session.exercises.slice(), moved=before[from];
    const root=scope==='planned'?document.getElementById('workoutWorkspace'):document.querySelector('#modalRoot .sheet');
    const scrollTop=root?.scrollTop||0;
    const prefix='exercise:'+session.date+':'+(scope==='planned'?session.key:scope)+':';
    const expanded=new Map(before.map((e,i)=>[e,viewDisclosures.get(prefix+i)]));
    root?.querySelectorAll('details[data-order-index]').forEach(node=>expanded.set(before[+node.dataset.orderIndex],node.open));
    session.exercises.splice(from,1);session.exercises.splice(to,0,moved);
    if(state.restTimer?.scope===scope && Number.isInteger(state.restTimer.exerciseIndex))state.restTimer.exerciseIndex=session.exercises.indexOf(before[state.restTimer.exerciseIndex]);
    // Rendering remembers the outgoing DOM; render once, then restore disclosure state by exercise.
    saveState(true);refreshScope(scope);
    const nextRoot=scope==='planned'?document.getElementById('workoutWorkspace'):document.querySelector('#modalRoot .sheet');
    session.exercises.forEach((e,i)=>{const open=expanded.get(e);if(open!==undefined){viewDisclosures.set(prefix+i,open);const node=nextRoot?.querySelector('[data-order-index="'+i+'"]');if(node)node.open=open;}});
    if(nextRoot)nextRoot.scrollTop=scrollTop;
    announce(moved.name+' · posición '+(to+1)+' de '+session.exercises.length);
    return true;
  };
  let drag=null;
  const rows=()=>drag?Array.from(drag.root.querySelectorAll('[data-order-scope]')).filter(n=>n.dataset.orderScope===drag.scope):[];
  function mark() {
    const list=rows();list.forEach(n=>n.classList.remove('order-before','order-after'));
    let slot=list.length;
    for(let i=0;i<list.length;i++){const r=list[i].getBoundingClientRect();if(drag.y<r.top+r.height/2){slot=i;break;}}
    drag.to=Math.max(0,Math.min(list.length-1,slot-(slot>drag.from?1:0)));
    if(drag.to!==drag.from){if(slot<list.length)list[slot].classList.add('order-before');else list.at(-1)?.classList.add('order-after');}
  }
  function tick(){if(!drag)return;const r=drag.root.getBoundingClientRect();const top=Math.max(0,r.top),bottom=Math.min(innerHeight,r.bottom);const delta=drag.y<top+65?-12:drag.y>bottom-65?12:0;if(delta&&drag.moved)drag.root.scrollTop+=delta;mark();drag.frame=requestAnimationFrame(tick);}
  function finish(commit) {
    if(!drag)return;const d=drag;cancelAnimationFrame(d.frame);rows().forEach(n=>n.classList.remove('order-before','order-after'));d.card.classList.remove('is-reordering');drag=null;
    if(d.handle.hasPointerCapture?.(d.pointer))d.handle.releasePointerCapture(d.pointer);
    if(commit&&d.moved)moveSessionExercise(d.scope,d.from,d.to);
    else announce(commit?'Arrastra el asa hacia arriba o abajo para mover el ejercicio.':'Movimiento cancelado.');
  }
  document.addEventListener('pointerdown',event=>{
    const handle=event.target.closest?.('.exercise-drag-handle');if(!handle||event.button!==0||event.isPrimary===false||drag)return;
    const card=handle.closest('[data-order-scope]'),scope=card.dataset.orderScope,session=sessionFor(scope);if(!session||session.completed)return;
    event.preventDefault();saveScopeInputs(scope);document.activeElement?.blur();
    const root=card.closest('.sheet, .workout-workspace');if(!root)return;
    drag={handle,card,scope,root,from:+card.dataset.orderIndex,to:+card.dataset.orderIndex,y:event.clientY,startY:event.clientY,pointer:event.pointerId,moved:false};
    handle.setPointerCapture?.(event.pointerId);card.classList.add('is-reordering');announce('Moviendo '+session.exercises[drag.from].name);tick();
  });
  document.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.pointer)return;event.preventDefault();drag.y=event.clientY;if(Math.abs(drag.y-drag.startY)>6)drag.moved=true;mark();},{passive:false});
  document.addEventListener('pointerup',event=>{if(drag&&event.pointerId===drag.pointer)finish(true);});
  document.addEventListener('pointercancel',event=>{if(drag&&event.pointerId===drag.pointer)finish(false);});
  document.addEventListener('lostpointercapture',event=>{if(drag&&event.pointerId===drag.pointer)finish(false);});
  document.addEventListener('click',event=>{if(event.target.closest?.('.exercise-drag-handle')){event.preventDefault();event.stopPropagation();}},true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&drag){event.preventDefault();finish(false);return;}
    const handle=event.target.closest?.('.exercise-drag-handle');if(!handle||!['ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();const card=handle.closest('[data-order-scope]'),scope=card.dataset.orderScope,from=+card.dataset.orderIndex,to=from+(event.key==='ArrowUp'?-1:1);
    if(moveSessionExercise(scope,from,to)){const root=scope==='planned'?document.getElementById('workoutWorkspace'):document.querySelector('#modalRoot .sheet');root?.querySelector('[data-order-index="'+to+'"] .exercise-drag-handle')?.focus({preventScroll:true});}
  });
  window.addEventListener('blur',()=>finish(false));
})();
