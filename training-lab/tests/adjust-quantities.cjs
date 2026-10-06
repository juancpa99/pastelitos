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
const row=(meal,date='2026-10-06')=>JSON.parse(run(`JSON.stringify(nutritionPlanDayRows('${date}').find(r=>r.meal==='${meal}'))`));
try{
 run(`setNutritionPlanMealIntended('2026-10-06','Post-entreno');addNutritionPlanMeal('2026-10-06','Desayuno')`);
 const breakfast=run(`JSON.stringify(state.foods.filter(f=>f.meal==='Desayuno'))`),laterBefore=row('Cena').nutrition.kcal;
 const otherLunch=JSON.stringify(row('Almuerzo','2026-10-07').items);
 run(`openNutritionPlanMealOptions('2026-10-06','Almuerzo')`);
 const preview=doc.getElementById('planAmountsPreview').textContent;
 doc.querySelector('[data-food-key="rice"]').value='200,5';
 run(`previewNutritionPlanMealAmounts()`);
 assert.notEqual(doc.getElementById('planAmountsPreview').textContent,preview,'live preview updates');
 assert.ok(!row('Almuerzo').items.some(([key,n])=>key==='rice'&&n===200.5),'preview does not save prematurely');
 run(`saveNutritionPlanMealAmounts('2026-10-06','Almuerzo')`);
 assert.equal(row('Almuerzo').items.find(([key])=>key==='rice')[1],200.5,'manual lunch grams kept');
 assert.equal(JSON.stringify(row('Almuerzo','2026-10-07').items),otherLunch,'other dates unchanged');
 assert.notEqual(row('Cena').nutrition.kcal,laterBefore,'pending dinner recalculated');
 assert.equal(run(`JSON.stringify(state.foods.filter(f=>f.meal==='Desayuno'))`),breakfast);
 run(`setNutritionPlanMealIntended('2026-10-06','Merienda');openNutritionPlanMealOptions('2026-10-06','Merienda')`);
 const yogurt=doc.querySelector('[data-food-key="greek_yogurt_0"]');yogurt.value='123,5';
 run(`saveNutritionPlanMealAmounts('2026-10-06','Merienda')`);
 assert.equal(row('Merienda').items.find(([key])=>key==='greek_yogurt_0')[1],123.5,'optimizer does not overwrite manual snack');
 const saved=dom.window.localStorage.getItem('training_lab_v4'),restored=boot(saved);
 try{assert.equal(restored.run(`nutritionPlanDayRows('2026-10-06').find(r=>r.meal==='Merienda').items.find(([key])=>key==='greek_yogurt_0')[1]`),123.5);}finally{restored.dom.window.close()}
 run(`addNutritionPlanMeal('2026-10-06','Almuerzo');openNutritionPlanMealOptions('2026-10-06','Almuerzo')`);
 const oldDinner=row('Cena').nutrition.kcal,count=run('state.foods.length');
 const rice=doc.querySelector('[data-food-key="rice"]'),recordId=rice.dataset.recordId;assert.ok(recordId);rice.value='150,25';
 run(`saveNutritionPlanMealAmounts('2026-10-06','Almuerzo')`);
 assert.equal(run(`state.foods.find(f=>f.id==='${recordId}').displayAmount`),150.25,'registered input updated in place');
 assert.equal(run('state.foods.length'),count,'no duplicate or unrelated deletion');
 assert.notEqual(row('Cena').nutrition.kcal,oldDinner,'registered lunch edit adjusts dinner');
 assert.equal(run(`JSON.stringify(state.foods.filter(f=>f.meal==='Desayuno'))`),breakfast);
 assert.ok(Math.abs(row('Almuerzo').nutrition.kcal-run(`state.foods.filter(f=>f.meal==='Almuerzo').reduce((s,f)=>s+calcFood(f).kcal,0)`))<.001);
 run(`openNutritionPlanMealOptions('2026-10-06','Almuerzo')`);doc.querySelector('[data-food-key="rice"]').value='-5';
 run(`saveNutritionPlanMealAmounts('2026-10-06','Almuerzo')`);
 assert.equal(run(`state.foods.find(f=>f.id==='${recordId}').displayAmount`),150.25,'invalid input rejected without altering food');
 run(`closeModal();openNutritionPlanMealOptions('2026-10-06','Merienda')`);doc.querySelector('[data-food-key="greek_yogurt_0"]').value='0';
 run(`saveNutritionPlanMealAmounts('2026-10-06','Merienda');openNutritionPlanMealOptions('2026-10-06','Merienda')`);
 assert.equal(doc.querySelector('[data-food-key="greek_yogurt_0"]').value,'0','zero remains editable');
 console.log('Preview, comma decimals, exact saved quantities, date isolation, registered edits, recalculation and reload passed.');
}finally{dom.window.close()}
