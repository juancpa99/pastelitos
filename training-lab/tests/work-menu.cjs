const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function boot(saved){
 const dom=new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g,''),{url:'https://example.test/training-lab/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,doc=w.document,run=code=>vm.runInContext(code,dom.getInternalVMContext());
 w.matchMedia=()=>({matches:false,addEventListener(){}});w.ResizeObserver=class{observe(){}};w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 if(saved)w.localStorage.setItem('training_lab_v4',saved);
 for(const m of html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g))run(fs.readFileSync(path.join(root,m[1]),'utf8'));
 run(`document.getElementById('selectedDate').value='2026-10-06';state.settings.nutritionGoals={kcal:2390,p:136,c:280,f:70};renderAll();showView('Food')`);
 return {dom,doc,run};
}
const {dom,doc,run}=boot();
const rows=()=>JSON.parse(run(`JSON.stringify(nutritionPlanDayRows('2026-10-06'))`));
const totals=()=>JSON.parse(run(`JSON.stringify(nutritionPlanDayNutrition('2026-10-06'))`));
try{
 run(`setNutritionPlanMealIntended('2026-10-06','Merienda');setNutritionPlanMealIntended('2026-10-06','Post-entreno')`);
 for(let d=5;d<=9;d++){
  const menu=run(`marevoWorkMenuForDate('2026-10-0${d}')`);
  assert.equal(menu.first.length,3);assert.equal(menu.second.length,3);assert.equal(menu.healthy.length,2);
 }
 assert.equal(run(`marevoWorkMenuForDate('2026-10-10')`),null);
 assert.equal(run(`marevoWorkMenuForDate('2026-10-12')`),null);
 run(`addNutritionPlanMeal('2026-10-06','Desayuno')`);
 const breakfast=run(`JSON.stringify(state.foods.filter(f=>f.meal==='Desayuno'))`);
 const lunchBefore=JSON.stringify(rows().find(r=>r.meal==='Almuerzo'));
 const dinnerBefore=JSON.stringify(rows().find(r=>r.meal==='Cena').items);
 run(`openWorkLunch('2026-10-06');selectWorkLunchCourse('first','cauliflower');selectWorkLunchCourse('second','burger');saveWorkLunch(false)`);
 assert.equal(run(`state.foods.filter(f=>f.meal==='Almuerzo').length`),0,'saving does not log');
 run(`addNutritionPlanMeal('2026-10-06','Almuerzo')`);
 assert.equal(run(`state.foods.filter(f=>f.meal==='Almuerzo').length`),5);
 assert.ok(Math.abs(run(`dayNutrition('2026-10-06').kcal`)-rows().find(r=>r.meal==='Desayuno').nutrition.kcal-1140.5)<.01);
 assert.equal(run(`JSON.stringify(state.foods.filter(f=>f.meal==='Desayuno'))`),breakfast);
 assert.notEqual(JSON.stringify(rows().find(r=>r.meal==='Cena').items),dinnerBefore);
 const lunchSaved=JSON.stringify(rows().find(r=>r.meal==='Almuerzo').items);
 const pendingBefore=rows().filter(r=>['Cena','Post-entreno'].includes(r.meal)).reduce((s,r)=>s+r.nutrition.kcal,0);
 run(`toggleNutritionPlanMealSkipped('2026-10-06','Merienda')`);
 const pendingAfter=rows().filter(r=>['Cena','Post-entreno'].includes(r.meal)).reduce((s,r)=>s+r.nutrition.kcal,0);
 assert.ok(pendingAfter>pendingBefore,'omitted snack moves energy to dinner/post');
 assert.equal(JSON.stringify(rows().find(r=>r.meal==='Almuerzo').items),lunchSaved,'lunch stays fixed');
 assert.equal(run(`JSON.stringify(state.foods.filter(f=>f.meal==='Desayuno'))`),breakfast);
 assert.ok(Math.abs(totals().kcal-2390)<60,JSON.stringify(totals()));
 run(`openWorkLunch('2026-10-06');selectWorkLunchCourse('first','potatoes');saveWorkLunch(true)`);
 assert.equal(run(`state.foods.filter(f=>f.meal==='Almuerzo').length`),5,'update replaces lunch');
 assert.ok(Math.abs(rows().find(r=>r.meal==='Almuerzo').nutrition.kcal-1590.5)<.01,'new lunch uses new selection');
 const restored=boot(dom.window.localStorage.getItem('training_lab_v4'));
 try{assert.equal(restored.run(`state.nutritionPlan.workLunches['2026-10-06'].first.id`),'potatoes');assert.equal(restored.run(`state.foods.filter(f=>f.meal==='Almuerzo').length`),5);}finally{restored.dom.window.close()}
 run(`openWorkLunch('2026-10-07');selectWorkLunchCourse('first','vegetables');selectWorkLunchCourse('second','lasagna');saveWorkLunch(false)`);
 assert.ok(!run(`state.nutritionPlan.workLunches['2026-10-07']`),'inconsistent PDF requires review');
 assert.match(doc.getElementById('workMenuWarning').textContent,/incoher/i);
 run(`document.getElementById('workMenuReviewed').checked=true;saveWorkLunch(false)`);
 assert.equal(run(`state.nutritionPlan.workLunches['2026-10-07'].first.p`),65,'PDF never silently changed');
 run(`openWorkLunch('2026-10-08');setWorkLunchMode('healthy')`);
 assert.equal(doc.querySelectorAll('.work-menu-course select').length,0,'healthy menu indivisible');
 assert.match(doc.querySelector('.work-menu-sheet').textContent,/estimaciones editables/);
 console.log('Work menu, estimates, replacement, skipped snack, rebalance and persistence passed.');
}finally{dom.window.close()}
const generic=boot();
try{
 const {run}=generic;
 const row=meal=>JSON.parse(run(`JSON.stringify(nutritionPlanDayRows('2026-10-06').find(r=>r.meal==='${meal}'))`));
 const lunch=JSON.stringify(row('Almuerzo').items),laterBefore=JSON.stringify(row('Cena').items);
 run(`state.foods.push({id:'manual',date:'2026-10-06',meal:'Desayuno',foodKey:'egg',amount:7});renderAll();showView('Food')`);
 assert.equal(row('Desayuno').nutrition.kcal,run(`calcFood(state.foods.find(f=>f.id==='manual')).kcal`));
 assert.notEqual(JSON.stringify(row('Cena').items),laterBefore,'manual food changes subsequent dinner');
 assert.equal(JSON.stringify(row('Almuerzo').items),lunch,'prepared lunch never adapted');
 run(`addNutritionPlanMeal('2026-10-06','Merienda')`);
 const actualSnack=run(`JSON.stringify(state.foods.filter(f=>f.meal==='Merienda'))`);
 run(`state.foods.find(f=>f.id==='manual').amount=10;renderAll()`);
 assert.equal(run(`JSON.stringify(state.foods.filter(f=>f.meal==='Merienda'))`),actualSnack,'logged snack immutable');
 const dinner=JSON.stringify(row('Cena').items);
 run(`state.settings.nutritionGoals.kcal=2900;renderAll()`);
 assert.notEqual(JSON.stringify(row('Cena').items),dinner,'current energy target used');
 assert.equal(JSON.stringify(row('Almuerzo').items),lunch);
 console.log('Generic manual food, logged meal preservation, fixed lunch and new calorie goal passed.');
}finally{generic.dom.window.close()}
const optional=boot();
try{
 const {run,doc}=optional;
 const row=meal=>JSON.parse(run(`JSON.stringify(nutritionPlanDayRows('2026-10-06').find(r=>r.meal==='${meal}'))`));
 for(const meal of ['Media mañana','Merienda','Post-entreno']){
  assert.ok(row(meal).optionalInactive,`${meal} not compulsory or assumed consumed`);
  assert.match(doc.querySelector(`[data-plan-meal="${meal}"]`).textContent,/No consumido/);
 }
 run(`addNutritionPlanMeal('2026-10-06','Desayuno');addNutritionPlanMeal('2026-10-06','Almuerzo')`);
 const dinnerBefore=row('Cena').nutrition.kcal,foodCount=run('state.foods.length');
 run(`setNutritionPlanMealIntended('2026-10-06','Post-entreno')`);
 assert.equal(run('state.foods.length'),foodCount,'intent never logs consumption');
 assert.ok(row('Post-entreno').reserved);
 assert.ok(row('Cena').nutrition.kcal<dinnerBefore,'planned post reduces pending dinner');
 const reserved=row('Post-entreno').nutrition.kcal;
 run(`markNutritionPlanMealNotDone('2026-10-06','Post-entreno')`);
 assert.ok(row('Post-entreno').skipped);
 assert.ok(row('Cena').nutrition.kcal>dinnerBefore-reserved/2,'opting out redistributes to pending dinner');
 run(`addNutritionPlanMeal('2026-10-06','Cena')`);
 const dinnerLog=run(`JSON.stringify(state.foods.filter(f=>f.meal==='Cena'))`);
 run(`setNutritionPlanMealIntended('2026-10-06','Post-entreno')`);
 assert.equal(run(`JSON.stringify(state.foods.filter(f=>f.meal==='Cena'))`),dinnerLog,'intent after dinner does not rewrite food');
 assert.equal(row('Cena').nutrition.kcal,run(`state.foods.filter(f=>f.meal==='Cena').reduce((n,f)=>n+calcFood(f).kcal,0)`));
 run(`window.marevoMetabolismEstimate=()=>({complete:true,tdee:2600,weight:62});setNutritionPlanMode('cut')`);
 const cut=run(`nutritionPlanTarget('2026-10-06').kcal`);
 run(`setNutritionPlanMode('maintain')`);const maintain=run(`nutritionPlanTarget('2026-10-06').kcal`);
 run(`setNutritionPlanMode('bulk')`);const bulk=run(`nutritionPlanTarget('2026-10-06').kcal`);
 assert.ok(cut<maintain&&maintain<bulk,'active calorie regime changes target');
 assert.equal(run(`JSON.stringify(state.foods.filter(f=>f.meal==='Cena'))`),dinnerLog);
 console.log('Voluntary meals, intention, post-workout reservation, unchanged logged dinner and calorie regimes passed.');
}finally{optional.dom.window.close()}
const assets=JSON.parse(fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/const ASSETS=(\[[^\n]+\]);/)[1]);
for(const m of html.matchAll(/(?:src|href)="((?:app|work-menu|nutrition-plan)\.(?:js|css)\?v=\d+)"/g))assert.ok(assets.includes('./'+m[1]),`offline asset missing: ${m[1]}`);
