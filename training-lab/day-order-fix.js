// Final chronological ordering for the September cycle UI.
function chronologicalComplementDescription(comp, compSession, compDone) {
  if (!comp) return "";
  if (compDone) return `${comp.title} registrado`;
  if (compSession?.startedAt) return `${comp.title} en curso`;
  return comp.timing || `${comp.title} pendiente`;
}

homeDayPresentation = function (date) {
  const p = planFor(date);
  const comp = homeComplementFor(date);
  const primaryDone = p.type === "rest" ? true : sessionDone(date, p);
  const compSession = homeComplementSession(date, comp);
  const compDone = !comp || !!compSession?.completed;
  const gymSession = p.type === "gym" ? findSession(date, p.key) : null;
  const primaryActive =
    !!(gymSession?.startedAt && !gymSession.completed) ||
    (state.cardioRuntime?.date === date && !state.cardioRuntime.completed);
  const compActive = !!(compSession?.startedAt && !compSession.completed);
  const hasActivity = p.type !== "rest" || !!comp;
  const allDone = hasActivity && primaryDone && compDone;
  const anyActive = primaryActive || compActive;

  let title = p.title;
  let subtitle = p.subtitle || "";
  let kind = "Recuperación";
  if (comp && p.type === "swim") {
    title = `${comp.title} + ${p.title}`;
    subtitle = comp.timing || p.subtitle || "";
    kind = /movilidad/i.test(comp.title)
      ? "Movilidad + natación"
      : "Complemento + natación";
  } else if (comp && p.type === "rest") {
    title = comp.title;
    subtitle = comp.timing || p.subtitle || "";
    kind = "Movilidad + core";
  } else if (p.type === "gym") kind = "Gimnasio";
  else if (p.type === "swim") kind = "Natación";
  else if (p.type === "cardio") kind = "Cardio";

  return {
    p,
    comp,
    compSession,
    primaryDone,
    compDone,
    hasActivity,
    allDone,
    anyActive,
    title,
    subtitle,
    kind,
  };
};

homeTaskHTML = function (date, presentation) {
  const { p, comp, compSession, primaryDone, compDone } = presentation;
  let html = "";

  const primaryTask = () =>
    task(
      "E",
      p.title,
      primaryDone ? `${p.title} registrado` : `${p.title} pendiente`,
      primaryDone,
      "showView('Workout')",
    );
  const complementTask = () =>
    task(
      "+",
      comp.title,
      chronologicalComplementDescription(comp, compSession, compDone),
      compDone,
      "showView('Workout')",
    );

  // L-X-V: the 16-17 h complement/mobility is shown before the 22-23 h swim.
  if (comp && p.type === "swim") {
    html += complementTask();
    html += primaryTask();
  } else {
    if (p.type !== "rest") html += primaryTask();
    if (comp) html += complementTask();
  }

  if (isSunday(date)) {
    html += task(
      "M",
      "Peso y cintura",
      measurementDone(date)
        ? "Mediciones registradas"
        : "Mediciones semanales pendientes",
      measurementDone(date),
      "openMeasurements()",
    );
    if (!monthlyReviewDone(date)) {
      const desc =
        monthlyMeasurementDone(date) && !monthlyPhotosDone(date)
          ? "Faltan las fotos del mes"
          : !monthlyMeasurementDone(date) && monthlyPhotosDone(date)
            ? "Faltan los perímetros del mes"
            : "Perímetros y fotos mensuales pendientes";
      html += task("R", "Revisión corporal mensual", desc, false, "openMonthlyReview()");
    }
  }

  const foods = foodsFor(date);
  HOME_CORE_MEALS.forEach((meal, index) => {
    const done = foods.some((item) => item.meal === meal);
    const icon = ["D", "A", "C"][index];
    const action = done ? "showView('Food')" : `openFoodModal('${meal}')`;
    html += task(
      icon,
      meal,
      done ? `${meal} registrado` : `Añadir ${meal.toLowerCase()}`,
      done,
      action,
    );
  });

  if (afterCheckHour(date)) {
    html += task(
      "✓",
      "Check-in final",
      dailyDone(date) ? "Día cerrado" : "Pendiente al final del día",
      dailyDone(date),
      "openDailyCheck()",
    );
  } else {
    html += `<div class="task"><div class="ico">✓</div><div><strong>Check-in final</strong><small>Aparecerá a partir de las ${state.settings.checkHour}:00.</small></div></div>`;
  }
  return html;
};

homeWeekLabel = function (date) {
  const p = planFor(date);
  const comp = homeComplementFor(date);
  if (comp && p.type === "swim") {
    return /movilidad/i.test(comp.title)
      ? "Movilidad + natación"
      : "Complemento + natación";
  }
  if (comp && p.type === "rest") return "Movilidad + core";
  return p.title;
};

function enforceChronologicalWorkoutOrder() {
  const root = document.getElementById("viewWorkout");
  if (!root) return;
  const date = currentDate();
  const p = planFor(date);
  const compCard = root.querySelector(".season-complement-card");
  if (p.type === "swim" && compCard) {
    const primaryHero = [...root.querySelectorAll(".card.hero")].find(
      (card) => card.querySelector(".hero-title")?.textContent.trim() === p.title,
    );
    if (primaryHero && compCard.nextElementSibling !== primaryHero) {
      primaryHero.insertAdjacentElement("beforebegin", compCard);
    }
  }
  if (typeof movePendingWorkoutCard === "function") movePendingWorkoutCard();
}

const chronologicalRenderWorkout = renderWorkout;
renderWorkout = function () {
  chronologicalRenderWorkout();
  enforceChronologicalWorkoutOrder();
};

// Refresh the current views using the corrected helpers.
enhanceHomeDayOverview();
enhanceWorkoutDayOverview();
enforceChronologicalWorkoutOrder();
