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
test('effective sets count once per primary zone, not for every involved muscle',()=>{
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
  const v=volume.volumes(rows,catalog,'week').get('2026-11-09');
  assert.equal(v.Pectoral,2);
  assert.equal(v.Hombros,3);
  assert.equal(v.Tríceps,0,'compound sets do not inflate triceps direct-set count');
  assert.equal(v.Bíceps,1);
  assert.equal(v.Glúteos,2);
  assert.equal(Object.values(v).reduce((a,b)=>a+b,0),8);
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
  assert.equal(snapshot.total,1);
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
  assert.match(radar,/Bíceps: 9 series/);
  const rows=volume.snapshot([
    session('2026-11-09',[exercise('biceps_curl','Bíceps',[set(),set()])])
  ],catalog,'2026-11-14','week').rows;
  const trend=volume.trendSvg(rows,'Bíceps','week');
  assert.match(trend,/Evolución semanal/);
  assert.match(trend,/09\/11: 2 series/);
  assert.match(trend,/trend-line/);
  assert.equal(volume.AXES.length,12);
});
