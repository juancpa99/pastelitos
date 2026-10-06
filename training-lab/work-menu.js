(function(){
 'use strict';
 const dish=(id,name,kcal,p,c,f,estimated=false)=>({id,name,kcal,p,c,f,estimated,amount:1});
 const fish=()=>dish('fish','Pescado · preparación no indicada',250,30,10,10,true);
 const healthy=(name,kcal,p,c,f)=>dish('healthy',name,kcal,p,c,f,true);
 const MENUS={
  '2026-10-05':{first:[dish('rice','Arroz negro con alioli',389,16,49,16),dish('soup','Sopa de picadillo',285,17,16,17),dish('pasta','Lacitos con atún y tomate',474,24,62,15)],second:[dish('eggs','Huevos fritos con morcilla',400,18,1,36),fish(),dish('pork','Chuleta de cerdo a la diabla',432,17,1,40)],healthy:[healthy('Sopa de picadillo',285,17,16,17),healthy('Pescado hervido',180,34,0,5)]},
  '2026-10-06':{first:[dish('potatoes','Patatas a la marinera',608,43,44,29),dish('cauliflower','Coliflor a la gallega',158,12,5,10),dish('noodles','Tallarines a la napolitana',430,11,56,12)],second:[dish('burger','Hamburguesa con queso',343,23,20,19),fish(),dish('wings','Alitas de pollo fritas',488,35,1,27)],healthy:[healthy('Coliflor rehogada',150,5,10,10),healthy('Pescado a la plancha',220,34,0,9)]},
  '2026-10-07':{first:[dish('lentils','Lentejas caseras',491,24,50,23),dish('vegetables','Menestra a la navarra',177,65,12,15),dish('macaroni','Macarrones York queso',484,24,55,15)],second:[dish('lasagna','Lasaña gratinada',530,33,40,26),fish(),dish('pork','Escalopines de cerdo a la pimienta',390,29,21,20)],healthy:[healthy('Menestra a la navarra',170,6.5,15,9),healthy('Escalopines de cerdo a la plancha',270,36,0,14)]},
  '2026-10-08':{first:[dish('paella','Paella mixta',389,16,49,16),dish('pasta','Ensalada de pasta tropical',476,17,66,16),dish('broccoli','Brócoli con bacon',238,12,4,7)],second:[dish('chicken','Jamoncitos de pollo asado a la naranja',254,24,22,8),fish(),dish('omelette','Tortilla francesa de atún',444,27,3,36)],healthy:[healthy('Brócoli rehogado',150,6,10,10),healthy('Tortilla francesa de atún',444,27,3,36)]},
  '2026-10-09':{first:[dish('salad','Ensalada mixta',283,13,10,21),dish('cream','Crema del chef',296,10,53,5),dish('pasta','Coditos al ajillo y perejil',393,22,56,26)],second:[dish('eggs','Huevos fritos con jamón',400,20,48,20),fish(),dish('chicken','Filete de pollo a la plancha',233,31,0,11)],healthy:[healthy('Ensalada mixta',283,13,10,21),healthy('Filete de pollo a la plancha',233,31,0,11)]}
 };
 const EXTRAS={
  bread:{id:'bread',name:'Barra de pan',amount:80,kcal:265,p:8,c:53,f:2,enabled:true,estimated:true},
  fries:{id:'fries',name:'Patatas fritas',amount:100,kcal:315,p:3.4,c:41,f:15,enabled:true,estimated:true},
  yogurt:{id:'yogurt',name:'Yogur de fruta de plátano · normal',amount:125,kcal:90,p:3.2,c:14,f:2.5,enabled:true,estimated:true}
 };
 let draft=null;
 const clone=x=>structuredClone(x);
 const stored=date=>state.nutritionPlan?.workLunches?.[date];
 const logged=date=>(state.foods||[]).some(f=>f.planSlotId===`marevo-plan:${date}:Almuerzo`);
 const inconsistent=row=>!row.estimated&&Math.abs(row.p*4+row.c*4+row.f*9-row.kcal)>row.kcal*.2;
 const parts=d=>[d.first,d.second,...Object.values(d.extras).filter(e=>e.enabled)].filter(Boolean);
 const totals=d=>parts(d).reduce((n,row)=>{const factor=row.id in EXTRAS?row.amount/100:row.amount;for(const k of ['kcal','p','c','f'])n[k]+=row[k]*factor;return n;},{kcal:0,p:0,c:0,f:0});
 window.marevoWorkMenuForDate=date=>MENUS[date]||null;
 window.marevoWorkLunchOption=function(date){
  const saved=stored(date);if(!saved?.items?.length)return null;
  return {id:'lunch_work_menu',name:'Menú semanal trabajo',workMenu:true,fixed:saved.items.map(i=>[i.foodKey,i.amount]),vars:[],summary:[saved.first?.name,saved.second?.name].filter(Boolean).join(' + '),estimated:parts(saved).some(r=>r.estimated)};
 };
 window.workMenuLunchButtonHTML=function(date){
  return MENUS[date]?`<button type="button" class="btn secondary small" onclick="openWorkLunch('${date}')">Menú semanal trabajo · elegir platos</button>`:'';
 };
 window.openWorkLunch=function(date){
  if(!MENUS[date]){toast('No hay menú de trabajo cargado para este día');return;}
  draft=stored(date)?clone(stored(date)):{date,mode:'regular',first:null,second:null,extras:clone(EXTRAS)};
  renderEditor();
 };
 function nutrientFields(row,key){
  return `<details class="work-menu-values"><summary>Revisar calorías y macros${row.estimated?' · estimación':''}</summary><div class="formgrid">${[['kcal','kcal'],['p','Proteína (g)'],['c','Carbohidratos (g)'],['f','Grasas (g)']].map(([k,label])=>`<label class="field"><span>${label}</span><input aria-label="${esc(row.name+' · '+label)}" inputmode="decimal" value="${row[k]}" oninput="updateWorkLunchNumber('${key}','${k}',this.value)"></label>`).join('')}</div><small>${key in EXTRAS?'Valores por 100 g':'Valores por ración servida'}. ${row.estimated?'Estimación editable; no figura en el PDF.':'Valores del PDF; puedes corregirlos.'}</small></details>`;
 }
 function courseHTML(kind,label){
  const row=draft[kind],list=MENUS[draft.date][kind];
  return `<div class="work-menu-course"><label class="field"><strong>${label}</strong>${draft.mode==='healthy'?`<span>${esc(row.name)}</span>`:`<select aria-label="${label}" onchange="selectWorkLunchCourse('${kind}',this.value)"><option value="">Elige lo que almorzaste</option>${list.map(r=>`<option value="${r.id}" ${row?.id===r.id?'selected':''}>${esc(r.name)}${r.estimated?' · estimación':''}</option>`).join('')}</select>`}</label>${row?`<label class="field work-menu-portion"><span>Raciones servidas</span><input aria-label="Raciones de ${esc(row.name)}" inputmode="decimal" value="${row.amount}" oninput="updateWorkLunchNumber('${kind}','amount',this.value)"></label>${nutrientFields(row,kind)}`:''}</div>`;
 }
 function renderEditor(){
  const date=draft.date,scrollTop=document.querySelector('.work-menu-sheet')?.scrollTop||0;
  document.getElementById('modalRoot').innerHTML=`<div class="modal"><div class="sheet work-menu-sheet" role="dialog" aria-modal="true" aria-label="Menú semanal trabajo"><div class="row between"><div><div class="eyebrow">Falwick Innovation · 5–9 oct 2026</div><h2>Menú semanal trabajo</h2><p>${esc(pretty(date))} · Almuerzo</p></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="work-menu-modes"><button type="button" class="btn ${draft.mode==='regular'?'':'secondary'}" onclick="setWorkLunchMode('regular')">Elegir platos</button><button type="button" class="btn ${draft.mode==='healthy'?'':'secondary'}" onclick="setWorkLunchMode('healthy')">Menú saludable completo</button></div>${draft.mode==='healthy'?'<p class="callout">El menú saludable es indivisible: se seleccionan sus dos platos juntos. El PDF no da sus valores nutricionales; se muestran estimaciones editables.</p>':''}${courseHTML('first','Primer plato')}${courseHTML('second','Segundo plato')}<h3>Pan, guarnición y postre</h3><p class="subtitle">Cantidades iniciales estimadas. Ajusta el peso servido si lo conoces; no es peso en crudo.</p>${Object.entries(draft.extras).map(([key,r])=>`<div class="work-menu-extra"><label class="work-menu-extra-check"><input type="checkbox" ${r.enabled?'checked':''} onchange="toggleWorkLunchExtra('${key}',this.checked)"><strong>${esc(r.name)}</strong></label><label class="field work-menu-portion"><span>Peso servido (g)</span><input aria-label="Gramos de ${esc(r.name)}" inputmode="decimal" value="${r.amount}" oninput="updateWorkLunchNumber('${key}','amount',this.value)"></label>${nutrientFields(r,key)}</div>`).join('')}<div id="workMenuWarning" class="callout warn"></div><label id="workMenuReview" class="work-menu-review"><input id="workMenuReviewed" type="checkbox"> He revisado los datos incoherentes y quiero usar estos valores.</label><div id="workMenuTotal" class="work-menu-total" role="status" aria-live="polite"></div><p class="subtitle">Guardar la selección prepara el almuerzo, pero no lo marca como comido. Registrar sustituye únicamente el registro de este almuerzo del plan.</p><div class="actions">${logged(date)?'':`<button type="button" class="btn secondary" onclick="saveWorkLunch(false)">Guardar selección</button>`}<button type="button" class="btn" onclick="saveWorkLunch(true)">${logged(date)?'Actualizar almuerzo registrado':'Registrar almuerzo'}</button></div></div></div>`;
  updatePreview();
  document.querySelector('.work-menu-sheet').scrollTop=scrollTop;
 }
 function updatePreview(){
  const n=totals(draft),suspect=parts(draft).filter(inconsistent),estimated=parts(draft).some(r=>r.estimated);
  const total=document.getElementById('workMenuTotal');
  if(total)total.textContent=`${estimated?'≈ ':''}${Math.round(n.kcal)} kcal · ${Math.round(n.p)} g proteína · ${Math.round(n.c)} g carbohidratos · ${Math.round(n.f)} g grasas${!draft.first||!draft.second?' · faltan platos por elegir':''}`;
  const warning=document.getElementById('workMenuWarning'),review=document.getElementById('workMenuReview');
  if(warning){warning.hidden=!suspect.length;warning.textContent=`Datos del PDF incoherentes en: ${suspect.map(r=>r.name).join(', ')}. Las calorías no concuerdan con los macros. Revisa los valores antes de registrar.`;}
  if(review)review.hidden=!suspect.length;
 }
 window.selectWorkLunchCourse=function(kind,id){
  const row=MENUS[draft.date][kind]?.find(r=>r.id===id);draft[kind]=row?clone(row):null;renderEditor();
 };
 window.setWorkLunchMode=function(mode){
  if(!draft||!['regular','healthy'].includes(mode)||draft.mode===mode)return;
  draft.mode=mode;[draft.first,draft.second]=mode==='healthy'?clone(MENUS[draft.date].healthy):[null,null];renderEditor();
 };
 window.toggleWorkLunchExtra=function(key,enabled){draft.extras[key].enabled=enabled;updatePreview();};
 window.updateWorkLunchNumber=function(key,field,value){
  const row=draft[key]||draft.extras[key];if(!row)return;
  row[field]=parseLocaleNumber(value);updatePreview();
 };
 window.saveWorkLunch=function(register){
  if(!draft?.first||!draft?.second){toast('Elige el primer y el segundo plato');return;}
  const rows=parts(draft);
  if(rows.some(r=>!Number.isFinite(r.amount)||r.amount<=0||['kcal','p','c','f'].some(k=>!Number.isFinite(r[k])||r[k]<0))){toast('Revisa cantidades y valores nutricionales');return;}
  if(rows.some(inconsistent)&&!document.getElementById('workMenuReviewed')?.checked){toast('Revisa los datos incoherentes del PDF o confirma que quieres usarlos');return;}
  const date=draft.date,group=Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
  const items=rows.map((r,i)=>{
   const isExtra=r.id in EXTRAS,foodKey=`work_menu_${date}_${group}_${i}`;
   state.customFoods.push({key:foodKey,name:r.name,cat:'Extra',unit:isExtra?'g':'ud',ref:isExtra?'peso servido · estimación por 100 g':r.estimated?'ración servida · estimación editable':'ración servida · valores del menú de trabajo',perUnit:!isExtra,custom:true,transient:true,source:'work-menu',estimated:r.estimated,kcal:r.kcal,p:r.p,c:r.c,f:r.f});
   return {foodKey,amount:r.amount};
  });
  state.nutritionPlan??={};state.nutritionPlan.workLunches??={};
  const previousRows=typeof window.nutritionPlanDayRows==='function'?window.nutritionPlanDayRows(date):[];
  const beforeLunchRows=stored(date)?.beforeLunchRows||previousRows.filter(row=>['Desayuno','Media mañana'].includes(row.meal));
  state.nutritionPlan.workLunches[date]={...clone(draft),items,beforeLunchRows:clone(beforeLunchRows),source:'Falwick Innovation · menú del 5 al 9 de octubre de 2026'};
  // Selecting the menu is reversible and does not create any food log.
  chooseNutritionPlanMeal(date,'Almuerzo','lunch_work_menu');
  if(register)addNutritionPlanMeal(date,'Almuerzo');
  else toast('Selección guardada · almuerzo pendiente de registrar');
 };
})();
