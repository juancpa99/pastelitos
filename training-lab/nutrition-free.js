(function(){
  'use strict';

  if(typeof state==='undefined'||typeof foodRecord!=='function')return;

  const QUAGGA_URL='https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.12.1/dist/quagga.min.js';
  const TESSERACT_URL='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
  const OFF_FIELDS=[
    'code','product_name','brands','serving_size','serving_quantity',
    'nutrition_data_per','nutriments','categories_tags','ingredients_text'
  ].join(',');

  let pendingMealPhotoBlob=null;
  let pendingMealPhotoUrl='';
  let viewerUrl='';

  function numberOrNull(value){
    const x=Number(value);
    return Number.isFinite(x)&&x>=0?x:null
  }
  function decimal(value){
    if(value==null)return null;
    const x=parseFloat(String(value).replace(/\s/g,'').replace(',','.'));
    return Number.isFinite(x)&&x>=0?x:null
  }
  function cleanBarcode(value){
    const code=String(value||'').replace(/\D/g,'');
    return code.length>=8&&code.length<=14?code:''
  }
  function derivedEnergy(p,c,f){
    return Math.round(((+p||0)*4+(+c||0)*4+(+f||0)*9)*10)/10
  }
  function dataUrl(blob){
    return new Promise(function(resolve,reject){
      const reader=new FileReader();
      reader.onload=function(){resolve(String(reader.result||''))};
      reader.onerror=function(){reject(reader.error||new Error('No se pudo leer la foto'))};
      reader.readAsDataURL(blob)
    })
  }
  function loadScript(id,src,globalName){
    if(globalName&&window[globalName])return Promise.resolve(window[globalName]);
    return new Promise(function(resolve,reject){
      const old=document.getElementById(id);
      if(old){
        old.addEventListener('load',function(){resolve(globalName?window[globalName]:true)},{once:true});
        old.addEventListener('error',function(){reject(new Error('No se pudo cargar el lector'))},{once:true});
        return
      }
      const script=document.createElement('script');
      script.id=id;script.src=src;script.async=true;script.crossOrigin='anonymous';
      script.onload=function(){resolve(globalName?window[globalName]:true)};
      script.onerror=function(){reject(new Error('No se pudo cargar el lector'))};
      document.head.appendChild(script)
    })
  }
  function loading(title,detail){
    document.getElementById('modalRoot').innerHTML=
      '<div class="modal"><div class="sheet nutrition-scan-loading">'+
      '<div class="spinner"></div><div><strong>'+esc(title||'Leyendo…')+'</strong>'+
      '<small id="nutritionScanProgress">'+esc(detail||'')+'</small></div></div></div>'
  }
  function progress(text){
    const el=document.getElementById('nutritionScanProgress');
    if(el)el.textContent=text||''
  }
  function chooseCamera(callback){
    const input=document.createElement('input');
    input.type='file';input.accept='image/*';input.setAttribute('capture','environment');input.hidden=true;
    input.addEventListener('change',function(){
      const file=input.files&&input.files[0];input.remove();
      if(file)callback(file)
    });
    document.body.appendChild(input);input.click()
  }

  async function decodeBarcodeNative(blob){
    if(!('BarcodeDetector' in window)||typeof createImageBitmap!=='function')return '';
    try{
      let formats=['ean_13','ean_8','upc_a','upc_e'];
      if(typeof BarcodeDetector.getSupportedFormats==='function'){
        const supported=await BarcodeDetector.getSupportedFormats();
        formats=formats.filter(function(f){return supported.includes(f)});
      }
      if(!formats.length)return '';
      const detector=new BarcodeDetector({formats:formats});
      const bitmap=await createImageBitmap(blob);
      const found=await detector.detect(bitmap);
      if(typeof bitmap.close==='function')bitmap.close();
      return cleanBarcode(found&&found[0]&&found[0].rawValue)
    }catch(error){return ''}
  }
  async function decodeBarcodeQuagga(blob){
    try{
      await loadScript('marevo-quagga2',QUAGGA_URL,'Quagga');
      const src=await dataUrl(blob);
      return await new Promise(function(resolve){
        window.Quagga.decodeSingle({
          src:src,
          numOfWorkers:0,
          locate:true,
          inputStream:{size:1600,singleChannel:false},
          decoder:{readers:['ean_reader','ean_8_reader','upc_reader','upc_e_reader']}
        },function(result){
          resolve(cleanBarcode(result&&result.codeResult&&result.codeResult.code))
        })
      })
    }catch(error){return ''}
  }
  async function decodeBarcode(file){
    const blob=typeof compressPhoto==='function'?await compressPhoto(file):file;
    let code=await decodeBarcodeNative(blob);
    if(code)return code;
    progress('Leyendo código…');
    code=await decodeBarcodeQuagga(blob);
    return code
  }

  function singularUnit(raw){
    const value=String(raw||'').toLowerCase();
    if(/reban|slice/.test(value))return 'rebanada';
    if(/tortit|rice cake/.test(value))return 'tortita';
    if(/gallet|cookie|biscuit/.test(value))return 'galleta';
    if(/barrit|bar\b/.test(value))return 'barrita';
    if(/lata|\bcan\b/.test(value))return 'lata';
    if(/botell|bottle/.test(value))return 'botella';
    if(/vaso|cup/.test(value))return 'vaso';
    if(/cacito|scoop/.test(value))return 'cacito';
    if(/huevo|egg/.test(value))return 'huevo';
    if(/unidad|unit/.test(value))return 'unidad';
    if(/raci|porci|serving/.test(value))return 'ración';
    return ''
  }
  function explicitServingInfo(text){
    const source=String(text||'');
    const unitPattern='(rebanadas?|slices?|tortitas?|rice cakes?|galletas?|cookies?|biscuits?|barritas?|bars?|latas?|cans?|botellas?|bottles?|vasos?|cups?|cacitos?|scoops?|huevos?|eggs?|unidades?|units?)';
    const re=new RegExp('(\\d+(?:[.,]\\d+)?)?\\s*'+unitPattern+'[^\\d\\n]{0,18}(\\d+(?:[.,]\\d+)?)\\s*(g|ml)','i');
    const m=source.match(re);
    if(m){
      const count=decimal(m[1])||1,weight=decimal(m[3]);
      return {unitName:singularUnit(m[2]),unitWeight:weight&&count?weight/count:null,unitWeightUnit:String(m[4]||'g').toLowerCase(),explicit:true}
    }
    const named=new RegExp(unitPattern,'i').exec(source);
    return named?{unitName:singularUnit(named[1]),unitWeight:null,unitWeightUnit:'g',explicit:false}:{unitName:'',unitWeight:null,unitWeightUnit:'g',explicit:false}
  }
  function naturalUnitForProduct(text){
    const s=String(text||'').toLowerCase();
    if(/pan de molde|sliced bread|rebanad/.test(s))return 'rebanada';
    if(/tortita.*arroz|rice cake/.test(s))return 'tortita';
    if(/barrita|protein bar|cereal bar/.test(s))return 'barrita';
    if(/galleta|cookie|biscuit/.test(s))return 'galleta';
    return ''
  }
  function inferCategory(text){
    const s=String(text||'').toLowerCase();
    if(/yogur|yogurt|leche|milk|queso|cheese|dairy/.test(s))return 'Lácteo';
    if(/pollo|chicken|pavo|turkey|at[uú]n|tuna|salm[oó]n|salmon|merluza|fish|carne|beef|jam[oó]n|ham|protein/.test(s))return 'Proteína';
    if(/pan|bread|arroz|rice|pasta|avena|oat|cereal|tortita|potato|patata|quinoa|couscous/.test(s))return 'Carbohidrato';
    if(/fruta|fruit|pl[aá]tano|banana|manzana|apple|fresa|strawber/.test(s))return 'Fruta';
    if(/verdura|vegetable|tomate|tomato/.test(s))return 'Verdura';
    if(/whey|suplement|supplement/.test(s))return 'Suplemento';
    return 'Extra'
  }
  function suggestedPlanFood(text){
    const s=String(text||'').toLowerCase();
    const candidates=[
      [/tortita.*arroz|rice cake/,'rice_cakes'],
      [/pan.*integral|whole.?grain bread|wholemeal bread/,'whole_bread'],
      [/pan de molde|sliced bread|\\bbread\\b/,'bread'],
      [/avena|\\boats?\\b/,'oats'],
      [/\\barroz\\b|\\brice\\b/,'rice'],
      [/\\bpasta\\b|macar|spaghet/,'pasta'],
      [/patata|potato/,'potato'],
      [/yogur.*griego|greek yogurt/,'greek_yogurt_0'],
      [/yogur|yogurt/,'yogurt'],
      [/\\bleche\\b|\\bmilk\\b/,'milk'],
      [/whey/,'whey'],
      [/cereal/,'cereal']
    ];
    for(const pair of candidates){
      if(pair[0].test(s)&&foodRecord(pair[1]))return pair[1]
    }
    return ''
  }
  function offValue(nutrients,key,suffix){
    return numberOrNull(nutrients&&nutrients[key+'_'+suffix])
  }
  function offEnergy(nutrients,suffix){
    let value=offValue(nutrients,'energy-kcal',suffix);
    if(value!=null)return value;
    const kj=offValue(nutrients,'energy',suffix);
    return kj==null?null:kj/4.184
  }
  function offSodiumMg(nutrients,suffix){
    const grams=offValue(nutrients,'sodium',suffix);
    return grams==null?null:grams*1000
  }
  function openFoodFactsData(payload){
    const product=payload&&payload.product?payload.product:payload||{};
    const nutr=product.nutriments||{};
    const hundredCore=['proteins','carbohydrates','fat'].map(function(k){return offValue(nutr,k,'100g')}).filter(function(v){return v!=null}).length;
    const servingCore=['proteins','carbohydrates','fat'].map(function(k){return offValue(nutr,k,'serving')}).filter(function(v){return v!=null}).length;
    const basis=hundredCore>=2?'100g':servingCore>=2?'serving':'100g';
    const suffix=basis==='serving'?'serving':'100g';
    const combined=[product.product_name,product.brands,(product.categories_tags||[]).join(' '),product.ingredients_text].filter(Boolean).join(' ');
    const serving=explicitServingInfo(product.serving_size||'');
    const inferredUnit=serving.unitName||naturalUnitForProduct(combined);
    const explicitWeight=serving.explicit?serving.unitWeight:null;
    const added=offValue(nutr,'added-sugars',suffix);
    const trans=offValue(nutr,'trans-fat',suffix);
    let addedStatus='not_stated';
    if(added!=null)addedStatus=added===0?'declared_zero':'declared_value';
    else if(/(az[uú]car|sugar|jarabe|syrup|glucosa|glucose|dextrosa|dextrose|miel|honey)/i.test(String(product.ingredients_text||'')))addedStatus='ingredients_indicate_added';
    return {
      kind:'label',
      name:String(product.product_name||'').trim(),
      brand:String(product.brands||'').split(',')[0].trim(),
      category:inferCategory(combined),
      referenceBasis:basis,
      unitName:inferredUnit,
      unitWeight:explicitWeight,
      unitWeightUnit:serving.unitWeightUnit||'g',
      energyKcal:offEnergy(nutr,suffix),
      protein:offValue(nutr,'proteins',suffix),
      carbs:offValue(nutr,'carbohydrates',suffix),
      fat:offValue(nutr,'fat',suffix),
      saturatedFat:offValue(nutr,'saturated-fat',suffix),
      transFat:trans,
      monounsaturatedFat:offValue(nutr,'monounsaturated-fat',suffix),
      polyunsaturatedFat:offValue(nutr,'polyunsaturated-fat',suffix),
      sugars:offValue(nutr,'sugars',suffix),
      addedSugars:added,
      fiber:offValue(nutr,'fiber',suffix),
      salt:offValue(nutr,'salt',suffix),
      sodiumMg:offSodiumMg(nutr,suffix),
      addedSugarStatus:addedStatus,
      transFatStatus:trans==null?'not_stated':trans===0?'declared_zero':'declared_value',
      suggestedPlanFood:suggestedPlanFood(combined),
      warnings:['Open Food Facts: confirma los valores antes de guardar.']
    }
  }
  window.marevoOpenFoodFactsData=openFoodFactsData;

  async function fetchOpenFoodFacts(code){
    const clean=cleanBarcode(code);
    if(!clean)throw new Error('invalid_barcode');
    const base=String(window.MAREVO_PUSH_BACKEND||'').replace(/\/$/,'');
    if(base){
      try{
        const response=await fetch(base+'/api/openfoodfacts?code='+encodeURIComponent(clean),{cache:'no-store'});
        if(response.ok)return await response.json()
      }catch(error){}
    }
    const url='https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(clean)+'.json?fields='+encodeURIComponent(OFF_FIELDS)+'&lc=es&cc=es';
    const response=await fetch(url,{headers:{'Accept':'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error('lookup_failed');
    return await response.json()
  }
  function reviewLabelData(data,meal,mode){
    if(mode==='punctual'){openPunctualProductReview(data,meal);return}
    if(typeof window.marevoOpenLabelReview!=='function')throw new Error('review_missing');
    window.marevoOpenLabelReview(data,meal);
    const select=document.getElementById('scanPlanFood');
    if(select&&data.suggestedPlanFood)select.value=data.suggestedPlanFood
  }
  function productNotFound(meal,code,mode){
    document.getElementById('modalRoot').innerHTML=
      '<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">'+
      '<div class="row between"><div><div class="eyebrow">Producto</div><div class="hero-title">No encontrado</div></div>'+
      '<button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>'+
      '<div class="callout" style="margin-top:12px">'+esc(code||'')+'</div>'+
      '<div class="actions"><button type="button" class="btn" onclick="captureNutritionLabelOCR(\''+esc(meal)+'\',\''+esc(mode||'common')+'\')">Leer etiqueta</button>'+
      '<button type="button" class="btn secondary" onclick="'+((mode||'common')==='punctual'?'openPunctualRegistration':'openCommonFoodRegistration')+'(\''+esc(meal)+'\')">Volver</button></div></div></div>'
  }
  async function lookupBarcode(code,meal,mode){
    const clean=cleanBarcode(code);
    if(!clean){toast('Código no válido');return}
    loading('Buscando producto','Open Food Facts');
    try{
      const payload=await fetchOpenFoodFacts(clean);
      if(!payload||payload.status!==1||!payload.product){productNotFound(meal,clean,mode);return}
      const data=openFoodFactsData(payload);
      if([data.protein,data.carbs,data.fat].filter(function(v){return v!=null}).length<2){
        data.warnings.push('La ficha está incompleta. Puedes completar los valores o fotografiar la etiqueta.')
      }
      reviewLabelData(data,meal,mode)
    }catch(error){
      const back=(mode||'common')==='punctual'?'openPunctualRegistration':'openCommonFoodRegistration';
      document.getElementById('modalRoot').innerHTML=
        '<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Producto</div><div class="hero-title">No se pudo consultar</div></div>'+
        '<button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>'+
        '<div class="actions"><button type="button" class="btn" onclick="captureNutritionLabelOCR(\''+esc(meal)+'\',\''+esc(mode||'common')+'\')">Leer etiqueta</button>'+
        '<button type="button" class="btn secondary" onclick="'+back+'(\''+esc(meal)+'\')">Volver</button></div></div></div>'
    }
  }

  window.openNutritionScanMenu=function(meal){
    const selected=MEAL_TYPES.includes(meal)?meal:'Desayuno';
    document.getElementById('modalRoot').innerHTML=
      '<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet nutrition-scan-sheet">'+
      '<div class="row between"><div><div class="eyebrow">Producto habitual</div><div class="hero-title">Escanear producto</div></div>'+
      '<button type="button" class="btn ghost small" onclick="openFoodModal(\''+esc(selected)+'\')">Volver</button></div>'+
      '<div class="nutrition-scan-choice-list">'+
      '<button type="button" class="meal-choice" onclick="captureProductBarcode(\''+esc(selected)+'\')"><strong>Código de barras</strong><small>Busca el producto</small><span>›</span></button>'+
      '<button type="button" class="meal-choice" onclick="captureNutritionLabelOCR(\''+esc(selected)+'\')"><strong>Leer etiqueta</strong><small>Leer información nutricional</small><span>›</span></button>'+
      '</div>'+
      '<div class="field" style="margin-top:12px"><label>Código manual</label><div class="nutrition-barcode-manual"><input id="manualBarcode" inputmode="numeric" autocomplete="off" placeholder="EAN / UPC"><button type="button" class="btn secondary" onclick="lookupManualBarcode(\''+esc(selected)+'\')">Buscar</button></div></div>'+
      '</div></div>'
  };
  window.lookupManualBarcode=function(meal,mode){lookupBarcode(val('manualBarcode'),meal,mode||'common')};
  window.captureProductBarcode=function(meal){
    chooseCamera(async function(file){
      loading('Leyendo código','Enfoca el código de barras');
      try{
        const code=await decodeBarcode(file);
        if(!code){
          document.getElementById('modalRoot').innerHTML=
            '<div class="modal"><div class="sheet"><div class="row between"><div><div class="eyebrow">Código de barras</div><div class="hero-title">No se pudo leer</div></div>'+
            '<button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>'+
            '<div class="actions"><button type="button" class="btn" onclick="captureProductBarcode(\''+esc(meal)+'\')">Repetir foto</button>'+
            '<button type="button" class="btn secondary" onclick="openNutritionScanMenu(\''+esc(meal)+'\')">Introducir código</button></div></div></div>';
          return
        }
        await lookupBarcode(code,meal,'common')
      }catch(error){
        toast('No se pudo leer el código');
        window.openNutritionScanMenu(meal)
      }
    })
  };

  function lineValue(line,keyword){
    if(!line)return {value:null,unit:''};
    const match=line.match(keyword);
    if(!match)return {value:null,unit:''};
    const tail=line.slice((match.index||0)+match[0].length);
    const m=tail.match(/(\d+(?:[.,]\d+)?)\s*(mg|g)?/i);
    return m?{value:decimal(m[1]),unit:String(m[2]||'g').toLowerCase()}:{value:null,unit:''}
  }
  function nutritionLine(lines,keyword,exclude){
    return lines.find(function(line){
      if(!keyword.test(line))return false;
      return !(exclude||[]).some(function(re){return re.test(line)})
    })||''
  }
  function gramsFrom(lines,keyword,exclude){
    const hit=nutritionLine(lines,keyword,exclude);
    const out=lineValue(hit,keyword);
    if(out.value==null)return null;
    return out.unit==='mg'?out.value/1000:out.value
  }
  function sodiumMgFrom(lines){
    const keyword=/sodio|sodium/i,hit=nutritionLine(lines,keyword,[]);
    const out=lineValue(hit,keyword);
    if(out.value==null)return null;
    return out.unit==='mg'?out.value:out.value*1000
  }
  function parseNutritionLabelText(text){
    const raw=String(text||'');
    const lines=raw.split(/\r?\n/).map(function(line){return line.replace(/\s+/g,' ').trim()}).filter(Boolean);
    const lower=raw.toLowerCase();
    const energyLine=nutritionLine(lines,/energ[ií]a|energy/i,[]);
    const kcalMatch=energyLine.match(/(\d+(?:[.,]\d+)?)\s*kcal/i)||raw.match(/(\d+(?:[.,]\d+)?)\s*kcal/i);
    const has100ml=/100\s*ml/i.test(raw),has100g=/100\s*g/i.test(raw),hasServing=/porci[oó]n|raci[oó]n|serving/i.test(raw);
    const serving=explicitServingInfo(raw);
    const unitName=serving.unitName||naturalUnitForProduct(raw);
    const added=gramsFrom(lines,/az[uú]cares?\s*(?:a[nñ]adid|agregad)|added sugars?/i,[]);
    const trans=gramsFrom(lines,/trans/i,[]);
    let addedStatus='not_stated';
    if(added!=null)addedStatus=added===0?'declared_zero':'declared_value';
    else if(/ingredientes|ingredients/i.test(raw)&&/(az[uú]car|sugar|jarabe|syrup|glucosa|glucose|dextrosa|dextrose|miel|honey)/i.test(raw))addedStatus='ingredients_indicate_added';
    const warnings=['OCR local: confirma los valores antes de guardar.'];
    if((has100g||has100ml)&&hasServing)warnings.push('La etiqueta parece tener varias columnas. Confirma la columna de 100 g / 100 ml.');
    return {
      kind:'label',
      name:'',
      brand:'',
      category:inferCategory(raw),
      referenceBasis:has100ml?'100ml':has100g?'100g':'serving',
      unitName:unitName,
      unitWeight:serving.unitWeight,
      unitWeightUnit:serving.unitWeightUnit||'g',
      energyKcal:kcalMatch?decimal(kcalMatch[1]):null,
      protein:gramsFrom(lines,/prote[ií]nas?|protein/i,[]),
      carbs:gramsFrom(lines,/hidratos?.{0,12}carbono|carbohidr/i,[]),
      fat:gramsFrom(lines,/grasas?|fat\b|l[ií]pidos?/i,[/saturad/i,/trans/i,/mono/i,/poli|poly/i]),
      saturatedFat:gramsFrom(lines,/saturad/i,[]),
      transFat:trans,
      monounsaturatedFat:gramsFrom(lines,/monoinsaturad|monounsatur/i,[]),
      polyunsaturatedFat:gramsFrom(lines,/poliinsaturad|polyunsatur/i,[]),
      sugars:gramsFrom(lines,/az[uú]cares?|sugars?/i,[/a[nñ]adid|agregad|added/i]),
      addedSugars:added,
      fiber:gramsFrom(lines,/fibra|fibre|fiber/i,[]),
      salt:gramsFrom(lines,/\bsal\b|\bsalt\b/i,[]),
      sodiumMg:sodiumMgFrom(lines),
      addedSugarStatus:addedStatus,
      transFatStatus:trans==null?'not_stated':trans===0?'declared_zero':'declared_value',
      suggestedPlanFood:suggestedPlanFood(raw),
      warnings:warnings,
      ocrText:raw
    }
  }
  window.marevoParseNutritionLabelText=parseNutritionLabelText;

  async function runLocalOCR(file,meal,mode){
    loading('Leyendo etiqueta','La primera vez puede tardar unos segundos');
    let worker=null;
    try{
      const blob=typeof compressPhoto==='function'?await compressPhoto(file):file;
      await loadScript('marevo-tesseract',TESSERACT_URL,'Tesseract');
      worker=await window.Tesseract.createWorker('spa',1,{logger:function(message){
        if(message&&message.status){
          const pct=message.progress!=null?' '+Math.round(message.progress*100)+'%':'';
          progress(message.status+pct)
        }
      }});
      const result=await worker.recognize(blob);
      const data=parseNutritionLabelText(result&&result.data&&result.data.text);
      reviewLabelData(data,meal,mode)
    }catch(error){
      const data={
        kind:'label',name:'',brand:'',category:'Extra',referenceBasis:'100g',
        unitName:'',unitWeight:null,unitWeightUnit:'g',
        energyKcal:null,protein:null,carbs:null,fat:null,saturatedFat:null,transFat:null,
        monounsaturatedFat:null,polyunsaturatedFat:null,sugars:null,addedSugars:null,
        fiber:null,salt:null,sodiumMg:null,addedSugarStatus:'not_stated',transFatStatus:'not_stated',
        warnings:['No se pudo leer automáticamente. Introduce los valores visibles en la etiqueta.']
      };
      reviewLabelData(data,meal,mode)
    }finally{
      if(worker)try{await worker.terminate()}catch(error){}
    }
  }
  window.captureNutritionLabelOCR=function(meal,mode){
    chooseCamera(function(file){runLocalOCR(file,meal||'Desayuno',mode||'common')})
  };

  function clearPendingMealPhotoUrl(){
    if(pendingMealPhotoUrl){URL.revokeObjectURL(pendingMealPhotoUrl);pendingMealPhotoUrl=''}
  }
  function mealQualityFields(){
    return '<details class="nutrition-oneoff-details"><summary>Más datos nutricionales</summary>'+
      '<div class="nutrition-scan-grid" style="margin-top:10px">'+
      '<label><span>Saturadas</span><span class="nutrition-scan-input"><input id="oneSat" inputmode="decimal"><b>g</b></span></label>'+
      '<label><span>Trans</span><span class="nutrition-scan-input"><input id="oneTrans" inputmode="decimal"><b>g</b></span></label>'+
      '<label><span>Azúcares añadidos</span><span class="nutrition-scan-input"><input id="oneAdded" inputmode="decimal"><b>g</b></span></label>'+
      '<label><span>Fibra</span><span class="nutrition-scan-input"><input id="oneFiber" inputmode="decimal"><b>g</b></span></label>'+
      '<label><span>Sal</span><span class="nutrition-scan-input"><input id="oneSalt" inputmode="decimal"><b>g</b></span></label>'+
      '</div></details>'
  }
  async function openOneOffMealReview(file,meal){
    try{
      pendingMealPhotoBlob=typeof compressPhoto==='function'?await compressPhoto(file):file;
      clearPendingMealPhotoUrl();
      pendingMealPhotoUrl=URL.createObjectURL(pendingMealPhotoBlob);
      const selected=MEAL_TYPES.includes(meal)?meal:'Merienda';
      document.getElementById('modalRoot').innerHTML=
        '<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet nutrition-scan-sheet">'+
        '<div class="row between"><div><div class="eyebrow">Comida puntual</div><div class="hero-title">Añadir al diario</div></div>'+
        '<button type="button" class="btn ghost small" onclick="closeModal()">Cancelar</button></div>'+
        '<img class="nutrition-oneoff-photo" src="'+pendingMealPhotoUrl+'" alt="Comida fotografiada">'+
        '<div class="callout" style="margin-top:10px">La foto se guarda en este dispositivo. MAREVO no inventa los macros: introduce una estimación si la conoces.</div>'+
        '<div class="formgrid nutrition-scan-main">'+
        '<div class="field wide"><label>Qué has tomado</label><input id="oneName" placeholder="Ej. Bocadillo de pollo"></div>'+
        '<div class="field wide"><label>Ración / nota</label><input id="onePortion" placeholder="Ej. bocadillo completo"></div>'+
        '<div class="field wide"><label>Comida</label><select id="oneMeal">'+MEAL_TYPES.map(function(v){return '<option '+(v===selected?'selected':'')+'>'+esc(v)+'</option>'}).join('')+'</select></div>'+
        '</div>'+
        '<div class="eyebrow nutrition-scan-section">Macros de la ración</div>'+
        '<div class="nutrition-scan-grid">'+
        '<label><span>Proteína</span><span class="nutrition-scan-input"><input id="oneProtein" inputmode="decimal" oninput="updateOneOffEnergy()"><b>g</b></span></label>'+
        '<label><span>Carbohidratos</span><span class="nutrition-scan-input"><input id="oneCarbs" inputmode="decimal" oninput="updateOneOffEnergy()"><b>g</b></span></label>'+
        '<label><span>Grasas</span><span class="nutrition-scan-input"><input id="oneFat" inputmode="decimal" oninput="updateOneOffEnergy()"><b>g</b></span></label>'+
        '<label><span>Energía</span><span class="nutrition-scan-input"><input id="oneKcal" inputmode="decimal"><b>kcal</b></span></label>'+
        '</div>'+mealQualityFields()+
        '<div class="actions"><button type="button" class="btn" onclick="saveOneOffMealPhoto()">Añadir al diario</button></div>'+
        '</div></div>'
    }catch(error){toast('No se pudo guardar la foto')}
  }
  window.updateOneOffEnergy=function(){
    const p=decimal(val('oneProtein')),c=decimal(val('oneCarbs')),f=decimal(val('oneFat'));
    const input=document.getElementById('oneKcal');
    if(input&&p!=null&&c!=null&&f!=null)input.value=derivedEnergy(p,c,f)
  };
  window.saveOneOffMealPhoto=async function(){
    const p=decimal(val('oneProtein')),c=decimal(val('oneCarbs')),f=decimal(val('oneFat'));
    if([p,c,f].some(function(v){return v==null})){toast('Introduce proteína, hidratos y grasas');return}
    const id='food_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
    const key='adhoc_photo_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
    const photoId='foodmeal_'+id;
    const kcal=decimal(val('oneKcal'))!=null?decimal(val('oneKcal')):derivedEnergy(p,c,f);
    const values={
      kcal:kcal,p:p,c:c,f:f,
      sat:decimal(val('oneSat')),trans:decimal(val('oneTrans')),addedSugars:decimal(val('oneAdded')),
      fiber:decimal(val('oneFiber')),salt:decimal(val('oneSalt'))
    };
    try{
      if(pendingMealPhotoBlob&&typeof putPhoto==='function')await putPhoto(photoId,pendingMealPhotoBlob);
      const name=val('oneName').trim()||'Comida puntual';
      const meal=MEAL_TYPES.includes(val('oneMeal'))?val('oneMeal'):'Merienda';
      state.customFoods.push({key:key,name:name,cat:'Extra',unit:'ud',ref:'una ración',perUnit:true,custom:true,transient:true,source:'meal_photo_manual',...values});
      state.foods.push({
        id:id,created:Date.now(),date:currentDate(),meal:meal,foodKey:key,amount:1,
        displayAmount:1,displayUnit:'ración',photoEstimate:true,photoId:photoId,note:val('onePortion').trim()
      });
      pendingMealPhotoBlob=null;clearPendingMealPhotoUrl();
      saveState();closeModal();renderAll();showView('Food');toast('Comida añadida')
    }catch(error){toast('No se pudo guardar la comida')}
  };
  window.openOneOffFoodPhoto=async function(id){
    const item=(state.foods||[]).find(function(row){return row.id===id});
    if(!item||!item.photoId||typeof getPhoto!=='function')return;
    try{
      const blob=await getPhoto(item.photoId);if(!blob){toast('Foto no disponible');return}
      if(viewerUrl)URL.revokeObjectURL(viewerUrl);
      viewerUrl=URL.createObjectURL(blob);
      const food=foodRecord(item.foodKey);
      document.getElementById('modalRoot').innerHTML=
        '<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">'+
        '<div class="row between"><div><div class="eyebrow">'+esc(item.meal)+'</div><div class="hero-title">'+esc(food&&food.name||'Comida puntual')+'</div></div>'+
        '<button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>'+
        '<img class="photo-full" src="'+viewerUrl+'" alt="Comida registrada">'+
        (item.note?'<div class="subtitle" style="margin-top:8px">'+esc(item.note)+'</div>':'')+
        '</div></div>'
    }catch(error){toast('Foto no disponible')}
  };
  window.scanOneOffMeal=function(meal){
    chooseCamera(function(file){openOneOffMealReview(file,meal||'Merienda')})
  };

  window.scanNutritionLabel=function(meal){window.openNutritionScanMenu(meal||'Desayuno')};


  const RESTAURANT_PRESETS=[
    {id:'burger',name:'Hamburguesa completa',kcal:850,p:40,c:70,f:45,note:'Hamburguesa con pan, queso y salsa'},
    {id:'burger_fries',name:'Hamburguesa + patatas',kcal:1200,p:45,c:125,f:55,note:'Ración estándar de restaurante'},
    {id:'pizza',name:'Pizza individual',kcal:1000,p:40,c:120,f:40,note:'Pizza mediana de masa estándar'},
    {id:'kebab',name:'Kebab / dürüm',kcal:850,p:35,c:80,f:40,note:'Con salsa y verduras'},
    {id:'burrito',name:'Burrito grande',kcal:900,p:40,c:110,f:32,note:'Arroz, proteína, legumbre y salsa'},
    {id:'sushi',name:'Sushi · 12 piezas',kcal:650,p:30,c:95,f:18,note:'Combinación variada'},
    {id:'carbonara',name:'Pasta carbonara',kcal:950,p:30,c:100,f:45,note:'Plato principal de restaurante'},
    {id:'paella',name:'Paella · plato',kcal:700,p:30,c:90,f:22,note:'Ración abundante'},
    {id:'sandwich',name:'Bocadillo / sándwich completo',kcal:700,p:35,c:80,f:25,note:'Pan, proteína, queso o salsa'}
  ];

  function blankLabelData(){
    return {
      kind:'label',name:'',brand:'',category:'Extra',referenceBasis:'100g',
      unitName:'',unitWeight:null,unitWeightUnit:'g',
      energyKcal:null,protein:null,carbs:null,fat:null,saturatedFat:null,transFat:null,
      monounsaturatedFat:null,polyunsaturatedFat:null,sugars:null,addedSugars:null,
      fiber:null,salt:null,sodiumMg:null,addedSugarStatus:'not_stated',transFatStatus:'not_stated',
      warnings:[]
    }
  }
  function mealSelect(selected,id){
    return '<select id="'+id+'">'+MEAL_TYPES.map(function(meal){
      return '<option '+(meal===selected?'selected':'')+'>'+esc(meal)+'</option>'
    }).join('')+'</select>'
  }
  function commonRegistrationMenu(meal){
    const selected=MEAL_TYPES.includes(meal)?meal:'Desayuno';
    document.getElementById('modalRoot').innerHTML=
      '<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">'+
      '<div class="row between"><div><div class="eyebrow">Uso común</div><div class="hero-title">Registrar alimento</div></div>'+
      '<button type="button" class="btn ghost small" onclick="closeModal()">Cerrar</button></div>'+
      '<div class="nutrition-scan-choice-list">'+
      '<button type="button" class="meal-choice" onclick="captureProductBarcode(\''+esc(selected)+'\')"><strong>Leer código de barras</strong><small>Buscar producto</small><span>›</span></button>'+
      '<button type="button" class="meal-choice" onclick="captureNutritionLabelOCR(\''+esc(selected)+'\',\'common\')"><strong>Leer etiqueta</strong><small>Extraer valores nutricionales</small><span>›</span></button>'+
      '<button type="button" class="meal-choice" onclick="openManualCommonFood(\''+esc(selected)+'\')"><strong>Añadir manualmente</strong><small>Introducir valores de la etiqueta</small><span>›</span></button>'+
      '</div>'+
      '<div class="field" style="margin-top:12px"><label>Código manual</label><div class="nutrition-barcode-manual"><input id="manualBarcode" inputmode="numeric" autocomplete="off" placeholder="EAN / UPC"><button type="button" class="btn secondary" onclick="lookupManualBarcode(\''+esc(selected)+'\',\'common\')">Buscar</button></div></div>'+
      '</div></div>'
  }
  window.openManualCommonFood=function(meal){reviewLabelData(blankLabelData(),meal||'Desayuno','common')};

  window.openFoodRegistrationHub=function(){window.openCommonFoodRegistration()};
  window.openCommonFoodRegistration=function(meal){commonRegistrationMenu(meal||'Desayuno')};

  window.openPunctualRegistration=function(meal){
    const selected=MEAL_TYPES.includes(meal)?meal:'Merienda';
    document.getElementById('modalRoot').innerHTML=
      '<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">'+
      '<div class="row between"><div><div class="eyebrow">Solo hoy</div><div class="hero-title">Producto puntual</div></div>'+
      '<button type="button" class="btn ghost small" onclick="openAddFoodHub()">Volver</button></div>'+
      '<div class="nutrition-scan-choice-list">'+
      '<button type="button" class="meal-choice" onclick="capturePunctualBarcode(\''+esc(selected)+'\')"><strong>Leer código de barras</strong><small>Producto envasado</small><span>›</span></button>'+
      '<button type="button" class="meal-choice" onclick="captureNutritionLabelOCR(\''+esc(selected)+'\',\'punctual\')"><strong>Leer etiqueta</strong><small>Información nutricional</small><span>›</span></button>'+
      '<button type="button" class="meal-choice" onclick="openManualPunctualFood(\''+esc(selected)+'\')"><strong>Añadir manualmente</strong><small>Macros o kcal conocidos</small><span>›</span></button>'+
      '</div>'+
      '<div class="field" style="margin-top:12px"><label>Código manual</label><div class="nutrition-barcode-manual"><input id="manualBarcode" inputmode="numeric" autocomplete="off" placeholder="EAN / UPC"><button type="button" class="btn secondary" onclick="lookupManualBarcode(\''+esc(selected)+'\',\'punctual\')">Buscar</button></div></div>'+
      '</div></div>'
  };

  window.capturePunctualBarcode=function(meal){
    chooseCamera(async function(file){
      loading('Leyendo código','Enfoca el código de barras');
      try{
        const code=await decodeBarcode(file);
        if(!code){toast('No se pudo leer el código');window.openPunctualRegistration(meal);return}
        await lookupBarcode(code,meal,'punctual')
      }catch(error){toast('No se pudo leer el código');window.openPunctualRegistration(meal)}
    })
  };

  function punctualQualityInputs(data){
    return '<details class="nutrition-oneoff-details"><summary>Más datos nutricionales</summary>'+
      '<div class="nutrition-scan-grid" style="margin-top:10px">'+
      '<label><span>Saturadas</span><span class="nutrition-scan-input"><input id="punSat" inputmode="decimal" value="'+(data.saturatedFat??'')+'"><b>g</b></span></label>'+
      '<label><span>Trans</span><span class="nutrition-scan-input"><input id="punTrans" inputmode="decimal" value="'+(data.transFat??'')+'"><b>g</b></span></label>'+
      '<label><span>Azúcares añadidos</span><span class="nutrition-scan-input"><input id="punAdded" inputmode="decimal" value="'+(data.addedSugars??'')+'"><b>g</b></span></label>'+
      '<label><span>Fibra</span><span class="nutrition-scan-input"><input id="punFiber" inputmode="decimal" value="'+(data.fiber??'')+'"><b>g</b></span></label>'+
      '<label><span>Sal</span><span class="nutrition-scan-input"><input id="punSalt" inputmode="decimal" value="'+(data.salt??'')+'"><b>g</b></span></label>'+
      '</div></details>'
  }
  function openPunctualProductReview(data,meal){
    const selected=MEAL_TYPES.includes(meal)?meal:'Merienda';
    document.getElementById('modalRoot').innerHTML=
      '<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet nutrition-scan-sheet">'+
      '<div class="row between"><div><div class="eyebrow">Comida puntual</div><div class="hero-title">Confirmar registro</div></div>'+
      '<button type="button" class="btn ghost small" onclick="openPunctualRegistration(\''+esc(selected)+'\')">Volver</button></div>'+
      '<div class="formgrid nutrition-scan-main">'+
      '<div class="field wide"><label>Nombre</label><input id="punName" value="'+esc(data.name||'')+'"></div>'+
      '<div class="field wide"><label>Comida</label>'+mealSelect(selected,'punMeal')+'</div>'+
      '<div class="field"><label>Valores por</label><select id="punBasis"><option value="100g" '+(data.referenceBasis==='100g'?'selected':'')+'>100 g</option><option value="100ml" '+(data.referenceBasis==='100ml'?'selected':'')+'>100 ml</option><option value="serving" '+(data.referenceBasis==='serving'?'selected':'')+'>Ración / unidad</option></select></div>'+
      '<div class="field"><label>Cantidad consumida</label><input id="punAmount" inputmode="decimal" value="'+(data.referenceBasis==='serving'?'1':'100')+'"></div>'+
      '</div>'+
      '<div class="eyebrow nutrition-scan-section">Macros</div>'+
      '<div class="nutrition-scan-grid">'+
      '<label><span>Proteína</span><span class="nutrition-scan-input"><input id="punProtein" inputmode="decimal" value="'+(data.protein??'')+'"><b>g</b></span></label>'+
      '<label><span>Carbohidratos</span><span class="nutrition-scan-input"><input id="punCarbs" inputmode="decimal" value="'+(data.carbs??'')+'"><b>g</b></span></label>'+
      '<label><span>Grasas</span><span class="nutrition-scan-input"><input id="punFat" inputmode="decimal" value="'+(data.fat??'')+'"><b>g</b></span></label>'+
      '<label><span>Energía</span><span class="nutrition-scan-input"><input id="punKcal" inputmode="decimal" value="'+(data.energyKcal??'')+'"><b>kcal</b></span></label>'+
      '</div>'+punctualQualityInputs(data)+
      '<div class="actions"><button type="button" class="btn" onclick="savePunctualProduct()">Registrar hoy</button></div>'+
      '</div></div>'
  }
  window.openManualPunctualFood=function(meal){openPunctualProductReview(blankLabelData(),meal||'Merienda')};

  window.savePunctualProduct=function(){
    const name=val('punName').trim()||'Comida puntual',basis=val('punBasis'),amount=decimal(val('punAmount'));
    const p=decimal(val('punProtein')),carbs=decimal(val('punCarbs')),fat=decimal(val('punFat'));
    let kcal=decimal(val('punKcal'));
    if(amount==null||amount<=0){toast('Introduce la cantidad consumida');return}
    if(kcal==null&&[p,carbs,fat].every(function(v){return v!=null}))kcal=derivedEnergy(p,carbs,fat);
    if(kcal==null){toast('Introduce las kcal o los macros');return}
    const factor=basis==='serving'?amount:amount/100;
    const safe=function(v){return v==null?null:v*factor};
    const key='adhoc_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
    const id='food_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
    const perUnit=true;
    state.customFoods.push({
      key:key,name:name,cat:'Extra',unit:'ud',ref:'registro puntual',perUnit:perUnit,custom:true,transient:true,source:'punctual',
      kcal:kcal*factor,p:safe(p)||0,c:safe(carbs)||0,f:safe(fat)||0,
      sat:safe(decimal(val('punSat'))),trans:safe(decimal(val('punTrans'))),
      addedSugars:safe(decimal(val('punAdded'))),fiber:safe(decimal(val('punFiber'))),salt:safe(decimal(val('punSalt')))
    });
    state.foods.push({id:id,created:Date.now(),date:currentDate(),meal:MEAL_TYPES.includes(val('punMeal'))?val('punMeal'):'Merienda',foodKey:key,amount:1,displayAmount:1,displayUnit:'ración'});
    saveState();closeModal();renderAll();showView('Food');toast('Comida registrada')
  };

  window.openRestaurantFood=function(meal){
    const selected=MEAL_TYPES.includes(meal)?meal:'Almuerzo';
    document.getElementById('modalRoot').innerHTML=
      '<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet">'+
      '<div class="row between"><div><div class="eyebrow">Estimación</div><div class="hero-title">Comida de restaurante</div></div>'+
      '<button type="button" class="btn ghost small" onclick="openPunctualRegistration(\''+esc(selected)+'\')">Volver</button></div>'+
      '<div class="field" style="margin-top:12px"><label>Comida</label>'+mealSelect(selected,'restaurantMeal')+'</div>'+
      '<div class="restaurant-estimate-note">Valores orientativos. El tamaño, aceite, salsas y receta pueden cambiar mucho el resultado.</div>'+
      '<div class="restaurant-preset-list">'+RESTAURANT_PRESETS.map(function(row){
        return '<button type="button" class="restaurant-preset" onclick="chooseRestaurantFood(\''+row.id+'\')"><span><strong>'+esc(row.name)+'</strong><small>'+esc(row.note)+'</small></span><b>≈ '+row.kcal+' kcal</b></button>'
      }).join('')+'</div>'+
      '<div class="actions"><button type="button" class="btn secondary" onclick="openManualPunctualFood(\''+esc(selected)+'\')">Otro / manual</button></div>'+
      '</div></div>'
  };
  window.chooseRestaurantFood=function(id){
    const row=RESTAURANT_PRESETS.find(function(item){return item.id===id});if(!row)return;
    const selected=MEAL_TYPES.includes(val('restaurantMeal'))?val('restaurantMeal'):'Almuerzo';
    openPunctualProductReview({
      name:row.name,referenceBasis:'serving',energyKcal:row.kcal,protein:row.p,carbs:row.c,fat:row.f,
      saturatedFat:null,transFat:null,addedSugars:null,fiber:null,salt:null
    },selected)
  };

  // Legacy name now opens the explicit registration flow instead of photographing a meal.
  window.scanOneOffMeal=function(meal){window.openPunctualRegistration(meal||'Merienda')};

})();