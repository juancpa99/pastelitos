/* Pure offline analysis. Engineering thresholds are documented in docs/adaptive-coach.md. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MarevoCoach = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const VERSION = 1,
    START = "2026-11-30",
    END = "2027-05-30";
  const PRIORITIES = [
    "Pectoral",
    "Deltoide lateral",
    "Bíceps",
    "Tríceps",
    "Espalda",
    "Cuádriceps",
    "Glúteo",
    "Gemelos",
    "Core",
  ];
  const num = (x) =>
    x === "" ||
    x == null ||
    !Number.isFinite(Number(String(x).replace(",", ".")))
      ? null
      : Number(String(x).replace(",", "."));
  const dateISO = (x) =>
    /^\d{4}-\d{2}-\d{2}$/.test(String(x))
      ? x
      : new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/Madrid",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(x));
  const add = (d, n) =>
    new Date(Date.parse(d + "T12:00:00Z") + n * 86400000)
      .toISOString()
      .slice(0, 10);
  const day = (d) => new Date(d + "T12:00:00Z").getUTCDay();
  const monday = (d) => add(dateISO(d), -(day(dateISO(d)) + 6) % 7);
  const range = (x) => {
    const ns = String(x ?? "1–2")
      .match(/\d+(?:\.\d+)?/g)
      ?.map(Number) || [1, 2];
    return [Math.min(...ns), Math.max(...ns)];
  };
  const mean = (a) =>
    a.length ? a.reduce((s, n) => s + n, 0) / a.length : null;
  function profile(e) {
    return (
      e.loadProfile || {
        mode: "unknown",
        machine: "unconfirmed",
        base: "",
        unilateral: !!e.unilateral,
      }
    );
  }
  function identity(e) {
    const p = profile(e);
    return JSON.stringify([
      e.key,
      p.mode,
      String(p.base ?? ""),
      p.machine || "",
      !!p.unilateral,
      e.variant || p.variant || "",
      e.technique || "",
    ]);
  }
  function classify(e, a) {
    if (a.attemptType === "warmup")
      return { kind: "warmup", work: false, goal: false };
    const p = profile(e),
      r = num(a.reps),
      kg = num(a.kg),
      rr = num(a.rightReps),
      rk = num(a.rightKg);
    const loadOK = kg != null && kg >= 0;
    const valid =
      !!a.completedAt &&
      r > 0 &&
      Number.isInteger(r) &&
      loadOK &&
      (!p.unilateral ||
        (!!a.rightCompletedAt &&
          rr > 0 &&
          Number.isInteger(rr) &&
          rk != null &&
          rk >= 0));
    if (!valid) return { kind: "incomplete", work: false, goal: false };
    const effort = (v) => {
      const n = num(v);
      return n != null && n >= 0 && n <= 10 ? n : null;
    };
    const rir =
        effort(a.rir) ??
        (num(a.rpe) >= 1 && num(a.rpe) <= 10 ? 10 - num(a.rpe) : null),
      rightRir = effort(a.rightRir);
    const [lo, hi] = range(e.rir),
      inside =
        r >= +e.min &&
        r <= +e.max &&
        (!p.unilateral || (rr >= +e.min && rr <= +e.max));
    const goal =
      inside &&
      rir != null &&
      rir >= lo &&
      rir <= hi &&
      (!p.unilateral || (rightRir != null && rightRir >= lo && rightRir <= hi));
    return {
      kind: !inside ? "outside-range" : goal ? "target" : "work",
      work: true,
      goal,
      kg,
      reps: r,
      rir,
      rightKg: rk,
      rightReps: rr,
      rightRir,
      unilateral: !!p.unilateral,
    };
  }
  function sets(e) {
    return (e.recordedSets || (Array.isArray(e.sets) ? e.sets : [])).map((a) =>
      classify(e, a),
    );
  }
  function records(data) {
    const seen = new Set();
    return [...(data.sessions || []), ...(data.extraSessions || [])].filter(
      (s) => {
        const id = s.id || `${s.date}|${s.key}|${s.startedAt || ""}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      },
    );
  }
  function history(data, e, before) {
    return records(data)
      .filter((s) => s.completed && s.date < before)
      .flatMap((s) =>
        (s.exercises || [])
          .filter(
            (x) =>
              x.type !== "mobility" &&
              identity(x) === identity(e) &&
              +x.min === +e.min &&
              +x.max === +e.max,
          )
          .map((x) => ({
            date: s.date,
            id: s.id || s.key,
            exercise: x,
            sets: sets(x).filter((z) => z.work),
            incomplete:
              sets(x).some((z) => z.kind === "incomplete") ||
              sets(x).filter((z) => z.work).length < (num(x.sets) || 0),
            session: s,
          })),
      )
      .filter((x) => x.sets.length)
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          String(a.id).localeCompare(String(b.id)),
      );
  }
  function comparison(a, b) {
    if (
      !a ||
      !b ||
      identity(a.exercise) !== identity(b.exercise) ||
      a.incomplete ||
      b.incomplete ||
      a.sets.length !== b.sets.length ||
      !a.sets.length
    )
      return { kind: "insufficient", reason: "Faltan series comparables." };
    if (
      a.sets.some(
        (s, i) =>
          s.kg !== b.sets[i].kg ||
          (s.unilateral && s.rightKg !== b.sets[i].rightKg),
      )
    )
      return {
        kind: "load-change",
        reason: "Cambió la carga; establece una nueva referencia.",
      };
    const delta = b.sets.reduce(
      (n, s, i) =>
        n +
        s.reps -
        a.sets[i].reps +
        (s.unilateral ? s.rightReps - a.sets[i].rightReps : 0),
      0,
    );
    const effortKnown = a.sets
      .concat(b.sets)
      .every((s) => s.rir != null && (!s.unilateral || s.rightRir != null));
    const harder =
      effortKnown &&
      b.sets.some(
        (s, i) =>
          s.rir < a.sets[i].rir - 1 ||
          (s.unilateral && s.rightRir < a.sets[i].rightRir - 1),
      );
    return {
      kind: delta > 0 ? "reps-up" : delta < 0 ? "reps-down" : "stable",
      delta,
      effortKnown,
      harder,
      reason:
        delta === 0
          ? "Mismas repeticiones a la misma carga."
          : `${delta > 0 ? "+" : ""}${delta} repeticiones a la misma carga${effortKnown ? "" : "; falta RIR para comparar esfuerzo"}.`,
    };
  }
  function recovery(data, date) {
    const rows = (data.daily || []).filter(
      (d) => d.date >= add(date, -6) && d.date <= date,
    );
    const vals = (k) =>
      rows.map((d) => num(d[k])).filter((n) => n != null && n >= 0 && n <= 10);
    const fatigue = mean(vals("fatigue")),
      energy = mean(vals("energy")),
      sleep = mean(
        rows
          .map((d) => num(d.sleep))
          .filter((n) => n != null && n > 0 && n <= 24),
      );
    const swims = (data.swim || []).filter(
      (s) => s.completed && s.date >= add(date, -6) && s.date <= date,
    );
    const pain = Math.max(
      0,
      ...vals("pain"),
      ...records(data)
        .filter((s) => s.date >= add(date, -6) && s.date <= date)
        .map((s) => num(s.pain) || 0),
      ...swims.map((s) => num(s.pain) || 0),
    );
    const tired =
      (fatigue != null && fatigue >= 7) ||
      (energy != null && energy <= 3) ||
      (sleep != null && sleep < 6);
    const sufficient =
      vals("fatigue").length >= 3 &&
      vals("energy").length >= 3 &&
      rows.filter((d) => num(d.sleep) > 0).length >= 3;
    return {
      pain,
      tired,
      sufficient,
      fatigue,
      energy,
      sleep,
      swims: swims.length,
      swimMinutes: swims.reduce((n, s) => n + (num(s.duration) || 0), 0),
      reason:
        pain >= 4
          ? "Hay molestias registradas."
          : tired
            ? "La recuperación registrada pide prudencia."
            : sufficient
              ? "Recuperación registrada sin señales de alerta."
              : "Faltan al menos tres registros de sueño, energía y fatiga en siete días.",
    };
  }
  function recommend(data, e, date) {
    const h = history(data, e, date),
      last = h.at(-1),
      rec = recovery(data, date),
      [lo, hi] = range(e.rir),
      target = Math.max(1, num(e.sets) || 3);
    const evidence = h
      .slice(-4)
      .map((x) => ({ date: x.date, id: x.id, sets: x.sets }));
    const base = {
      version: VERSION,
      exerciseKey: e.key,
      identity: identity(e),
      date,
      action: "calibrate",
      reason:
        "Sin historial comparable. Elige una carga controlable y registra el RIR.",
      sufficiency: h.length >= 4 ? "trend" : h.length ? "reference" : "none",
      evidence,
      recovery: rec,
      targets: Array.from({ length: target }, () => ({
        kg: null,
        reps: +e.min,
        rir: hi,
      })),
      last: last || null,
      trend: "insufficient",
    };
    if (e.repPolicy === 'failure') return {...base, action:'hold', reason:'Cuatro series al fallo técnico. Registra las repeticiones reales; ajusta la carga manualmente sin un techo de repeticiones inventado.', targets:Array.from({length:target},(_,i)=>({kg:last?.sets[i]?.kg??null,reps:last?.sets[i]?.reps??null,rir:0}))};
    if (!last)
      return {
        ...base,
        action: rec.pain >= 4 ? "pain" : "calibrate",
        reason:
          rec.pain >= 4
            ? "No aumentes cargas con molestias. Evita el movimiento que las reproduzca."
            : base.reason,
      };
    base.targets = Array.from({ length: target }, (_, i) => {
      const s = last.sets[i];
      return {
        kg: s?.kg ?? null,
        reps: s ? Math.max(+e.min, Math.min(+e.max, s.reps)) : +e.min,
        rir: hi,
        ...(profile(e).unilateral
          ? {
              rightKg: s?.rightKg ?? null,
              rightReps: s
                ? Math.max(+e.min, Math.min(+e.max, s.rightReps))
                : +e.min,
            }
          : {}),
      };
    });
    const recent = h.slice(-4),
      comparisons = recent.slice(1).map((x, i) => comparison(recent[i], x));
    base.trend =
      comparisons.length >= 3 &&
      comparisons.every(
        (c) => c.kind === "stable" && c.effortKnown && !c.harder,
      )
        ? "stable"
        : comparisons.length >= 2 &&
            comparisons
              .slice(-2)
              .every((c) => c.kind === "reps-down" && c.effortKnown)
          ? "declining"
          : comparisons.some((c) => c.kind === "reps-up")
            ? "improving"
            : "insufficient";
    const keep = (action, reason) => ({ ...base, action, reason });
    if (rec.pain >= 4 || num(e.pain) >= 4)
      return keep(
        "pain",
        "No aumentes la carga con molestias. Evita el movimiento que las reproduzca y revisa la causa.",
      );
    if (rec.tired) {
      base.targets = base.targets.map((s) => ({
        ...s,
        rir: Math.max(3, s.rir),
      }));
      return keep(
        base.trend === "declining" ? "reduce-fatigue" : "hold",
        base.trend === "declining"
          ? "Caída en dos comparaciones y mala recuperación: revisa una reducción temporal de series."
          : "Mantén la carga y deja más margen; una sesión peor no exige cambiar el programa.",
      );
    }
    if (Date.parse(date) - Date.parse(last.date) > 28 * 86400000)
      return keep(
        "hold",
        "La última referencia tiene más de cuatro semanas. Recalibra la carga con margen antes de progresar.",
      );
    if (last.incomplete || last.sets.length !== target)
      return keep(
        "hold",
        "Sesión incompleta o distinto número de series. Mantén la referencia antes de progresar.",
      );
    if (
      last.sets.some(
        (s) => s.rir == null || (s.unilateral && s.rightRir == null),
      )
    )
      return keep(
        "hold",
        "Falta RIR válido. Repite la referencia y registra el esfuerzo antes de subir carga.",
      );
    if (last.sets.some((s) => s.rir < lo || (s.unilateral && s.rightRir < lo)))
      return keep(
        "hold",
        "El esfuerzo superó el previsto. Mantén la carga y recupera el RIR objetivo.",
      );
    if (
      last.sets.some(
        (s) => s.reps < +e.min || (s.unilateral && s.rightReps < +e.min),
      )
    )
      return keep(
        "hold",
        "Hay series de trabajo bajo el rango. Conservamos esos datos; descansa y revisa la tendencia antes de ajustar.",
      );
    const ceiling = last.sets.every(
      (s) => s.reps >= +e.max && (!s.unilateral || s.rightReps >= +e.max),
    );
    const inc = num(profile(e).increment);
    if (ceiling) {
      if (
        !(inc > 0) ||
        profile(e).mode === "unknown" ||
        profile(e).mode === "bodyweight"
      )
        return keep(
          "configure",
          "Rango superior completado. Configura el incremento y la modalidad de carga antes de proponer kg.",
        );
      base.targets = base.targets.map((s) => ({
        ...s,
        kg: Math.max(
          0,
          +(s.kg + (profile(e).mode === "assisted" ? -inc : inc)).toFixed(3),
        ),
        reps: +e.min,
        ...(profile(e).unilateral
          ? {
              rightKg: Math.max(
                0,
                +(
                  s.rightKg + (profile(e).mode === "assisted" ? -inc : inc)
                ).toFixed(3),
              ),
              rightReps: +e.min,
            }
          : {}),
      }));
      return keep(
        "load",
        profile(e).mode === "assisted"
          ? "Completaste el rango con margen. Prueba un paso menos de asistencia."
          : "Completaste todas las series del rango con margen. Prueba el incremento configurado y vuelve al inicio del rango.",
      );
    }
    const i = base.targets.findIndex(
      (s) => s.reps < +e.max || s.rightReps < +e.max,
    );
    if (i >= 0) {
      if (base.targets[i].reps < +e.max) base.targets[i].reps++;
      if (profile(e).unilateral && base.targets[i].rightReps < +e.max)
        base.targets[i].rightReps++;
    }
    return keep(
      "reps",
      "Mantén la carga e intenta sumar una repetición sin superar el esfuerzo previsto. No hace falta mejorar todas las series.",
    );
  }
  const GROUPS = {
    bench_press: [["Pectoral"], ["Tríceps", "Deltoide anterior"]],
    incline_db_press: [["Pectoral"], ["Tríceps", "Deltoide anterior"]],
    incline_machine_press: [["Pectoral"], ["Tríceps", "Deltoide anterior"]],
    incline_db_fly: [["Pectoral"], []],
    cable_lateral_raise: [["Deltoide lateral"], []],
    triceps_pushdown: [["Tríceps"], []],
    overhead_triceps: [["Tríceps"], []],
    pull_up: [["Espalda"], ["Bíceps"]],
    chest_supported_row: [["Espalda"], ["Bíceps", "Deltoide posterior"]],
    single_arm_cable_row: [["Espalda"], ["Bíceps"]],
    lat_pulldown: [["Espalda"], ["Bíceps"]],
    face_pull: [["Deltoide posterior"], ["Espalda"]],
    bayesian_cable_curl: [["Bíceps"], []],
    hammer_curl: [["Bíceps"], []],
    incline_db_curl: [["Bíceps"], []],
    hack_squat: [["Cuádriceps"], ["Glúteo"]],
    rdl: [["Isquios"], ["Glúteo"]],
    leg_press: [["Cuádriceps"], ["Glúteo"]],
    seated_leg_curl: [["Isquios"], []],
    hip_thrust: [["Glúteo"], []],
    standing_calf: [["Gemelos"], []],
    seated_calf: [["Gemelos"], []],
    cable_crunch: [["Core"], []],
    ab_wheel: [["Core"], []],
    hanging_knee_raise: [["Core"], []],
    pallof_press: [["Core"], []],
  };
  function muscles(e) {
    return e.coachMuscles || GROUPS[e.key] || [["Sin clasificar"], []];
  }
  function volume(sessions, planned = false) {
    const out = {};
    sessions.forEach((s) =>
      (s.exercises || [])
        .filter((e) => e.type !== "mobility")
        .forEach((e) => {
          const n = planned
            ? num(e.sets) || 0
            : sets(e).filter((z) => z.work).length;
          const [direct, indirect] = muscles(e);
          [direct, indirect].forEach((groups, i) =>
            groups.forEach((g) => {
              out[g] ??= { direct: 0, indirect: 0, exposures: [] };
              out[g][i ? "indirect" : "direct"] += n;
              if (n && !out[g].exposures.includes(s.date || s.key))
                out[g].exposures.push(s.date || s.key);
            }),
          );
        }),
    );
    return out;
  }
  function phases(date) {
    const defs = [
      [4, "Calibración", "Consolidar cargas, esfuerzo y calidad del registro"],
      [6, "Progresión", "Mejorar repeticiones y cargas"],
      [
        6,
        "Hipertrofia prioritaria",
        "Revisar pectoral superior, hombros, brazos y gemelos",
      ],
      [6, "Optimización", "Distribuir el estímulo y gestionar la fatiga"],
      [
        4,
        "Evaluación y continuidad",
        "Revisar tendencias y preparar el siguiente ciclo",
      ],
    ];
    let start = START,
      week = 1;
    const out = [];
    for (const [weeks, name, goal] of defs) {
      out.push({
        id: out.length + 1,
        start,
        end: add(start, weeks * 7 - 1),
        weeks,
        week,
        name,
        goal,
      });
      start = add(start, weeks * 7);
      week += weeks;
    }
    while (start <= date) {
      out.push({
        id: out.length + 1,
        start,
        end: add(start, 41),
        weeks: 6,
        week,
        name: "Continuidad",
        goal: "Mantener lo eficaz y revisar según los registros",
      });
      start = add(start, 42);
      week += 6;
    }
    return out;
  }
  function planning(date) {
    const list = phases(date),
      current = list.find((p) => date >= p.start && date <= p.end) || list[0],
      week = Math.max(
        1,
        Math.floor((Date.parse(date) - Date.parse(START)) / 604800000) + 1,
      );
    return {
      start: START,
      end: END,
      week,
      upcoming: date < START,
      current,
      phases: list,
      nextReview: current.end,
      bodyReview: add(START, Math.ceil(week / 4) * 4 * 7 - 1),
      intermediate: add(START, 83),
    };
  }
  function programFor(data, date) {
    if(date < '2026-11-14') return 3;
    const rows=(data.coach?.programHistory||[]).filter(x=>x.date<=date&&[3,4].includes(x.days)).sort((a,b)=>a.date.localeCompare(b.date));
    return rows.at(-1)?.days || 4;
  }
  function programKeys(data,date) { return programFor(data,date)===4 ? ['four_shoulders','four_legs','four_back','four_chest'] : ['nov26_push','nov26_pull','nov26_legs']; }
  function weekly(data, date, plans = []) {
    const start = monday(date),
      end = add(start, 6),
      rows = records(data).filter((s) => s.date >= start && s.date <= date),
      vol = volume(rows),
      planned = volume(plans, true),
      rec = recovery(data, date),
      exercises = new Map();
    plans
      .concat(rows)
      .forEach((s) =>
        (s.exercises || [])
          .filter((e) => e.type !== "mobility")
          .forEach((e) => exercises.set(identity(e), e)),
      );
    const recommendations = [...exercises.values()].map((e) => ({
      exercise: e,
      ...recommend(data, e, add(date, 1)),
    }));
    const completed = new Set(
      rows
        .filter((s) => s.completed)
        .map((s) => s.weeklyTemplateKey || s.key || s.sourceKey)
        .filter((k) => (plans.length ? plans.map(p=>p.key) : programKeys(data,date)).includes(k)),
    );
    return {
      start,
      end,
      through: date,
      partial: date < end,
      rows,
      volume: vol,
      planned,
      recovery: rec,
      recommendations,
      completed: completed.size,
      plannedSessions: plans.length || programKeys(data,date).length,
      plan: planning(date),
      conclusion:
        rec.pain >= 4
          ? "Prioriza resolver las molestias."
          : rec.tired
            ? "Esta semana priorizamos recuperar."
            : !recommendations.some((r) => r.last)
              ? "Construyamos tu primera referencia."
              : recommendations.some((r) => r.action === "load")
                ? "Hay ejercicios preparados para un pequeño incremento."
                : "Consolida la carga y suma repeticiones con margen.",
    };
  }
  function proposeVolume(report) {
    if (report.partial || report.plan.upcoming) return [];
    const rec = report.recovery;
    const declining = report.recommendations.filter(
      (r) => r.action === "reduce-fatigue",
    );
    if (rec.tired && declining.length)
      return [
        {
          id: `${report.start}:reduce`,
          type: "reduce",
          exerciseKey: declining[0].exerciseKey,
          delta: -1,
          reason:
            "Descenso repetido con mala recuperación. Probar una serie menos durante una semana.",
          evidence: declining[0].evidence,
          week: add(report.start, 7),
          expires: add(report.start, 13),
        },
      ];
    if (
      report.plan.week <= 4 ||
      rec.tired ||
      rec.pain >= 4 ||
      !rec.sufficient ||
      report.completed < 3
    )
      return [];
    for (const muscle of PRIORITIES) {
      const related = report.recommendations.filter((r) =>
        muscles(r.exercise)[0].includes(muscle),
      );
      const v = report.volume[muscle] || { direct: 0, indirect: 0 };
      const p = report.planned[muscle] || { direct: 0 };
      if (
        related.length &&
        related.every((r) => r.trend === "stable" && r.last?.date >= report.start && ["reps", "hold"].includes(r.action)) &&
        v.direct >= p.direct &&
        v.direct + 0.5 * v.indirect < 16
      )
        return [
          {
            id: `${report.start}:${muscle}:add`,
            type: "add",
            muscle,
            exerciseKey: related[0].exerciseKey,
            delta: 1,
            reason:
              "Cuatro exposiciones estables, PPL completa y recuperación registrada. Se puede probar una serie extra si hay un hueco disponible.",
            evidence: related.flatMap((r) => r.evidence),
            week: add(report.start, 7),
            expires: add(report.start, 13),
          },
        ];
    }
    return [];
  }
  function schedule(proposal, slots, recordsAlready = []) {
    const used = recordsAlready
      .filter((s) => s.date >= proposal.week && s.date <= proposal.expires)
      .flatMap((s) =>
        (s.exercises || []).filter((e) => e.coachDecisionId === proposal.id),
      );
    if (used.length) return { status: "already-scheduled" };
    const slot = slots.find(
      (s) =>
        s.date >= proposal.week &&
        s.date <= proposal.expires &&
        !s.swim &&
        s.available &&
        s.mode === "solo" &&
        s.capacity >= Math.abs(proposal.delta) &&
        (!s.optional || s.confirmed) &&
        !s.started,
    );
    return slot
      ? {
          status: "scheduled",
          date: slot.date,
          exerciseKey: proposal.exerciseKey,
          delta: proposal.delta,
        }
      : {
          status: "no-slot",
          reason:
            "No hay un hueco solo confirmado. Mantén el plan; no acumules series para recuperar.",
        };
  }
  function decision(log, proposal, action, at, placement = null) {
    if (
      ![
        "presented",
        "accepted",
        "deferred",
        "rejected",
        "applied",
        "outcome",
        "reverted",
      ].includes(action)
    )
      throw Error("Invalid decision");
    const previous = log.filter((x) => x.proposal.id === proposal.id).at(-1);
    if (action === "applied" && previous?.action !== "accepted")
      throw Error("Acceptance required");
    if (
      action === "accepted" &&
      (!placement || placement.status !== "scheduled")
    )
      throw Error("Available slot required");
    return [
      ...log,
      {
        version: VERSION,
        id: `${proposal.id}:${log.length}`,
        at,
        action,
        proposal: JSON.parse(JSON.stringify(proposal)),
        placement: placement || previous?.placement || null,
      },
    ];
  }
  function bodyReview(data, date) {
    const rows = (data.body || [])
      .filter((b) => b.date <= date && b.date >= add(date, -83))
      .sort((a, b) => a.date.localeCompare(b.date));
    const out = {};
    for (const key of [
      "weight",
      "waist",
      "chest",
      "arm",
      "hips",
      "thigh",
      "calf",
    ]) {
      const a = rows.filter((r) => num(r[key]) > 0),
        first = a[0],
        last = a.at(-1);
      out[key] =
        first &&
        last &&
        Date.parse(last.date) - Date.parse(first.date) >= 28 * 86400000
          ? {
              from: first.date,
              to: last.date,
              delta: +(num(last[key]) - num(first[key])).toFixed(2),
              value: num(last[key]),
            }
          : null;
    }
    return out;
  }
  function longitudinal(data, date) {
    const through = dateISO(date),
      all = records(data).filter((s) => s.date >= START && s.date <= through),
      swims = (data.swim || []).filter(
        (s) => s.completed && s.date >= START && s.date <= through,
      ),
      weeks = [];
    for (let d = START; d <= through; d = add(d, 7)) {
      const end = add(d, 6),
        rows = all.filter((s) => s.date >= d && s.date <= end),
        keys = new Set(
          rows
            .filter((s) => s.completed)
            .map((s) => s.weeklyTemplateKey || s.key || s.sourceKey),
        );
      const selectedKeys = programKeys(data, end < through ? end : through);
      const completed = selectedKeys.filter((k) =>
        keys.has(k),
      ).length;
      const due = (selectedKeys.length===4?[0,1,3,5]:[1,3,5]).filter((n) => add(d, n) <= through).length;
      weeks.push({
        start: d,
        end,
        partial: through < end,
        ppl: completed,
        plannedSessions: selectedKeys.length,
        pplDue: Math.max(due, completed),
        workSets: rows.reduce(
          (n, s) =>
            n +
            (s.exercises || []).reduce(
              (a, e) => a + sets(e).filter((z) => z.work).length,
              0,
            ),
          0,
        ),
        swimMinutes: swims
          .filter((s) => s.date >= d && s.date <= end)
          .reduce((n, s) => n + (num(s.duration) || 0), 0),
      });
    }
    const p = planning(through),
      message = p.upcoming
        ? "Usa noviembre como referencia; la programación vigente se conserva."
        : p.week >= 26
          ? "Evaluación global disponible. Conserva los ejercicios con progreso y revisa los que muestran caída persistente; el siguiente mesociclo continúa sin incrementos por calendario."
          : p.week >= 12
            ? "Revisión intermedia: contrasta rendimiento, adherencia y medidas corporales antes de modificar objetivos."
            : "Consolida referencias comparables. No hace falta aumentar volumen mientras progresas.";
    return {
      weeks,
      sessions: all.filter((s) => s.completed).length,
      swims: swims.length,
      pplCompleted: weeks.reduce((n, w) => n + w.ppl, 0),
      pplDue: weeks.reduce((n, w) => n + w.pplDue, 0),
      body: bodyReview(data, through),
      message,
    };
  }
  return {
    programFor,
    VERSION,
    START,
    END,
    PRIORITIES,
    num,
    dateISO,
    add,
    day,
    monday,
    range,
    profile,
    identity,
    classify,
    sets,
    records,
    history,
    comparison,
    recovery,
    recommend,
    muscles,
    volume,
    phases,
    planning,
    weekly,
    proposeVolume,
    schedule,
    decision,
    bodyReview,
    longitudinal,
  };
});
