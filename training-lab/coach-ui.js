/* UI adapter. Only explicit user actions write coach decisions; analysis is read-only. */
let coachWeekOffset = 0;
function coachStore() {
  return state.coach && typeof state.coach === "object"
    ? state.coach
    : { version: 1, decisions: [], availability: {} };
}
function coachLog() {
  return Array.isArray(coachStore().decisions) ? coachStore().decisions : [];
}
function coachWrite(changes) {
  state.coach = { ...coachStore(), ...changes, version: 1 };
  saveState(true);
}
function coachPlans(date) {
  if (date < "2026-11-02") return [];
  return (
    date < MarevoCoach.START
      ? ["nov26_push", "nov26_pull", "nov26_legs"]
          .map((k) => oct26TemplateForKey(k, date))
          .filter(Boolean)
      : typeof coachBasePlans === "function"
        ? coachBasePlans()
        : []
  ).map((p) => ({
    ...p,
    exercises: p.exercises.map((e) => ({
      ...e,
      loadProfile: state.equipmentProfiles?.[e.key] || loadProfile(e),
    })),
  }));
}
function coachReport(date) {
  return MarevoCoach.weekly(state, date, coachPlans(date));
}
function coachDate() {
  return coachWeekOffset
    ? MarevoCoach.add(MarevoCoach.monday(todayISO()), 7 * coachWeekOffset + 6)
    : todayISO();
}
function coachMoveWeek(n) {
  coachWeekOffset = Math.min(0, coachWeekOffset + n);
  renderProgress();
}
function coachSeriesText(sets) {
  return sets
    .map(
      (s) =>
        `${s.kg ?? "—"} kg × ${s.reps}${s.unilateral || s.rightReps != null ? ` / D ${s.rightKg ?? "—"} × ${s.rightReps ?? "—"}` : ""}`,
    )
    .join(" · ");
}
function coachRecommendation(e, date) {
  return MarevoCoach.recommend(
    state,
    { ...e, loadProfile: loadProfile(e) },
    date,
  );
}
function coachExerciseHTML(e, scope, index) {
  const session =
      scope === "planned"
        ? findSession(currentDate(), planFor(currentDate()).key)
        : state.extraSessions.find((s) => s.id === scope),
    date = session?.date || currentDate();
  const r = coachRecommendation(e, date),
    past = r.last?.sets || [],
    manual = coachStore().targets?.[date + "|" + r.identity];
  const targets = manual || r.targets;
  return `<div class="coach-prescription"><div class="coach-kicker">${session?.completed ? "Referencia al comenzar" : "Tu próximo objetivo"} · ${targets.length} series</div><div class="coach-comparison"><span>Antes</span><p>${past.length ? esc(coachSeriesText(past)) : "Primera sesión comparable"}</p><span>Ahora</span><p><strong>${esc(coachSeriesText(targets))}</strong><small>RIR ${esc([...new Set(targets.map((t) => t.rir))].join(" / "))} · ${esc(loadLabel(e))}</small></p></div>${disclosureHTML("coach-why:" + scope + ":" + index, "Por qué este objetivo", `<p>${esc(r.reason)}</p><p>Datos: ${r.evidence.length} exposiciones${r.evidence.length ? " · " + r.evidence.map((x) => esc(x.date)).join(", ") : ""}. ${esc(r.recovery.reason)}</p><p>Puedes lograr menos o más repeticiones. El registro conserva lo que realmente hagas.</p>`)}${!session?.completed ? `<button class="btn ghost small" onclick="coachEditTarget('${scope}',${index})">Ajustar objetivo</button>` : ""}</div>`;
}
function coachEditTarget(scope, index) {
  saveScopeInputs(scope);
  const e = scopeExercise(scope, index),
    r = coachRecommendation(e, currentDate());
  document.getElementById("modalRoot").innerHTML =
    `<div class="modal"><div class="sheet"><h2>Tu objetivo · ${esc(e.name)}</h2><p>Solo cambia la propuesta de hoy. No rellena series realizadas.</p>${r.targets.map((s, i) => `<label for="coachKg${i}">Serie ${i + 1} · kg / reps</label><div class="coach-input-pair"><input id="coachKg${i}" inputmode="decimal" aria-label="Kg serie ${i + 1}" value="${s.kg ?? ""}"><input id="coachReps${i}" inputmode="numeric" aria-label="Repeticiones serie ${i + 1}" value="${s.reps}"></div>`).join("")}<p>Para lados independientes, ajusta cada lado al registrar; este objetivo manual se aplica a ambos lados.</p><div class="actions"><button class="btn" onclick="coachSaveTarget('${scope}',${index})">Guardar objetivo</button><button class="btn ghost" onclick="closeModal();refreshScope('${scope}')">Cancelar</button></div></div></div>`;
}
function coachSaveTarget(scope, index) {
  const e = scopeExercise(scope, index),
    r = coachRecommendation(e, currentDate()),
    targets = r.targets.map((s, i) => ({
      ...s,
      kg: MarevoCoach.num(val("coachKg" + i)),
      reps: MarevoCoach.num(val("coachReps" + i)),
    }));
  if (
    targets.some(
      (s) =>
        s.kg == null || s.kg < 0 || !Number.isInteger(s.reps) || s.reps < 1,
    )
  ) {
    toast("Revisa kg y repeticiones");
    return;
  }
  if (loadProfile(e).unilateral)
    targets.forEach((s) => {
      s.rightKg = s.kg;
      s.rightReps = s.reps;
    });
  const proposal = {
    id: "target:" + currentDate() + ":" + r.identity,
    type: "manual-target",
    targets,
    evidence: r.evidence,
    reason: r.reason,
  };
  coachWrite({
    targets: {
      ...coachStore().targets,
      [currentDate() + "|" + r.identity]: targets,
    },
    decisions: [
      ...coachLog(),
      { at: new Date().toISOString(), action: "applied", proposal },
    ],
  });
  closeModal();
  refreshScope(scope);
}
function coachHomeHTML(date) {
  const r = coachReport(date),
    goals = r.recommendations
      .filter((x) => x.last && ["reps", "load", "hold"].includes(x.action))
      .slice(0, 2);
  return `<section class="coach-home" aria-label="Tu entrenador"><div class="row between"><span class="coach-kicker">Tu entrenador</span><button class="coach-link" onclick="showView('Progress')">Ver análisis <span aria-hidden="true">↗</span></button></div><h2>${esc(r.conclusion)}</h2>${goals.length ? goals.map((g) => `<p><strong>${esc(g.exercise.name)}</strong> · ${esc(coachSeriesText(g.targets))}</p>`).join("") : "<p>Registra cargas, repeticiones y RIR. Con las primeras sesiones podremos proponerte objetivos concretos.</p>"}<small>${r.partial ? "Semana en curso · evaluación provisional" : "Semana completa"} · ${r.completed}/${r.plannedSessions} sesiones registradas</small></section>`;
}
function coachVolumeHTML(actual, planned = {}) {
  const groups = [
    ...new Set([
      ...MarevoCoach.PRIORITIES,
      ...Object.keys(actual),
      ...Object.keys(planned),
    ]),
  ];
  return `<p class="subtitle">Series de trabajo, incluso fuera del rango. Directas e indirectas se muestran por separado; no son una medida de crecimiento.</p><div class="coach-volume-head"><span>Músculo</span><span>Directas</span><span>Indirectas</span><span>Plan base</span></div>${groups
    .map((g) => {
      const a = actual[g] || { direct: 0, indirect: 0, exposures: [] },
        p = planned[g];
      return `<div class="coach-volume-row"><span>${esc(g)}<small>${a.exposures.length} exposiciones</small></span><strong>${a.direct}</strong><span>${a.indirect}</span><span>${p?.direct ?? "—"}</span></div>`;
    })
    .join("")}`;
}
function coachTrendHTML(r) {
  const h = r.evidence;
  if (!h.length)
    return "<p>Sin historial comparable. Las máquinas y variantes diferentes tienen su propia referencia.</p>";
  return `<div class="coach-history">${h.map((x) => `<div><time>${esc(x.date)}</time><span>${esc(coachSeriesText(x.sets))}</span><small>RIR ${x.sets.map((s) => s.rir ?? "—").join(" / ")}</small></div>`).join("")}</div>`;
}
function coachPlanHTML(date) {
  const p = MarevoCoach.planning(date),
    body = MarevoCoach.bodyReview(state, date);
  return `<section class="coach-plan"><div class="coach-kicker">Mi planificación · 30 nov 2026 → 30 may 2027</div><h2>${p.upcoming ? "Preparación del próximo ciclo" : `Semana ${p.week} · ${esc(p.current.name)}`}</h2><p>${esc(p.current.goal)}. Las fases orientan la revisión; no suben cargas ni series por fecha.</p><div class="coach-plan-meta"><span>Próxima revisión<strong>${p.nextReview}</strong></span><span>Revisión corporal<strong>${p.bodyReview}</strong></span></div>${disclosureHTML("coach-timeline", "Mesociclos y continuidad", `<ol class="coach-timeline">${p.phases.map((x) => `<li class="${x.id === p.current.id ? "is-current" : ""}"><span>${x.start} — ${x.end}</span><strong>${esc(x.name)} · ${x.weeks} semanas</strong><p>${esc(x.goal)}</p></li>`).join("")}</ol><p>Tras mayo, se generan ciclos de seis semanas sin fecha de caducidad. Revisa objetivos y volumen según el rendimiento. Revisión intermedia: ${p.intermediate}. No hay descargas automáticas.</p>`)}${disclosureHTML("coach-longitudinal", "Balance del programa", coachLongitudinalHTML(date))}${disclosureHTML(
    "coach-body",
    "Revisión corporal y evaluación del programa",
    `<p>El rendimiento no demuestra por sí solo ganancia muscular. Compara perímetros, peso y fotos en condiciones similares.</p>${
      Object.entries(body)
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<p>${esc({ weight: "Peso", waist: "Cintura", chest: "Pecho", arm: "Brazo", hips: "Cadera", thigh: "Muslo", calf: "Gemelo" }[k])}: ${v.delta > 0 ? "+" : ""}${v.delta} ${k === "weight" ? "kg" : "cm"} · ${v.from} → ${v.to}</p>`,
        )
        .join("") ||
      "<p>Faltan mediciones separadas por al menos cuatro semanas.</p>"
    }<button class="btn secondary small" onclick="coachExport()">Exportar evaluación completa</button>`,
  )}<p class="coach-footnote">Prioridad: pectoral superior, hombros y brazos, sin descuidar espalda, piernas, gemelos y core.</p></section>`;
}
function coachProposals(date) {
  const closed = MarevoCoach.add(MarevoCoach.monday(date), -1);
  return MarevoCoach.proposeVolume(coachReport(closed));
}
function coachDecisionHTML(date) {
  const proposals = coachProposals(date);
  return (
    proposals
      .map((p) => {
        const last = coachLog()
          .filter((x) => x.proposal.id === p.id)
          .at(-1);
        return `<div class="coach-proposal"><strong>${p.type === "add" ? "Probar una serie adicional" : "Reducir una serie durante una semana"}</strong><p>${esc(p.reason)}</p><small>${p.week} → ${p.expires}</small>${last && ["accepted", "applied", "rejected", "deferred", "reverted", "outcome"].includes(last.action) ? `<p>Decisión: ${esc(coachActionLabel(last.action))}. ${last.placement?.date || ""}</p>${["accepted", "applied"].includes(last.action) ? `<button class="btn ghost small" onclick="coachRevert('${esc(p.id)}')">Mantener plan original desde ahora</button>` : ""}` : `<button class="btn secondary small" onclick="coachReviewProposal('${esc(p.id)}')">Revisar propuesta</button>`}</div>`;
      })
      .join("") ||
    "<p>No hay cambios de volumen justificados ahora. Mantener el plan es una decisión válida.</p>"
  );
}
function coachActionLabel(a) {
  return (
    {
      presented: "Presentada",
      accepted: "Aceptada",
      applied: "Aplicada",
      deferred: "Aplazada",
      rejected: "Rechazada",
      reverted: "Revertida para próximas sesiones",
      outcome: "Resultado registrado",
    }[a] || a
  );
}
function coachProgressHTML() {
  const date = coachDate(),
    r = coachReport(date);
  return `<section class="coach-analysis"><div class="row between"><div><div class="coach-kicker">Tu entrenador</div><h2>Análisis semanal</h2></div><div class="coach-week-nav"><button aria-label="Semana anterior" onclick="coachMoveWeek(-1)">‹</button><button aria-label="Semana siguiente" ${coachWeekOffset === 0 ? "disabled" : ""} onclick="coachMoveWeek(1)">›</button></div></div><p class="subtitle">${r.start} → ${r.through}${r.partial ? " · semana incompleta" : ""}</p><h3>${esc(r.conclusion)}</h3><p>${esc(r.recovery.reason)}</p><div class="coach-summary"><span><strong>${r.completed}/${r.plannedSessions}</strong>sesiones registradas</span><span><strong>${r.recovery.swims}</strong>sesiones de natación</span><span><strong>${r.rows.reduce((n, s) => n + (+s.duration || 0), 0)}</strong>min de fuerza registrados</span></div><p class="coach-footnote">${r.partial ? "No se compara el total de esta semana con una semana completa." : "Evaluación de lunes a domingo."} Zona horaria: Madrid.</p>${disclosureHTML("coach-exercises", "Rendimiento y próximos objetivos", r.recommendations.map((x) => disclosureHTML("coach-ex:" + x.identity, esc(x.exercise.name), `<p>${esc(x.reason)}</p><p><strong>Próxima: ${esc(coachSeriesText(x.targets))}</strong> · RIR ${esc(x.exercise.rir)}</p>${coachTrendHTML(x)}<p>Datos: ${x.sufficiency === "trend" ? "cuatro o más exposiciones; revisa su comparabilidad" : x.sufficiency === "reference" ? "referencia inicial; tendencia aún limitada" : "insuficientes"}. ${x.trend === "stable" ? "Rendimiento estable." : x.trend === "declining" ? "Caída repetida." : x.trend === "improving" ? "Hay mejoras de repeticiones; revisa el esfuerzo." : ""}</p>`, false, x.last ? coachSeriesText(x.last.sets) : "Sin historial comparable")).join(""))}${disclosureHTML("coach-volume", "Volumen por músculo", coachVolumeHTML(r.volume, r.planned))}${disclosureHTML(
    "coach-session-review",
    "Sesiones y resultados",
    r.rows
      .map(
        (s) =>
          `<div class="coach-session"><strong>${esc(s.title || s.key || "Sesión")} · ${esc(s.date)}</strong><p>${s.completed ? "Finalizada" : "Incompleta"} · ${s.duration ?? "—"} min · RPE ${s.rpe ?? "—"}</p>${(
            s.exercises || []
          )
            .filter((e) => e.type !== "mobility")
            .map((e) => {
              const h = MarevoCoach.history(state, e, s.date).at(-1),
                now = {
                  exercise: e,
                  sets: MarevoCoach.sets(e).filter((x) => x.work),
                  incomplete: MarevoCoach.sets(e).some(
                    (x) => x.kind === "incomplete",
                  ),
                },
                c = MarevoCoach.comparison(h, now);
              return `<p>${esc(e.name)}: ${esc(c.reason)}</p>`;
            })
            .join("")}</div>`,
      )
      .join("") || "<p>No hay sesiones esta semana.</p>",
  )}${disclosureHTML("coach-adjust", "Cambios de volumen", coachDecisionHTML(todayISO()), false, "Se aplican solo con tu aceptación y un hueco confirmado")}${disclosureHTML(
    "coach-log",
    "Historial de decisiones",
    coachLog()
      .slice()
      .reverse()
      .map(
        (x) =>
          `<div class="coach-history-item"><strong>${esc(coachActionLabel(x.action))} · ${esc(x.at.slice(0, 10))}</strong><p>${esc(x.proposal.reason || "Objetivo ajustado manualmente")}</p>${x.placement?.date ? `<small>Sesión: ${x.placement.date}</small>` : ""}<details><summary>Datos y criterio utilizados</summary><pre>${esc(JSON.stringify({ evidence: x.proposal.evidence, targets: x.proposal.targets, placement: x.placement, outcome: x.proposal.outcome }, null, 2))}</pre></details></div>`,
      )
      .join("") ||
      "<p>Aún no has tomado decisiones. Consultar el análisis no cambia tu plan.</p>",
  )}<p class="coach-footnote">Análisis local de tus registros. Sin compartir datos con servicios de IA. <a href="docs/adaptive-coach.md" target="_blank" rel="noopener">Criterios y evidencia</a></p></section>${coachPlanHTML(date)}`;
}
let coachPendingProposal = null;
function coachReviewProposal(id) {
  const p = coachProposals(todayISO()).find((p) => p.id === id);
  if (!p) return;
  coachPendingProposal = p;
  coachWrite({
    decisions: MarevoCoach.decision(
      coachLog(),
      p,
      "presented",
      new Date().toISOString(),
    ),
  });
  const options = Array.from({ length: 7 }, (_, i) =>
    MarevoCoach.add(p.week, i),
  ).filter((d) => d >= todayISO() && !oct26SwimDay(d));
  document.getElementById("modalRoot").innerHTML =
    `<div class="modal"><div class="sheet"><h2>Revisar cambio</h2><p>${esc(p.reason)}</p><p>Solo se aplica en una sesión nueva, entrenando solo. Si no hay hueco o ya hay demasiados complementos, mantén el plan.</p><label for="coachSlot">Día disponible</label><select id="coachSlot">${options.map((d) => `<option>${d}</option>`).join("")}</select><label><input type="checkbox" id="coachSolo"> Confirmo que entrenaré solo y tengo tiempo para este ajuste${p.type === "add" ? " adicional" : ""}.</label><p>El domingo es opcional: elegirlo aquí confirma su disponibilidad. El cambio caduca al terminar la semana.</p><div class="actions"><button class="btn" onclick="coachDecide('accepted')">Aceptar</button><button class="btn secondary" onclick="coachDecide('deferred')">Aplazar</button><button class="btn ghost" onclick="coachDecide('rejected')">Mantener plan</button></div></div></div>`;
}
function coachDecide(action) {
  const p = coachPendingProposal;
  if (!p) return;
  let placement = null;
  if (action === "accepted") {
    const date = val("coachSlot");
    if (!document.getElementById("coachSolo").checked || !date) {
      toast("Confirma un día disponible y entrenamiento solo");
      return;
    }
    placement = MarevoCoach.schedule(
      p,
      [
        {
          date,
          mode: "solo",
          available: true,
          capacity: coachSlotCapacity(p, date),
          swim: oct26SwimDay(date) && !(MarevoCoach.programFor(state,date)===4 && weekday(date)===1),
          optional: weekday(date) === 0,
          confirmed: true,
          started: MarevoCoach.records(state).some(
            (s) => s.date === date && (s.startedAt || s.completed),
          ),
        },
      ],
      MarevoCoach.records(state),
    );
    if (placement.status !== "scheduled") {
      toast(placement.reason || "El cambio ya está asignado");
      return;
    }
  }
  coachWrite({
    decisions: MarevoCoach.decision(
      coachLog(),
      p,
      action,
      new Date().toISOString(),
      placement,
    ),
  });
  coachPendingProposal = null;
  closeModal();
  renderAll();
}
function coachRevert(id) {
  const last = coachLog()
    .filter((x) => x.proposal.id === id)
    .at(-1);
  if (!last) return;
  coachWrite({
    decisions: MarevoCoach.decision(
      coachLog(),
      last.proposal,
      "reverted",
      new Date().toISOString(),
    ),
  });
  renderAll();
}
function coachApplyChanges(exercises, date, mode) {
  if (date < MarevoCoach.START || mode !== "solo") return exercises;
  let out = structuredClone(exercises),
    log = coachLog();
  const latest = new Map(log.map((x) => [x.proposal.id, x]));
  for (const d of latest.values()) {
    if (
      d.action !== "accepted" ||
      d.placement?.date !== date ||
      d.proposal.expires < date
    )
      continue;
    const p = d.proposal;
    let e = out.find((e) => e.key === p.exerciseKey);
    if (!e && p.delta > 0) {
      const base = coachPlans(date)
        .flatMap((p) => p.exercises)
        .find((e) => e.key === p.exerciseKey);
      if (base) {
        e = normalizeSessionExercise({ ...base, sets: 0, recordedSets: [] });
        out.push(e);
      }
    }
    if (!e || +e.sets + p.delta < 1) continue;
    e.sets = +e.sets + p.delta;
    e.coachDecisionId = p.id;
    // The record and its audit event are committed together by the session creator.
  }
  return out;
}
function coachExport() {
  const date = todayISO(),
    report = {
      app: "MAREVO",
      version: 1,
      generatedAt: new Date().toISOString(),
      plan: MarevoCoach.planning(date),
      weekly: coachReport(date),
      body: MarevoCoach.bodyReview(state, date),
      decisions: coachLog(),
      longitudinal: MarevoCoach.longitudinal(state, date),
      note: "Rendimiento y evolución corporal son indicadores distintos. Las reglas son heurísticas conservadoras.",
    };
  download(
    "MAREVO_entrenador_" + date + ".json",
    JSON.stringify(report, null, 2),
    "application/json",
  );
}
// One recommendation source replaces conflicting legacy advice, without altering records.
exerciseAdvice = (e, date = currentDate()) =>
  e.type === "mobility"
    ? "Prioriza control y un recorrido cómodo."
    : coachRecommendation(e, date).reason;
weeklyGuidanceStatus = function (date) {
  const r = coachReport(date);
  return {
    key: r.recovery.tired ? "fatigue" : "reference",
    title: r.conclusion,
    desc:
      r.recovery.reason +
      " Los cambios de series requieren aceptación en Tu entrenador.",
    volumeFactor: 1,
    rirNote: "RIR programado",
    checks: (state.daily || []).filter(
      (d) => d.date >= r.start && d.date <= date,
    ).length,
  };
};
weeklyGuideHTML = (date) => coachHomeHTML(date);
openWeeklyExerciseGuide = () => {
  closeModal();
  showView("Progress");
};
muscleVolumeHTML = (sessions) => coachVolumeHTML(MarevoCoach.volume(sessions));
renderAll();

function coachAfterSession(session) {
  const C = MarevoCoach,
    items = (session.exercises || [])
      .filter((e) => e.type !== "mobility")
      .map((e) => {
        const previous = C.history(state, e, session.date).at(-1),
          current = {
            exercise: e,
            sets: C.sets(e).filter((x) => x.work),
            incomplete: C.sets(e).some((x) => x.kind === "incomplete"),
          },
          delta = C.comparison(previous, current);
        const next = C.recommend(state, e, C.add(session.date, 1));
        return {
          key: e.key,
          name: e.name,
          comparison: delta,
          next: next.reason,
          targets: next.targets,
        };
      });
  let log = coachLog();
  for (const e of session.exercises || []) {
    if (!e.coachDecisionId) continue;
    const d = log.filter((x) => x.proposal.id === e.coachDecisionId).at(-1);
    if (d?.action !== "applied") continue;
    const outcome = items.find((x) => x.key === e.key);
    log = C.decision(
      log,
      { ...d.proposal, outcome, sessionDate: session.date },
      "outcome",
      new Date().toISOString(),
      d.placement,
    );
  }
  if (log !== coachLog()) coachWrite({ decisions: log });
  document.getElementById("modalRoot").innerHTML =
    `<div class="modal"><div class="sheet"><div class="coach-kicker">Sesión guardada</div><h2>Lo que has hecho hoy</h2><p>Comparamos el mismo ejercicio, equipo y número de series. Más carga no demuestra por sí sola más músculo.</p>${items.map((x) => `<div class="coach-session"><strong>${esc(x.name)}</strong><p>${esc(x.comparison.reason)}</p><small>${esc(x.next)}</small></div>`).join("")}<div class="actions"><button class="btn" onclick="closeModal();renderAll()">Terminar</button><button class="btn secondary" onclick="closeModal();showView('Progress')">Ver análisis</button></div></div></div>`;
}

function coachSlotCapacity(proposal, date) {
  if(weekday(date)!==0&&!oct26WeekOrder(date).some(k=>oct26SessionStatus(date,k).state==='pending'))return 0;
  const p = planFor(date),
    exercises =
      weekday(date) === 0 && typeof coachSundayPlan === "function"
        ? coachSundayPlan(date)
        : p.exercises || [];
  if (proposal.delta < 0)
    return exercises.some((e) => e.key === proposal.exerciseKey && e.sets > 1)
      ? 1
      : 0;
  const count = exercises
    .filter((e) => e.type !== "mobility")
    .reduce((n, e) => n + (+e.sets || 0), 0);
  return count < (weekday(date) === 0 ? 16 : 27) ? 1 : 0;
}

function coachRecordApplied(session) {
  let log = coachLog();
  for (const e of session.exercises || []) {
    if (!e.coachDecisionId) continue;
    const d = log.filter((x) => x.proposal.id === e.coachDecisionId).at(-1);
    if (d?.action === "accepted")
      log = MarevoCoach.decision(
        log,
        d.proposal,
        "applied",
        new Date().toISOString(),
        d.placement,
      );
  }
  if (log !== coachLog()) state.coach = { ...coachStore(), decisions: log };
}

function coachLongitudinalHTML(date) {
  const r = MarevoCoach.longitudinal(state, date);
  return `<p>${r.weeks.length} semanas observadas · ${r.sessions} sesiones de fuerza · ${r.swims} de natación.</p><p>Sesiones de fuerza completadas: ${r.pplCompleted} de ${r.pplDue} previstas hasta la fecha. Los cambios de día cuentan una vez. El balance sigue la rutina seleccionada.</p><div class="coach-history">${
    r.weeks
      .slice(-6)
      .map(
        (w) =>
          `<div><time>${w.start} · ${w.partial ? "en curso" : "completa"}</time><span>${w.ppl}/${w.plannedSessions} sesiones · ${w.workSets} series de trabajo · ${w.swimMinutes} min natación</span></div>`,
      )
      .join("") || "<p>El programa comienza el 30 de noviembre.</p>"
  }</div><p>${r.message}</p><button class="btn secondary small" onclick="coachExport()">Descargar todas las semanas</button>`;
}
