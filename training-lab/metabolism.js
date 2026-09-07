(function(){
  'use strict';

  if(typeof state==='undefined'||typeof renderFood!=='function'||typeof renderSettings!=='function')return;

  const ACTIVITY_LEVELS=[
    {value:1.20,label:'Sedentario',detail:'Poco ejercicio fuera de la actividad diaria'},
    {value:1.375,label:'Ligero',detail:'1–3 sesiones de ejercicio por semana'},
    {value:1.55,label:'Moderado',detail:'3–5 sesiones de ejercicio por semana'},
    {value:1.725,label:'Muy activo',detail:'6–7 sesiones de ejercicio por semana'},
    {value:1.90,label:'Extremadamente activo',detail:'Entrenamiento muy intenso y actividad física elevada'}
  ];
  const DEFAULT_ACTIVITY=1.725;

  function profile(){
    if(!state.metabolism||typeof state.metabolism!=='object')state.metabolism={};
    return state.metabolism;
  }

  function parseDecimal(value){
    const raw=String(value??'').trim();
    if(!raw)return null;
    const n=Number(raw.replace(/\s+/g,'').replace(',','.'));
    return Number.isFinite(n)?n:null;
  }

  function latestBodyWeight(){
    const rows=[...(state.body||[])].filter(row=>Number.isFinite(Number(row?.weight))&&Number(row.weight)>0);
    rows.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    return rows.length?Number(rows[0].weight):null;
  }

  function ageOn(dateISO,birthISO){
    if(!birthISO)return null;
    const date=new Date(`${dateISO||currentDate()}T12:00:00`),birth=new Date(`${birthISO}T12:00:00`);
    if(Number.isNaN(date.getTime())||Number.isNaN(birth.getTime())||birth>=date)return null;
    let age=date.getFullYear()-birth.getFullYear();
    const beforeBirthday=date.getMonth()<birth.getMonth()||(date.getMonth()===birth.getMonth()&&date.getDate()<birth.getDate());
    if(beforeBirthday)age-=1;
    return age>0&&age<120?age:null;
  }

  function metabolismEstimate(date=currentDate()){
    const p=profile(),weight=latestBodyWeight(),height=Number(p.heightCm),age=ageOn(date,p.birthDate),sex=p.sex;
    const activity=Number(p.activityFactor)||DEFAULT_ACTIVITY;
    if(!weight||!Number.isFinite(height)||height<=0||!age||(sex!=='male'&&sex!=='female')){
      return {complete:false,weight,height:Number.isFinite(height)?height:null,age,sex,activity};
    }
    // Mifflin-St Jeor equation. Activity factor converts BMR to an average daily expenditure estimate.
    const sexConstant=sex==='male'?5:-161;
    const bmr=10*weight+6.25*height-5*age+sexConstant;
    const tdee=bmr*activity;
    return {complete:true,weight,height,age,sex,activity,bmr,tdee};
  }

  function activityInfo(value){
    const n=Number(value)||DEFAULT_ACTIVITY;
    return ACTIVITY_LEVELS.reduce((best,item)=>Math.abs(item.value-n)<Math.abs(best.value-n)?item:best,ACTIVITY_LEVELS[0]);
  }

  function fmtKcal(value){
    return `${Math.round(value).toLocaleString('es-ES')} kcal`;
  }

  function foodMetabolismCardHTML(date=currentDate()){
    const estimate=metabolismEstimate(date);
    if(!estimate.complete){
      const missing=[];
      if(!estimate.weight)missing.push('peso');
      if(!estimate.sex)missing.push('sexo para la fórmula');
      if(!estimate.age)missing.push('fecha de nacimiento');
      if(!estimate.height)missing.push('altura');
      return `<div class="card" id="metabolismFoodCard"><div class="row between"><div><div class="eyebrow">Balance energético</div><strong>Completa tu estimación de gasto</strong></div><button type="button" class="btn ghost small" onclick="goToMetabolismSettings()">Configurar</button></div><div class="subtitle" style="margin-top:8px">Falta ${esc(missing.join(', '))}. El peso se toma automáticamente de tu última medición corporal.</div></div>`;
    }

    const nut=typeof dayNutrition==='function'?dayNutrition(date):{kcal:0};
    const items=typeof foodsFor==='function'?foodsFor(date):[];
    const intake=Number(nut?.kcal)||0,balance=intake-estimate.tdee;
    let balanceLabel='Sin comidas registradas',balanceValue='—',balanceClass='';
    if(items.length){
      if(Math.abs(balance)<50){balanceLabel='Cerca de mantenimiento';balanceValue=fmtKcal(balance);}
      else if(balance<0){balanceLabel='Déficit provisional';balanceValue=`−${fmtKcal(Math.abs(balance))}`;balanceClass='good';}
      else{balanceLabel='Superávit provisional';balanceValue=`+${fmtKcal(balance)}`;balanceClass='warn';}
    }
    const activity=activityInfo(estimate.activity);
    return `<div class="card" id="metabolismFoodCard"><div class="row between"><div><div class="eyebrow">Balance energético</div><strong>Gasto y déficit estimados</strong></div><button type="button" class="btn ghost small" onclick="goToMetabolismSettings()">Ajustar</button></div><div class="grid2 compact-metrics" style="margin-top:10px"><div class="metric"><div class="k">Metabolismo basal</div><div class="v">${fmtKcal(estimate.bmr)}</div></div><div class="metric"><div class="k">Gasto diario estimado</div><div class="v">${fmtKcal(estimate.tdee)}</div></div><div class="metric"><div class="k">Ingerido hoy</div><div class="v">${items.length?fmtKcal(intake):'—'}</div></div><div class="metric"><div class="k">${balanceLabel}</div><div class="v ${balanceClass}">${balanceValue}</div></div></div><div class="nutrition-note">Actividad: ${esc(activity.label)} · factor ${String(activity.value).replace('.',',')}. El gasto es una media diaria aproximada, no las calorías exactas quemadas hoy. El balance cambia a medida que registras comidas.</div></div>`;
  }

  function metabolismSettingsHTML(){
    const p=profile(),weight=latestBodyWeight(),selectedActivity=Number(p.activityFactor)||DEFAULT_ACTIVITY;
    const options=ACTIVITY_LEVELS.map(item=>`<option value="${item.value}" ${Math.abs(item.value-selectedActivity)<0.001?'selected':''}>${esc(item.label)} · ${String(item.value).replace('.',',')} — ${esc(item.detail)}</option>`).join('');
    const sex=p.sex||'';
    return `<div class="card" id="metabolismSettingsCard"><div class="row between"><div><div class="eyebrow">Metabolismo y gasto energético</div><strong>Estimación de mantenimiento</strong></div><span class="pill">Mifflin–St Jeor</span></div><div class="subtitle" style="margin-top:8px">MAREVO calcula tu metabolismo basal y después estima tu gasto energético diario con un factor de actividad. El peso se toma de la última medición corporal${weight?` (${Number(weight.toFixed(1)).toLocaleString('es-ES')} kg)`:''}.</div><div class="formgrid" style="margin-top:10px"><div class="field"><label>Sexo para la fórmula</label><select id="metSex"><option value="" ${!sex?'selected':''}>Seleccionar</option><option value="male" ${sex==='male'?'selected':''}>Hombre</option><option value="female" ${sex==='female'?'selected':''}>Mujer</option></select></div><div class="field"><label>Fecha de nacimiento</label><input id="metBirth" type="date" value="${esc(p.birthDate||'')}"></div><div class="field"><label>Altura (cm)</label><input id="metHeight" inputmode="decimal" value="${p.heightCm??''}" placeholder="Ej. 175"></div><div class="field wide"><label>Nivel de actividad</label><select id="metActivity">${options}</select></div></div><div class="callout" style="margin-top:10px"><strong>Actividad sugerida: Muy activo (1,725).</strong> Tu planificación actual combina tres sesiones de natación y tres sesiones de fuerza por semana, además de complementos y movilidad. Es un buen punto de partida, pero el gasto real se debe calibrar con la evolución del peso durante varias semanas.</div>${weight?'':`<div class="callout" style="margin-top:10px">Todavía falta el peso. Registra una medición corporal y MAREVO la usará automáticamente.</div>`}<div class="actions"><button type="button" class="btn" onclick="saveMetabolismSettings()">Guardar metabolismo</button></div></div>`;
  }

  function injectFoodCard(){
    const root=document.getElementById('viewFood');
    if(!root||root.querySelector('#metabolismFoodCard'))return;
    const topCards=[...root.children].filter(el=>el.classList?.contains('card'));
    const anchor=topCards[1]||topCards[0];
    if(anchor)anchor.insertAdjacentHTML('afterend',foodMetabolismCardHTML(currentDate()));
    else root.insertAdjacentHTML('afterbegin',foodMetabolismCardHTML(currentDate()));
  }

  function injectSettingsCard(){
    const root=document.getElementById('viewSettings'),section=root?.querySelector('#nutritionSettings');
    if(!root||!section||root.querySelector('#metabolismSettingsCard'))return;
    const anchor=section.nextElementSibling;
    if(anchor)anchor.insertAdjacentHTML('afterend',metabolismSettingsHTML());
    else section.insertAdjacentHTML('afterend',metabolismSettingsHTML());
  }

  window.saveMetabolismSettings=function(){
    const sex=document.getElementById('metSex')?.value||'';
    const birthDate=document.getElementById('metBirth')?.value||'';
    const height=parseDecimal(document.getElementById('metHeight')?.value);
    const activity=parseDecimal(document.getElementById('metActivity')?.value)||DEFAULT_ACTIVITY;
    if(sex!=='male'&&sex!=='female'){toast('Selecciona el sexo para la fórmula');return;}
    if(!ageOn(currentDate(),birthDate)){toast('Introduce una fecha de nacimiento válida');return;}
    if(!height||height<120||height>230){toast('Introduce una altura válida en cm');return;}
    if(!ACTIVITY_LEVELS.some(item=>Math.abs(item.value-activity)<0.001)){toast('Selecciona un nivel de actividad válido');return;}
    state.metabolism={sex,birthDate,heightCm:height,activityFactor:activity};
    saveState();
    toast('Estimación metabólica guardada');
    renderSettings();
  };

  window.goToMetabolismSettings=function(){
    showView('Settings');
    setTimeout(()=>document.getElementById('metabolismSettingsCard')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
  };

  const oldRenderFood=renderFood;
  renderFood=function(){
    oldRenderFood();
    injectFoodCard();
  };

  const oldRenderSettings=renderSettings;
  renderSettings=function(){
    oldRenderSettings();
    injectSettingsCard();
  };
})();
