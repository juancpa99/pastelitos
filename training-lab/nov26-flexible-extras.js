// Flexible November PPL: choose who you train with; carry unfinished supplemental work across days.
// Existing sessions and the three shared PPL templates are preserved.
(function(){
  const START="2026-11-09", END="2026-11-29";
  const BASE_KEYS=["nov26_push","nov26_pull","nov26_legs"];
  const GOALS={back:2,calves:3,chest:2,core:3};
  const LABELS={back:"Espalda · jalón",calves:"Gemelos",chest:"Pecho · press",core:"Core adicional"};
  const validDate=date=>typeof date==="string"&&date>=START&&date<=END;
  const weekStart=date=>mondayOf(date);
  const inSameWeek=(session,date)=>!!session&&session.date>=weekStart(date)&&session.date<=addDaysISO(weekStart(date),6);

  function flexExercise(target,sets){
    if(target==="back")return {key:"lat_pulldown",name:"Jalón al pecho · segundo estímulo",type:"strength",sets,min:10,max:12,rir:"1–2",rest:"90–120 s",muscle:"Dorsal y espalda",note:"Codos hacia abajo; sin inclinar el torso excesivamente." ,marevoFlexTarget:target};
    if(target==="chest")return {key:"machine_chest_press",name:"Press de pecho en máquina · segundo estímulo",type:"strength",sets,min:8,max:12,rir:"1–2",rest:"2 min",muscle:"Pectoral",note:"Controla el descenso; sin necesitar llegar al fallo.",marevoFlexTarget:target};
    if(target==="calves")return {key:"seated_calf",name:"Gemelo sentado · complemento",type:"strength",sets,min:10,max:15,rir:"1–2",rest:"60–90 s",muscle:"Sóleo y gemelos",note:"Recorrido completo; pausa abajo sin rebotes.",marevoFlexTarget:target};
    return {key:"ab_wheel",name:"Rueda abdominal (o variante con fitball)",type:"strength",sets,min:6,max:12,rir:"2–3",rest:"60–90 s",muscle:"Abdomen y estabilización",note:"No arquees la zona lumbar; limita el recorrido o usa dead bug si no puedes mantener el control.",marevoFlexTarget:"core"};
  }

  function creditedSets(target,date){
    let count=0;
    [...(state.sessions||[]),...(state.extraSessions||[])].forEach(session=>{
      if(!inSameWeek(session,date))return;
      (session.exercises||[]).forEach(e=>{
        if(e.marevoFlexTarget!==target)return;
        count+=typeof effectiveCount==="function"?effectiveCount(e):0;
      });
    });
    return Math.min(GOALS[target],count);
  }
  function pending(target,date){return Math.max(0,GOALS[target]-creditedSets(target,date))}
  function pendingText(date,targets){
    const rows=targets.filter(t=>pending(t,date)>0).map(t=>LABELS[t]+": "+pending(t,date)+" series");
    return rows.length?rows.join(" · "):"Sin complementos pendientes";
  }
  function extrasFor(key,mode,date){
    if(mode!=="solo")return [];
    const targets=key==="nov26_push"?["back","calves"]:key==="nov26_pull"?["chest","core"]:key==="nov26_legs"?["calves","core"]:[];
    return targets.map(t=>flexExercise(t,pending(t,date))).filter(e=>e.sets>0);
  }
  function preparedExercises(key,mode,date){
    const p=oct26TemplateForKey(key,date);
    const base=structuredClone(p.exercises||[]);
    return base.concat(extrasFor(key,mode,date)).map(e=>normalizeSessionExercise(e));
  }
  function currentRecord(key,date){
    const a=(state.sessions||[]).find(s=>s.date===date&&s.key===key&&!s.completed);
    const b=(state.extraSessions||[]).filter(s=>s.date===date&&s.weeklyTemplateKey===key&&!s.completed).slice(-1)[0];
    return a||b;
  }
  function chooser(key){
    const date=currentDate();
    const info={nov26_push:"PUSH",nov26_pull:"PULL",nov26_legs:"LEGS"};
    const subtitle=key==="nov26_push"?"Espalda y gemelos":key==="nov26_pull"?"Pecho y abdomen":"Gemelos y abdomen pendientes";
    document.getElementById("modalRoot").innerHTML=
      '<div class="modal"><div class="sheet" role="dialog" aria-modal="true" aria-label="Cómo vas a entrenar">'+
      '<div class="row between"><div><div class="eyebrow">Antes de comenzar · '+info[key]+'</div><h2>¿Cómo entrenas hoy?</h2></div><button class="btn ghost small" onclick="closeModal()">Cerrar</button></div>'+
      '<p class="subtitle">Se conserva la rutina PPL original. Cuando entrenas solo, MAREVO añade las series complementarias que aún faltan esta semana.</p>'+
      '<div class="training-choices">'+
      '<button type="button" class="training-choice" onclick="marevoChooseCompany(\''+key+'\',\'acompaniado\')"><span><strong>Entreno acompañado</strong><small>Solo rutina original, sin complementos.</small></span><span aria-hidden="true">›</span></button>'+
      '<button type="button" class="training-choice" onclick="marevoChooseCompany(\''+key+'\',\'solo\')"><span><strong>Entreno solo</strong><small>Rutina original + '+subtitle+'.</small></span><span aria-hidden="true">›</span></button>'+
      '</div><div class="callout" style="margin-top:12px">Pendiente esta semana: '+pendingText(date,["back","chest","calves","core"])+'. Lo que no se complete podrá pasar al sábado o al domingo.</div>'+
      '</div></div>';
  }

  const previousStart=oct26StartWeeklySession;
  oct26StartWeeklySession=function(key){
    const date=currentDate();
    if(!validDate(date)||!BASE_KEYS.includes(key))return previousStart(key);
    const status=oct26SessionStatus(date,key);
    if(status.state!=="pending")return previousStart(key);
    chooser(key);
  };

  window.marevoChooseCompany=function(key,mode){
    const date=currentDate();
    if(!validDate(date)||!BASE_KEYS.includes(key)||!["solo","acompaniado"].includes(mode))return;
    const status=oct26SessionStatus(date,key);
    if(status.state!=="pending"){closeModal();previousStart(key);return}
    if(planFor(date).key===key){
      const p=planFor(date);
      const session=ensureDraftSession(date,p);
      if(!session.startedAt){
        session.exercises=preparedExercises(key,mode,date);
        session.marevoCompanionMode=mode;
        session.marevoFlexWeek=weekStart(date);
        saveState(true);
      }
    }
    closeModal();
    previousStart(key);
    const session=currentRecord(key,date);
    if(session&&!session.completed&&session.marevoCompanionMode==null){
      session.exercises=preparedExercises(key,mode,date);
      session.marevoCompanionMode=mode;
      session.marevoFlexWeek=weekStart(date);
      saveState(true);
      if(session.id)editExtraSession(session.id);
      else refreshPlannedWorkspace();
    }
    renderAll();
  };

  function movement(key,name,dose,note,group="Movilidad"){
    return {key,name,type:"mobility",group,dose,note,done:false};
  }
  function sundayBase(){
    return [
      movement("marevo_sunday_pogo","Saltos verticales suaves (opcional)","2 × 4–5","Solo si las piernas están recuperadas del sábado. Aterriza suave; si estás fatigado, omite.","Potencia"),
      movement("marevo_sunday_reverse_lunge","Zancadas inversas sin carga (opcional)","2 × 8/lado","Técnica y control, sin llegar al fallo; omite si hay fatiga tras piernas.","Coordinación"),
      {key:"hanging_knee_raise",name:"Elevación de rodillas colgado",type:"strength",sets:3,min:8,max:12,rir:"1–2",rest:"90 s",muscle:"Abdomen",note:"Inicia el gesto con retroversión pélvica, sin impulso del tronco."},
      {key:"pallof_press",name:"Pallof press en polea",type:"strength",sets:3,min:10,max:12,rir:"1–2",rest:"60–90 s",muscle:"Core antirrotación",note:"No permitas que el cable te rote; 10–12 repeticiones por lado."},
      movement("marevo_sunday_dead_bug","Dead bug con exhalación","2 × 8/lado","Exhala al extender; mantén costillas y pelvis controladas.","Control lumbopélvico"),
      movement("marevo_sunday_side_plank","Plancha lateral","2 × 25–40 s/lado","Pelvis alineada, sin girar el tronco.","Estabilidad"),
      movement("marevo_sunday_hip_flexor","Estiramiento de flexores de cadera en media rodilla","2 × 30–45 s/lado","Contracción suave del glúteo; evita compensar arqueando la zona lumbar.","Flexibilidad"),
      movement("marevo_sunday_hip_90_90","Transiciones 90/90 de cadera","2 × 8/lado","Movimiento cómodo y progresivo.","Movilidad"),
      movement("marevo_sunday_open_book","Rotación torácica en suelo (open book)","2 × 8/lado","Rodillas juntas; gira desde la zona dorsal.","Movilidad"),
      movement("marevo_sunday_wall_slide","Deslizamiento de brazos en pared (wall slides)","2 × 10","Mantén las costillas controladas, sin forzar hombros.","Movilidad")
    ];
  }
  function sundayPlan(date){
    const targets=["back","chest","calves","core"];
    const supplemental=targets.map(t=>flexExercise(t,pending(t,date))).filter(e=>e.sets>0);
    return sundayBase().concat(supplemental).map(normalizeSessionExercise);
  }
  function sundaySession(date){
    return (state.extraSessions||[]).find(s=>s.date===date&&s.marevoSunday===true);
  }
  window.marevoStartSunday=function(){
    const date=currentDate();
    if(!validDate(date)||weekday(date)!==0)return;
    let session=sundaySession(date);
    if(session){
      if(session.completed){toast("La sesión de domingo ya está guardada");return}
      closeModal();editExtraSession(session.id);return;
    }
    const id="marevo_sunday_"+Date.now().toString(36);
    session={id,date,title:"DOMINGO · Core, movilidad y complementos",marevoSunday:true,completed:false,startedAt:Date.now(),duration:null,rpe:null,activeKcal:null,exercises:sundayPlan(date)};
    state.extraSessions.push(session);saveState(true);closeModal();renderAll();editExtraSession(id);
  };
  const previousLanding=workoutLandingHTML;
  workoutLandingHTML=function(date){
    let html=previousLanding(date);
    if(!validDate(date)||weekday(date)!==0)return html;
    const session=sundaySession(date),label=session?(session.completed?"Domingo completado":"Continuar domingo"):"Iniciar domingo opcional";
    const details=session?"Tu sesión queda guardada y puede reanudarse.":"Core, control lumbopélvico, movilidad, flexibilidad y saltos opcionales.";
    html=html.replace("Fuerza completada esta semana. Hoy puedes descansar.","PPL completada. El domingo sigue siendo opcional.");
    return html+'<div class="card" style="margin-top:14px"><div class="eyebrow">4.º día · opcional</div><div class="hero-title" style="font-size:19px">Domingo · core y movilidad</div><p class="subtitle">'+details+'</p><p class="subtitle">Complementos pendientes: '+pendingText(date,["back","chest","calves","core"])+'</p><div class="actions"><button class="btn secondary" '+(session&&session.completed?'disabled':'onclick="marevoStartSunday()"')+'>'+label+'</button></div><small class="subtitle">Si estás cansado tras piernas, puedes omitir saltos y zancadas o descansar.</small></div>';
  };
  const previousAdvice=exerciseAdvice;
  exerciseAdvice=function(e,date=currentDate()){
    if(e&&e.marevoFlexTarget&&validDate(date))return "Complemento flexible: solo cuenta si completas las series con técnica y RIR adecuados. "+(e.note||"");
    return previousAdvice(e,date);
  };
  renderAll();
})();
