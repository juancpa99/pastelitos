(function(){
  'use strict';

  if(typeof FOOD_DB==='undefined'||typeof MEAL_FOOD_KEYS==='undefined')return;

  // Weight convention used throughout MAREVO:
  // - rice: dry weight, before cooking
  // - pasta, potato and lentils: cooked weight
  // - meat, poultry, fresh fish and vegetables: raw weight, before cooking
  // - packaged/processed foods: direct edible weight as indicated
  // Generic nutrition values are expressed per 100 g in the SAME state used for weighing.

  FOOD_DB.rice={
    cat:'Carbohidrato',
    name:'Arroz (en seco)',
    unit:'g',
    ref:'peso en seco, antes de cocinar',
    kcal:360,
    p:7,
    c:79,
    f:0.6
  };

  FOOD_DB.pasta={
    cat:'Carbohidrato',
    name:'Pasta cocida',
    unit:'g',
    ref:'peso cocido',
    kcal:158,
    p:5.8,
    c:30.9,
    f:0.9
  };

  FOOD_DB.potato={
    cat:'Carbohidrato',
    name:'Patata cocida',
    unit:'g',
    ref:'peso cocido',
    kcal:87,
    p:1.9,
    c:20.1,
    f:0.1
  };

  FOOD_DB.chicken={
    cat:'Proteína',
    name:'Pechuga de pollo',
    unit:'g',
    ref:'peso crudo, antes de cocinar',
    kcal:120,
    p:22.5,
    c:0,
    f:2.6
  };

  FOOD_DB.turkey={
    cat:'Proteína',
    name:'Pavo',
    unit:'g',
    ref:'peso crudo, antes de cocinar',
    kcal:114,
    p:23.7,
    c:0,
    f:1.2
  };

  FOOD_DB.beef={
    cat:'Proteína',
    name:'Ternera magra',
    unit:'g',
    ref:'peso crudo, antes de cocinar',
    kcal:150,
    p:21.5,
    c:0,
    f:7
  };

  FOOD_DB.whitefish={
    cat:'Proteína',
    name:'Pescado blanco',
    unit:'g',
    ref:'peso crudo, antes de cocinar',
    kcal:82,
    p:18,
    c:0,
    f:0.7
  };

  FOOD_DB.salmon={
    cat:'Proteína',
    name:'Salmón',
    unit:'g',
    ref:'peso crudo, antes de cocinar',
    kcal:208,
    p:20.4,
    c:0,
    f:13.4
  };

  FOOD_DB.tuna={
    cat:'Proteína',
    name:'Atún fresco',
    unit:'g',
    ref:'peso crudo, antes de cocinar',
    kcal:109,
    p:24.4,
    c:0,
    f:0.5
  };

  FOOD_DB.veg={
    cat:'Verdura',
    name:'Verduras variadas',
    unit:'g',
    ref:'peso crudo, parte comestible, antes de cocinar',
    kcal:35,
    p:2,
    c:5,
    f:0.3
  };

  FOOD_DB.ham_york_90={
    cat:'Proteína',
    name:'Jamón cocido extra (≥90% jamón)',
    unit:'g',
    ref:'peso directo; valores aproximados, revisa la etiqueta de tu marca',
    kcal:106,
    p:19,
    c:1,
    f:2.8
  };

  FOOD_DB.chicken_thigh={
    cat:'Proteína',
    name:'Filetes de contramuslo de pollo',
    unit:'g',
    ref:'peso crudo, sin piel, antes de cocinar',
    kcal:144,
    p:19.7,
    c:0,
    f:7
  };

  if(typeof FOOD_INPUT_META!=='undefined'){
    FOOD_INPUT_META.rice={inputUnit:'g',presets:[50,75,100,125],reference:'peso en seco, antes de cocinar'};
    FOOD_INPUT_META.pasta={inputUnit:'g',presets:[100,150,200,250],reference:'peso cocido'};
    FOOD_INPUT_META.potato={inputUnit:'g',presets:[200,300,400,500],reference:'peso cocido'};
    FOOD_INPUT_META.chicken={inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'};
    FOOD_INPUT_META.turkey={inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'};
    FOOD_INPUT_META.beef={inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'};
    FOOD_INPUT_META.whitefish={inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'};
    FOOD_INPUT_META.salmon={inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'};
    FOOD_INPUT_META.tuna={inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, antes de cocinar'};
    FOOD_INPUT_META.veg={inputUnit:'g',presets:[100,150,200,300],reference:'peso crudo, parte comestible, antes de cocinar'};
    FOOD_INPUT_META.ham_york_90={inputUnit:'g',presets:[30,50,80,100],reference:'peso directo'};
    FOOD_INPUT_META.chicken_thigh={inputUnit:'g',presets:[100,150,200,250],reference:'peso crudo, sin piel, antes de cocinar'};
  }

  function addMealFood(meal,key,afterKey){
    const list=MEAL_FOOD_KEYS[meal];
    if(!Array.isArray(list)||list.includes(key))return;
    const index=afterKey?list.indexOf(afterKey):-1;
    if(index>=0)list.splice(index+1,0,key);
    else list.push(key);
  }

  addMealFood('Desayuno','ham_york_90','egg');
  addMealFood('Merienda','ham_york_90','turkey');
  addMealFood('Almuerzo','chicken_thigh','chicken');
  addMealFood('Cena','chicken_thigh','chicken');
})();
