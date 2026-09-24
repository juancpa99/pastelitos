// Calendar-aligned buckets; current period is intentionally shown as incomplete.
function progressBuckets(ref,period){
 const count=period==='day'?1:4,rows=[];
 for(let n=count-1;n>=0;n--){
  let start,end;
  if(period==='month'){const d=new Date(ref+'T12:00:00Z');d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-n);start=d.toISOString().slice(0,10);d.setUTCMonth(d.getUTCMonth()+1);d.setUTCDate(0);end=d.toISOString().slice(0,10);}
  else if(period==='week'){start=addDaysISO(mondayOf(ref),-7*n);end=addDaysISO(start,6);}
  else start=end=ref;
  end=end>ref?ref:end;
  const label=period==='day'?'Hoy':n===0?(period==='week'?'Esta semana':'Este mes'):new Date(start+'T12:00:00').toLocaleDateString('es-ES',period==='month'?{month:'short'}:{day:'numeric',month:'short'});
  rows.push({start,end,label,sessions:allCompletedTraining().filter(s=>s.date>=start&&s.date<=end)});
 }
 return rows;
}
function seriesByMuscle(sessions){
 const totals=Object.fromEntries(MUSCLE_AXES.map(([name])=>[name,0]));
 sessions.forEach(s=>(s.exercises||[]).forEach(e=>{if(e.type==='mobility')return;const count=getEffectiveRecordedSets(e).length;muscleGroupsForExercise(e).forEach(g=>{if(g in totals)totals[g]+=count;});}));return totals;
}
function progressRadar(current,previous){
 const labels=MUSCLE_AXES.map(a=>a[0]),max=Math.max(1,...Object.values(current),...Object.values(previous||{})),cx=180,cy=157,R=101;
 const point=(i,v)=>{const a=-Math.PI/2+2*Math.PI*i/labels.length;return `${cx+Math.cos(a)*R*v},${cy+Math.sin(a)*R*v}`;};
 let svg='<svg viewBox="0 0 360 320" role="img" aria-label="Series por grupo muscular; turquesa actual, gris periodo anterior">';
 for(let l=1;l<=4;l++)svg+=`<polygon points="${labels.map((_,i)=>point(i,l/4)).join(' ')}" fill="none" stroke="#294050"/>`;
 labels.forEach((label,i)=>{const [x,y]=point(i,1.24).split(',');svg+=`<line x1="180" y1="157" x2="${point(i,1).split(',')[0]}" y2="${point(i,1).split(',')[1]}" stroke="#294050"/><text x="${x}" y="${y}" text-anchor="${+x<170?'end':+x>190?'start':'middle'}" dominant-baseline="middle" fill="#adc1ce" font-size="9">${esc(label)}</text>`;});
 if(previous)svg+=`<polygon points="${labels.map((g,i)=>point(i,previous[g]/max)).join(' ')}" fill="none" stroke="#9aafbd" stroke-dasharray="4 4" stroke-width="2"/>`;
 svg+=`<polygon points="${labels.map((g,i)=>point(i,current[g]/max)).join(' ')}" fill="#2dd4bf" fill-opacity=".18" stroke="#2dd4bf" stroke-width="2.5"/></svg>`;
 return svg+`<p class="chart-caption">Escala común: 0–${max} series por grupo. Los ejercicios compuestos cuentan en varios grupos.</p><details class="chart-values"><summary>Ver valores</summary>${labels.map(g=>`<div class="summaryline"><span>${esc(g)}</span><span>${current[g]}${previous?' / '+previous[g]+' anterior':''}</span></div>`).join('')}</details>`;
}
function trendBars(buckets,values,unit){
 const max=Math.max(1,...values.filter(v=>v!=null));
 return `<div class="trend-bars">${buckets.map((b,i)=>`<div class="trend-column"><strong>${values[i]==null?'—':values[i].toLocaleString('es-ES')}</strong><div class="trend-track"><span style="height:${values[i]==null?0:values[i]/max*100}%"></span></div><small>${esc(b.label)}</small></div>`).join('')}</div><p class="chart-caption">${esc(unit)}${values.every(v=>!v)?' · Aún no hay registros en este periodo.':''}</p>`;
}
function loadTrendHTML(ref,period,index=0){
 const buckets=progressBuckets(ref,period),groups=strengthChartGroups(ref).filter(g=>g.points.some(p=>p.date>=buckets[0].start));
 if(!groups.length)return '<div class="empty">Registra series de fuerza para ver la evolución de la carga por ejercicio.</div>';
 const g=groups[index]||groups[0];
 const values=buckets.map(b=>{const points=g.points.filter(p=>p.date>=b.start&&p.date<=b.end);return points.length?Math.max(...points.map(p=>p.left)):null;});
 return `<label class="chart-caption" for="trendExercise">Ejercicio y equipo</label><select id="trendExercise" onchange="changeLoadTrend(this.value)">${groups.map((g,i)=>`<option value="${i}" ${i===index?'selected':''}>${esc(g.exercise.name)} · ${esc(loadProfile(g.exercise).machine||loadProfile(g.exercise).mode)}</option>`).join('')}</select>${trendBars(buckets,values,'Carga máxima registrada (kg)')}<p class="chart-caption">Mismo ejercicio y equipo. La carga por sí sola no mide mejora: revisa repeticiones y RIR en Fuerza.${g.points.some(p=>p.right!=null)?' En ejercicios unilaterales se muestra el lado izquierdo; consulta ambos lados en Fuerza.':''}</p>`;
}
function changeLoadTrend(index){document.getElementById('loadTrend').innerHTML=loadTrendHTML(todayISO(),state.settings.progressPeriod||'week',+index);}
function progressCarouselHTML(ref,period){
 const buckets=progressBuckets(ref,period),last=buckets.at(-1),current=seriesByMuscle(last.sessions),previous=period==='day'?null:seriesByMuscle(buckets.at(-2).sessions);
 const sets=buckets.map(b=>b.sessions.reduce((n,s)=>n+(s.exercises||[]).reduce((a,e)=>a+(e.type==='mobility'?0:getEffectiveRecordedSets(e).length),0),0));
 const swims=buckets.map(b=>b.sessions.filter(s=>s._kind==='swim').reduce((n,s)=>n+(+s.meters||0),0));
 const slides=[['Distribución muscular',`<p class="chart-legend"><span>● Actual</span>${previous?' · ┄ Periodo anterior':''}</p>${progressRadar(current,previous)}`],['Volumen de fuerza',trendBars(buckets,sets,'Series efectivas registradas')],['Evolución de la carga',`<div id="loadTrend">${loadTrendHTML(ref,period)}</div>`],['Volumen de natación',trendBars(buckets,swims,'Metros nadados')]];
 return `<section class="progress-charts" aria-label="Gráficas de progreso"><div class="chart-navigation"><span>${period==='day'?'Actividad de hoy':'Últimos cuatro '+(period==='week'?'periodos semanales':'meses')}</span><div><button class="btn ghost small" aria-label="Gráfica anterior" onclick="moveProgressChart(-1)">‹</button><button class="btn ghost small" aria-label="Gráfica siguiente" onclick="moveProgressChart(1)">›</button></div></div>${period==='day'?'':'<p class="chart-caption">El periodo actual está en curso; los anteriores están completos.</p>'}<div class="chart-carousel" tabindex="0" aria-label="Desliza para ver otras gráficas">${slides.map(([title,body],i)=>`<article class="chart-slide" aria-label="${i+1} de 4: ${title}"><div class="row between"><h2>${title}</h2><small>${i+1} / 4</small></div>${body}</article>`).join('')}</div><p class="chart-caption">Desliza o usa las flechas: distribución · volumen · carga · natación.</p></section>`;
}
function moveProgressChart(direction){const el=document.querySelector('.chart-carousel');if(el)el.scrollTo({left:Math.max(0,Math.min(3,Math.round(el.scrollLeft/el.clientWidth)+direction))*el.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
