(function(){
  'use strict';

  if(typeof state==='undefined'||typeof renderFood!=='function'||typeof foodRecord!=='function')return;

  const PLAN_START='2026-09-25';
  const PLAN_END='2026-10-30';
  const DAILY_DEFICIT=150;
  const PROTEIN_PER_KG=2.2;
  const MEALS=['Desayuno','Almuerzo','Merienda','Cena','Post-entreno'];

  const SHARES_WITH_POST={
    'Desayuno':{kcal:.23,protein:.22},
    'Almuerzo':{kcal:.31,protein:.30},
    'Merienda':{kcal:.14,protein:.18},
    'Cena':{kcal:.22,protein:.20},
    'Post-entreno':{kcal:.10,protein:.10}
  };
  const SHARES_NO_POST={
    'Desayuno':{kcal:.23,protein:.22},
    'Almuerzo':{kcal:.31,protein:.30},
    'Merienda':{kcal:.18,protein:.22},
    'Cena':{kcal:.28,protein:.26},
    'Post-entreno':{kcal:0,protein:0}
  };

  const OPTIONS={
    'Desayuno':[
      {id:'breakfast_oats',name:'Avena con leche, whey y plátano',fixed:[['milk',250],['banana',1]],vars:[['whey',10,55,5],['oats',30,120,5]]},
      {id:'breakfast_toast',name:'Tostadas con huevos y jamón cocido',fixed:[['egg',2],['tomato',100]],vars:[['ham_york_90',30,130,10],['whole_bread',1,5,1]]},
      {id:'breakfast_yogurt',name:'Yogur con avena, whey y fresas',fixed:[['greek_yogurt_0',250],['strawberries',150]],vars:[['whey',0,45,5],['oats',30,110,5]]}
    ],
    'Almuerzo':[
      {id:'lunch_chicken_rice',name:'Pollo con arroz y verduras',fixed:[['veg',200],['oil',5]],vars:[['chicken',130,280,10],['rice',45,150,5]]},
      {id:'lunch_chicken_pasta',name:'Pollo con pasta y verduras',fixed:[['veg',200],['oil',5]],vars:[['chicken',130,280,10],['pasta',45,150,5]]},
      {id:'lunch_chicken_potato',name:'Pollo con patatas y verduras',fixed:[['veg',200],['oil',5]],vars:[['chicken',130,280,10],['potato',250,700,25]]},
      {id:'lunch_turkey_rice',name:'Pavo con arroz y verduras',fixed:[['veg',200],['oil',5]],vars:[['turkey',130,290,10],['rice',45,150,5]]},
      {id:'lunch_beef_potato',name:'Ternera con patatas y verduras',fixed:[['veg',200],['oil',5]],vars:[['beef',130,260,10],['potato',250,700,25]]}
    ],
    'Merienda':[
      {id:'snack_toast',name:'Tostas con aguacate y jamón cocido',fixed:[['avocado',50]],vars:[['ham_york_90',40,150,10],['whole_bread',1,5,1]]},
      {id:'snack_yogurt',name:'Yogur, whey y plátano',fixed:[['greek_yogurt_0',250],['banana',1]],vars:[['whey',0,40,5],['oats',0,70,5]]},
      {id:'snack_shake',name:'Batido de proteína con leche y plátano',fixed:[['milk',250],['banana',1]],vars:[['whey',15,50,5],['rice_cakes',0,6,1]]}
    ],
    'Cena':[
      {id:'dinner_turkey_potato',name:'Pavo con patatas y verduras',fixed:[['veg',200],['oil',5]],vars:[['turkey',110,280,10],['potato',250,700,25]]},
      {id:'dinner_hake_potato',name:'Merluza con patatas y verduras',fixed:[['veg',200],['oil',5]],vars:[['hake',140,320,10],['potato',250,700,25]]},
      {id:'dinner_chicken_rice',name:'Pollo con arroz y verduras',fixed:[['veg',200],['oil',5]],vars:[['chicken',110,270,10],['rice',40,140,5]]},
      {id:'dinner_turkey_rice',name:'Pavo con arroz y verduras',fixed:[['veg',200],['oil',5]],vars:[['turkey',110,280,10],['rice',40,140,5]]},
      {id:'dinner_salmon_potato',name:'Salmón con patatas y verduras',fixed:[['veg',200]],vars:[['salmon',100,240,10],['potato',250,650,25]]}
    ],
    'Post-entreno':[
      {id:'post_shake',name:'Batido de proteína con leche',fixed:[['milk',250]],vars:[['whey',10,45,5],['rice_cakes',0,5,1]]},
      {id:'post_yogurt',name:'Yogur con whey y plátano',fixed:[['greek_yogurt_0',200]],vars:[['whey',0,35,5],['banana',0,1,1]]},
      {id:'post_milk_banana',name:'Leche con plátano y whey',fixed:[['milk',250],['banana',1]],vars:[['whey',0,35,5]]}
    ]
  };

  const WEEK_DEFAULTS={
    0:{'Desayuno':'breakfast_oats','Almuerzo':'lunch_chicken_potato','Merienda':'snack_yogurt','Cena':'dinner_turkey_potato','Post-entreno':'post_shake'},
    1:{'Desayuno':'breakfast_oats','Almuerzo':'lunch_chicken_rice','Merienda':'snack_toast','Cena':'dinner_turkey_potato','Post-entreno':'post_shake'},
    2:{'Desayuno':'breakfast_toast','Almuerzo':'lunch_chicken_rice','Merienda':'snack_yogurt','Cena':'dinner_hake_potato','Post-entreno':'post_shake'},
    3:{'Desayuno':'breakfast_oats','Almuerzo':'lunch_chicken_rice','Merienda':'snack_toast','Cena':'dinner_turkey_rice','Post-entreno':'post_shake'},
    4:{'Desayuno':'breakfast_toast','Almuerzo':'lunch_chicken_pasta','Merienda':'snack_yogurt','Cena':'dinner_hake_potato','Post-entreno':'post_shake'},
    5:{'Desayuno':'breakfast_oats','Almuerzo':'lunch_chicken_pasta','Merienda':'snack_toast','Cena':'dinner_chicken_rice','Post-entreno':'post_shake'},
    6:{'Desayuno':'breakfast_yogurt','Almuerzo':'lunch_turkey_rice','Merienda':'snack_shake','Cena':'dinner_salmon_potato','Post-entreno':'post_shake'}
  };

  function planState(){
    if(!state.nutritionPlan||typeof state.nutritionPlan!=='object')state.nutritionPlan={};
    if(!state.nutritionPlan.overrides||typeof state.nutritionPlan.overrides!=='object')state.nutritionPlan.overrides={};
    if(!state.nutritionPlan.postSkipped||typeof state.nutritionPlan.postSkipped!=='object')state.nutritionPlan.postSkipped={};
    if(!state.nutritionPlan.amountOverrides||typeof state.nutritionPlan.amountOverrides!=='object')state.nutritionPlan.amountOverrides={};
    return state.nutritionPlan;
  }
  function inPlan(date){return date>=PLAN_START&&date<=PLAN_END}
  function dayIndex(date){return dateObj(date).getDay()}
  function targetFor(date){
    const estimate=typeof window.marevoMetabolismEstimate==='function'?window.marevoMetabolismEstimate(date):null;
    const weight=estimate?.weight||(typeof window.marevoLatestBodyWeight==='function'?window.marevoLatestBodyWeight():null);
    const existing=state.settings?.nutritionGoals||{};
    const kcal=estimate?.complete?Math.round((estimate.tdee-DAILY_DEFICIT)/10)*10:(Number(existing.kcal)||null);
    const protein=weight?Math.round(weight*PROTEIN_PER_KG):(Number(existing.p)||null);
    return {complete:!!(kcal&&protein),kcal,protein,weight,tdee:estimate?.complete?estimate.tdee:null,deficit:DAILY_DEFICIT};
  }
  function syncGoals(date){
    const t=targetFor(date);if(!t.complete)return t;
    const goals=state.settings.nutritionGoals||(state.settings.nutritionGoals={kcal:null,p:null,c:null,f:null});
    if(Number(goals.kcal)!==t.kcal||Number(goals.p)!==t.protein){
      goals.kcal=t.kcal;goals.p=t.protein;saveState(true);
    }
    return t
  }
  function selectedOptionId(date,meal){
    return planState().overrides?.[date]?.[meal]||WEEK_DEFAULTS[dayIndex(date)]?.[meal]||OPTIONS[meal]?.[0]?.id
  }
  function selectedOption(date,meal){
    const id=selectedOptionId(date,meal);
    return OPTIONS[meal]?.find(option=>option.id===id)||OPTIONS[meal]?.[0]||null
  }
  function isPostSkipped(date){return !!planState().postSkipped?.[date]}
  function mealShare(date,meal){return (isPostSkipped(date)?SHARES_NO_POST:SHARES_WITH_POST)[meal]||{kcal:0,protein:0}}
  function foodInputNutrition(foodKey,inputAmount){
    const amount=toStoredFoodAmount(foodKey,inputAmount);
    return calcFood({foodKey,amount})
  }
  function sumNutrition(items){
    return items.reduce((sum,[key,inputAmount])=>{
      const n=foodInputNutrition(key,inputAmount);
      sum.kcal+=n.kcal;sum.p+=n.p;sum.c+=n.c;sum.f+=n.f;
      return sum
    },{kcal:0,p:0,c:0,f:0})
  }
  function range(min,max,step){
    const out=[];for(let n=min;n<=max+1e-9;n+=step)out.push(Number(n.toFixed(4)));return out
  }
  function fitOption(date,meal,option){
    const target=targetFor(date),share=mealShare(date,meal);
    if(!target.complete)return {items:[...(option.fixed||[])],nutrition:sumNutrition(option.fixed||[])};
    const targetKcal=target.kcal*share.kcal,targetProtein=target.protein*share.protein;
    const fixed=option.fixed||[],vars=option.vars||[];
    const choices=vars.map(v=>range(v[1],v[2],v[3]));
    let best=null;
    const test=values=>{
      const items=[...fixed,...vars.map((v,i)=>[v[0],values[i]])].filter(([,amount])=>amount>0);
      const n=sumNutrition(items);
      const kcalError=Math.abs(n.kcal-targetKcal)/Math.max(100,targetKcal);
      const pDiff=n.p-targetProtein;
      const proteinError=Math.abs(pDiff)/Math.max(15,targetProtein)*(pDiff<0?2.6:1.4);
      const score=kcalError*1.6+proteinError;
      if(!best||score<best.score)best={items,nutrition:n,score};
    };
    if(!vars.length)test([]);
    else if(vars.length===1)choices[0].forEach(a=>test([a]));
    else choices[0].forEach(a=>choices[1].forEach(b=>test([a,b])));
    return best||{items:[...fixed],nutrition:sumNutrition(fixed)}
  }
  function mealPlan(date,meal){
    const option=selectedOption(date,meal);
    if(!option)return null;
    if(meal==='Post-entreno'&&isPostSkipped(date))return {meal,option,skipped:true,items:[],nutrition:{kcal:0,p:0,c:0,f:0}};
    const fitted=fitOption(date,meal,option),custom=planState().amountOverrides?.[date]?.[meal];
    if(custom?.optionId===option.id&&custom.amounts){
      fitted.items=fitted.items.map(([key,amount])=>[key,Number.isFinite(+custom.amounts[key])?+custom.amounts[key]:amount]).filter(([,amount])=>amount>0);
      fitted.nutrition=sumNutrition(fitted.items)
    }
    return {meal,option,skipped:false,...fitted}
  }
  function dayPlan(date){return MEALS.map(meal=>mealPlan(date,meal)).filter(Boolean)}
  function dayPlanNutrition(date){
    return dayPlan(date).reduce((sum,row)=>{sum.kcal+=row.nutrition.kcal;sum.p+=row.nutrition.p;sum.c+=row.nutrition.c;sum.f+=row.nutrition.f;return sum},{kcal:0,p:0,c:0,f:0})
  }
  function amountText(key,amount){
    const meta=foodInputMeta(key),shown=Number.isInteger(amount)?amount:Number(amount.toFixed(1));
    return `${shown} ${meta.inputUnit}`
  }
  function itemSummary(items){
    return items.map(([key,amount])=>`${foodRecord(key)?.name||key} ${amountText(key,amount)}`).join(' · ')
  }
  function dateLabel(date){
    return dateObj(date).toLocaleDateString('es-ES',{weekday:'short',day:'numeric'}).replace('.','')
  }
  function planSlotId(date,meal){return `marevo-plan:${date}:${meal}`}
  function slotLogged(date,meal){const id=planSlotId(date,meal);return (state.foods||[]).some(item=>item.planSlotId===id)}
  function weeklyDates(date){
    const start=mondayOf(date);return Array.from({length:7},(_,i)=>addDaysISO(start,i))
  }

  function planMealRowHTML(date,row){
    if(row.meal==='Post-entreno'&&row.skipped){
      return `<div class="nutrition-plan-meal nutrition-plan-post skipped"><div class="nutrition-plan-meal-main"><span>Post-entreno · opcional</span><strong>No tomar hoy</strong><small>La merienda y la cena ya están reajustadas.</small></div><div class="nutrition-plan-meal-actions"><button type="button" class="btn ghost small" onclick="toggleNutritionPlanPost('${date}')">Reactivar</button></div></div>`
    }
    const logged=slotLogged(date,row.meal),post=row.meal==='Post-entreno';
    return `<div class="nutrition-plan-meal ${post?'nutrition-plan-post':''}">
      <div class="nutrition-plan-meal-main"><span>${esc(row.meal)}${post?' · opcional':''}</span><strong>${esc(row.option.name)}</strong><small>${esc(itemSummary(row.items))}</small><em>${Math.round(row.nutrition.kcal)} kcal · ${Math.round(row.nutrition.p)} g proteína</em></div>
      <div class="nutrition-plan-meal-actions"><button type="button" class="btn ${logged?'secondary':''} small" onclick="addNutritionPlanMeal('${date}','${row.meal}')">${logged?'Actualizar':'Añadir'}</button><button type="button" class="btn ghost small" onclick="openNutritionPlanMealOptions('${date}','${row.meal}')">Ajustar</button>${post?`<button type="button" class="btn ghost small" onclick="toggleNutritionPlanPost('${date}')">No tomar hoy</button>`:''}</div>
    </div>`
  }

  function nutritionPlanHTML(date=currentDate()){
    const target=syncGoals(date),days=weeklyDates(date);
    const active=inPlan(date);
    let targetHTML='';
    if(target.complete){
      targetHTML=`<div class="nutrition-plan-targets"><div><span>Objetivo</span><strong>${target.kcal} kcal</strong></div><div><span>Proteína</span><strong>${target.protein} g</strong><small>${target.weight?`${target.weight.toFixed(1)} kg × 2,2`:''}</small></div><div><span>Déficit</span><strong>−${target.deficit} kcal</strong></div></div>`
    }else{
      targetHTML=`<div class="nutrition-plan-missing"><span>Falta completar peso o estimación de mantenimiento.</span><button type="button" class="btn ghost small" onclick="goToMetabolismSettings()">Configurar</button></div>`
    }
    const weekHTML=`<div class="nutrition-plan-week">${days.map(d=>`<button type="button" class="${d===date?'active':''} ${inPlan(d)?'':'outside'}" onclick="selectNutritionPlanDate('${d}')"><span>${esc(dateLabel(d))}</span><b>${inPlan(d)?'•':'—'}</b></button>`).join('')}</div>`;
    const totals=active&&target.complete?dayPlanNutrition(date):null;
    const body=active&&target.complete
      ?`<div class="nutrition-plan-day-head"><div><span>Plan del día</span><strong>${esc(pretty(date))}</strong></div><div class="nutrition-plan-day-total">≈ ${Math.round(totals.kcal)} kcal · ${Math.round(totals.p)} g proteína</div></div><div class="nutrition-plan-meals">${dayPlan(date).map(row=>planMealRowHTML(date,row)).join('')}</div>`
      :active
        ?`<div class="nutrition-plan-empty">Completa el peso y el gasto estimado para calcular las cantidades.</div>`
        :`<div class="nutrition-plan-empty">Plan activo del 25 de septiembre al 30 de octubre.</div>`;
    return `<section class="nutrition-plan-card">
      <div class="nutrition-plan-head"><div><div class="eyebrow">Plan nutricional · hasta 30 oct</div><h2>Comidas de la semana</h2></div><button type="button" class="btn secondary small" onclick="openNutritionShoppingList()">Calcular compra</button></div>
      ${targetHTML}${weekHTML}${body}
    </section>`
  }

  window.selectNutritionPlanDate=function(date){
    document.getElementById('selectedDate').value=date;renderAll();showView('Food')
  };
  window.addNutritionPlanMeal=function(date,meal){
    if(!inPlan(date))return;
    const row=mealPlan(date,meal);if(!row||row.skipped)return;
    const slot=planSlotId(date,meal);
    state.foods=state.foods.filter(item=>item.planSlotId!==slot);
    const groupId=`plan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
    row.items.forEach(([foodKey,inputAmount],index)=>{
      const meta=foodInputMeta(foodKey),amount=toStoredFoodAmount(foodKey,inputAmount);
      state.foods.push({id:`${groupId}_${index}`,created:Date.now()+index,date,meal,foodKey,amount,displayAmount:inputAmount,displayUnit:meta.inputUnit,dishGroupId:groupId,dishName:row.option.name,planSlotId:slot});
    });
    saveState();renderAll();showView('Food');toast(`${row.option.name} añadido`)
  };
  window.openNutritionPlanMealOptions=function(date,meal){
    const options=OPTIONS[meal]||[],selected=selectedOptionId(date,meal),current=mealPlan(date,meal);
    const amounts=current&&!current.skipped?`<div class="nutrition-plan-amount-editor"><div class="eyebrow">Cantidades</div>${current.items.map(([key,amount],i)=>{const db=foodRecord(key),meta=foodInputMeta(key);return `<label><span><strong>${esc(db?.name||key)}</strong><small>${esc(meta.reference)}</small></span><span class="nutrition-plan-amount-control"><input id="planAmount_${i}" data-food-key="${esc(key)}" inputmode="decimal" value="${amount}"><b>${esc(meta.inputUnit)}</b></span></label>`}).join('')}<button type="button" class="btn secondary" onclick="saveNutritionPlanMealAmounts('${date}','${meal}')">Guardar cantidades</button></div>`:'';
    document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row between"><div><div class="eyebrow">${esc(meal)}</div><div class="hero-title">Ajustar comida</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>${amounts}<div class="nutrition-plan-option-title">Cambiar plato</div><div class="nutrition-plan-option-list">${options.map(option=>{const fitted=fitOption(date,meal,option);return `<button type="button" class="nutrition-plan-option ${option.id===selected?'active':''}" onclick="chooseNutritionPlanMeal('${date}','${meal}','${option.id}')"><span><strong>${esc(option.name)}</strong><small>${esc(itemSummary(fitted.items))}</small></span><em>${Math.round(fitted.nutrition.kcal)} kcal · ${Math.round(fitted.nutrition.p)} g proteína</em></button>`}).join('')}</div></div></div>`
  };
  window.saveNutritionPlanMealAmounts=function(date,meal){
    const option=selectedOption(date,meal),inputs=[...document.querySelectorAll('[id^="planAmount_"]')];
    if(!option||!inputs.length)return;
    const amounts={};
    for(const input of inputs){
      const n=Number(input.value);if(!Number.isFinite(n)||n<0){toast('Revisa las cantidades');return}
      amounts[input.dataset.foodKey]=n
    }
    const ps=planState();if(!ps.amountOverrides[date])ps.amountOverrides[date]={};
    ps.amountOverrides[date][meal]={optionId:option.id,amounts};
    saveState(true);closeModal();renderAll();showView('Food');toast('Cantidades actualizadas')
  };
  window.chooseNutritionPlanMeal=function(date,meal,optionId){
    const ps=planState();if(!ps.overrides[date])ps.overrides[date]={};
    ps.overrides[date][meal]=optionId;
    if(ps.amountOverrides?.[date])delete ps.amountOverrides[date][meal];
    saveState(true);closeModal();renderAll();showView('Food')
  };
  window.toggleNutritionPlanPost=function(date){
    const ps=planState(),next=!ps.postSkipped[date];
    if(next)ps.postSkipped[date]=true;else delete ps.postSkipped[date];
    if(next){
      const slot=planSlotId(date,'Post-entreno');
      state.foods=state.foods.filter(item=>item.planSlotId!==slot)
    }
    saveState(true);renderAll();showView('Food')
  };

  function shoppingRows(start,days){
    const map=new Map();
    for(let offset=0;offset<days;offset++){
      const date=addDaysISO(start,offset);if(!inPlan(date))break;
      dayPlan(date).forEach(row=>{
        if(row.skipped)return;
        row.items.forEach(([foodKey,inputAmount])=>{
          const meta=foodInputMeta(foodKey),db=foodRecord(foodKey);
          if(!db)return;
          const unit=meta.inputUnit,key=`${foodKey}|${unit}`;
          if(!map.has(key))map.set(key,{foodKey,name:db.name,cat:db.cat,unit,total:0,uses:0,dishes:new Set()});
          const entry=map.get(key);entry.total+=inputAmount;entry.uses+=1;entry.dishes.add(row.option.name)
        })
      })
    }
    return [...map.values()].sort((a,b)=>{
      const order={'Proteína':0,'Carbohidrato':1,'Verdura':2,'Fruta':3,'Lácteo':4,'Extra':5,'Suplemento':6};
      return (order[a.cat]??9)-(order[b.cat]??9)||a.name.localeCompare(b.name,'es')
    })
  }
  function shoppingAmount(row){
    if(row.unit==='g'&&row.total>=1000)return `${Number((row.total/1000).toFixed(2))} kg`;
    if(row.unit==='ml'&&row.total>=1000)return `${Number((row.total/1000).toFixed(2))} L`;
    const n=Number.isInteger(row.total)?row.total:Number(row.total.toFixed(1));
    return `${n} ${row.unit}`
  }
  function shoppingResultsHTML(start,days){
    const rows=shoppingRows(start,days);
    const actualDays=Math.max(0,Math.min(days,Math.floor((dateObj(PLAN_END)-dateObj(start))/86400000)+1));
    const end=actualDays>0?addDaysISO(start,actualDays-1):start;
    if(!rows.length)return '<div class="nutrition-plan-empty">No hay días del plan en ese intervalo.</div>';
    let lastCat='';
    return `<div class="shopping-range">${esc(start)} → ${esc(end)}</div><div class="shopping-list">${rows.map(row=>{
      const heading=row.cat!==lastCat?(lastCat=row.cat,`<div class="shopping-category">${esc(row.cat)}</div>`):'';
      const dishText=[...row.dishes].slice(0,2).join(' · ');
      return `${heading}<div class="shopping-row"><div><strong>${esc(row.name)}</strong><small>${row.uses} usos${dishText?` · ${esc(dishText)}`:''}</small></div><b>${esc(shoppingAmount(row))}</b></div>`
    }).join('')}</div>`
  }
  window.openNutritionShoppingList=function(){
    const start=inPlan(currentDate())?currentDate():PLAN_START;
    document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet shopping-sheet"><div class="row between"><div><div class="eyebrow">Meal prep</div><div class="hero-title">Compra para varios días</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="shopping-controls"><label>Desde<input id="shopStart" type="date" min="${PLAN_START}" max="${PLAN_END}" value="${start}"></label><label>Días<input id="shopDays" inputmode="numeric" type="number" min="1" max="36" value="7"></label></div><div class="quickchips"><button type="button" class="chip" onclick="document.getElementById('shopDays').value=3;refreshNutritionShoppingList()">3 días</button><button type="button" class="chip" onclick="document.getElementById('shopDays').value=5;refreshNutritionShoppingList()">5 días</button><button type="button" class="chip" onclick="document.getElementById('shopDays').value=7;refreshNutritionShoppingList()">7 días</button><button type="button" class="chip" onclick="document.getElementById('shopDays').value=14;refreshNutritionShoppingList()">14 días</button></div><div class="actions"><button type="button" class="btn" onclick="refreshNutritionShoppingList()">Calcular compra</button></div><div id="shoppingResults">${shoppingResultsHTML(start,7)}</div></div></div>`
  };
  window.refreshNutritionShoppingList=function(){
    const start=document.getElementById('shopStart')?.value||PLAN_START;
    const days=Math.max(1,Math.min(36,Math.round(Number(document.getElementById('shopDays')?.value)||7)));
    const root=document.getElementById('shoppingResults');if(root)root.innerHTML=shoppingResultsHTML(start,days)
  };

  window.nutritionPlanHTML=nutritionPlanHTML;
  window.nutritionPlanTarget=targetFor;

  renderAll();
})();
