(function(){
  'use strict';

  if(typeof state==='undefined'||typeof renderFood!=='function'||typeof foodRecord!=='function')return;

  const PLAN_START='2026-10-05';
  const PLAN_END='2026-11-30';
  const PROTEIN_PER_KG=2.2;
  const MEALS=['Desayuno','Media mañana','Almuerzo','Merienda','Cena','Post-entreno'];
  const OPTIONAL_MEALS=['Media mañana','Merienda','Post-entreno'];
  const TUPPER_MEALS=['Almuerzo','Cena'];
  const FLEXIBLE_MEALS=['Desayuno','Media mañana','Merienda','Cena','Post-entreno'];
  const REDISTRIBUTABLE_MEALS=['Desayuno','Media mañana','Merienda','Cena','Post-entreno'];
  const TUPPER_PORTIONS={
    chicken:180,turkey:180,beef:180,hake:180,whitefish:180,salmon:180,pork_loin:180,prawns:180,tofu:180,tempeh:180,
    rice:75,pasta:75,potato:350,quinoa:75,couscous:75,lentils:75,chickpeas:75,beans:75,
    veg:200,oil:5
  };
  const NUTRITION_MODES={
    cut:{label:'Definición',defaultOffset:-200,min:-300,max:-100,step:50},
    maintain:{label:'Mantener',defaultOffset:0,min:-100,max:100,step:50},
    bulk:{label:'Volumen',defaultOffset:300,min:200,max:500,step:50}
  };

  const BASE_SHARES={
    'Desayuno':{kcal:.23,protein:.22},
    'Media mañana':{kcal:0,protein:0},
    'Almuerzo':{kcal:.265,protein:.25},
    'Merienda':{kcal:.14,protein:.18},
    'Cena':{kcal:.265,protein:.25},
    'Post-entreno':{kcal:.10,protein:.10}
  };
  const MEDIA_MORNING_SHARE={kcal:.08,protein:.08};
  const COOKING_YIELDS={
    rice:{factor:3,label:'cocido'},
    pasta:{factor:2.4,label:'cocida'},
    quinoa:{factor:3,label:'cocida'},
    couscous:{factor:2.5,label:'cocido'},
    lentils:{factor:2.5,label:'cocidas'},
    chickpeas:{factor:2.4,label:'cocidos'},
    beans:{factor:2.4,label:'cocidas'}
  };

  const OPTIONS={
    'Desayuno':[
      {id:'breakfast_oats',name:'Avena con leche, whey y plátano',fixed:[['milk',250],['banana',1]],vars:[['whey',10,55,5],['oats',30,120,5]]},
      {id:'breakfast_eggs_bread',name:'3 huevos + 1 rebanada de pan integral',fixed:[['egg',3],['whole_bread',1]],vars:[]},
      {id:'breakfast_eggs_lentil_toast',name:'3 huevos + 4 tostadas de lentejas',fixed:[['egg',3],['lentil_crisp_toast',4]],vars:[]},
      {id:'breakfast_ham_bread',name:'6 lonchas de jamón York 90% + 1 rebanada de pan integral',fixed:[['ham_york_90',90],['whole_bread',1]],vars:[]},
      {id:'breakfast_ham_lentil_toast',name:'6 lonchas de jamón York 90% + 4 tostadas de lentejas',fixed:[['ham_york_90',90],['lentil_crisp_toast',4]],vars:[]},
      {id:'breakfast_yogurt',name:'Yogur con avena, whey y fresas',fixed:[['greek_yogurt_0',250],['strawberries',150]],vars:[['whey',0,45,5],['oats',30,110,5]]}
    ],
    'Media mañana':[
      {id:'mid_yogurt_banana',name:'Yogur griego con plátano',fixed:[['greek_yogurt_0',200]],vars:[['banana',0,1,1],['whey',0,25,5]]},
      {id:'mid_toast_turkey',name:'Tostas con pavo',fixed:[],vars:[['ham_york_90',40,100,10],['whole_bread',1,3,1]]},
      {id:'mid_ricecakes_turkey',name:'Tortitas de arroz con pavo',fixed:[],vars:[['ham_york_90',40,100,10],['rice_cakes',2,5,1]]},
      {id:'mid_shake',name:'Batido de proteína con leche',fixed:[['milk',250]],vars:[['whey',15,35,5]]}
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
    0:{'Desayuno':'breakfast_ham_bread','Almuerzo':'lunch_chicken_potato','Merienda':'snack_yogurt','Cena':'dinner_turkey_potato','Post-entreno':'post_shake'},
    1:{'Desayuno':'breakfast_eggs_lentil_toast','Almuerzo':'lunch_chicken_rice','Merienda':'snack_toast','Cena':'dinner_turkey_potato','Post-entreno':'post_shake'},
    2:{'Desayuno':'breakfast_oats','Almuerzo':'lunch_chicken_rice','Merienda':'snack_yogurt','Cena':'dinner_hake_potato','Post-entreno':'post_shake'},
    3:{'Desayuno':'breakfast_ham_lentil_toast','Almuerzo':'lunch_chicken_rice','Merienda':'snack_toast','Cena':'dinner_turkey_rice','Post-entreno':'post_shake'},
    4:{'Desayuno':'breakfast_oats','Almuerzo':'lunch_chicken_pasta','Merienda':'snack_yogurt','Cena':'dinner_hake_potato','Post-entreno':'post_shake'},
    5:{'Desayuno':'breakfast_eggs_bread','Almuerzo':'lunch_chicken_pasta','Merienda':'snack_toast','Cena':'dinner_chicken_rice','Post-entreno':'post_shake'},
    6:{'Desayuno':'breakfast_yogurt','Almuerzo':'lunch_turkey_rice','Merienda':'snack_shake','Cena':'dinner_salmon_potato','Post-entreno':'post_shake'}
  };

  function planState(){
    if(!state.nutritionPlan||typeof state.nutritionPlan!=='object')state.nutritionPlan={};
    if(!state.nutritionPlan.overrides||typeof state.nutritionPlan.overrides!=='object')state.nutritionPlan.overrides={};
    if(!state.nutritionPlan.postSkipped||typeof state.nutritionPlan.postSkipped!=='object')state.nutritionPlan.postSkipped={};
    if(!state.nutritionPlan.skippedMeals||typeof state.nutritionPlan.skippedMeals!=='object')state.nutritionPlan.skippedMeals={};
    if(!state.nutritionPlan.optionalMeals||typeof state.nutritionPlan.optionalMeals!=='object')state.nutritionPlan.optionalMeals={};
    if(!state.nutritionPlan.amountOverrides||typeof state.nutritionPlan.amountOverrides!=='object')state.nutritionPlan.amountOverrides={};
    if(!state.nutritionPlan.tupperPortions||typeof state.nutritionPlan.tupperPortions!=='object')state.nutritionPlan.tupperPortions={};
    if(!state.nutritionPlan.preferredFoods||typeof state.nutritionPlan.preferredFoods!=='object')state.nutritionPlan.preferredFoods={};
    if(!state.nutritionPlan.postTupperExtras||typeof state.nutritionPlan.postTupperExtras!=='object')state.nutritionPlan.postTupperExtras={};
    if(state.nutritionPlan.movedTuppers&&typeof state.nutritionPlan.movedTuppers==='object'){
      state.nutritionPlan.movedTuppers={};
    }
    if(!state.nutritionPlan.tupperStandardV1){
      Object.values(state.nutritionPlan.amountOverrides).forEach(day=>{
        if(day&&typeof day==='object'){delete day.Almuerzo;delete day.Cena}
      });
      state.nutritionPlan.tupperStandardV1=true
    }
    if(!state.nutritionPlan.mealStatusMigrated){
      Object.keys(state.nutritionPlan.postSkipped).forEach(date=>{
        if(state.nutritionPlan.postSkipped[date]){
          if(!state.nutritionPlan.skippedMeals[date])state.nutritionPlan.skippedMeals[date]={};
          state.nutritionPlan.skippedMeals[date]['Post-entreno']=true
        }
      });
      state.nutritionPlan.postSkipped={};
      state.nutritionPlan.mealStatusMigrated=true
    }
    if(!NUTRITION_MODES[state.nutritionPlan.mode])state.nutritionPlan.mode='cut';
    if(state.nutritionPlan.mode==='cut'&&!state.nutritionPlan.cutRangeV2){
      if(Number(state.nutritionPlan.baseOffset)===-150)state.nutritionPlan.baseOffset=-200;
      state.nutritionPlan.cutRangeV2=true
    }
    const cfg=NUTRITION_MODES[state.nutritionPlan.mode];
    const stored=Number(state.nutritionPlan.baseOffset);
    state.nutritionPlan.baseOffset=Number.isFinite(stored)?Math.min(cfg.max,Math.max(cfg.min,stored)):cfg.defaultOffset;
    return state.nutritionPlan;
  }
  function inPlan(date){return date>=PLAN_START&&date<=PLAN_END}
  function dayIndex(date){return dateObj(date).getDay()}
  function clamp(value,min,max){return Math.min(max,Math.max(min,value))}
  function recentWeightTrend(date){
    const end=date>todayISO()?todayISO():date,start=addDaysISO(end,-21);
    const rows=[...(state.body||[])].filter(row=>row.date>=start&&row.date<=end&&Number.isFinite(+row.weight)&&+row.weight>0).sort((a,b)=>a.date.localeCompare(b.date));
    if(rows.length<2)return null;
    const first=rows[0],last=rows[rows.length-1],days=Math.round((dateObj(last.date)-dateObj(first.date))/86400000);
    if(days<7)return null;
    return (+last.weight-+first.weight)*7/days
  }
  function recentTrainingAdherence(date){
    const today=todayISO(),cutoff=date<today?date:addDaysISO(today,-1);
    if(cutoff<PLAN_START)return {ratio:null,planned:0,completed:0,extra:0};
    const start=addDaysISO(cutoff,-13);
    let planned=[];
    if(typeof oct26PlannedItems==='function'&&cutoff<=PLAN_END){
      planned=oct26PlannedItems(cutoff).filter(item=>item.date>=start&&item.date<=cutoff);
    }
    if(!planned.length&&typeof dayActivities==='function'){
      for(let d=start;d<=cutoff;d=addDaysISO(d,1)){
        dayActivities(d).filter(a=>a.kind==='Fuerza'||a.kind==='Natación').forEach((a,index)=>{
          planned.push({date:d,type:a.kind==='Natación'?'swim':'gym',done:!!a.done,key:`${d}_${index}`})
        })
      }
    }
    if(!planned.length)return {ratio:null,planned:0,completed:0,extra:0};
    let score=0;
    planned.forEach(item=>{
      if(item.done===true){score+=1;return}
      if(item.type==='gym'){
        const record=(state.sessions||[]).find(s=>s.date===item.date&&s.completed);
        if(record)score+=record.incomplete?0.75:1;
      }else if(item.type==='swim'){
        if((state.swim||[]).some(s=>s.date===item.date&&s.completed))score+=1;
      }
    });
    const extra=[...(state.extraSessions||[]),...(state.cardio||[])].filter(s=>s.completed&&s.date>=start&&s.date<=cutoff).length;
    return {ratio:score/planned.length,planned:planned.length,completed:score,extra}
  }
  function activityAdjustment(date){
    const a=recentTrainingAdherence(date);
    if(a.ratio==null)return {kcal:0,...a};
    let kcal=a.ratio>=.9?0:a.ratio>=.75?-25:-50;
    kcal+=Math.min(50,a.extra*25);
    return {kcal:clamp(kcal,-50,50),...a}
  }
  function weightAdjustment(mode,date){
    const weekly=recentWeightTrend(date);
    if(weekly==null)return {kcal:0,weekly:null};
    let kcal=0;
    if(mode==='cut'){
      if(weekly>.1)kcal=-50;
      else if(weekly<-.35)kcal=50;
    }else if(mode==='maintain'){
      if(weekly>.2)kcal=-50;
      else if(weekly<-.2)kcal=50;
    }else{
      if(weekly<0)kcal=50;
      else if(weekly>.35)kcal=-50;
    }
    return {kcal,weekly}
  }
  function targetFor(date){
    const estimate=typeof window.marevoMetabolismEstimate==='function'?window.marevoMetabolismEstimate(date):null;
    const weight=estimate?.weight||(typeof window.marevoLatestBodyWeight==='function'?window.marevoLatestBodyWeight():null);
    const existing=state.settings?.nutritionGoals||{},ps=planState(),cfg=NUTRITION_MODES[ps.mode];
    const activity=activityAdjustment(date),trend=weightAdjustment(ps.mode,date);
    const effectiveOffset=clamp(ps.baseOffset+activity.kcal+trend.kcal,cfg.min,cfg.max);
    const kcal=estimate?.complete?Math.round((estimate.tdee+effectiveOffset)/10)*10:(Number(existing.kcal)||null);
    const protein=weight?Math.round(weight*PROTEIN_PER_KG):(Number(existing.p)||null);
    return {complete:!!(kcal&&protein),kcal,protein,weight,tdee:estimate?.complete?estimate.tdee:null,mode:ps.mode,modeLabel:cfg.label,baseOffset:ps.baseOffset,effectiveOffset,activityAdjustment:activity.kcal,weightAdjustment:trend.kcal,adherence:activity.ratio,weightTrend:trend.weekly};
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
    if(meal==='Almuerzo'&&id==='lunch_work_menu'&&typeof window.marevoWorkLunchOption==='function'){
      const work=window.marevoWorkLunchOption(date);if(work)return work;
    }
    return OPTIONS[meal]?.find(option=>option.id===id)||OPTIONS[meal]?.[0]||null
  }
  function workLunchActive(date){return (!!selectedOption(date,'Almuerzo')?.workMenu||loggedMealFoods(date,'Almuerzo').some(f=>f.workMenu))&&!isMealSkipped(date,'Almuerzo')}
  function loggedMealFoods(date,meal){return (state.foods||[]).filter(f=>f.date===date&&f.meal===meal)}
  function loggedNutrition(rows){return rows.reduce((sum,f)=>addNutrition(sum,calcFood(f)),{kcal:0,p:0,c:0,f:0})}
  function adaptationCutoff(date){
    return MEALS.reduce((last,meal,index)=>loggedMealFoods(date,meal).length||(meal!=='Post-entreno'&&(isMealSkipped(date,meal)||manualMealPlan(date,meal)&&optionalMealActive(date,meal)))?Math.max(last,index):last,workLunchActive(date)?MEALS.indexOf('Almuerzo'):-1)
  }
  function manualMealPlan(date,meal){
    const option=selectedOption(date,meal),custom=planState().amountOverrides?.[date]?.[meal];
    if(!option||custom?.optionId!==option.id||!custom.amounts)return null;
    const items=Object.entries(custom.amounts).filter(([key,amount])=>foodRecord(key)&&Number.isFinite(+amount)&&+amount>=0).map(([key,amount])=>[key,+amount]);
    return {items,nutrition:sumNutrition(items),manualFixed:true}
  }
  function macroTargets(date){
    const target=targetFor(date),goals=state.settings.nutritionGoals||{};
    if(Number(goals.c)>0&&Number(goals.f)>0){
      const scale=Math.max(0,(target.kcal||0)-(target.protein||0)*4)/(Number(goals.c)*4+Number(goals.f)*9);
      return {c:Number(goals.c)*scale,f:Number(goals.f)*scale}
    }
    const f=Number(goals.f)>0?Number(goals.f):Math.max(0,(target.kcal||0)*.25/9);
    const c=Number(goals.c)>0?Number(goals.c):Math.max(0,((target.kcal||0)-(target.protein||0)*4-f*9)/4);
    return {c,f}
  }
  function isMealSkipped(date,meal){
    return !!planState().skippedMeals?.[date]?.[meal]
  }
  function postTupperExtras(date){
    const extras=planState().postTupperExtras?.[date];
    return Array.isArray(extras)?extras.filter(meal=>TUPPER_MEALS.includes(meal)&&!selectedOption(date,meal)?.workMenu&&isMealSkipped(date,meal)):[]
  }
  function postTupperSlotId(date,meal){return `marevo-plan:${date}:Post-entreno-extra:${meal}`}
  function postTupperLogged(date,meal){
    const slot=postTupperSlotId(date,meal);
    return (state.foods||[]).some(item=>item.planSlotId===slot)
  }
  function optionalMealActive(date,meal){
    if(!OPTIONAL_MEALS.includes(meal))return true;
    return !!planState().optionalMeals?.[date]?.[meal]||loggedMealFoods(date,meal).length>0
  }
  function reservedPostPlan(date){
    const target=targetFor(date),option=selectedOption(date,'Post-entreno');
    if(!option)return null;
    const row=fitOption(date,'Post-entreno',option,{kcal:(target.kcal||0)*BASE_SHARES['Post-entreno'].kcal,protein:(target.protein||0)*BASE_SHARES['Post-entreno'].protein});
    const custom=planState().amountOverrides?.[date]?.['Post-entreno'];
    if(custom?.optionId===option.id&&custom.amounts){
      row.items=row.items.map(([key,amount])=>[key,Number.isFinite(+custom.amounts[key])?+custom.amounts[key]:amount]);
      row.nutrition=sumNutrition(row.items)
    }
    return row
  }
  function planFoodKey(foodKey){
    const mapped=planState().preferredFoods?.[foodKey];
    if(!mapped||mapped===foodKey)return foodKey;
    const custom=(state.customFoods||[]).find(f=>f.key===mapped&&!f.transient);
    return custom?mapped:foodKey
  }
  function basePlanFoodKey(foodKey){
    const preferred=planState().preferredFoods||{};
    return Object.keys(preferred).find(base=>preferred[base]===foodKey)||foodKey
  }
  function planFoodDisplayName(foodKey){
    const baseKey=basePlanFoodKey(foodKey);
    return FOOD_DB[baseKey]?.name||foodRecord(foodKey)?.name||foodKey
  }
  window.marevoPreferredFoodKey=planFoodKey;
  window.marevoBasePlanFoodKey=basePlanFoodKey;
  window.marevoPlanFoodDisplayName=planFoodDisplayName;
  function foodInputNutrition(foodKey,inputAmount){
    const key=planFoodKey(foodKey),amount=toStoredFoodAmount(key,inputAmount);
    return calcFood({foodKey:key,amount})
  }
  function sumNutrition(items){
    return items.reduce((sum,[key,inputAmount])=>{
      const n=foodInputNutrition(key,inputAmount);
      sum.kcal+=n.kcal;sum.p+=n.p;sum.c+=n.c;sum.f+=n.f;
      return sum
    },{kcal:0,p:0,c:0,f:0})
  }
  function tupperReferenceDate(){
    const today=todayISO();
    if(today<PLAN_START)return PLAN_START;
    if(today>PLAN_END)return PLAN_END;
    return today
  }
  function median(values){
    const rows=values.filter(Number.isFinite).sort((a,b)=>a-b);
    if(!rows.length)return null;
    const mid=Math.floor(rows.length/2);
    return rows.length%2?rows[mid]:(rows[mid-1]+rows[mid])/2
  }
  function optionFitSuggestions(option,targetKcal,targetProtein){
    const fixed=(option.fixed||[]).map(([key,amount])=>[planFoodKey(key),amount]);
    const vars=option.vars||[];
    if(!vars.length)return {};
    const choices=vars.map(v=>range(v[1],v[2],v[3]));
    let best=null;
    const visit=(index,values)=>{
      if(index<vars.length){choices[index].forEach(value=>visit(index+1,[...values,value]));return}
      const items=[...fixed,...vars.map((v,i)=>[planFoodKey(v[0]),values[i]])].filter(([,amount])=>amount>0);
      const n=sumNutrition(items);
      const kcalError=Math.abs(n.kcal-targetKcal)/Math.max(100,targetKcal);
      const pDiff=n.p-targetProtein;
      const proteinError=Math.abs(pDiff)/Math.max(15,targetProtein)*(pDiff<0?2.6:1.4);
      const score=kcalError*1.6+proteinError;
      if(!best||score<best.score)best={values:[...values],score}
    };
    visit(0,[]);
    const out={};if(!best)return out;
    vars.forEach((v,i)=>{out[v[0]]=best.values[i]});
    return out
  }
  let autoTupperCacheKey='',autoTupperCacheValue=null;
  function autoTupperPortions(){
    const target=targetFor(tupperReferenceDate());
    if(!target.complete)return {...TUPPER_PORTIONS};
    const preferred=planState().preferredFoods||{};
    const foodSignature=Object.entries(preferred).sort(([a],[b])=>a.localeCompare(b)).map(([base,key])=>{
      const food=(state.customFoods||[]).find(f=>f.key===key);
      return [base,key,food?.kcal,food?.p,food?.c,food?.f,food?.inputMeta?.gramsPerInput,food?.perUnit]
    });
    const cacheKey=JSON.stringify([target.kcal,target.protein,foodSignature]);
    if(cacheKey===autoTupperCacheKey&&autoTupperCacheValue)return {...autoTupperCacheValue};
    const targetKcal=target.kcal*BASE_SHARES.Almuerzo.kcal;
    const targetProtein=target.protein*BASE_SHARES.Almuerzo.protein;
    const suggestions={};
    [...OPTIONS.Almuerzo,...OPTIONS.Cena].forEach(option=>{
      const fit=optionFitSuggestions(option,targetKcal,targetProtein);
      Object.entries(fit).forEach(([key,value])=>{
        if(!Object.prototype.hasOwnProperty.call(TUPPER_PORTIONS,key))return;
        if(key==='veg'||key==='oil')return;
        (suggestions[key]||(suggestions[key]=[])).push(value)
      })
    });
    const result={...TUPPER_PORTIONS};
    Object.entries(suggestions).forEach(([key,values])=>{
      const m=median(values);if(m==null)return;
      const defs=[...OPTIONS.Almuerzo,...OPTIONS.Cena].flatMap(o=>o.vars||[]).filter(v=>v[0]===key);
      const step=Math.min(...defs.map(v=>v[3]).filter(Number.isFinite));
      result[key]=step?Math.round(m/step)*step:m
    });
    autoTupperCacheKey=cacheKey;autoTupperCacheValue={...result};
    return result
  }
  function tupperPortions(){
    const ps=planState();
    if(!ps.fixedLunchPortions&&targetFor(tupperReferenceDate()).complete){
      ps.fixedLunchPortions=autoTupperPortions();saveState(true)
    }
    return {...(ps.fixedLunchPortions||TUPPER_PORTIONS),...(ps.tupperPortions||{})}
  }
  function standardTupperItems(option){
    const portions=tupperPortions(),seen=new Set(),items=[];
    [...(option.fixed||[]),...(option.vars||[]).map(v=>[v[0],v[1]])].forEach(([key,amount])=>{
      if(seen.has(key))return;seen.add(key);
      const standard=Number(portions[key]);
      items.push([planFoodKey(key),Number.isFinite(standard)?standard:amount])
    });
    return items.filter(([,amount])=>Number(amount)>0)
  }
  function standardTupperPlan(option){
    const items=option.workMenu?(option.fixed||[]).map(i=>[...i]):standardTupperItems(option);
    return {items,nutrition:sumNutrition(items),score:0}
  }
  function redistributeTarget(targets,sourceMeal,recipients){
    const freed={...targets[sourceMeal]};
    targets[sourceMeal]={kcal:0,protein:0};
    if(!recipients.length)return;
    ['kcal','protein'].forEach(key=>{
      const weight=recipients.reduce((sum,meal)=>sum+Math.max(0,targets[meal][key]),0);
      recipients.forEach(meal=>{
        const share=weight>0?Math.max(0,targets[meal][key])/weight:1/recipients.length;
        targets[meal][key]+=freed[key]*share
      })
    })
  }
  function subtractOptionalTarget(targets,desired,donors){
    if(!donors.length)return;
    ['kcal','protein'].forEach(key=>{
      const available=donors.reduce((sum,meal)=>sum+Math.max(0,targets[meal][key]),0);
      const take=Math.min(desired[key],available);
      donors.forEach(meal=>{
        const share=available>0?Math.max(0,targets[meal][key])/available:0;
        targets[meal][key]=Math.max(0,targets[meal][key]-take*share)
      })
    })
  }
  function applyTargetDifference(targets,difference,recipients){
    if(!recipients.length)return;
    ['kcal','protein'].forEach(key=>{
      const delta=Number(difference[key])||0;if(Math.abs(delta)<.01)return;
      const weight=recipients.reduce((sum,meal)=>sum+Math.max(0,targets[meal][key]),0);
      if(delta>0){
        recipients.forEach(meal=>{
          const share=weight>0?Math.max(0,targets[meal][key])/weight:1/recipients.length;
          targets[meal][key]+=delta*share
        })
      }else{
        const remove=Math.min(-delta,weight);
        recipients.forEach(meal=>{
          const share=weight>0?Math.max(0,targets[meal][key])/weight:0;
          targets[meal][key]=Math.max(0,targets[meal][key]-remove*share)
        })
      }
    })
  }
  function mealTargetMap(date){
    const target=targetFor(date);
    const targets={};
    MEALS.forEach(meal=>{
      const share=BASE_SHARES[meal]||{kcal:0,protein:0};
      targets[meal]={kcal:(target.kcal||0)*share.kcal,protein:(target.protein||0)*share.protein}
    });
    {
      const fixed={kcal:0,p:0,c:0,f:0},future=[];
      const cutoff=adaptationCutoff(date);
      if(optionalMealActive(date,'Media mañana')){
        targets['Media mañana']={kcal:(target.kcal||0)*MEDIA_MORNING_SHARE.kcal,protein:(target.protein||0)*MEDIA_MORNING_SHARE.protein};
      }
      MEALS.forEach(meal=>{
        const logged=loggedMealFoods(date,meal);
        if(logged.length){addNutrition(fixed,loggedNutrition(logged));return;}
        if(isMealSkipped(date,meal)||!optionalMealActive(date,meal)){targets[meal]={kcal:0,protein:0};return;}
        const manual=manualMealPlan(date,meal);
        if(manual){addNutrition(fixed,manual.nutrition);targets[meal]={kcal:manual.nutrition.kcal,protein:manual.nutrition.p};return;}
        if(meal==='Post-entreno'){
          const post=reservedPostPlan(date);if(post)addNutrition(fixed,post.nutrition);
          targets[meal]={kcal:(target.kcal||0)*BASE_SHARES[meal].kcal,protein:(target.protein||0)*BASE_SHARES[meal].protein};return;
        }
        if(meal!=='Almuerzo'&&MEALS.indexOf(meal)>cutoff){future.push(meal);return;}
        const previous=planState().workLunches?.[date]?.beforeLunchRows?.find(row=>row.meal===meal);
        const option=selectedOption(date,meal);
        if(workLunchActive(date)&&previous&&!previous.skipped&&!previous.optionalInactive)addNutrition(fixed,previous.nutrition);
        else if(option)addNutrition(fixed,fitOption(date,meal,option,targets[meal]).nutrition);
      });
      addNutrition(fixed,loggedNutrition((state.foods||[]).filter(f=>f.date===date&&!MEALS.includes(f.meal))));
      const shares=meal=>meal==='Media mañana'?MEDIA_MORNING_SHARE:BASE_SHARES[meal];
      const shareSum=future.reduce((n,meal)=>n+shares(meal).kcal,0);
      const proteinSum=future.reduce((n,meal)=>n+shares(meal).protein,0);
      future.forEach(meal=>{
        targets[meal]={kcal:Math.max(0,(target.kcal||0)-fixed.kcal)*(shares(meal).kcal/shareSum||0),protein:Math.max(0,(target.protein||0)-fixed.p)*(shares(meal).protein/proteinSum||0)};
      });
      return targets;
    }
  }
  function range(min,max,step){
    const out=[];for(let n=min;n<=max+1e-9;n+=step)out.push(Number(n.toFixed(4)));return out
  }
  function fitOption(date,meal,option,targetOverride=null){
    if(meal==='Almuerzo')return standardTupperPlan(option);
    const target=targetFor(date),mealTarget=targetOverride||mealTargetMap(date)[meal]||{kcal:0,protein:0};
    if(!target.complete)return {items:[...(option.fixed||[])],nutrition:sumNutrition(option.fixed||[])};
    const targetKcal=mealTarget.kcal,targetProtein=mealTarget.protein;
    const fixed=(option.fixed||[]).map(([key,amount])=>[planFoodKey(key),amount]);
    const vars=(option.vars||[]).map(v=>[planFoodKey(v[0]),v[1],v[2],v[3]]);
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
    const visit=(index,values)=>{
      if(index>=vars.length){test(values);return}
      choices[index].forEach(value=>visit(index+1,[...values,value]))
    };
    if(!vars.length)test([]);else visit(0,[]);
    return best||{items:[...fixed],nutrition:sumNutrition(fixed)}
  }
  function rawMealPlan(date,meal){
    const option=selectedOption(date,meal);
    if(!option)return null;
    const logged=loggedMealFoods(date,meal);
    if(logged.length)return {meal,option,skipped:false,optionalInactive:false,workFixed:true,items:logged.map(f=>[f.foodKey,fromStoredFoodAmount(f)]),nutrition:loggedNutrition(logged)};
    if(isMealSkipped(date,meal))return {meal,option,skipped:true,optionalInactive:false,items:[],nutrition:{kcal:0,p:0,c:0,f:0}};
    const manual=manualMealPlan(date,meal);
    if(manual)return {meal,option,skipped:false,optionalInactive:!optionalMealActive(date,meal),...manual};
    if(workLunchActive(date)){
      if(MEALS.indexOf(meal)<MEALS.indexOf('Almuerzo')){
        const previous=planState().workLunches?.[date]?.beforeLunchRows?.find(row=>row.meal===meal);
        if(previous&&(!OPTIONAL_MEALS.includes(meal)||previous.optionalInactive===!optionalMealActive(date,meal)))return {...structuredClone(previous),workFixed:true};
      }
    }
    const optionalInactive=OPTIONAL_MEALS.includes(meal)&&!optionalMealActive(date,meal);
    const target=targetFor(date);
    const previewShare=meal==='Media mañana'?MEDIA_MORNING_SHARE:BASE_SHARES[meal];
    const previewTarget=optionalInactive?{kcal:(target.kcal||0)*previewShare.kcal,protein:(target.protein||0)*previewShare.protein}:null;
    const fitted=fitOption(date,meal,option,previewTarget),custom=planState().amountOverrides?.[date]?.[meal];
    if(meal!=='Almuerzo'&&custom?.optionId===option.id&&custom.amounts){
      fitted.items=fitted.items.map(([key,amount])=>[key,Number.isFinite(+custom.amounts[key])?+custom.amounts[key]:amount]).filter(([,amount])=>amount>0);
      fitted.nutrition=sumNutrition(fitted.items)
    }
    return {meal,option,skipped:false,optionalInactive,reserved:meal==='Post-entreno'&&!optionalInactive,...fitted}
  }
  function addNutrition(a,b,sign=1){
    ['kcal','p','c','f'].forEach(key=>a[key]=(Number(a[key])||0)+(Number(b[key])||0)*sign);
    return a
  }
  function activeRowsNutrition(rows){
    return rows.reduce((sum,row)=>{
      if(row.skipped||row.optionalInactive)return sum;
      return addNutrition(sum,row.nutrition)
    },{kcal:0,p:0,c:0,f:0})
  }
  function dayAdjustmentScore(n,target,date){
    const proteinShort=Math.max(0,(target.protein||0)-n.p);
    const proteinExcess=Math.max(0,n.p-(target.protein||0));
    const macros=date?macroTargets(date):null;
    const macroError=macros?Math.abs(n.c-macros.c)*3+Math.abs(n.f-macros.f)*9:0;
    return proteinShort*10000+Math.abs(n.kcal-(target.kcal||0))*100+proteinExcess*4+macroError
  }
  function adjustableRowItems(date,row){
    if(!row||row.workFixed||row.manualFixed||row.reserved||row.skipped||row.optionalInactive||slotLogged(date,row.meal))return [];
    if(row.meal==='Almuerzo'||MEALS.indexOf(row.meal)<=adaptationCutoff(date))return [];
    return row.items.map(([key,amount],index)=>{
      const baseKey=basePlanFoodKey(key);
      const meta=foodInputMeta(key),continuous=meta.inputUnit==='g'||meta.inputUnit==='ml';
      const def=(row.option.vars||[]).find(v=>v[0]===baseKey);
      const fixed=(row.option.fixed||[]).find(v=>v[0]===baseKey);
      if(!def&&!fixed)return null;
      return {index,key,baseKey,amount,min:0,max:def?def[2]:Math.max(fixed[1]*2,amount),step:continuous?1:(def?.[3]||1),continuous}
    }).filter(Boolean)
  }
  function fineTuneDayPlan(date,rows){
    const target=targetFor(date);
    if(!target.complete)return rows;
    const tuned=rows.map(row=>({...row,items:(row.items||[]).map(item=>[...item]),nutrition:{...row.nutrition}}));
    let total=activeRowsNutrition(tuned);
    addNutrition(total,loggedNutrition((state.foods||[]).filter(f=>f.date===date&&!MEALS.includes(f.meal))));
    let bestScore=dayAdjustmentScore(total,target,date);
    for(let pass=0;pass<16;pass++){
      const kcalDelta=target.kcal-total.kcal;
      let best=null;
      tuned.forEach((row,rowIndex)=>{
        adjustableRowItems(date,row).forEach(variable=>{
          const current=Number(row.items[variable.index]?.[1])||0;
          const perUnit=foodInputNutrition(variable.key,1);
          if(!Number.isFinite(perUnit.kcal)||perUnit.kcal<=0)return;
          const ideal=clamp(current+kcalDelta/perUnit.kcal,variable.min,variable.max);
          const step=variable.step||1;
          const snapped=variable.continuous?Math.round(ideal):Math.round(ideal/step)*step;
          const candidates=[snapped,snapped-step,snapped+step,variable.min,variable.max]
            .map(value=>clamp(value,variable.min,variable.max))
            .filter((value,index,array)=>Number.isFinite(value)&&value>=0&&array.indexOf(value)===index&&Math.abs(value-current)>.0001);
          candidates.forEach(value=>{
            const oldN=foodInputNutrition(variable.key,current),newN=foodInputNutrition(variable.key,value);
            const candidateTotal={...total};addNutrition(candidateTotal,oldN,-1);addNutrition(candidateTotal,newN,1);
            const score=dayAdjustmentScore(candidateTotal,target,date);
            if(score+1e-8<bestScore&&(!best||score<best.score))best={rowIndex,index:variable.index,value,total:candidateTotal,score}
          })
        })
      });
      if(!best)break;
      const row=tuned[best.rowIndex];
      row.items[best.index]=[row.items[best.index][0],best.value];
      row.nutrition=sumNutrition(row.items);
      total=best.total;bestScore=best.score;
    }
    // Exchange ingredients at nearly equal energy so calorie accuracy does not
    // trap the optimizer in a high-protein/high-fat composition.
    for(let pass=0;pass<24;pass++){
      const variables=tuned.flatMap((row,rowIndex)=>adjustableRowItems(date,row).map(v=>({...v,rowIndex})));
      let best=null;
      const macros=macroTargets(date);
      for(const a of variables){
        const current=tuned[a.rowIndex].items[a.index][1],unit=foodInputNutrition(a.key,1);
        if(!(unit.kcal>0))continue;
        const desired=[current-a.step*5,current+a.step*5,a.min,a.max];
        for(const [key,goal] of [['p',target.protein],['c',macros.c],['f',macros.f]])if(unit[key]>0)desired.push(current+(goal-total[key])/unit[key]);
        const choices=[...new Set(desired.map(value=>clamp(Math.round(value/a.step)*a.step,a.min,a.max)))];
        for(const value of choices){
          if(Math.abs(value-current)<.0001)continue;
          const deltaA=foodInputNutrition(a.key,value-current);
          for(const b of variables){
            if(a.rowIndex===b.rowIndex&&a.index===b.index)continue;
            const oldB=tuned[b.rowIndex].items[b.index][1],unitB=foodInputNutrition(b.key,1);
            if(!(unitB.kcal>0))continue;
            const ideal=oldB+(target.kcal-total.kcal-deltaA.kcal)/unitB.kcal;
            const nextB=clamp(Math.round(ideal/b.step)*b.step,b.min,b.max);
            const candidate={...total};addNutrition(candidate,deltaA);addNutrition(candidate,foodInputNutrition(b.key,nextB-oldB));
            const score=dayAdjustmentScore(candidate,target,date);
            if(score+1e-8<bestScore&&(!best||score<best.score))best={a,b,value,nextB,total:candidate,score};
          }
        }
      }
      if(!best)break;
      tuned[best.a.rowIndex].items[best.a.index][1]=best.value;
      tuned[best.b.rowIndex].items[best.b.index][1]=best.nextB;
      tuned[best.a.rowIndex].nutrition=sumNutrition(tuned[best.a.rowIndex].items);
      tuned[best.b.rowIndex].nutrition=sumNutrition(tuned[best.b.rowIndex].items);
      total=best.total;bestScore=best.score;
    }
    tuned.forEach(row=>{if(!row.manualFixed)row.items=row.items.filter(([,amount])=>amount>0)});
    return tuned
  }
  const dayPlanCache=new Map();
  function dayPlanSignature(date){return JSON.stringify([targetFor(date),planState(),state.settings.nutritionGoals,(state.foods||[]).filter(f=>f.date===date),state.customFoods])}
  function dayPlan(date){
    const cached=dayPlanCache.get(date),signature=dayPlanSignature(date);
    if(cached?.signature===signature)return structuredClone(cached.rows);
    const rows=MEALS.map(meal=>rawMealPlan(date,meal)).filter(Boolean);
    const tuned=fineTuneDayPlan(date,rows);
    dayPlanCache.set(date,{signature:dayPlanSignature(date),rows:structuredClone(tuned)});
    if(dayPlanCache.size>14)dayPlanCache.delete(dayPlanCache.keys().next().value);
    return tuned
  }
  function mealPlan(date,meal){return dayPlan(date).find(row=>row.meal===meal)||null}
  function dayPlanNutrition(date){
    const sum=dayPlan(date).reduce((acc,row)=>{
      if(row.skipped||row.optionalInactive)return acc;
      acc.kcal+=row.nutrition.kcal;acc.p+=row.nutrition.p;acc.c+=row.nutrition.c;acc.f+=row.nutrition.f;return acc
    },{kcal:0,p:0,c:0,f:0});
    addNutrition(sum,loggedNutrition((state.foods||[]).filter(f=>f.date===date&&!MEALS.includes(f.meal))));
    return sum
  }
  function clearFlexibleOverrides(date,afterMeal=null){
    const ps=planState(),overrides=ps.amountOverrides?.[date];
    if(!overrides)return;
    const afterIndex=afterMeal?MEALS.indexOf(afterMeal):-1;
    FLEXIBLE_MEALS.forEach(meal=>{
      const index=MEALS.indexOf(meal);
      if(index<=afterIndex||slotLogged(date,meal))return;
      delete overrides[meal]
    })
  }
  function amountText(key,amount){
    const meta=foodInputMeta(key),shown=Number.isInteger(amount)?amount:Number(amount.toFixed(1));
    return `${shown} ${meta.inputUnit}`
  }
  function itemSummary(items){
    return items.map(([key,amount])=>`${planFoodDisplayName(key)} ${amountText(key,amount)}`).join(' · ')
  }
  function dateLabel(date){
    return dateObj(date).toLocaleDateString('es-ES',{weekday:'short',day:'numeric'}).replace('.','')
  }
  function planSlotId(date,meal){return `marevo-plan:${date}:${meal}`}
  function slotLogged(date,meal){const id=planSlotId(date,meal);return (state.foods||[]).some(item=>item.planSlotId===id)}
  function weeklyDates(date){
    const start=mondayOf(date);return Array.from({length:7},(_,i)=>addDaysISO(start,i))
  }

  function postTupperExtraRowsHTML(date){
    return postTupperExtras(date).filter(meal=>postTupperLogged(date,meal)).map(meal=>{
      const option=selectedOption(date,meal);if(!option)return '';
      const plan=standardTupperPlan(option);
      return `<div class="nutrition-plan-meal nutrition-plan-post"><div class="nutrition-plan-meal-main"><span>Post-entreno · extra</span><strong>${esc(option.name)}</strong><small>${esc(itemSummary(plan.items))}</small><em>${Math.round(plan.nutrition.kcal)} kcal · ${Math.round(plan.nutrition.p)} g proteína</em></div><div class="nutrition-plan-meal-actions"><button type="button" class="btn secondary small" disabled>Registrado</button><button type="button" class="btn ghost small" onclick="removeSkippedTupperFromPost('${date}','${meal}')">Quitar</button></div></div>`
    }).join('')
  }
  function planMealRowHTML(date,row){
    const logged=slotLogged(date,row.meal),post=row.meal==='Post-entreno',mid=row.meal==='Media mañana',optional=OPTIONAL_MEALS.includes(row.meal),tupper=TUPPER_MEALS.includes(row.meal)&&!row.option.workMenu;
    const workButton=row.meal==='Almuerzo'&&typeof window.workMenuLunchButtonHTML==='function'?window.workMenuLunchButtonHTML(date):'';
    if(row.workFixed&&!logged&&loggedMealFoods(date,row.meal).length){
      return `<div class="nutrition-plan-meal" data-plan-meal="${esc(row.meal)}"><div class="nutrition-plan-meal-main"><span>${esc(row.meal)} · registrada</span><strong>Tu registro real</strong><small>${esc(itemSummary(row.items))}</small><em>${Math.round(row.nutrition.kcal)} kcal · ${Math.round(row.nutrition.p)} g proteína</em></div><div class="nutrition-plan-meal-actions"><span class="pill good">Se mantiene sin cambios</span></div></div>`;
    }
    if(row.skipped){
      const added=tupper&&postTupperLogged(date,row.meal);
      return `<div class="nutrition-plan-meal skipped" data-plan-meal="${esc(row.meal)}"><div class="nutrition-plan-meal-main"><span>${esc(row.meal)}</span><strong>No consumido</strong></div><div class="nutrition-plan-meal-actions"><button type="button" class="btn ghost small" onclick="toggleNutritionPlanMealSkipped('${date}','${row.meal}')">Reactivar</button>${tupper?(added?`<button type="button" class="btn ghost small" onclick="removeSkippedTupperFromPost('${date}','${row.meal}')">Quitar del post-entreno</button>`:`<button type="button" class="btn ghost small" onclick="addSkippedTupperToPost('${date}','${row.meal}')">Añadir al post-entreno</button>`):''}</div></div>`
    }
    if(row.optionalInactive){
      return `<div class="nutrition-plan-meal nutrition-plan-optional" data-plan-meal="${esc(row.meal)}"><div class="nutrition-plan-meal-main"><span>${esc(row.meal)} · voluntario</span><strong>${esc(row.option.name)}</strong><small>${esc(itemSummary(row.items))}</small><em>Vista previa · ${Math.round(row.nutrition.kcal)} kcal · ${Math.round(row.nutrition.p)} g proteína · no incluido en el plan</em></div><div class="nutrition-plan-meal-actions"><button type="button" class="btn secondary small" onclick="setNutritionPlanMealIntended('${date}','${row.meal}')">${post?'Voy a tomar postentreno · recalcular cena':'Voy a consumirla'}</button><button type="button" class="btn small" onclick="addNutritionPlanMeal('${date}','${row.meal}')">Registrar consumo</button><button type="button" class="btn ghost small" onclick="openNutritionPlanMealOptions('${date}','${row.meal}')">Ajustar</button><button type="button" class="btn ghost small" onclick="markNutritionPlanMealNotDone('${date}','${row.meal}')">No consumido</button></div></div>`
    }
    if(row.option.workMenu){
      return `<div class="nutrition-plan-meal work-menu-plan-row" data-plan-meal="Almuerzo"><div class="nutrition-plan-meal-main"><span>Almuerzo</span><strong>Menú semanal trabajo</strong><small>${esc(itemSummary(row.items))}</small><em>${row.option.estimated?'≈ ':''}${Math.round(row.nutrition.kcal)} kcal · ${Math.round(row.nutrition.p)} g proteína</em></div><div class="nutrition-plan-meal-actions">${logged?`<button type="button" class="btn secondary small" onclick="removeNutritionPlanMeal('${date}','Almuerzo')">Deshacer registro</button>`:`<button type="button" class="btn small" onclick="addNutritionPlanMeal('${date}','Almuerzo')">Registrar almuerzo</button>`}${workButton}<button type="button" class="btn ghost small" onclick="openNutritionPlanMealOptions('${date}','Almuerzo')">Cambiar al táper</button><button type="button" class="btn ghost small" onclick="markNutritionPlanMealNotDone('${date}','Almuerzo')">No consumido</button></div></div>`;
    }
    if(!row.workFixed&&!row.items.length){
      return `<div class="nutrition-plan-meal" data-plan-meal="${esc(row.meal)}"><div class="nutrition-plan-meal-main"><span>${esc(row.meal)}</span><strong>Sin cantidad pendiente</strong><small>Según el ajuste actual no hay una cantidad propuesta para esta comida. Puedes cambiar la opción o marcarla como no consumida.</small></div><div class="nutrition-plan-meal-actions"><button type="button" class="btn ghost small" onclick="openNutritionPlanMealOptions('${date}','${row.meal}')">Cambiar opción</button><button type="button" class="btn ghost small" onclick="markNutritionPlanMealNotDone('${date}','${row.meal}')">No consumido</button></div></div>`;
    }
    return `<div class="nutrition-plan-meal ${post?'nutrition-plan-post':''}" data-plan-meal="${esc(row.meal)}">
      <div class="nutrition-plan-meal-main"><span>${esc(row.meal)}${optional?' · voluntario':''}${row.reserved?' · previsto (no registrado)':''}</span><strong>${esc(row.option.name)}</strong><small>${esc(itemSummary(row.items))}</small><em>${Math.round(row.nutrition.kcal)} kcal · ${Math.round(row.nutrition.p)} g proteína</em></div>
      <div class="nutrition-plan-meal-actions">${logged?`<button type="button" class="btn secondary small" onclick="removeNutritionPlanMeal('${date}','${row.meal}')">Deshacer registro</button>`:`<button type="button" class="btn small" onclick="addNutritionPlanMeal('${date}','${row.meal}')">Añadir</button>`}${workButton}<button type="button" class="btn ghost small" onclick="openNutritionPlanMealOptions('${date}','${row.meal}')">Ajustar</button><button type="button" class="btn ghost small" onclick="markNutritionPlanMealNotDone('${date}','${row.meal}')">No consumido</button></div>
    </div>`
  }
  function signedKcal(value){
    const n=Math.round(Number(value)||0);
    return n===0?'0 kcal':`${n>0?'+':'−'}${Math.abs(n)} kcal`
  }
  function nutritionModeHTML(target){
    return `<div class="nutrition-plan-mode" role="group" aria-label="Objetivo energético">${Object.entries(NUTRITION_MODES).map(([key,cfg])=>`<button type="button" class="${target.mode===key?'active':''}" onclick="setNutritionPlanMode('${key}')">${esc(cfg.label)}</button>`).join('')}</div>`
  }

  function nutritionPlanHTML(date=currentDate()){
    const target=syncGoals(date),days=weeklyDates(date);
    const active=inPlan(date);
    let targetHTML='';
    if(target.complete){
      targetHTML=`${nutritionModeHTML(target)}<div class="nutrition-plan-targets"><div><span>Objetivo</span><strong>${target.kcal} kcal</strong></div><div><span>Proteína</span><strong>${target.protein} g</strong><small>${target.weight?`${target.weight.toFixed(1)} kg × 2,2`:''}</small></div><button type="button" class="nutrition-plan-balance" onclick="openNutritionPlanModeSettings()"><span>Balance</span><strong>${signedKcal(target.effectiveOffset)}</strong></button></div>`
    }else{
      targetHTML=`${nutritionModeHTML(target)}<div class="nutrition-plan-missing"><span>Falta peso o mantenimiento.</span><button type="button" class="btn ghost small" onclick="goToMetabolismSettings()">Configurar</button></div>`
    }
    const weekHTML=`<div class="nutrition-plan-week">${days.map(d=>`<button type="button" class="${d===date?'active':''} ${inPlan(d)?'':'outside'}" onclick="selectNutritionPlanDate('${d}')"><span>${esc(dateLabel(d))}</span><b>${inPlan(d)?'•':'—'}</b></button>`).join('')}</div>`;
    const totals=active&&target.complete?dayPlanNutrition(date):null;
    const totalKcal=Math.round(totals?.kcal||0),totalPrefix=totalKcal===target.kcal?'':'≈ ',macroGoal=macroTargets(date);
    const body=active&&target.complete
      ?`<div class="nutrition-plan-day-head"><div><span>Plan del día</span><strong>${esc(pretty(date))}</strong></div><div class="nutrition-plan-day-tools"><div class="nutrition-plan-day-total">${totalPrefix}${totalKcal} kcal · ${Math.round(totals.p)} g proteína</div><button type="button" class="btn ghost small nutrition-rebalance-button" onclick="rebalanceNutritionPlanDay('${date}')">Reajustar resto</button></div></div><div class="nutrition-plan-meals">${dayPlan(date).map(row=>planMealRowHTML(date,row)).join('')}${postTupperExtraRowsHTML(date)}</div>`
      :active
        ?`<div class="nutrition-plan-empty">Completa peso y mantenimiento.</div>`
        :`<div class="nutrition-plan-empty">Plan activo hasta el 30 de noviembre.</div>`;
    const balanceNote=totals?`<div class="callout work-menu-balance"><strong>Adaptación automática al registro real</strong><p>Las cantidades de las comidas posteriores se recalculan al registrar, editar o eliminar alimentos. El almuerzo se mantiene fijo; lo ya registrado no cambia. Si no meriendas, marca «No consumido»: lo pendiente se reparte entre cena y post-entreno.</p><small>Plan completo: ${Math.round(totals.p)} g proteína · ${Math.round(totals.c)} g carbohidratos · ${Math.round(totals.f)} g grasas. ${Math.abs(totalKcal-target.kcal)>30?`Con estas opciones quedan ${Math.abs(totalKcal-target.kcal)} kcal ${totalKcal>target.kcal?'por encima del objetivo':'por completar'}; cambia una opción si quieres acercarte más.`:'Las cantidades se calculan con los valores disponibles.'}${workLunchActive(date)?' El comedor incluye estimaciones editables.':''} Objetivo del día: ${Math.round(target.protein)} g proteína · ${Math.round(macroGoal.c)} g carbohidratos · ${Math.round(macroGoal.f)} g grasas. Las comidas anteriores sin registro siguen siendo previsiones: marca las omitidas para no contarlas.</small></div>`:'';
    return `<section class="nutrition-plan-card">
      <div class="nutrition-plan-head"><div><div class="eyebrow">Plan nutricional · 5 oct–30 nov</div><h2>Comidas de la semana</h2></div><div class="nutrition-plan-head-actions"><button type="button" class="btn secondary small" onclick="openNutritionCookingPlan()">Cocinar</button><button type="button" class="btn secondary small" onclick="openNutritionShoppingList()">Compra</button></div></div>
      ${targetHTML}${weekHTML}${!target.complete&&typeof window.workMenuLunchButtonHTML==='function'?window.workMenuLunchButtonHTML(date):''}${balanceNote}${body}
    </section>`
  }

  window.setNutritionPlanMode=function(mode){
    if(!NUTRITION_MODES[mode])return;
    const ps=planState(),changed=ps.mode!==mode;
    ps.mode=mode;ps.baseOffset=NUTRITION_MODES[mode].defaultOffset;
    if(changed)ps.amountOverrides={};
    saveState(true);renderAll();showView('Food')
  };
  window.openNutritionPlanModeSettings=function(){
    const ps=planState(),cfg=NUTRITION_MODES[ps.mode],values=[];
    for(let value=cfg.min;value<=cfg.max;value+=cfg.step)values.push(value);
    document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row between"><div><div class="eyebrow">${esc(cfg.label)}</div><div class="hero-title">Ajuste energético</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="nutrition-offset-grid">${values.map(value=>`<button type="button" class="${value===ps.baseOffset?'active':''}" onclick="setNutritionPlanOffset(${value})">${signedKcal(value)}</button>`).join('')}</div></div></div>`
  };
  window.setNutritionPlanOffset=function(value){
    const ps=planState(),cfg=NUTRITION_MODES[ps.mode],next=clamp(Number(value)||0,cfg.min,cfg.max);
    ps.baseOffset=next;ps.amountOverrides={};
    saveState(true);closeModal();renderAll();showView('Food')
  };

  window.selectNutritionPlanDate=function(date){
    document.getElementById('selectedDate').value=date;renderAll();showView('Food')
  };
  window.addNutritionPlanMeal=function(date,meal){
    if(!inPlan(date))return;
    if(loggedMealFoods(date,meal).length&&!slotLogged(date,meal)){toast('Esta comida ya tiene alimentos registrados; edítalos en el registro del día');return;}
    const ps=planState();
    if(OPTIONAL_MEALS.includes(meal)&&!optionalMealActive(date,meal)){
      if(!ps.optionalMeals[date])ps.optionalMeals[date]={};
      ps.optionalMeals[date][meal]=true;
      clearFlexibleOverrides(date,meal)
    }
    if(isMealSkipped(date,meal)){
      if(!ps.skippedMeals[date])ps.skippedMeals[date]={};
      delete ps.skippedMeals[date][meal]
    }
    const chosen=selectedOption(date,meal);
    const row=meal==='Almuerzo'&&chosen?.workMenu?{meal,option:chosen,...standardTupperPlan(chosen)}:mealPlan(date,meal);if(!row||row.skipped||row.optionalInactive)return;
    const slot=planSlotId(date,meal);
    state.foods=state.foods.filter(item=>item.planSlotId!==slot);
    const groupId=`plan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
    row.items.forEach(([foodKey,inputAmount],index)=>{
      const meta=foodInputMeta(foodKey),amount=toStoredFoodAmount(foodKey,inputAmount);
      state.foods.push({id:`${groupId}_${index}`,created:Date.now()+index,date,meal,foodKey,planBaseFoodKey:basePlanFoodKey(foodKey),amount,displayAmount:inputAmount,displayUnit:meta.inputUnit,dishGroupId:groupId,dishName:row.option.name,workMenu:!!row.option.workMenu,planSlotId:slot});
    });
    clearFlexibleOverrides(date,meal);
    saveState();renderAll();showView('Food');toast(`${row.option.name} añadido`)
  };
  window.setNutritionPlanMealIntended=function(date,meal){
    if(!inPlan(date)||!OPTIONAL_MEALS.includes(meal))return;
    const ps=planState();if(!ps.optionalMeals[date])ps.optionalMeals[date]={};
    ps.optionalMeals[date][meal]=true;
    if(ps.skippedMeals[date])delete ps.skippedMeals[date][meal];
    saveState(true);renderAll();showView('Food');
    toast(meal==='Post-entreno'?(loggedMealFoods(date,'Cena').length?'Postentreno previsto; tu cena registrada se mantiene':'Postentreno reservado · cena recalculada'):'Comida prevista · cantidades recalculadas')
  };
  window.removeNutritionPlanMeal=function(date,meal){
    const slot=planSlotId(date,meal);
    const before=state.foods.length;
    state.foods=state.foods.filter(item=>item.planSlotId!==slot);
    if(state.foods.length===before){toast('No había ningún registro que eliminar');return}
    clearFlexibleOverrides(date);
    saveState();renderAll();showView('Food');toast('Registro deshecho')
  };
  window.markNutritionPlanMealNotDone=function(date,meal){
    if(loggedMealFoods(date,meal).length&&!slotLogged(date,meal)){toast('Hay un consumo real registrado: edítalo o elimínalo primero');return;}
    const slot=planSlotId(date,meal);
    state.foods=state.foods.filter(item=>item.planSlotId!==slot);
    const ps=planState();if(!ps.skippedMeals[date])ps.skippedMeals[date]={};
    ps.skippedMeals[date][meal]=true;
    if(meal==='Desayuno'||FLEXIBLE_MEALS.includes(meal))clearFlexibleOverrides(date,meal);
    saveState();renderAll();showView('Food')
  };

  window.openNutritionPlanMealOptions=function(date,meal){
    const options=OPTIONS[meal]||[],selected=selectedOptionId(date,meal),current=mealPlan(date,meal);
    const previewShare=meal==='Media mañana'?MEDIA_MORNING_SHARE:BASE_SHARES[meal];
    const previewTarget=OPTIONAL_MEALS.includes(meal)&&!optionalMealActive(date,meal)?{kcal:(targetFor(date).kcal||0)*previewShare.kcal,protein:(targetFor(date).protein||0)*previewShare.protein}:null;
    const records=loggedMealFoods(date,meal);
    const editableItems=current?(current.items||[]).map(item=>[...item]):[];
    if(current&&!records.length){
      [...(current.option.fixed||[]),...(current.option.vars||[])].forEach(([baseKey])=>{
        const key=planFoodKey(baseKey);if(!editableItems.some(([existing])=>existing===key))editableItems.push([key,0])
      })
    }
    const amounts=current&&!current.skipped&&!current.option.workMenu?`<div class="nutrition-plan-amount-editor"><div class="eyebrow">Cantidades ${records.length?'del consumo registrado':'previstas para este día'}</div>${editableItems.map(([key,amount],i)=>{const meta=foodInputMeta(key);return `<label><span><strong>${esc(planFoodDisplayName(key))}</strong><small>${esc(meta.reference)}</small></span><span class="nutrition-plan-amount-control"><input id="planAmount_${i}" data-food-key="${esc(key)}" data-record-id="${esc(records[i]?.id||'')}" inputmode="decimal" value="${amount}" oninput="previewNutritionPlanMealAmounts()"><b>${esc(meta.inputUnit)}</b></span></label>`}).join('')}<div id="planAmountsPreview" role="status" aria-live="polite"></div><p class="subtitle">${records.length?'Guardar corrige esta comida registrada y recalcula lo pendiente.':'Guardar mantiene estas cantidades y recalcula las comidas posteriores. «Reajustar resto» devuelve las cantidades pendientes al cálculo automático.'}</p><button type="button" class="btn secondary" onclick="saveNutritionPlanMealAmounts('${date}','${meal}')">Guardar cantidades</button></div>`:'';
    document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row between"><div><div class="eyebrow">${esc(meal)}</div><div class="hero-title">Ajustar comida</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>${amounts}<div class="nutrition-plan-option-title">Cambiar plato</div><div class="nutrition-plan-option-list">${options.map(option=>{const fitted=fitOption(date,meal,option,previewTarget);return `<button type="button" class="nutrition-plan-option ${option.id===selected?'active':''}" onclick="chooseNutritionPlanMeal('${date}','${meal}','${option.id}')"><span><strong>${esc(option.name)}</strong><small>${esc(itemSummary(fitted.items))}</small></span><em>${Math.round(fitted.nutrition.kcal)} kcal · ${Math.round(fitted.nutrition.p)} g proteína</em></button>`}).join('')}</div></div></div>`
    previewNutritionPlanMealAmounts();
  };
  window.previewNutritionPlanMealAmounts=function(){
    const root=document.getElementById('planAmountsPreview');if(!root)return;
    const inputs=[...document.querySelectorAll('[id^="planAmount_"]')],items=inputs.map(input=>[input.dataset.foodKey,parseLocaleNumber(input.value)]);
    if(items.some(([,amount])=>!Number.isFinite(amount)||amount<0)){root.textContent='Revisa las cantidades';return;}
    const n=sumNutrition(items);
    root.textContent=`Vista previa · ${Math.round(n.kcal)} kcal · ${Number(n.p.toFixed(1))} g proteína · ${Number(n.c.toFixed(1))} g carbohidratos · ${Number(n.f.toFixed(1))} g grasas`;
  };
  window.saveNutritionPlanMealAmounts=function(date,meal){
    const option=selectedOption(date,meal),inputs=[...document.querySelectorAll('[id^="planAmount_"]')];
    if(!option||!inputs.length)return;
    const amounts={};
    for(const input of inputs){
      const n=parseLocaleNumber(input.value);if(!Number.isFinite(n)||n<0){toast('Revisa las cantidades');return}
      amounts[input.dataset.foodKey]=n
    }
    const ps=planState();
    if(loggedMealFoods(date,meal).length){
      const edits=inputs.map(input=>({item:state.foods.find(f=>f.id===input.dataset.recordId&&f.date===date&&f.meal===meal),amount:parseLocaleNumber(input.value)}));
      if(edits.some(edit=>!edit.item)){toast('El registro ha cambiado; vuelve a abrir Ajustar');return;}
      edits.forEach(({item,amount})=>{item.amount=toStoredFoodAmount(item.foodKey,amount);item.displayAmount=amount;item.displayUnit=foodInputMeta(item.foodKey).inputUnit});
      clearFlexibleOverrides(date,meal);
      saveState();closeModal();renderAll();showView('Food');toast('Consumo actualizado · resto recalculado');return;
    }
    if(!ps.amountOverrides[date])ps.amountOverrides[date]={};
    ps.amountOverrides[date][meal]={optionId:option.id,amounts};
    if(OPTIONAL_MEALS.includes(meal)){
      if(!ps.optionalMeals[date])ps.optionalMeals[date]={};ps.optionalMeals[date][meal]=true;
    }
    saveState(true);closeModal();renderAll();showView('Food');toast('Cantidades actualizadas')
  };
  window.chooseNutritionPlanMeal=function(date,meal,optionId){
    const ps=planState();if(!ps.overrides[date])ps.overrides[date]={};
    ps.overrides[date][meal]=optionId;
    if(meal==='Media mañana'&&!ps.optionalMeals?.[date]?.[meal]){
      if(!ps.optionalMeals[date])ps.optionalMeals[date]={};
      ps.optionalMeals[date][meal]=true
    }
    if(ps.amountOverrides?.[date])delete ps.amountOverrides[date][meal];
    clearFlexibleOverrides(date,meal);
    saveState(true);closeModal();renderAll();showView('Food')
  };
  window.toggleNutritionPlanMealSkipped=function(date,meal){
    if(slotLogged(date,meal)){toast('Ya está registrada');return}
    const ps=planState();if(!ps.skippedMeals[date])ps.skippedMeals[date]={};
    const next=!ps.skippedMeals[date][meal];
    if(next)ps.skippedMeals[date][meal]=true;else delete ps.skippedMeals[date][meal];
    if(!next&&TUPPER_MEALS.includes(meal)){
      const slot=postTupperSlotId(date,meal);
      state.foods=state.foods.filter(item=>item.planSlotId!==slot);
      if(Array.isArray(ps.postTupperExtras?.[date]))ps.postTupperExtras[date]=ps.postTupperExtras[date].filter(x=>x!==meal)
    }
    if(meal==='Media mañana'&&!optionalMealActive(date,meal)&&!next){
      if(!ps.optionalMeals[date])ps.optionalMeals[date]={};
      ps.optionalMeals[date][meal]=true
    }
    if(meal==='Desayuno'||FLEXIBLE_MEALS.includes(meal))clearFlexibleOverrides(date,meal);
    saveState(true);renderAll();showView('Food')
  };
  window.addSkippedTupperToPost=function(date,meal){
    if(!TUPPER_MEALS.includes(meal)||!isMealSkipped(date,meal))return;
    const option=selectedOption(date,meal);if(!option||option.workMenu)return;
    const ps=planState();if(!Array.isArray(ps.postTupperExtras[date]))ps.postTupperExtras[date]=[];
    if(!ps.postTupperExtras[date].includes(meal))ps.postTupperExtras[date].push(meal);
    const slot=postTupperSlotId(date,meal);
    state.foods=state.foods.filter(item=>item.planSlotId!==slot);
    const plan=standardTupperPlan(option),groupId=`post_tupper_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
    plan.items.forEach(([foodKey,inputAmount],index)=>{
      const meta=foodInputMeta(foodKey),amount=toStoredFoodAmount(foodKey,inputAmount);
      state.foods.push({id:`${groupId}_${index}`,created:Date.now()+index,date,meal:'Post-entreno',foodKey,planBaseFoodKey:basePlanFoodKey(foodKey),amount,displayAmount:inputAmount,displayUnit:meta.inputUnit,dishGroupId:groupId,dishName:option.name,planSlotId:slot})
    });
    saveState();renderAll();showView('Food');toast('Táper añadido al post-entreno')
  };
  window.removeSkippedTupperFromPost=function(date,meal){
    const ps=planState(),slot=postTupperSlotId(date,meal);
    state.foods=state.foods.filter(item=>item.planSlotId!==slot);
    if(Array.isArray(ps.postTupperExtras?.[date]))ps.postTupperExtras[date]=ps.postTupperExtras[date].filter(x=>x!==meal);
    saveState();renderAll();showView('Food')
  };
  window.toggleNutritionPlanPost=function(date){
    window.toggleNutritionPlanMealSkipped(date,'Post-entreno')
  };
  window.rebalanceNutritionPlanDay=function(date){
    clearFlexibleOverrides(date);
    saveState(true);renderAll();showView('Food');toast('Resto del día reajustado')
  };

  function cookingMeals(start,days){
    const out=[];
    const safeDays=Math.max(1,Math.min(7,Math.round(Number(days)||7)));
    for(let offset=0;offset<safeDays;offset++){
      const date=addDaysISO(start,offset);if(!inPlan(date))break;
      ['Almuerzo','Cena'].forEach(meal=>{
        const row=mealPlan(date,meal);
        if(!row||row.option.workMenu||row.skipped||row.optionalInactive||slotLogged(date,meal))return;
        out.push({date,meal,...row})
      })
    }
    return out
  }
  function cookingDishRows(start,days){
    const map=new Map();
    cookingMeals(start,days).forEach(row=>{
      const key=row.option.name;
      if(!map.has(key))map.set(key,{name:row.option.name,count:0,dates:[]});
      const entry=map.get(key);entry.count+=1;entry.dates.push(row.date)
    });
    return [...map.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'es'))
  }
  function cookingIngredientRows(start,days){
    const map=new Map();
    cookingMeals(start,days).forEach(row=>{
      row.items.forEach(([foodKey,inputAmount])=>{
        const db=foodRecord(foodKey),meta=foodInputMeta(foodKey);if(!db||!meta)return;
        const baseKey=basePlanFoodKey(foodKey),baseDb=FOOD_DB[baseKey]||db;
        const key=`${baseKey}|${meta.inputUnit}`;
        if(!map.has(key))map.set(key,{foodKey:baseKey,name:baseDb.name,cat:baseDb.cat,unit:meta.inputUnit,total:0,uses:0,portions:[],dishes:new Set()});
        const entry=map.get(key);entry.total+=inputAmount;entry.uses+=1;entry.portions.push(inputAmount);entry.dishes.add(row.option.name)
      })
    });
    return [...map.values()].sort((a,b)=>{
      const order={'Proteína':0,'Carbohidrato':1,'Verdura':2,'Extra':3,'Lácteo':4,'Fruta':5,'Suplemento':6};
      return (order[a.cat]??9)-(order[b.cat]??9)||a.name.localeCompare(b.name,'es')
    })
  }
  function prepAmount(value,unit){
    if(unit==='g'&&value>=1000)return `${Number((value/1000).toFixed(2))} kg`;
    if(unit==='ml'&&value>=1000)return `${Number((value/1000).toFixed(2))} L`;
    const n=Number.isInteger(value)?value:Number(value.toFixed(1));
    return `${n} ${unit}`
  }
  function portionRangeText(portions,unit,factor=1){
    const values=(portions||[]).map(value=>value*factor).filter(Number.isFinite);
    if(!values.length)return '';
    const min=Math.min(...values),max=Math.max(...values);
    return Math.abs(max-min)<.01?prepAmount(min,unit):`${prepAmount(min,unit)}–${prepAmount(max,unit)}`
  }
  function cookingIngredientMeta(row){
    const yieldInfo=COOKING_YIELDS[row.foodKey];
    if(yieldInfo&&row.unit==='g'){
      const cooked=row.total*yieldInfo.factor,cookedRange=portionRangeText(row.portions,'g',yieldInfo.factor);
      return `${row.uses} raciones · ≈ ${prepAmount(cooked,'g')} ${yieldInfo.label} · ≈ ${cookedRange}/ración`
    }
    return `${row.uses} raciones · ${portionRangeText(row.portions,row.unit)}/ración`
  }
  function cookingResultsHTML(start,days){
    const safeDays=Math.max(1,Math.min(7,Math.round(Number(days)||7)));
    const meals=cookingMeals(start,safeDays),dishes=cookingDishRows(start,safeDays),ingredients=cookingIngredientRows(start,safeDays);
    if(!meals.length)return '<div class="nutrition-plan-empty">No hay almuerzos o cenas pendientes en ese intervalo.</div>';
    const actualDays=Math.max(1,Math.min(safeDays,Math.floor((dateObj(PLAN_END)-dateObj(start))/86400000)+1));
    const end=addDaysISO(start,actualDays-1);
    const dishHTML=dishes.map(row=>`<div class="cooking-dish-row"><strong>${row.count} × ${esc(row.name)}</strong></div>`).join('');
    let currentCat='';
    const ingredientHTML=ingredients.map(row=>{
      const heading=row.cat!==currentCat?(currentCat=row.cat,`<div class="cooking-section-label">${esc(row.cat)}</div>`):'';
      return `${heading}<div class="cooking-ingredient-row"><div><strong>${esc(row.name)}</strong><small>${esc(cookingIngredientMeta(row))}</small></div><b>${esc(prepAmount(row.total,row.unit))}</b></div>`
    }).join('');
    return `<div class="cooking-range">${esc(shoppingDateLabel(start))} → ${esc(shoppingDateLabel(end))}</div><div class="cooking-summary"><div><span>Táperes</span><strong>${meals.length}</strong></div><div><span>Recetas</span><strong>${dishes.length}</strong></div><div><span>Días</span><strong>${actualDays}</strong></div></div><div class="cooking-block"><div class="eyebrow">Táperes</div>${dishHTML}</div><div class="cooking-block"><div class="eyebrow">Preparar</div>${ingredientHTML}</div>`
  }
  window.openNutritionCookingPlan=function(){
    const start=inPlan(currentDate())?currentDate():PLAN_START;
    document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet shopping-sheet cooking-sheet"><div class="row between shopping-head"><div><div class="eyebrow">Meal prep</div><div class="hero-title">Cocinar para varios días</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="shopping-controls cooking-controls"><label><span>Desde</span><span class="shopping-control-input"><input id="cookStart" type="date" min="${PLAN_START}" max="${PLAN_END}" value="${start}"></span></label><label><span>Días</span><span class="shopping-control-input"><input id="cookDays" inputmode="numeric" type="number" min="1" max="7" value="7"></span></label></div><div class="quickchips"><button type="button" class="chip" onclick="document.getElementById('cookDays').value=3;refreshNutritionCookingPlan()">3 días</button><button type="button" class="chip" onclick="document.getElementById('cookDays').value=5;refreshNutritionCookingPlan()">5 días</button><button type="button" class="chip" onclick="document.getElementById('cookDays').value=7;refreshNutritionCookingPlan()">7 días</button></div><div class="actions"><button type="button" class="btn" onclick="refreshNutritionCookingPlan()">Calcular preparación</button></div><div id="cookingResults">${cookingResultsHTML(start,7)}</div></div></div>`
  };
  window.refreshNutritionCookingPlan=function(){
    const start=document.getElementById('cookStart')?.value||PLAN_START;
    const days=Math.max(1,Math.min(7,Math.round(Number(document.getElementById('cookDays')?.value)||7)));
    const input=document.getElementById('cookDays');if(input)input.value=days;
    const root=document.getElementById('cookingResults');if(root)root.innerHTML=cookingResultsHTML(start,days)
  };

  function shoppingRows(start,days){
    const map=new Map();
    for(let offset=0;offset<days;offset++){
      const date=addDaysISO(start,offset);if(!inPlan(date))break;
      dayPlan(date).forEach(row=>{
        if(row.skipped||row.optionalInactive)return;
        row.items.forEach(([foodKey,inputAmount])=>{
          const meta=foodInputMeta(foodKey),db=foodRecord(foodKey);
          if(!db)return;
          const baseKey=basePlanFoodKey(foodKey),baseDb=FOOD_DB[baseKey]||db;
          const unit=meta.inputUnit,key=`${baseKey}|${unit}`;
          if(!map.has(key))map.set(key,{foodKey:baseKey,name:baseDb.name,cat:baseDb.cat,unit,total:0,uses:0,dishes:new Set()});
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
  function shoppingDateLabel(date){
    return dateObj(date).toLocaleDateString('es-ES',{day:'numeric',month:'short'}).replace('.','')
  }
  function shoppingResultsHTML(start,days){
    const rows=shoppingRows(start,days);
    const actualDays=Math.max(0,Math.min(days,Math.floor((dateObj(PLAN_END)-dateObj(start))/86400000)+1));
    const end=actualDays>0?addDaysISO(start,actualDays-1):start;
    if(!rows.length)return '<div class="nutrition-plan-empty">No hay días del plan en ese intervalo.</div>';
    let lastCat='';
    return `<div class="shopping-range">${esc(shoppingDateLabel(start))} → ${esc(shoppingDateLabel(end))}</div><div class="shopping-list">${rows.map(row=>{
      const heading=row.cat!==lastCat?(lastCat=row.cat,`<div class="shopping-category">${esc(row.cat)}</div>`):'';
      const dishText=[...row.dishes].slice(0,2).join(' · ');
      return `${heading}<div class="shopping-row"><div><strong>${esc(row.name)}</strong><small>${row.uses} usos${dishText?` · ${esc(dishText)}`:''}</small></div><b>${esc(shoppingAmount(row))}</b></div>`
    }).join('')}</div>`
  }
  window.openNutritionShoppingList=function(){
    const start=inPlan(currentDate())?currentDate():PLAN_START;
    document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet shopping-sheet"><div class="row between shopping-head"><div><div class="eyebrow">Compra</div><div class="hero-title">Compra para varios días</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="shopping-controls"><label><span>Desde</span><span class="shopping-control-input"><input id="shopStart" type="date" min="${PLAN_START}" max="${PLAN_END}" value="${start}"></span></label><label><span>Días</span><span class="shopping-control-input"><input id="shopDays" inputmode="numeric" type="number" min="1" max="36" value="7"></span></label></div><div class="quickchips"><button type="button" class="chip" onclick="document.getElementById('shopDays').value=3;refreshNutritionShoppingList()">3 días</button><button type="button" class="chip" onclick="document.getElementById('shopDays').value=5;refreshNutritionShoppingList()">5 días</button><button type="button" class="chip" onclick="document.getElementById('shopDays').value=7;refreshNutritionShoppingList()">7 días</button><button type="button" class="chip" onclick="document.getElementById('shopDays').value=14;refreshNutritionShoppingList()">14 días</button></div><div class="actions"><button type="button" class="btn" onclick="refreshNutritionShoppingList()">Calcular compra</button></div><div id="shoppingResults">${shoppingResultsHTML(start,7)}</div></div></div>`
  };
  window.refreshNutritionShoppingList=function(){
    const start=document.getElementById('shopStart')?.value||PLAN_START;
    const days=Math.max(1,Math.min(36,Math.round(Number(document.getElementById('shopDays')?.value)||7)));
    const root=document.getElementById('shoppingResults');if(root)root.innerHTML=shoppingResultsHTML(start,days)
  };

  window.nutritionPlanHTML=nutritionPlanHTML;
  window.nutritionPlanTarget=targetFor;
  window.nutritionPlanDayRows=dayPlan;
  window.nutritionPlanDayNutrition=dayPlanNutrition;

  renderAll();
})();
