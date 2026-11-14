/* Pure offline analysis. Engineering thresholds are documented in docs/adaptive-coach.md. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SerieCoach = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const VERSION = 1;
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
    if (e.repPolicy === 'failure') return {...base, action:'hold', reason:'Series al fallo técnico. Registra las repeticiones reales; ajusta la carga manualmente sin un techo de repeticiones inventado.', targets:Array.from({length:target},(_,i)=>({kg:last?.sets[i]?.kg??null,reps:last?.sets[i]?.reps??null,rir:0}))};
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
  return {num,range,profile,identity,classify,sets,records,history,comparison,recovery,recommend};
});
