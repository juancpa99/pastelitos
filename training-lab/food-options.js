(function(){
  'use strict';

  if(typeof FOOD_DB==='undefined'||typeof MEAL_FOOD_KEYS==='undefined')return;

  // MAREVO weighing rule: foods that are cooked at home are ALWAYS logged before cooking.
  // Grains, pasta and legumes use dry weight; potatoes, meat, fish and vegetables use raw weight.
  // Ready-to-eat packaged foods use the edible / drained weight shown on their label.
  // Nutrition values must match the same state in which the food is weighed.
  // Generic nutrition values are practical approximations per 100 g/ml unless perUnit=true.

  function setFood(key,data,meta,meals){
    FOOD_DB[key]=data;
    if(typeof FOOD_INPUT_META!=='undefined'&&meta)FOOD_INPUT_META[key]=meta;
    (meals||[]).forEach(meal=>addMealFood(meal,key));
  }
  function addMealFood(meal,key,afterKey){
    const list=MEAL_FOOD_KEYS[meal];
    if(!Array.isArray(list)||list.includes(key))return;
    const index=afterKey?list.indexOf(afterKey):-1;
    if(index>=0)list.splice(index+1,0,key);
    else list.push(key);
  }
  function addQuickMealReplacement(meal,key){
    if(typeof FOOD_QUICK_COMBOS==='undefined')return;
    const combos=FOOD_QUICK_COMBOS[meal]||(FOOD_QUICK_COMBOS[meal]=[]);
    if(combos.some(combo=>combo.items?.some(item=>item?.[0]===key)))return;
    combos.unshift({name:'Sustitutivo Kaiku · 500 ml',items:[[key,500]]});
  }

  // Core foods with the weighing references used by Camilo.
  setFood('rice',{cat:'Carbohidrato',name:'Arroz (en seco)',unit:'g',ref:'peso en seco, antes de cocinar',kcal:360,p:7,c:79,f:.6},
    {inputUnit:'g',presets:[50,75,100,125],reference:'peso en seco, antes de cocinar'},['Almuerzo','Cena']);
  setFood('pasta',{cat:'Carbohidrato',name:'Pasta (en seco)',unit:'g',ref:'peso en seco, antes de cocinar',kcal:371,p:13,c:74.7,f:1.5},
    {inputUnit:'g',presets:[60,80,100,120],reference:'peso en seco, antes de cocinar'},['Almuerzo','Cena']);
  setFood('potato',{cat:'Carbohidrato',name:'Patata cruda',unit:'g',ref:'peso crudo, antes de cocinar',kcal:77,p:2,c:17.5,f:.1},
    {inputUnit:'g',presets:[200,300,400,500],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('chicken',{cat:'Proteína',name:'Pechuga de pollo',unit:'g',ref:'peso crudo, antes de cocinar',kcal:120,p:22.5,c:0,f:2.6},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('turkey',{cat:'Proteína',name:'Pavo',unit:'g',ref:'peso crudo, antes de cocinar',kcal:114,p:23.7,c:0,f:1.2},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena','Merienda']);
  setFood('beef',{cat:'Proteína',name:'Ternera magra',unit:'g',ref:'peso crudo, antes de cocinar',kcal:150,p:21.5,c:0,f:7},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('whitefish',{cat:'Proteína',name:'Pescado blanco',unit:'g',ref:'peso crudo, antes de cocinar',kcal:82,p:18,c:0,f:.7},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('salmon',{cat:'Proteína',name:'Salmón',unit:'g',ref:'peso crudo, antes de cocinar',kcal:208,p:20.4,c:0,f:13.4},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('tuna',{cat:'Proteína',name:'Atún fresco',unit:'g',ref:'peso crudo, antes de cocinar',kcal:109,p:24.4,c:0,f:.5},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('veg',{cat:'Verdura',name:'Verduras variadas',unit:'g',ref:'peso crudo, parte comestible, antes de cocinar',kcal:35,p:2,c:5,f:.3},
    {inputUnit:'g',presets:[100,150,200,300],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);

  // Carbohydrates and legumes. All are weighed before cooking.
  setFood('lentils',{cat:'Carbohidrato',name:'Lentejas (en seco)',unit:'g',ref:'peso en seco, antes de cocinar',kcal:352,p:24.6,c:63.4,f:1.1},
    {inputUnit:'g',presets:[60,80,100,120],reference:'peso en seco, antes de cocinar'},['Almuerzo','Cena']);
  setFood('sweet_potato',{cat:'Carbohidrato',name:'Boniato / batata crudo',unit:'g',ref:'peso crudo, antes de cocinar',kcal:86,p:1.6,c:20.1,f:.1},
    {inputUnit:'g',presets:[200,300,400],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('quinoa',{cat:'Carbohidrato',name:'Quinoa (en seco)',unit:'g',ref:'peso en seco, antes de cocinar',kcal:368,p:14.1,c:64.2,f:6.1},
    {inputUnit:'g',presets:[60,80,100,120],reference:'peso en seco, antes de cocinar'},['Almuerzo','Cena']);
  setFood('couscous',{cat:'Carbohidrato',name:'Cuscús (en seco)',unit:'g',ref:'peso en seco, antes de cocinar',kcal:376,p:12.8,c:77.4,f:.6},
    {inputUnit:'g',presets:[60,80,100,120],reference:'peso en seco, antes de cocinar'},['Almuerzo','Cena']);
  setFood('chickpeas',{cat:'Carbohidrato',name:'Garbanzos (en seco)',unit:'g',ref:'peso en seco, antes de cocinar',kcal:378,p:20.5,c:63,f:6},
    {inputUnit:'g',presets:[60,80,100,120],reference:'peso en seco, antes de cocinar'},['Almuerzo','Cena']);
  setFood('beans',{cat:'Carbohidrato',name:'Alubias / judías (en seco)',unit:'g',ref:'peso en seco, antes de cocinar',kcal:333,p:23.6,c:60,f:.8},
    {inputUnit:'g',presets:[60,80,100,120],reference:'peso en seco, antes de cocinar'},['Almuerzo','Cena']);
  setFood('corn',{cat:'Carbohidrato',name:'Maíz dulce',unit:'g',ref:'peso escurrido',kcal:96,p:3.4,c:21,f:1.5},
    {inputUnit:'g',presets:[50,80,100,150],reference:'peso escurrido'},['Almuerzo','Cena']);
  setFood('wrap',{cat:'Carbohidrato',name:'Tortilla de trigo / wrap',unit:'g',ref:'peso directo; revisa la etiqueta si tu marca difiere',kcal:310,p:8.5,c:52,f:8},
    {inputUnit:'g',presets:[50,60,70,80],reference:'peso directo'},['Desayuno','Almuerzo','Merienda','Cena']);
  setFood('whole_bread',{cat:'Carbohidrato',name:'Pan integral',unit:'g',ref:'peso directo',kcal:247,p:12,c:41,f:4.2},
    {inputUnit:'rebanadas',singular:'rebanada',gramsPerInput:30,presets:[1,2,3,4],reference:'1 rebanada ≈ 30 g'},['Desayuno','Almuerzo','Merienda','Cena','Post-entreno']);

  // Protein sources.
  setFood('chicken_thigh',{cat:'Proteína',name:'Contramuslo de pollo sin piel',unit:'g',ref:'peso crudo, antes de cocinar',kcal:144,p:19.7,c:0,f:7},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, sin piel'},['Almuerzo','Cena']);
  setFood('pork_loin',{cat:'Proteína',name:'Lomo de cerdo',unit:'g',ref:'peso crudo, antes de cocinar',kcal:143,p:21.5,c:0,f:6},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('beef_mince_5',{cat:'Proteína',name:'Carne picada de ternera magra (~5% grasa)',unit:'g',ref:'peso crudo; valores aproximados',kcal:137,p:21.4,c:0,f:5},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('prawns',{cat:'Proteína',name:'Gambas / langostinos',unit:'g',ref:'peso crudo y limpio',kcal:85,p:20,c:0,f:.5},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo y limpio'},['Almuerzo','Cena']);
  setFood('hake',{cat:'Proteína',name:'Merluza',unit:'g',ref:'peso crudo, antes de cocinar',kcal:86,p:17.5,c:0,f:1.8},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('cod',{cat:'Proteína',name:'Bacalao fresco',unit:'g',ref:'peso crudo, antes de cocinar',kcal:82,p:17.8,c:0,f:.7},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'},['Almuerzo','Cena']);
  setFood('tuna_can_natural',{cat:'Proteína',name:'Atún al natural (lata)',unit:'g',ref:'peso escurrido',kcal:116,p:26,c:0,f:1},
    {inputUnit:'g',presets:[60,80,120,160],reference:'peso escurrido'},['Desayuno','Almuerzo','Merienda','Cena']);
  setFood('sardines',{cat:'Proteína',name:'Sardinas en conserva',unit:'g',ref:'peso escurrido; valores aproximados',kcal:208,p:24.6,c:0,f:11.5},
    {inputUnit:'g',presets:[60,80,100,120],reference:'peso escurrido'},['Almuerzo','Cena']);
  setFood('egg_white',{cat:'Proteína',name:'Claras de huevo',unit:'g',ref:'peso directo',kcal:52,p:10.9,c:.7,f:.2},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso directo'},['Desayuno','Almuerzo','Merienda','Cena']);
  setFood('ham_york_90',{cat:'Proteína',name:'Jamón cocido extra (≥90% jamón)',unit:'g',ref:'peso directo; revisa la etiqueta de tu marca',kcal:106,p:19,c:1,f:2.8},
    {inputUnit:'g',presets:[30,50,80,100],reference:'peso directo'},['Desayuno','Merienda','Cena']);
  setFood('serrano_ham',{cat:'Proteína',name:'Jamón serrano',unit:'g',ref:'peso directo; valores aproximados',kcal:241,p:31,c:.5,f:13},
    {inputUnit:'g',presets:[20,30,40,60],reference:'peso directo'},['Desayuno','Merienda','Cena']);
  setFood('tofu',{cat:'Proteína',name:'Tofu firme',unit:'g',ref:'peso directo',kcal:144,p:17.3,c:2.8,f:8.7},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso directo'},['Almuerzo','Cena']);
  setFood('tempeh',{cat:'Proteína',name:'Tempeh',unit:'g',ref:'peso directo',kcal:195,p:19.9,c:7.6,f:11.4},
    {inputUnit:'g',presets:[100,150,200],reference:'peso directo'},['Almuerzo','Cena']);

  // Dairy.
  setFood('greek_yogurt_0',{cat:'Lácteo',name:'Yogur griego 0%',unit:'g',ref:'peso directo',kcal:59,p:10.3,c:3.6,f:.4},
    {inputUnit:'g',presets:[150,200,250],reference:'peso directo'},['Desayuno','Merienda','Post-entreno']);
  setFood('cottage_cheese',{cat:'Lácteo',name:'Cottage / queso batido granulado',unit:'g',ref:'peso directo',kcal:98,p:11.1,c:3.4,f:4.3},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso directo'},['Desayuno','Merienda','Cena']);
  setFood('fresh_cheese',{cat:'Lácteo',name:'Queso fresco tipo Burgos',unit:'g',ref:'peso directo',kcal:174,p:12.4,c:3,f:12.5},
    {inputUnit:'g',presets:[50,75,100,150],reference:'peso directo'},['Desayuno','Merienda','Cena']);
  setFood('mozzarella_light',{cat:'Lácteo',name:'Mozzarella ligera',unit:'g',ref:'peso directo; revisa la etiqueta de tu marca',kcal:170,p:20,c:3,f:8},
    {inputUnit:'g',presets:[40,60,80,100],reference:'peso directo'},['Almuerzo','Merienda','Cena']);

  // Fruit.
  setFood('strawberries',{cat:'Fruta',name:'Fresas',unit:'g',ref:'peso comestible',kcal:32,p:.7,c:7.7,f:.3},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso comestible'},['Desayuno','Merienda','Post-entreno']);
  setFood('blueberries',{cat:'Fruta',name:'Arándanos',unit:'g',ref:'peso comestible',kcal:57,p:.7,c:14.5,f:.3},
    {inputUnit:'g',presets:[50,80,100,150],reference:'peso comestible'},['Desayuno','Merienda','Post-entreno']);
  setFood('pear',{cat:'Fruta',name:'Pera',unit:'g',ref:'peso comestible',kcal:57,p:.4,c:15.2,f:.1},
    {inputUnit:'g',presets:[120,150,180,200],reference:'peso comestible'},['Desayuno','Almuerzo','Merienda','Cena','Post-entreno']);
  setFood('grapes',{cat:'Fruta',name:'Uvas',unit:'g',ref:'peso comestible',kcal:69,p:.7,c:18.1,f:.2},
    {inputUnit:'g',presets:[100,150,200],reference:'peso comestible'},['Desayuno','Merienda','Post-entreno']);
  setFood('pineapple',{cat:'Fruta',name:'Piña',unit:'g',ref:'peso comestible',kcal:50,p:.5,c:13.1,f:.1},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso comestible'},['Desayuno','Almuerzo','Merienda','Cena','Post-entreno']);
  setFood('mango',{cat:'Fruta',name:'Mango',unit:'g',ref:'peso comestible',kcal:60,p:.8,c:15,f:.4},
    {inputUnit:'g',presets:[100,150,200],reference:'peso comestible'},['Desayuno','Merienda','Post-entreno']);

  // Vegetables: useful when the user wants more precision than "verduras variadas".
  setFood('broccoli',{cat:'Verdura',name:'Brócoli',unit:'g',ref:'peso crudo, parte comestible',kcal:34,p:2.8,c:6.6,f:.4},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo'},['Almuerzo','Cena']);
  setFood('zucchini',{cat:'Verdura',name:'Calabacín',unit:'g',ref:'peso crudo',kcal:17,p:1.2,c:3.1,f:.3},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo'},['Almuerzo','Cena']);
  setFood('pepper',{cat:'Verdura',name:'Pimiento',unit:'g',ref:'peso crudo',kcal:31,p:1,c:6,f:.3},
    {inputUnit:'g',presets:[80,100,150,200],reference:'peso crudo'},['Almuerzo','Cena']);
  setFood('onion',{cat:'Verdura',name:'Cebolla',unit:'g',ref:'peso crudo',kcal:40,p:1.1,c:9.3,f:.1},
    {inputUnit:'g',presets:[50,80,100,150],reference:'peso crudo'},['Almuerzo','Cena']);
  setFood('tomato',{cat:'Verdura',name:'Tomate',unit:'g',ref:'peso crudo',kcal:18,p:.9,c:3.9,f:.2},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo'},['Desayuno','Almuerzo','Merienda','Cena']);
  setFood('spinach',{cat:'Verdura',name:'Espinacas',unit:'g',ref:'peso crudo',kcal:23,p:2.9,c:3.6,f:.4},
    {inputUnit:'g',presets:[50,100,150,200],reference:'peso crudo'},['Almuerzo','Cena']);
  setFood('mushrooms',{cat:'Verdura',name:'Champiñones',unit:'g',ref:'peso crudo',kcal:22,p:3.1,c:3.3,f:.3},
    {inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo'},['Almuerzo','Cena']);
  setFood('carrot',{cat:'Verdura',name:'Zanahoria',unit:'g',ref:'peso crudo',kcal:41,p:.9,c:9.6,f:.2},
    {inputUnit:'g',presets:[80,100,150,200],reference:'peso crudo'},['Almuerzo','Cena']);

  // Fats, toppings and useful extras.
  setFood('avocado',{cat:'Extra',name:'Aguacate',unit:'g',ref:'peso comestible',kcal:160,p:2,c:8.5,f:14.7},
    {inputUnit:'g',presets:[30,50,75,100],reference:'peso comestible'},['Desayuno','Almuerzo','Merienda','Cena']);
  setFood('almonds',{cat:'Extra',name:'Almendras',unit:'g',ref:'peso directo',kcal:579,p:21.2,c:21.6,f:49.9},
    {inputUnit:'g',presets:[15,20,25,30],reference:'peso directo'},['Desayuno','Merienda','Post-entreno']);
  setFood('walnuts',{cat:'Extra',name:'Nueces',unit:'g',ref:'peso directo',kcal:654,p:15.2,c:13.7,f:65.2},
    {inputUnit:'g',presets:[15,20,25,30],reference:'peso directo'},['Desayuno','Merienda']);
  setFood('peanut_butter',{cat:'Extra',name:'Crema de cacahuete',unit:'g',ref:'peso directo; revisa la etiqueta de tu marca',kcal:588,p:25,c:20,f:50},
    {inputUnit:'g',presets:[10,15,20,30],reference:'peso directo'},['Desayuno','Merienda','Post-entreno']);
  setFood('hummus',{cat:'Extra',name:'Hummus',unit:'g',ref:'peso directo; valores aproximados',kcal:166,p:7.9,c:14.3,f:9.6},
    {inputUnit:'g',presets:[30,50,75,100],reference:'peso directo'},['Almuerzo','Merienda','Cena']);
  setFood('honey',{cat:'Extra',name:'Miel',unit:'g',ref:'peso directo',kcal:304,p:.3,c:82.4,f:0},
    {inputUnit:'g',presets:[5,10,15,20],reference:'peso directo'},['Desayuno','Merienda','Post-entreno']);
  setFood('dark_chocolate',{cat:'Extra',name:'Chocolate negro',unit:'g',ref:'peso directo; revisa el % y la etiqueta',kcal:598,p:7.8,c:19,f:52},
    {inputUnit:'g',presets:[10,15,20,30],reference:'peso directo'},['Desayuno','Merienda']);

  // Packaged / convenience options.
  setFood('kaiku_complete_vanilla',{cat:'Suplemento',name:'Kaiku comida completa',unit:'ml',ref:'1 botella = 500 ml; valores de la etiqueta',kcal:100,p:7,c:6.8,f:4.6,saturatedFat:1.8,sugars:4.6,fiber:1.7,salt:.13},
    {inputUnit:'ml',presets:[500],reference:'1 botella = 500 ml · 500 kcal · 35 g proteína · 34 g HC · 23 g grasa'},
    ['Desayuno','Almuerzo','Merienda','Cena','Post-entreno']);

  // Keep the complete drink as a true one-tap replacement.
  ['Desayuno','Almuerzo','Merienda','Cena','Post-entreno'].forEach(meal=>addQuickMealReplacement(meal,'kaiku_complete_vanilla'));

  // Editable meal templates. Amounts use the same input units shown to the user.
  ['whole_bread','ham_york_90','greek_yogurt_0','fresh_cheese','strawberries','blueberries','pear','grapes','pineapple','mango','almonds','walnuts','peanut_butter','avocado','tuna_can_natural'].forEach(key=>addMealFood('Media mañana',key));

  window.MAREVO_DISH_TEMPLATES={
    Desayuno:[
      {name:'Avena, leche y plátano',items:[['oats',60],['milk',250],['banana',1]]},
      {name:'Yogur, avena y frutos rojos',items:[['greek_yogurt_0',250],['oats',50],['strawberries',150]]},
      {name:'Huevos, pan y fruta',items:[['egg',2],['bread',2],['banana',1]]},
      {name:'Pan, pavo y queso fresco',items:[['whole_bread',2],['ham_york_90',60],['fresh_cheese',75]]}
    ],
    'Media mañana':[
      {name:'Yogur griego con plátano',items:[['greek_yogurt_0',200],['banana',1]]},
      {name:'Tostas con pavo',items:[['whole_bread',2],['ham_york_90',60]]},
      {name:'Yogur con frutos rojos',items:[['greek_yogurt_0',200],['strawberries',150]]},
      {name:'Tortitas de arroz con pavo',items:[['rice_cakes',3],['ham_york_90',60]]},
      {name:'Batido de proteína con leche',items:[['whey',25],['milk',250]]}
    ],
    Almuerzo:[
      {name:'Pollo con arroz y verduras',items:[['chicken',180],['rice',75],['veg',200]]},
      {name:'Pollo con pasta y verduras',items:[['chicken',180],['pasta',90],['veg',200]]},
      {name:'Pollo con patatas y verduras',items:[['chicken',180],['potato',350],['veg',200]]},
      {name:'Pavo con arroz y verduras',items:[['turkey',180],['rice',75],['veg',200]]},
      {name:'Ternera con patatas y verduras',items:[['beef',180],['potato',350],['veg',200]]},
      {name:'Salmón con patatas y verduras',items:[['salmon',180],['potato',300],['veg',200]]},
      {name:'Pescado blanco con arroz y verduras',items:[['whitefish',200],['rice',75],['veg',200]]},
      {name:'Lomo con pasta y verduras',items:[['pork_loin',180],['pasta',90],['veg',200]]},
      {name:'Garbanzos, huevo y verduras',items:[['chickpeas',90],['egg',2],['veg',150]]}
    ],
    Merienda:[
      {name:'Yogur, avena y plátano',items:[['greek_yogurt_0',250],['oats',40],['banana',1]]},
      {name:'Pan, pavo y queso fresco',items:[['whole_bread',2],['ham_york_90',60],['fresh_cheese',75]]},
      {name:'Tortitas, pavo y plátano',items:[['rice_cakes',4],['ham_york_90',60],['banana',1]]},
      {name:'Yogur, frutos rojos y almendras',items:[['greek_yogurt_0',250],['strawberries',150],['almonds',20]]},
      {name:'Whey, leche y plátano',items:[['whey',30],['milk',250],['banana',1]]}
    ],
    Cena:[
      {name:'Pollo con arroz y verduras',items:[['chicken',180],['rice',75],['veg',200]]},
      {name:'Pollo con pasta y verduras',items:[['chicken',180],['pasta',90],['veg',200]]},
      {name:'Pollo con patatas y verduras',items:[['chicken',180],['potato',350],['veg',200]]},
      {name:'Pavo con arroz y verduras',items:[['turkey',180],['rice',75],['veg',200]]},
      {name:'Ternera con patatas y verduras',items:[['beef',180],['potato',350],['veg',200]]},
      {name:'Salmón con patatas y verduras',items:[['salmon',180],['potato',300],['veg',200]]},
      {name:'Merluza con arroz y verduras',items:[['hake',200],['rice',75],['veg',200]]},
      {name:'Tofu con arroz y verduras',items:[['tofu',200],['rice',75],['veg',200]]}
    ],
    'Post-entreno':[
      {name:'Whey, leche y plátano',items:[['whey',30],['milk',250],['banana',1]]},
      {name:'Yogur, avena y plátano',items:[['greek_yogurt_0',250],['oats',40],['banana',1]]},
      {name:'Leche, whey y avena',items:[['milk',300],['whey',30],['oats',50]]}
    ]
  };

  // Correct the legacy bread combo: bread input is in slices, not grams.
  if(typeof FOOD_QUICK_COMBOS!=='undefined'){
    const breakfast=FOOD_QUICK_COMBOS.Desayuno||[];
    const eggsBread=breakfast.find(combo=>combo.name==='Huevos + pan');
    if(eggsBread)eggsBread.items=[['egg',2],['bread',2]];
  }
})();
