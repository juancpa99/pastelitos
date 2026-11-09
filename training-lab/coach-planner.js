/* Single compatibility boundary: historic blocks remain frozen; future dates use reusable PPL. */
(function () {
  const C = MarevoCoach,
    keys = ["nov26_push", "nov26_pull", "nov26_legs"];
  const active = (d) => d >= C.START;
  const baseline = Object.fromEntries(
    keys.map((k) => [k, structuredClone(oct26TemplateForKey(k, "2026-11-29"))]),
  );
  window.coachBasePlans = () => structuredClone(Object.values(baseline));
  window.coachFutureTemplate = function (key, date) {
    if (!baseline[key]) return null;
    const p = structuredClone(baseline[key]);
    p.block = "MAREVO · planificación continua";
    p.subtitle = "PPL · volumen de referencia · progresión según tus registros";
    p.exercises.forEach((e) => {
      e.loadProfile = state.equipmentProfiles?.[e.key] || undefined;
    });
    return p;
  };
  const prev = {
    plan: planFor,
    template: oct26TemplateForKey,
    context: oct26FlexContext,
    order: oct26WeekOrder,
    slots: oct26SlotIndicesForDate,
    swim: oct26SwimDay,
    label: homeWeekLabel,
    pool: oct26WeeklyPoolHTML,
    start: oct26StartWeeklySession,
    choices: trainingChoices,
    pending: openPendingWorkouts,
  };
  oct26FlexContext = (d) => active(d || currentDate()) || prev.context(d);
  oct26WeekOrder = (d = currentDate()) =>
    active(d) ? keys.slice() : prev.order(d);
  oct26TemplateForKey = (k, d = currentDate()) =>
    active(d) ? coachFutureTemplate(k, d) : prev.template(k, d);
  oct26SwimDay = (d) =>
    active(d)
      ? [1, 3, 5].includes(weekday(d)) && !marevoNoSwimOnDate(d)
      : prev.swim(d);
  oct26SlotIndicesForDate = (d) =>
    active(d)
      ? [2, 4, 6].includes(weekday(d))
        ? [[2, 4, 6].indexOf(weekday(d))]
        : []
      : prev.slots(d);
  planFor = function (d) {
    if (!active(d)) return prev.plan(d);
    const i = [2, 4, 6].indexOf(weekday(d)),
      key = keys[i];
    return key &&
      !oct26WeeklyRecords(d, key).some((s) => s.completed && s.date !== d)
      ? coachFutureTemplate(key, d)
      : {
          key: "coach_rest_" + weekday(d),
          title: oct26SwimDay(d) ? "Natación" : "Descanso / opcional",
          type: "rest",
          exercises: [],
        };
  };
  homeWeekLabel = (d) => (active(d) ? planFor(d).title : prev.label(d));
  trainingChoices = function () {
    const d = currentDate();
    return active(d)
      ? oct26SwimDay(d)
        ? []
        : keys
            .filter((k) => !oct26WeeklyCompleted(d, k))
            .map((k) => coachFutureTemplate(k, d))
      : prev.choices();
  };
  oct26StartWeeklySession = function (key) {
    const d = currentDate();
    if (!active(d)) return prev.start(key);
    if (!keys.includes(key) || oct26SwimDay(d)) return;
    const st = oct26SessionStatus(d, key);
    if (st.state === "done") {
      toast("Esta sesión ya está hecha esta semana");
      return;
    }
    if (st.state === "active") {
      closeModal();
      if (st.record.id) editExtraSession(st.record.id);
      else {
        document.getElementById("selectedDate").value = st.record.date;
        showView("Workout");
        openPlannedWorkspace();
      }
      return;
    }
    // Reuse the existing record lifecycle and IDs, so holidays and deduplication still work.
    const p = coachFutureTemplate(key, d),
      id = "coach_" + Date.now().toString(36);
    state.extraSessions.push({
      id,
      date: d,
      title: p.title,
      weeklyTemplateKey: key,
      weeklyWeekStart: mondayOf(d),
      completed: false,
      startedAt: Date.now(),
      duration: null,
      rpe: null,
      exercises: p.exercises.map((e) =>
        normalizeSessionExercise({ ...e, recordedSets: [] }),
      ),
    });
    saveState(true);
    closeModal();
    renderAll();
    editExtraSession(id);
  };
  oct26WeeklyPoolHTML = function (d = currentDate()) {
    if (!active(d)) return prev.pool(d);
    return (
      '<div class="coach-week">' +
      keys
        .map(
          (k, i) =>
            "<div><span>" +
            ["Martes · Push", "Jueves · Pull", "Sábado · Legs"][i] +
            "</span><strong>" +
            esc(oct26SessionStatus(d, k).label) +
            "</strong></div>",
        )
        .join("") +
      "<p>Natación lunes, miércoles y viernes. Domingo opcional. Las sesiones movidas cuentan una sola vez.</p></div>"
    );
  };
  openPendingWorkouts = function () {
    if (!active(currentDate())) return prev.pending();
    openTrainingSelector();
  };
})();
