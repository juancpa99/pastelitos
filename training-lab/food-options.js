(function(){
  'use strict';

  if(typeof FOOD_DB==='undefined'||typeof MEAL_FOOD_KEYS==='undefined')return;

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
    ref:'peso cocinado, sin piel',
    kcal:209,
    p:26,
    c:0,
    f:11
  };

  if(typeof FOOD_INPUT_META!=='undefined'){
    FOOD_INPUT_META.ham_york_90={inputUnit:'g',presets:[30,50,80,100],reference:'peso directo'};
    FOOD_INPUT_META.chicken_thigh={inputUnit:'g',presets:[100,150,200,250],reference:'peso cocinado, sin piel'};
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
