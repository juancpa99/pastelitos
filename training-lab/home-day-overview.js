// Shared calendar labels. Screen composition is owned by app.js.
if(typeof SEP26_PLANS!=="undefined"&&SEP26_PLANS["0"]){
 SEP26_PLANS["0"].title="Movilidad completa + faja abdominal";
 SEP26_PLANS["0"].subtitle="Recuperación activa · sesión principal de movilidad del ciclo";
}
function homeComplementFor(date){return typeof seasonComplementTemplate==="function"?seasonComplementTemplate(date):null}
function homeComplementSession(date,template){return template?(state.extraSessions||[]).find(s=>s.date===date&&s.templateKey===template.key)||null:null}
function homeWeekLabel(date){
 if(typeof oct26FlexibleWeekLabel==="function"&&oct26FlexContext(date))return oct26FlexibleWeekLabel(date);
 const p=planFor(date),comp=homeComplementFor(date);
 if(comp&&p.type==="swim")return comp.title+" + natación";
 return comp&&p.type==="rest"?comp.title:p.title;
}
