const test = require('node:test');
const assert = require('node:assert/strict');
const volume = require('../progress.js');

const catalog = [
  {key:'bench_press',muscle:'Pectoral'},
  {key:'military_press',muscle:'Hombros'},
  {key:'biceps_curl',muscle:'Bíceps'},
  {key:'single_leg_rdl',muscle:'Isquios'},
  {key:'hip_thrust',muscle:'Glúteos'},
  {key:'side_plank',muscle:'Abdomen y oblicuos'}
];
const set = (reps = 10, kg = 20) => ({kg,reps,completedAt:123,attemptType:'effective'});
const exercise = (key, muscle, sets, extra = {}) => ({
  key, muscle, type:'strength', kind:'strength', recordedSets:sets, loadProfile:{unilateral:false}, ...extra
});
const session = (date, exercises, completed = true) => ({
  date, completed, exercises, id:date+'-'+exercises.length
});

test('week buckets start Monday and do not split Sunday/Monday or year boundaries', () => {
  assert.equal(volume.periodKey('2026-11-09','week'),'2026-11-09');
  assert.equal(volume.periodKey('2026-11-15','week'),'2026-11-09');
  assert.equal(volume.periodKey('2026-11-16','week'),'2026-11-16');
  assert.equal(volume.periodKey('2027-01-01','week'),'2026-12-28');
  assert.equal(volume.previousKey('2026-11-09','week'),'2026-11-02');
  assert.equal(volume.recentKeys('2026-11-14','week').length,8);
});
test('month buckets and previous-month lookup work across a year boundary', () => {
  assert.equal(volume.periodKey('2026-11-14','month'),'2026-11');
  assert.equal(volume.previousKey('2027-01','month'),'2026-12');
  assert.equal(volume.periodLabel('2026-11','month'),'nov 2026');
  const keys=volume.recentKeys('2027-02-10','month');
  assert.deepEqual(keys,['2026-09','2026-10','2026-11','2026-12','2027-01','2027-02']);
});
test('direct sets plus half of the identified indirect set contributions, without counting stabilizers',()=>{
  const rows=[
    session('2026-11-12',[
      exercise('bench_press','Pectoral',[set(),{...set(),attemptType:'warmup'},set()]),
      exercise('military_press','Hombros + tríceps',[set(),set(),set()]),
      exercise('biceps_curl','Bíceps',[set(),{...set(),completedAt:null}]),
      exercise('custom_one','Glúteos',[set(),set()]),
      exercise('other','Unknown',[set()])
    ])
  ];
  const original=JSON.stringify(rows);
  const breakdown=volume.detailedVolumes(rows,catalog,'week').get('2026-11-09');
  const v=breakdown.combined;
  assert.equal(v.Pectoral,2);
  assert.equal(v.Hombros,4,'bench press adds 1 indirect equivalent to 3 overhead-press direct sets');
  assert.equal(breakdown.direct.Tríceps,0,'no direct triceps sets');
  assert.equal(breakdown.indirect.Tríceps,2.5,'2 press sets plus 3 overhead press sets -> (2+3)*0.5');
  assert.equal(v.Tríceps,2.5);
  assert.equal(v.Bíceps,1);
  assert.equal(v.Glúteos,2);
  assert.equal(Object.values(v).reduce((a,b)=>a+b,0),11.5,'total summed across muscles is equivalent stimulus, not physical set count');
  assert.equal(JSON.stringify(rows),original,'never mutates training records');
});
test('unilateral work counts a complete left-and-right pair exactly once',()=>{
  const uni=exercise('single_leg_rdl','Isquios',[
    {...set(),rightCompletedAt:123,rightKg:18,rightReps:9},
    {...set(),rightCompletedAt:null,rightKg:18,rightReps:9},
    {...set(),attemptType:'warmup',rightCompletedAt:123},
    {...set(),rightCompletedAt:124,rightKg:18,rightReps:9},
  ],{loadProfile:{unilateral:true}});
  const rows=[session('2026-11-14',[uni])];
  assert.equal(volume.workSets(uni).length,2);
  assert.equal(volume.volumes(rows,catalog,'week').get('2026-11-09').Isquios,2);
});
test('unfinished sessions and exercises with zero finished work do not create false volume',()=>{
  const rows=[
    session('2026-11-10',[exercise('bench_press','Pectoral',[set(),set()])],false),
    session('2026-11-12',[exercise('bench_press','Pectoral',[{...set(),completedAt:null}])]),
    session('2026-11-16',[exercise('bench_press','Pectoral',[set()])])
  ];
  const snapshot=volume.snapshot(rows,catalog,'2026-11-16','week');
  assert.equal(snapshot.current.Pectoral,1);
  assert.equal(snapshot.previous.Pectoral,0);
  assert.equal(snapshot.total,2,'one bench press creates 1 chest + 0.5 triceps + 0.5 shoulders');
  assert.equal(snapshot.rows.length,8);
  assert.equal(snapshot.rows.at(-2).total,0);
});
test('weekly and monthly snapshots compare the correct periods and fill gaps with zero',()=>{
  const rows=[
    session('2026-10-31',[exercise('hip_thrust','Glúteos',[set()])]),
    session('2026-11-01',[exercise('hip_thrust','Glúteos',[set(),set()])]),
    session('2026-11-09',[exercise('hip_thrust','Glúteos',[set(),set(),set()])]),
    session('2026-11-14',[exercise('hip_thrust','Glúteos',[set()])])
  ];
  const weekly=volume.snapshot(rows,catalog,'2026-11-14','week');
  assert.equal(weekly.current.Glúteos,4);
  assert.equal(weekly.previous.Glúteos,0);
  const monthly=volume.snapshot(rows,catalog,'2026-11-14','month');
  assert.equal(monthly.current.Glúteos,6);
  assert.equal(monthly.previous.Glúteos,1);
  assert.equal(monthly.rows.length,6);
  assert.equal(monthly.rows.at(-1).key,'2026-11');
});
test('SVG radar has all zones and comparison series, trend SVG labels each period',()=>{
  const now=volume.empty(),prior=volume.empty();
  now.Bíceps=9;prior.Bíceps=5;
  now.Cuádriceps=6;
  const radar=volume.radarSvg(now,prior);
  assert.match(radar,/<svg/);
  assert.match(radar,/radar-current/);
  assert.match(radar,/radar-previous/);
  assert.match(radar,/Femoral/);
  assert.match(radar,/Cuádriceps/);
  assert.match(radar,/Bíceps: 9 series equivalentes/);
  const rows=volume.snapshot([
    session('2026-11-09',[exercise('biceps_curl','Bíceps',[set(),set()])])
  ],catalog,'2026-11-14','week').rows;
  const trend=volume.trendSvg(rows,'Bíceps','week');
  assert.match(trend,/Evolución semanal/);
  assert.match(trend,/09\/11: 2 series/);
  assert.match(trend,/trend-line/);
  assert.equal(volume.AXES.length,12);
});

test('compound exercise roles are explicit, never counted as half sets for every stabiliser',()=>{
 const examples=[
   ['bench_press','Pectoral',['Tríceps','Hombros']],
   ['incline_db_press','Pectoral',['Tríceps','Hombros']],
   ['military_press','Hombros',['Tríceps']],
   ['pull_up','Espalda',['Bíceps']],
   ['barbell_row','Espalda',['Bíceps','Hombros']],
   ['back_squat','Cuádriceps',['Glúteos','Aductores']],
   ['leg_press','Cuádriceps',['Glúteos','Aductores']],
   ['rdl','Isquios',['Glúteos']],
   ['sumo_deadlift','Glúteos',['Cuádriceps','Isquios','Aductores']],
   ['db_pullover','Espalda',['Pectoral']],
   ['cable_woodchop','Abdomen y oblicuos',[]]
 ];
 for (const [key,primary,secondary] of examples){
   const catMuscle=catalog.find(c=>c.key===key)?.muscle||primary;
   const r=volume.roles({key,muscle:catMuscle},[
     ...catalog,{key,muscle:catMuscle}]);
   assert.equal(r.primary,primary,key);
   assert.deepEqual(r.indirect,secondary,key);
 }
 assert.equal(volume.INDIRECT_WEIGHT,0.5);
 const curl=volume.roles({key:'biceps_curl',muscle:'Bíceps'},catalog);
 assert.deepEqual(curl.indirect,[]);
 const farmer=volume.roles({key:'farmer_carry',muscle:'Antebrazo'},catalog);
 assert.deepEqual(farmer.indirect,[],'no extra half-set is added for general stabilisation');
});
test('all catalogue entries have an identifiable primary muscle and no overlapping secondary role',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
 const sandbox={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../catalog.js'),'utf8'),sandbox);
 assert.ok(sandbox.window.SERIE_CATALOG.length>140);
 for (const cat of sandbox.window.SERIE_CATALOG){
   const r=volume.roles(cat,sandbox.window.SERIE_CATALOG);
   assert.ok(volume.AXES.some(([name])=>name===r.primary),cat.key);
   assert.equal(r.indirect.includes(r.primary),false,cat.key);
   assert.equal(r.indirect.length,new Set(r.indirect).size,cat.key);
 }
});
test('fractional model gives weekly direct, indirect and total and keeps finished sets from past records',()=>{
 const rows=[
   session('2026-11-09',[
     exercise('bench_press','Pectoral',[set(),set(),set()]),
     exercise('pull_up','Espalda',[set(),set(),set(),set()]),
     exercise('biceps_curl','Bíceps',[set(),set()]),
     exercise('back_squat','Cuádriceps',[set(),set()]),
   ])
 ];
 const snapshot=volume.snapshot(rows,catalog,'2026-11-14','week');
 assert.equal(snapshot.currentDetail.direct.Bíceps,2);
 assert.equal(snapshot.currentDetail.indirect.Bíceps,2);
 assert.equal(snapshot.current.Bíceps,4);
 assert.equal(snapshot.current.Tríceps,1.5);
 assert.equal(snapshot.current.Hombros,1.5);
 assert.equal(snapshot.current.Glúteos,1);
 assert.equal(snapshot.current.Aductores,1);
 assert.equal(snapshot.currentDetail.direct.Aductores,0);
 const contributions=volume.contributions(rows,catalog,'2026-11-09','week');
 const biceps=contributions.filter(r=>r.muscle==='Bíceps');
 assert.equal(biceps.length,2);
 assert.equal(biceps.find(r=>r.type==='direct').equivalent,2);
 assert.equal(biceps.find(r=>r.type==='indirect').equivalent,2);
 assert.equal(biceps.find(r=>r.type==='indirect').sets,4);
 const radar=volume.radarSvg(snapshot.current,snapshot.previous,snapshot.currentDetail.direct);
 assert.match(radar,/radar-direct/);
 assert.match(radar,/Bíceps: 4 series equivalentes/);
 assert.match(radar,/2 directas \+ 2 indirectas ponderadas/);
 const trend=volume.trendSvg(snapshot.rows,'Bíceps','week');
 assert.match(trend,/09\/11: 4 series/);
});
test('optional per-exercise manual attribution overrides automatic roles without counting the primary twice',()=>{
 const original={key:'bench_press',muscle:'Pectoral',progressPrimary:'Tríceps',
   progressSecondary:['Tríceps','Espalda','Espalda','Hombros','Unknown']};
 const old=JSON.stringify(original);
 assert.deepEqual(volume.roles(original,catalog),{primary:'Tríceps',indirect:['Espalda','Hombros']});
 const rows=[session('2026-11-14',[exercise(original.key,original.muscle,[set(),set()],original)])];
 const b=volume.detailedVolumes(rows,catalog,'week').get('2026-11-09');
 assert.equal(b.direct.Tríceps,2);
 assert.equal(b.indirect.Tríceps,0);
 assert.equal(b.indirect.Espalda,1);
 assert.equal(b.indirect.Hombros,1);
 assert.equal(b.indirect.Pectoral,0);
 assert.equal(JSON.stringify(original),old);
});
