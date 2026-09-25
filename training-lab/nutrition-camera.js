(function(){
  'use strict';

  const QUALITY_FIELDS=[
    ['sat','Saturadas'],['trans','Trans'],['addedSugars','Azúcares añadidos'],
    ['fiber','Fibra'],['salt','Sal'],['mono','Monoinsaturadas'],['poly','Poliinsaturadas']
  ];
  const SCAN_FIELDS=[
    ['energyKcal','Energía','kcal'],['protein','Proteína','g'],['carbs','Carbohidratos','g'],['fat','Grasas','g'],
    ['saturatedFat','Saturadas','g'],['transFat','Trans','g'],['monounsaturatedFat','Monoinsaturadas','g'],
    ['polyunsaturatedFat','Poliinsaturadas','g'],['sugars','Azúcares','g'],['addedSugars','Azúcares añadidos','g'],
    ['fiber','Fibra','g'],['salt','Sal','g'],['sodiumMg','Sodio','mg']
  ];

  function backend(){
    return String(window.MAREVO_PUSH_BACKEND||'').replace(/\/$/,'')
  }
  function n(value){const x=Number(value);return Number.isFinite(x)&&x>=0?x:null}
  function shown(value){return value==null?'':Number(value.toFixed?.(2)??value)}
  function pluralUnit(name){
    const value=String(name||'unidad').trim().toLowerCase();
    if(value==='rebanada')return 'rebanadas';
    if(value==='unidad')return 'unidades';
    if(value.endsWith('s'))return value;
    return value+'s'
  }
  function derivedKcal(p,c,f){return Math.round(((+p||0)*4+(+c||0)*4+(+f||0)*9)*10)/10}
  function fieldValue(id){const el=document.getElementById(id);if(!el||el.value==='')return null;return n(el.value)}
  function qualityProps(prefix='scan'){
    return {
      sat:fieldValue(prefix+'SaturatedFat'),
      trans:fieldValue(prefix+'TransFat'),
      mono:fieldValue(prefix+'MonounsaturatedFat'),
      poly:fieldValue(prefix+'PolyunsaturatedFat'),
      sugars:fieldValue(prefix+'Sugars'),
      addedSugars:fieldValue(prefix+'AddedSugars'),
      fiber:fieldValue(prefix+'Fiber'),
      salt:fieldValue(prefix+'Salt'),
      sodiumMg:fieldValue(prefix+'SodiumMg')
    }
  }
  function dataUrl(blob){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result||''));
      reader.onerror=()=>reject(reader.error||new Error('No se pudo leer la foto'));
      reader.readAsDataURL(blob)
    })
  }
  async function prepareImage(file){
    const blob=typeof compressPhoto==='function'?await compressPhoto(file):file;
    return await dataUrl(blob)
  }
  function loading(){
    document.getElementById('modalRoot').innerHTML='<div class="modal"><div class="sheet nutrition-scan-loading"><div class="spinner"></div><strong>Analizando…</strong></div></div>'
  }
  async function analyze(file,mode,meal){
    if(!file)return;
    loading();
    try{
      const base=backend();if(!base)throw new Error('backend_missing');
      const imageDataUrl=await prepareImage(file);
      const response=await fetch(base+'/api/nutrition-analyze',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({mode,imageDataUrl})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        if(data?.error==='nutrition_scan_not_configured')throw new Error('not_configured');
        throw new Error(data?.error||'analysis_failed')
      }
      if(mode==='meal')openMealPhotoReview(data,meal||'Merienda');
      else openLabelReview(data,meal||'Desayuno')
    }catch(error){
      document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="row between"><div><div class="eyebrow">Foto</div><div class="hero-title">No se pudo analizar</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div><div class="callout warn">${error?.message==='not_configured'?'El análisis por foto todavía no está configurado en el servidor.':'Prueba de nuevo con la etiqueta completa y bien enfocada.'}</div></div></div>`
    }
  }
  function choosePhoto(mode,meal){
    const input=document.createElement('input');
    input.type='file';input.accept='image/*';input.setAttribute('capture','environment');input.hidden=true;
    input.addEventListener('change',()=>{const file=input.files?.[0];input.remove();if(file)analyze(file,mode,meal)});
    document.body.appendChild(input);input.click()
  }
  function nutrientInputs(data,prefix){
    return `<div class="nutrition-scan-grid">${SCAN_FIELDS.map(([key,label,unit])=>`<label><span>${label}</span><span class="nutrition-scan-input"><input id="${prefix}${key[0].toUpperCase()+key.slice(1)}" inputmode="decimal" value="${shown(data?.[key])}"><b>${unit}</b></span></label>`).join('')}</div>`
  }
  function categoryOptions(selected){
    return ['Carbohidrato','Proteína','Verdura','Fruta','Lácteo','Suplemento','Extra'].map(v=>`<option ${v===selected?'selected':''}>${v}</option>`).join('')
  }
  function openLabelReview(data,meal){
    const basis=data.referenceBasis||'100g',unitName=data.unitName||'',unitWeight=data.unitWeight??'';
    const missingUnit=unitName&&!unitWeight;
    document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet nutrition-scan-sheet">
      <div class="row between"><div><div class="eyebrow">Etiqueta</div><div class="hero-title">Confirmar alimento</div></div><button type="button" class="btn ghost small" onclick="openFoodModal('${esc(meal)}')">Cancelar</button></div>
      <input id="scanMeal" type="hidden" value="${esc(meal)}">
      <div class="formgrid nutrition-scan-main">
        <div class="field wide"><label>Nombre</label><input id="scanName" value="${esc(data.name||'')}"></div>
        <div class="field"><label>Marca</label><input id="scanBrand" value="${esc(data.brand||'')}"></div>
        <div class="field"><label>Categoría</label><select id="scanCategory">${categoryOptions(data.category)}</select></div>
        <div class="field"><label>Valores por</label><select id="scanBasis"><option value="100g" ${basis==='100g'?'selected':''}>100 g</option><option value="100ml" ${basis==='100ml'?'selected':''}>100 ml</option><option value="serving" ${basis==='serving'?'selected':''}>Ración / unidad</option></select></div>
      </div>
      <div class="eyebrow nutrition-scan-section">Macros y etiqueta</div>
      ${nutrientInputs(data,'scan')}
      <div class="nutrition-unit-box ${missingUnit?'needs-input':''}">
        <div class="eyebrow">Unidad habitual</div>
        <div class="formgrid">
          <div class="field"><label>Unidad</label><input id="scanUnitName" placeholder="rebanada, unidad…" value="${esc(unitName)}"></div>
          <div class="field"><label>Peso medio</label><div class="nutrition-scan-input"><input id="scanUnitWeight" inputmode="decimal" placeholder="opcional" value="${shown(unitWeight)}"><b>${esc(data.unitWeightUnit||'g')}</b></div></div>
        </div>
        ${missingUnit?'<small>La etiqueta no indica cuánto pesa una unidad. Puedes introducir el peso medio o dejar el alimento en gramos.</small>':''}
      </div>
      <div class="nutrition-unit-box">
        <div class="eyebrow">Declaraciones</div>
        <div class="formgrid">
          <div class="field"><label>Azúcares añadidos</label><select id="scanAddedSugarStatus"><option value="not_stated" ${data.addedSugarStatus==='not_stated'?'selected':''}>No declarado</option><option value="declared_zero" ${data.addedSugarStatus==='declared_zero'?'selected':''}>Declara 0</option><option value="declared_value" ${data.addedSugarStatus==='declared_value'?'selected':''}>Valor declarado</option><option value="ingredients_indicate_added" ${data.addedSugarStatus==='ingredients_indicate_added'?'selected':''}>Ingredientes indican añadido</option></select></div>
          <div class="field"><label>Grasas trans</label><select id="scanTransFatStatus"><option value="not_stated" ${data.transFatStatus==='not_stated'?'selected':''}>No declarado</option><option value="declared_zero" ${data.transFatStatus==='declared_zero'?'selected':''}>Declara 0</option><option value="declared_value" ${data.transFatStatus==='declared_value'?'selected':''}>Valor declarado</option></select></div>
        </div>
      </div>
      ${(data.warnings||[]).length?`<div class="nutrition-scan-warnings">${data.warnings.map(w=>`<span>${esc(w)}</span>`).join('')}</div>`:''}
      <div class="actions"><button type="button" class="btn" onclick="saveScannedNutritionLabel()">Guardar alimento</button></div>
    </div></div>`
  }
  function scanNutrients(){
    return {
      kcal:fieldValue('scanEnergyKcal'),p:fieldValue('scanProtein'),c:fieldValue('scanCarbs'),f:fieldValue('scanFat'),
      ...qualityProps('scan')
    }
  }
  window.saveScannedNutritionLabel=function(){
    const meal=val('scanMeal')||'Desayuno',name=val('scanName').trim(),brand=val('scanBrand').trim(),basis=val('scanBasis'),cat=val('scanCategory')||'Extra';
    const values=scanNutrients();if(!name||[values.p,values.c,values.f].some(v=>v==null)){toast('Revisa proteína, hidratos y grasas');return}
    if(values.kcal==null)values.kcal=derivedKcal(values.p,values.c,values.f);
    const unitName=val('scanUnitName').trim(),unitWeight=n(val('scanUnitWeight'));
    let perUnit=false,unit=basis==='100ml'?'ml':'g',factor=1,inputMeta=null;
    if(basis==='serving'){
      if(unitWeight&&unitWeight>0){factor=100/unitWeight;unit='g'}
      else{perUnit=true;unit='ud'}
    }
    const scaled={};
    Object.entries(values).forEach(([key,value])=>scaled[key]=value==null?null:value*factor);
    if(unitName&&unitWeight&&!perUnit){
      inputMeta={inputUnit:pluralUnit(unitName),singular:unitName,gramsPerInput:unitWeight,presets:[1,2,3,4],reference:`1 ${unitName} ≈ ${unitWeight} ${unit}`};
    }else if(perUnit){
      inputMeta={inputUnit:pluralUnit(unitName||'unidad'),singular:unitName||'unidad',perUnitDirect:true,presets:[1,2,3,4],reference:'valor por unidad de la etiqueta'};
    }
    const key=`custom_scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
    state.customFoods.push({key,name:brand?`${name} · ${brand}`:name,cat,unit,ref:basis==='100ml'?'etiqueta por 100 ml':perUnit?'etiqueta por unidad':'etiqueta por 100 g',perUnit,custom:true,source:'label_scan',inputMeta,addedSugarStatus:val('scanAddedSugarStatus')||'not_stated',transFatStatus:val('scanTransFatStatus')||'not_stated',...scaled});
    saveState(true);openFoodModal(meal);const input=document.getElementById('fdKey');if(input){input.value=key;setFoodSelection(key)}toast('Alimento guardado')
  };

  function openMealPhotoReview(data,meal){
    document.getElementById('modalRoot').innerHTML=`<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet nutrition-scan-sheet">
      <div class="row between"><div><div class="eyebrow">Comida puntual</div><div class="hero-title">Confirmar estimación</div></div><button type="button" class="btn ghost small" onclick="closeModal()">Cancelar</button></div>
      <div class="formgrid nutrition-scan-main">
        <div class="field wide"><label>Qué has tomado</label><input id="mealScanName" value="${esc(data.name||'Comida por foto')}"></div>
        <div class="field wide"><label>Ración estimada</label><input id="mealScanPortion" value="${esc(data.portionDescription||'')}"></div>
        <div class="field wide"><label>Comida</label><select id="mealScanMeal">${MEAL_TYPES.map(v=>`<option ${v===meal?'selected':''}>${v}</option>`).join('')}</select></div>
      </div>
      <div class="eyebrow nutrition-scan-section">Estimación</div>
      ${nutrientInputs(data,'mealScan')}
      ${(data.assumptions||[]).length?`<div class="nutrition-scan-warnings">${data.assumptions.map(w=>`<span>${esc(w)}</span>`).join('')}</div>`:''}
      <div class="actions"><button type="button" class="btn" onclick="saveOneOffMealPhoto()">Añadir al diario</button></div>
    </div></div>`
  }
  window.saveOneOffMealPhoto=function(){
    const name=val('mealScanName').trim()||'Comida por foto',meal=val('mealScanMeal')||'Merienda';
    const values={
      kcal:fieldValue('mealScanEnergyKcal'),p:fieldValue('mealScanProtein'),c:fieldValue('mealScanCarbs'),f:fieldValue('mealScanFat'),
      ...qualityProps('mealScan')
    };
    if([values.p,values.c,values.f].some(v=>v==null)){toast('Revisa proteína, hidratos y grasas');return}
    if(values.kcal==null)values.kcal=derivedKcal(values.p,values.c,values.f);
    const key=`adhoc_photo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`,id=`food_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,6)}`;
    state.customFoods.push({key,name,cat:'Extra',unit:'ud',ref:'estimación por foto · una ración',perUnit:true,custom:true,transient:true,source:'meal_photo',...values});
    state.foods.push({id,created:Date.now(),date:currentDate(),meal,foodKey:key,amount:1,displayAmount:1,displayUnit:'ración',photoEstimate:true});
    saveState();closeModal();renderAll();showView('Food');toast('Comida añadida')
  };

  window.scanNutritionLabel=function(meal){choosePhoto('label',meal||'Desayuno')};
  window.scanOneOffMeal=function(meal){choosePhoto('meal',meal||'Merienda')};

  const originalFoodModal=window.openFoodModal;
  if(typeof originalFoodModal==='function')window.openFoodModal=function(meal){
    originalFoodModal(meal);
    const actions=document.querySelector('.food-modal-actions');
    if(actions&&!actions.querySelector('.nutrition-scan-label-btn')){
      const button=document.createElement('button');button.type='button';button.className='btn secondary nutrition-scan-label-btn';button.textContent='Escanear etiqueta';button.onclick=()=>scanNutritionLabel(val('fdMeal')||meal);
      actions.insertBefore(button,actions.children[1]||null)
    }
  };
  const originalMealChooser=window.openMealChooser;
  if(typeof originalMealChooser==='function')window.openMealChooser=function(){
    originalMealChooser();
    const list=document.querySelector('.meal-choice-list');
    if(list&&!document.querySelector('.meal-photo-choice')){
      const button=document.createElement('button');button.type='button';button.className='meal-choice meal-photo-choice';button.onclick=()=>scanOneOffMeal('Merienda');
      button.innerHTML='<strong>Foto de comida</strong><small>Registro puntual</small><span>›</span>';list.prepend(button)
    }
  };
  const originalCustom=window.openCustomFoodModal;
  if(typeof originalCustom==='function')window.openCustomFoodModal=function(meal){
    originalCustom(meal);
    const actions=document.querySelector('#modalRoot .actions');
    if(actions&&!actions.querySelector('.nutrition-scan-label-btn')){
      const button=document.createElement('button');button.type='button';button.className='btn secondary nutrition-scan-label-btn';button.textContent='Escanear etiqueta';button.onclick=()=>scanNutritionLabel(meal);
      actions.prepend(button)
    }
  };

  const originalDashboard=window.nutritionDashboardHTML;
  if(typeof originalDashboard==='function')window.nutritionDashboardHTML=function(nut){
    const base=originalDashboard(nut),items=Math.max(0,+nut.qualityItems||0);
    const metrics=QUALITY_FIELDS.map(([key,label])=>{
      const known=+nut.qualityKnown?.[key]||0,value=+nut[key]||0;
      const partial=known>0&&known<items,unit=key==='sodiumMg'?'mg':'g';
      return `<div class="nutrition-quality-metric"><span>${label}</span><strong>${known?(partial?'≥ ':'')+Number(value.toFixed(1))+' '+unit:'—'}</strong></div>`
    }).join('');
    return base+`<div class="nutrition-quality-card"><div class="eyebrow">Calidad nutricional</div><div class="nutrition-quality-grid">${metrics}</div></div>`
  };
})();