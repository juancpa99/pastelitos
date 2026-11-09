const assert = require("node:assert/strict"),
  test = require("node:test"),
  C = require("../coach-engine.js");
const e = {
  key: "incline_db_press",
  name: "Press",
  type: "strength",
  sets: 4,
  min: 8,
  max: 12,
  rir: "1–2",
  loadProfile: {
    mode: "dumbbell",
    increment: 2,
    machine: "",
    base: "",
    unilateral: false,
  },
};
const set = (reps = 12, kg = 18, rir = 2) => ({
  kg,
  reps,
  rir,
  attemptType: "effective",
  completedAt: 1,
});
const session = (date, reps = [12, 11, 10, 9], extra = {}) => ({
  date,
  key: "nov26_push",
  completed: true,
  exercises: [{ ...e, recordedSets: reps.map((n) => set(n)), ...extra }],
});
const recommend = (rows, ex = e, extra = {}) =>
  C.recommend({ sessions: rows, ...extra }, ex, "2026-12-29");
test("empty history gives no invented load", () => {
  const r = recommend([]);
  assert.equal(r.action, "calibrate");
  assert.equal(r.targets[0].kg, null);
});
test("double progression adds one total repetition", () => {
  const r = recommend([session("2026-12-01")]);
  assert.deepEqual(
    r.targets.map((s) => s.reps),
    [12, 12, 10, 9],
  );
  assert.equal(r.targets[0].kg, 18);
});
test("all sets at ceiling increase by equipment step", () => {
  const r = recommend([session("2026-12-01", [12, 12, 12, 12])]);
  assert.equal(r.action, "load");
  assert.equal(r.targets[0].kg, 20);
  assert.equal(r.targets[0].reps, 8);
});
test("missing, negative or excessive RIR never permits increase", () => {
  for (const rir of ["", null, -1, 11]) {
    const s = session("2026-12-01", [12, 12, 12, 12], {
      recordedSets: Array.from({ length: 4 }, () => set(12, 18, rir)),
    });
    assert.equal(recommend([s]).action, "hold");
  }
});
test("work below target is retained; warmup and incomplete are distinct", () => {
  assert.equal(C.classify(e, set(6)).kind, "outside-range");
  assert.equal(
    C.classify(e, { ...set(), attemptType: "warmup" }).kind,
    "warmup",
  );
  assert.equal(
    C.classify(e, { ...set(), completedAt: null }).kind,
    "incomplete",
  );
  assert.equal(C.classify(e, set(10, 18, "")).kind, "work");
});
test("mixed loads preserve each set reference", () => {
  const s = session("2026-12-01", [12, 12, 12, 12], {
    recordedSets: [set(12, 20), set(12, 18), set(12, 16), set(12, 14)],
  });
  assert.deepEqual(
    recommend([s]).targets.map((s) => s.kg),
    [22, 20, 18, 16],
  );
});
test("different machines, variants, convention and base are not comparable", () => {
  for (const patch of [
    { machine: "B" },
    { variant: "neutral" },
    { mode: "plates" },
    { base: 20 },
  ]) {
    const ex = { ...e, loadProfile: { ...e.loadProfile, ...patch } };
    assert.equal(recommend([session("2026-12-01")], ex).sufficiency, "none");
  }
});
test("bodyweight, lastre and assistance have separate semantics", () => {
  const make = (mode) => ({ ...e, loadProfile: { ...e.loadProfile, mode } });
  for (const [mode, action, kg] of [
    ["bodyweight", "configure", 18],
    ["weighted", "load", 20],
    ["assisted", "load", 16],
  ]) {
    const ex = make(mode),
      s = session("2026-12-01", [12, 12, 12, 12], {
        loadProfile: ex.loadProfile,
      }),
      r = recommend([s], ex);
    assert.equal(r.action, action);
    assert.equal(r.targets[0].kg, kg);
  }
});
test("unilateral requires both sides, preserves separate loads", () => {
  const ex = { ...e, loadProfile: { ...e.loadProfile, unilateral: true } };
  const ss = Array.from({ length: 4 }, () => ({
    ...set(),
    rightKg: 16,
    rightReps: 12,
    rightRir: 2,
    rightCompletedAt: 1,
  }));
  assert.equal(
    C.classify(ex, { ...ss[0], rightCompletedAt: null }).kind,
    "incomplete",
  );
  const s = session("2026-12-01", [], {
      loadProfile: ex.loadProfile,
      recordedSets: ss,
    }),
    r = recommend([s], ex);
  assert.equal(r.targets[0].kg, 20);
  assert.equal(r.targets[0].rightKg, 18);
});
test("incomplete exposure prevents load increase", () => {
  assert.equal(recommend([session("2026-12-01", [12, 12])]).action, "hold");
});
test("stable and slow improvements differ", () => {
  const dates = ["2026-12-01", "2026-12-08", "2026-12-15", "2026-12-22"];
  assert.equal(recommend(dates.map((d) => session(d))).trend, "stable");
  assert.equal(
    recommend(dates.map((d, i) => session(d, [8 + i, 8, 8, 8]))).trend,
    "improving",
  );
});
test("isolated loss is not persistent decline", () => {
  assert.notEqual(
    recommend([session("2026-12-01"), session("2026-12-08", [10, 10, 9, 8])])
      .trend,
    "declining",
  );
});
test("repeated decline with fatigue suggests review", () => {
  const r = recommend(
    [
      session("2026-12-01", [12, 12, 12, 12]),
      session("2026-12-08", [11, 11, 11, 11]),
      session("2026-12-15", [10, 10, 10, 10]),
    ],
    e,
    { daily: [{ date: "2026-12-29", fatigue: 8 }] },
  );
  assert.equal(r.action, "reduce-fatigue");
});
test("pain blocks increases even with a ceiling", () => {
  assert.equal(
    recommend([session("2026-12-01", [12, 12, 12, 12])], e, {
      daily: [{ date: "2026-12-29", pain: 5 }],
    }).action,
    "pain",
  );
});
test("Madrid week boundaries cross year and daylight saving", () => {
  assert.equal(C.monday("2027-01-01"), "2026-12-28");
  assert.equal(C.dateISO("2026-11-08T23:30:00Z"), "2026-11-09");
  assert.equal(C.dateISO("2027-03-28T22:30:00Z"), "2027-03-29");
});
test("26 weeks then perpetual cycles", () => {
  assert.equal(C.planning("2027-05-30").week, 26);
  assert.equal(C.planning("2027-05-31").current.id, 6);
  assert.equal(C.planning("2030-01-01").current.name, "Continuidad");
  assert.equal(C.phases("2027-05-30").at(-1).end, "2027-05-30");
});
test("direct and indirect counted separately including failed target", () => {
  const v = C.volume([session("2026-12-01", [6, 8, 10, 12])]);
  assert.equal(v.Pectoral.direct, 4);
  assert.equal(v.Tríceps.indirect, 4);
  assert.equal(v.Tríceps.direct, 0);
});
test("partial weeks never propose volume increase", () => {
  assert.deepEqual(
    C.proposeVolume(C.weekly({ sessions: [] }, "2026-12-01", [])),
    [],
  );
});
test("proposal requires recovery and stable multiple exposures", () => {
  const report = {
    partial: false,
    start: "2026-12-21",
    plan: { upcoming: false },
    completed: 3,
    recovery: { sufficient: true, pain: 0, tired: false },
    volume: { Pectoral: { direct: 8, indirect: 0 } },
    planned: { Pectoral: { direct: 8 } },
    recommendations: [
      { exercise: e, exerciseKey: e.key, trend: "stable", evidence: [], last: {date:"2026-12-22"}, action:"reps" },
    ],
  };
  assert.equal(C.proposeVolume(report)[0].delta, 1);
  assert.deepEqual(C.proposeVolume({ ...report, completed: 2 }), []);
  assert.deepEqual(
    C.proposeVolume({
      ...report,
      recovery: { ...report.recovery, sufficient: false },
    }),
    [],
  );
});
test("placement respects companion, swim, Sunday and availability", () => {
  const p = { id: "p", week: "2026-12-28", expires: "2027-01-03", delta: 1 };
  const slot = {
    date: "2027-01-03",
    mode: "solo",
    available: true,
    capacity: 1,
    optional: true,
    confirmed: true,
  };
  assert.equal(C.schedule(p, [slot]).status, "scheduled");
  for (const patch of [
    { mode: "acompaniado" },
    { swim: true },
    { confirmed: false },
    { capacity: 0 },
    { started: true },
  ])
    assert.equal(C.schedule(p, [{ ...slot, ...patch }]).status, "no-slot");
});
test("rejecting increase or deload does not apply it; log immutable", () => {
  for (const type of ["add", "reduce"]) {
    const p = { id: type, type },
      log = [];
    const next = C.decision(log, p, "rejected", "2026-12-27");
    assert.equal(log.length, 0);
    assert.equal(next[0].action, "rejected");
    assert.throws(() => C.decision(next, p, "applied", "2026-12-27"));
  }
});
test("accepted and applied states require explicit placement", () => {
  const p = { id: "x" };
  assert.throws(() => C.decision([], p, "accepted", "now"));
  let log = C.decision([], p, "accepted", "now", {
    status: "scheduled",
    date: "2027-01-03",
  });
  log = C.decision(log, p, "applied", "later");
  assert.equal(log.length, 2);
});
test("analysis never modifies input", () => {
  const data = { sessions: [session("2026-12-01")] },
    before = JSON.stringify(data);
  C.weekly(data, "2026-12-06", [{ exercises: [e] }]);
  assert.equal(JSON.stringify(data), before);
});
test("body change requires long enough interval", () => {
  assert.equal(
    C.bodyReview(
      {
        body: [
          { date: "2026-12-01", weight: 58 },
          { date: "2026-12-08", weight: 59 },
        ],
      },
      "2026-12-30",
    ).weight,
    null,
  );
});

test("old history is a reference, not a load increase", () => {
  assert.equal(
    C.recommend(
      { sessions: [session("2026-11-01", [12, 12, 12, 12])] },
      e,
      "2026-12-29",
    ).action,
    "hold",
  );
});

test("calibration does not propose additional volume", () => {
  const r = {
    partial: false,
    plan: { week: 2 },
    recovery: { tired: false, pain: 0, sufficient: true },
    recommendations: [],
    completed: 3,
  };
  assert.deepEqual(C.proposeVolume(r), []);
});
test("longitudinal PPL dedup and missed sessions, no Sunday obligation", () => {
  const d = {
    sessions: [session("2026-12-01"), session("2026-12-02")],
    extraSessions: [
      {
        id: "sunday",
        date: "2026-12-06",
        marevoSunday: true,
        completed: true,
        exercises: [],
      },
    ],
  };
  const r = C.longitudinal(d, "2026-12-06");
  assert.equal(r.pplDue, 3);
  assert.equal(r.pplCompleted, 1);
  assert.equal(r.sessions, 3);
});
test("invalid RIR can use valid RPE without assuming zero", () => {
  assert.equal(C.classify(e, { ...set(), rir: "", rpe: 8 }).rir, 2);
  assert.equal(C.classify(e, { ...set(), rir: "", rpe: "" }).rir, null);
});
