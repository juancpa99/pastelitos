const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function boot(saved){
 const dom=new JSDOM(html.replace(/<script[^>]*src=[^>]*><\/script>/g,''),{url:'https://example.test/training-lab/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,run=code=>vm.runInContext(code,dom.getInternalVMContext());
 w.matchMedia=()=>({matches:false,addEventListener(){}});w.ResizeObserver=class{observe(){}};w.structuredClone=structuredClone;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 if(saved)w.localStorage.setItem('training_lab_v4',saved);
 for(const m of html.matchAll(/<script src="([^"?]+)(?:\?[^\"]*)?"><\/script>/g))run(fs.readFileSync(path.join(root,m[1]),'utf8'));
 return {dom,run};
}
const {dom,run}=boot();
try{
 const forbidden=e=>/med_ball|slam|chest_pass/.test(e.key);
 for(const date of ['2026-10-06','2026-10-20','2026-11-24']){
  const push=run(`oct26TemplateForKey('oct26_push','${date}')`);
  assert.equal(push.exercises[0].key,'cable_power_pullover');
  assert.match(push.exercises[0].dose,/3 × 5/);
  assert.match(push.exercises[0].note,/placas no deben golpearse/);
  assert.ok(!push.exercises.some(forbidden));
  assert.equal(run(`oct26TemplateForKey('oct26_legs_a','${date}').exercises[0].key`),'vertical_jump');
 }
 assert.equal(run(`SEP26_PLANS['2'].exercises[0].key`),'power_incline_push_up');
 assert.equal(run(`EXERCISE_LIBRARY.filter(e=>e.key==='cable_power_pullover').length`),1);
 const saved=JSON.parse(run(`JSON.stringify(state)`)),today=run('todayISO()');
 const old={key:'med_ball_slam',name:'Slam con balón medicinal',type:'mobility',done:false};
 const strength={key:'bench_press',type:'strength',recordedSets:[{kg:60,reps:6,completedAt:123}]};
 saved.sessions=[{date:today,key:'oct26_push',title:'Push',startedAt:100,completed:false,exercises:[structuredClone(old),structuredClone(strength)]},{date:today,key:'oct26_push',title:'Push antiguo',completed:true,exercises:[{...structuredClone(old),done:true}]}];
 saved.extraSessions=[{id:'extra',date:today,kind:'gym',completed:false,startedAt:101,exercises:[{...structuredClone(old),key:'med_ball_chest_pass'}]}];
 saved.customPlans={gym:{'2':{key:'custom',type:'gym',exercises:[structuredClone(old)]}}};
 const restored=boot(JSON.stringify(saved));
 try{
  assert.equal(restored.run(`state.sessions.find(s=>!s.completed).exercises[0].key`),'cable_power_pullover','in-progress unperformed exercise upgraded');
  assert.equal(restored.run(`JSON.stringify(state.sessions.find(s=>!s.completed).exercises[1].recordedSets)`),JSON.stringify(strength.recordedSets));
  assert.equal(restored.run(`state.sessions.find(s=>s.completed).exercises[0].key`),'med_ball_slam','completed history preserved');
  assert.equal(restored.run(`state.extraSessions.find(s=>s.id==='extra').exercises[0].key`),'power_incline_push_up');
  assert.equal(restored.run(`state.customPlans.gym['2'].exercises[0].key`),'cable_power_pullover');
  const again=boot(restored.dom.window.localStorage.getItem('training_lab_v4'));
  try{assert.equal(again.run(`state.sessions.find(s=>!s.completed).exercises[0].key`),'cable_power_pullover')}finally{again.dom.window.close()}
 }finally{restored.dom.window.close()}
 const assets=JSON.parse(fs.readFileSync(path.join(root,'sw.js'),'utf8').match(/const ASSETS=(\[[^\n]+\]);/)[1]);
 for(const m of html.matchAll(/src="((?:gym-friendly-power|oct26-v2-plan|phase-sep2026|phase-oct2026-pplul)\.js\?v=\d+)"/g))assert.ok(assets.includes('./'+m[1]));
 console.log('Power replacements, retained jumps, active-session migration, untouched completed history and reload passed.');
}finally{dom.window.close()}
