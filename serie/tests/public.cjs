const {JSDOM}=require('jsdom'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
function app(snapshot){const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script[^>]*>[\s\S]*?<\/script>/g,'');const dom=new JSDOM(html,{url:'https://example.test/serie/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,ctx=dom.getInternalVMContext(),run=s=>vm.runInContext(s,ctx);w.structuredClone=structuredClone;w.crypto.randomUUID=crypto.randomUUID;w.scrollTo=()=>{};w.scrollBy=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};w.confirm=()=>true;if(snapshot)w.localStorage.setItem('serie.public.v1',snapshot);for(const f of ['catalog.js','plans.js','coach.js','app.js','install.js','updates.js'])run(fs.readFileSync(path.join(root,f),'utf8'));return {w,run};}
const {w,run}=app();let count=0;function test(name,fn){fn();count++;console.log('PASS',name);}
try{
test('public app has four plans, no personal data, no nutrition or three-day UI',()=>{assert.equal(run('plans().length'),4);assert.equal(run('db.sessions.length'),0);assert.equal(run('db.days.join()'),'1,2,4,6');for(const page of ['train','history','progress','settings']){run(`navigate('${page}')`);assert.doesNotMatch(w.document.body.textContent,/MAREVO|dieta|comida|nutrici|3 días|Camilo/i);}assert.equal(run('SERIE_CATALOG.length'),new Set(run('SERIE_CATALOG.map(e=>e.key)')).size);assert.ok(run('SERIE_CATALOG.length')>130);assert.equal(run('SERIE_GROUPS.length'),12);assert.ok(run('SERIE_PLANS.every(p=>p.exercises.every(e=>catalogue(e.key)))'));});
test('closed session can add, edit and group existing/new exercises without changing date or losing sets',()=>{run("selectedDate='2026-11-14';startSession(3)");run("current().exercises[0].recordedSets[0]={kg:20,reps:10,rir:2,attemptType:'effective',completedAt:123};finishSession()");const date=run('current().date'),before=run('JSON.stringify(current().exercises[0].recordedSets)');const a=run('current().exercises[0].id'),b=run('current().exercises[1].id');run(`linkExercises('${a}','${b}');touch();render()`);assert.equal(run('groupMembers(current().exercises[0]).length'),2);run(`openLibrary('${a}');addExercise('db_row')`);assert.equal(run('groupMembers(current().exercises[0]).length'),3);assert.equal(run('current().date'),date);assert.equal(run('current().completed'),true);assert.equal(run('JSON.stringify(current().exercises[0].recordedSets)'),before);assert.ok(w.document.querySelector('.footer-add'));run(`editExercise('${a}')`);w.document.getElementById('edit-name').value='Press plano personalizado';w.document.getElementById('edit-sets').value='4';w.document.getElementById('edit-link').value='unlink';run(`saveExercise({preventDefault(){}},'${a}')`);assert.equal(run('current().exercises[0].name'),'Press plano personalizado');assert.equal(run('current().exercises[0].recordedSets[0].completedAt'),123);assert.equal(run('current().exercises[0].superset'),null);assert.equal(run('current().exercises[0].recordedSets.length'),4);});
test('drag reordering and template edits preserve records; future sessions use edited template',()=>{const id=run('current().exercises[0].id'),sets=run('JSON.stringify(current().exercises[0].recordedSets)');run(`moveExercise('${id}',3)`);assert.equal(run('current().exercises[3].id'),id);assert.equal(run('JSON.stringify(current().exercises[3].recordedSets)'),sets);run('saveTemplate()');const title=run('current().exercises[3].name');run("selectedDate='2026-11-21';startSession(3)");assert.equal(run('current().exercises[3].name'),title);assert.ok(run('current().exercises.every(e=>e.recordedSets.every(a=>!a.completedAt))'));assert.equal(run('db.sessions[0].completed'),true);});
test('superset timer waits for whole round, normal sets start rest',()=>{run("selectedDate='2026-11-16';startSession(0)");const a=run('current().exercises[0].id'),b=run('current().exercises[1].id');run(`linkExercises('${a}','${b}');render();current().exercises[0].recordedSets[0]={kg:20,reps:10,rir:2,attemptType:'effective'};toggleSet('${a}',0)`);assert.equal(run('restEnd'),0);run(`exercise('${b}').recordedSets[0]={kg:5,reps:15,rir:2,attemptType:'effective'};toggleSet('${b}',0)`);assert.ok(run('restEnd>Date.now()'));});
test('search handles accents and equipment and custom exercises',()=>{run('openLibrary()');w.document.getElementById('library-search').value='biceps';run('renderLibrary()');assert.match(w.document.getElementById('library-list').textContent,/Curl/);w.document.getElementById('library-search').value='';w.document.getElementById('library-equipment').value='Barra';w.document.getElementById('library-group').value='Pectoral';run('renderLibrary()');assert.match(w.document.getElementById('library-list').textContent,/banca/);assert.doesNotMatch(w.document.getElementById('library-list').textContent,/polea/);run('customExercise()');w.document.getElementById('custom-name').value='Mi variante';run('saveCustom({preventDefault(){}})');assert.equal(run('db.custom.at(-1).name'),'Mi variante');assert.ok(run("current().exercises.some(e=>e.name==='Mi variante')"));});
test('saved data reloads; malformed imports rejected; other app storage stays untouched',()=>{w.localStorage.setItem('trainingLab_v5','personal');run('save()');const snapshot=run('JSON.stringify(db)');const next=app(snapshot);assert.equal(next.run('db.sessions.length'),3);assert.equal(next.run('db.custom.length'),1);assert.equal(next.run('db.templates.length'),4);next.w.close();assert.equal(w.localStorage.getItem('trainingLab_v5'),'personal');assert.throws(()=>run("validateData({version:1,sessions:[],custom:[],days:[1,1,4,6]})"));assert.throws(()=>run("validateData({...db,sessions:[{id:'bad\"id'}]})"));});
test('progression reuses real history and never invents a first load',()=>{const e=run("instantiate(catalogue('bench_press'))");e.sets=3;e.min=6;e.max=10;e.loadProfile={mode:'barbell',machine:'bar',increment:2.5,base:'',unilateral:false};const C=w.SerieCoach;assert.equal(C.recommend({sessions:[]},e,'2026-11-20').targets[0].kg,null);const history={date:'2026-11-16',completed:true,exercises:[{...e,recordedSets:Array.from({length:3},()=>({kg:20,reps:10,rir:2,completedAt:123,attemptType:'effective'}))}]};assert.equal(C.recommend({sessions:[history]},e,'2026-11-20').targets[0].kg,22.5);});
test('all views render with records; assets are isolated and cached',()=>{run('closeDialog()');for(const page of ['train','history','progress','settings']){run(`navigate('${page}')`);assert.ok(w.document.getElementById('app').textContent.length>30);}const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');for(const match of html.matchAll(/(?:href|src)="([^"#]+\.(?:js|css|svg|png|webmanifest)(?:\?[^\"]*)?)"/g)){assert.ok(fs.existsSync(path.join(root,match[1].split('?')[0])),match[1]);assert.ok(sw.includes(match[1]),match[1]);}assert.ok(sw.includes("startsWith('serie-public-')"));assert.ok(!sw.includes('training-lab'));});
test('bayesian cable curl and incline dumbbell curl are separate searchable entries',()=>{
 const isolated=app(),r=isolated.run,w=isolated.w;
 assert.ok(r("catalogue('bayesian_cable_curl')"));
 assert.ok(r("catalogue('incline_behind_body_db_curl')"));
 r("selectedDate='2026-11-22';startSession(0);openLibrary()");
 w.document.getElementById('library-search').value='bayesiano';r('renderLibrary()');
 assert.match(w.document.getElementById('library-list').textContent,/bayesiano/i);
 w.document.getElementById('library-search').value='codos atrás';r('renderLibrary()');
 assert.match(w.document.getElementById('library-list').textContent,/banco inclinado/i);
 w.close();
});
test('in-progress session can be discarded without removing closed history',()=>{
 const isolated=app(),r=isolated.run,w=isolated.w;
 r("selectedDate='2026-11-19';startSession(0)");
 const first=r("current().id");
 r("current().exercises[0].recordedSets[0].completedAt=123;save()");
 r("discardSession()");
 assert.equal(r("db.sessions.length"),0);
 assert.equal(r("sessionId"),null);
 r("startSession(0)");
 assert.notEqual(r("current().id"),first);
 r("current().exercises.forEach(e=>e.recordedSets.forEach(a=>a.completedAt=123))");
 r("finishSession()");
 assert.equal(r("db.sessions.length"),1);
 r("discardSession()");
 assert.equal(r("db.sessions.length"),1);
 assert.ok(r("current().completed"));
 w.close();
});
test('install guide opens and remains available in settings',()=>{
 const isolated=app(),r=isolated.run,w=isolated.w;
 r('openInstallGuide(false)');
 assert.equal(w.document.getElementById('dialog').open,true);
 assert.match(w.document.getElementById('dialog').textContent,/pantalla de inicio/i);
 r('closeDialog()');
 r("navigate('settings')");
 assert.match(w.document.getElementById('app').textContent,/Cómo instalar SERIE/i);
 w.close();
});
test('training cards follow configured weekday order, swapping Thursday and Saturday without moving training data',()=>{
 const isolated=app(),r=isolated.run,doc=isolated.w.document;
 r("selectedDate='2026-11-12';startSession(2)");
 r("current().exercises[0].recordedSets[0]={kg:30,reps:10,rir:2,attemptType:'effective',completedAt:123}");
 r('finishSession()');
 const old=r("JSON.stringify(db.sessions[0])");
 r("navigate('settings');changeDay(2,6)");
 assert.equal(r('db.days.join()'),'1,2,6,4');
 assert.equal(r('JSON.stringify(db.sessions[0])'),old);
 assert.match(doc.getElementById('app').textContent,/intercambian los días/i);
 r("selectedDate='2026-11-19';navigate('train')");
 const cards=[...doc.querySelectorAll('.plan-card')];
 assert.deepEqual(cards.map(c=>c.querySelector('h2').textContent),['Hombros, pecho y brazos','Pierna y espalda','Pecho y hombros','Espalda y pierna']);
 assert.deepEqual(cards.map(c=>c.querySelector('.plan-number').textContent),['01','02','03','04']);
 assert.deepEqual(cards.map(c=>c.querySelector('.eyebrow').textContent),['Lunes','Martes','Jueves','Sábado']);
 assert.equal(cards[2].querySelector('button').getAttribute('onclick'),'startSession(3)');
 assert.match(cards[2].textContent,/Programada para hoy/);
 assert.match(doc.querySelector('.hero-aside').textContent,/Lun · Mar · Jue · Sáb/);
 r("selectedDate='2026-11-21';render()");
 assert.match(doc.querySelectorAll('.plan-card')[3].textContent,/Programada para hoy/);
 const snapshot=r('JSON.stringify(db)'),again=app(snapshot);
 assert.equal(again.run('db.days.join()'),'1,2,6,4');
 assert.match(again.w.document.querySelectorAll('.plan-card')[2].textContent,/Pecho y hombros/);
 assert.equal(again.run('db.sessions.length'),1);
 again.w.close();
 r('changeDay(0,0)');
 assert.equal([...doc.querySelectorAll('.plan-card')].at(-1).querySelector('h2').textContent,'Hombros, pecho y brazos');
 isolated.w.close();
});
console.log(`${count} public-app scenarios passed`);
}finally{w.close();}
