/* Session usability: records are explicit; templates remain unchanged. */
const LOAD_MODES = {
  total: "Peso total / selector",
  dumbbell: "Una mancuerna (por mano)",
  plates: "Discos totales + base",
  sideplates: "Discos por lado + base",
};
function loadProfile(e) {
  return (
    e.loadProfile ||
    ((e.recordedSets || []).some((a) => a.completedAt)
      ? {
          mode: "total",
          base: "",
          machine: "Registro anterior · convención sin confirmar",
          unilateral: false,
        }
      : null) ||
    state.equipmentProfiles?.[e.key] || {
      mode: /mancuerna/i.test(e.name || "") ? "dumbbell" : "total",
      base: "",
      machine: "",
      unilateral:
        !!e.unilateral ||
        /unilateral|búlgar|por lado/i.test(
          (e.name || "") + " " + (e.note || ""),
        ),
    }
  );
}
function profileSignature(e) {
  const p = loadProfile(e);
  return JSON.stringify([
    p.mode,
    String(p.base ?? ""),
    p.machine || "",
    !!p.unilateral,
  ]);
}
function loadLabel(e) {
  const p = loadProfile(e);
  return `${LOAD_MODES[p.mode] || LOAD_MODES.total}${p.machine ? " · " + p.machine : ""}${p.base !== "" && p.base != null ? " · base " + p.base + " kg" : ""}`;
}
function nominalLoad(e, kg) {
  if (kg === "" || kg == null) return null;
  const p = loadProfile(e);
  return (
    +kg * (p.mode === "sideplates" ? 2 : 1) +
    (["plates", "sideplates"].includes(p.mode) ? +p.base || 0 : 0)
  );
}
function matchingHistory(e) {
  return lastCompletedExercises(e.key, currentDate(), 100).filter(
    (h) =>
      profileSignature(h) === profileSignature(e) &&
      +h.min === +e.min &&
      +h.max === +e.max &&
      String(h.rir) === String(e.rir),
  );
}
const oldNormalizeAttempt = normalizeAttempt;
normalizeAttempt = function (a) {
  return { ...a, ...oldNormalizeAttempt(a) };
};
inferredAttemptStatus = function (e, a) {
  if (a.attemptType === "warmup") return a.completedAt ? "warmup" : null;
  if (!a.completedAt) return null;
  if (loadProfile(e).unilateral && !a.rightCompletedAt) return null;
  return "effective";
};
classifyAttempt = function (e, a) {
  if (a.attemptType === "warmup")
    return {
      status: "warmup",
      tone: "warmup",
      title: "Aproximación",
      text: "Calentamiento registrado.",
    };
  const c = strictEffectiveCriteria(e, a.reps, a.rir);
  return {
    status: "effective",
    tone: c.valid ? "good" : "warn",
    title: c.valid ? "Serie registrada" : "Registrada · fuera del objetivo",
    text:
      "Cuenta como trabajo realizado. " +
      setCoachFeedback(e, a.reps, a.rir).text,
  };
};
function collectScope(scope) {
  if (scope === "planned" && planFor(currentDate()).type !== "gym") return;
  const s =
    scope === "planned"
      ? normalizePlannedSession()
      : state.extraSessions.find((s) => s.id === scope);
  if (!s) return;
  s.exercises.forEach((e, i) => {
    e.recordedSets = allAttempts(e).map((a, j) => {
      const out = { ...a };
      for (const [field, id] of Object.entries({
        kg: "kg",
        reps: "rp",
        rir: "rr",
        rightKg: "rkg",
        rightReps: "rrp",
        rightRir: "rrr",
      })) {
        const input = document.getElementById(`${scope}_${id}_${i}_${j}`);
        if (input) out[field] = input.value.replace(",", ".");
      }
      return out;
    });
  });
  return s;
}
collectPlannedInputs = function () {
  return collectScope("planned");
};
saveScopeInputs = function (scope) {
  clearTimeout(autosaveTimer);
  collectScope(scope);
  saveState(true);
};
saveExtraInputs = function (scope) {
  saveScopeInputs(scope);
};
function refreshScope(scope) {
  if (scope === "planned") renderWorkout();
  else editExtraSession(scope);
}
function equipmentSettings(scope, i) {
  saveScopeInputs(scope);
  const e = scopeExercise(scope, i),
    p = loadProfile(e);
  document.getElementById("modalRoot").innerHTML =
    `<div class="modal"><div class="sheet"><h2>Cómo registras ${esc(e.name)}</h2><p>Se recuerda para próximas sesiones. El historial conserva su configuración original.</p><label for="eqMachine">Máquina / identificación en tu club</label><input id="eqMachine" value="${esc(p.machine)}" placeholder="Hammer Strength · remo 3"><label for="eqMode">Los kg que introduces son…</label><select id="eqMode">${Object.entries(
      LOAD_MODES,
    )
      .map(
        ([k, v]) =>
          `<option value="${k}" ${p.mode === k ? "selected" : ""}>${v}</option>`,
      )
      .join(
        "",
      )}</select><label for="eqBase">Barra o resistencia inicial (kg, opcional)</label><input id="eqBase" inputmode="decimal" value="${esc(p.base ?? "")}" placeholder="Desconocida"><p>Ejemplo: barra 20 + 15 kg de discos por lado = 50 kg nominales. En poleas usa el selector; no sumes la máquina. La resistencia real depende de palancas y poleas.</p><label><input id="eqUni" type="checkbox" ${p.unilateral ? "checked" : ""}> Unilateral: registrar izquierda y derecha</label><p>Una pareja de lados = 1 serie por lado. Con dos mancuernas a la vez, registra el peso de una y deja unilateral desactivado.</p><div class="actions"><button class="btn" onclick="saveEquipment('${scope}',${i})">Guardar configuración</button><button class="btn ghost" onclick="closeModal();refreshScope('${scope}')">Cancelar</button></div></div></div>`;
}
function saveEquipment(scope, i) {
  const e = scopeExercise(scope, i);
  if (allAttempts(e).some((a) => a.completedAt || a.leftCompletedAt)) {
    toast(
      "Configura el equipo antes de registrar series. Añade otra variante para cambiarlo.",
    );
    return;
  }
  const base = val("eqBase").replace(",", ".");
  if (base !== "" && (!Number.isFinite(+base) || +base < 0)) {
    toast("La base debe ser un peso válido");
    return;
  }
  e.loadProfile = {
    mode: val("eqMode"),
    base,
    machine: val("eqMachine").trim(),
    unilateral: document.getElementById("eqUni").checked,
  };
  state.equipmentProfiles ??= {};
  state.equipmentProfiles[e.key] = { ...e.loadProfile };
  saveState(true);
  closeModal();
  refreshScope(scope);
}
const oldNormalizeExercise = normalizeSessionExercise;
normalizeSessionExercise = function (e) {
  const n = oldNormalizeExercise(e);
  if (!n.loadProfile && !allAttempts(n).some((a) => a.completedAt))
    n.loadProfile = { ...loadProfile(n) };
  return n;
};
function copySet(scope, i, j, source) {
  saveScopeInputs(scope);
  const e = scopeExercise(scope, i),
    arr = allAttempts(e);
  if (
    arr[j]?.completedAt ||
    (source !== "side" && arr[j]?.leftCompletedAt) ||
    arr[j]?.rightCompletedAt
  ) {
    toast("Copia antes de registrar los lados");
    return;
  }
  let ref;
  if (source === "side") ref = arr[j];
  else if (source === "previous")
    ref = arr
      .slice(0, j)
      .reverse()
      .find((a) => a.completedAt && a.attemptType === arr[j].attemptType);
  else {
    const h = matchingHistory(e)[0];
    ref =
      h &&
      allAttempts(h).filter(
        (a) => a.completedAt && a.attemptType === arr[j].attemptType,
      )[j];
  }
  if (!ref) {
    toast("No hay una referencia comparable");
    return;
  }
  if (source === "side") {
    Object.assign(arr[j], { rightKg: ref.kg, rightReps: ref.reps });
  } else {
    for (const k of ["kg", "reps", "rightKg", "rightReps"])
      arr[j][k] = ref[k] ?? "";
  }
  e.recordedSets = arr;
  saveState(true);
  refreshScope(scope);
  toast("Peso y reps copiados. Valora el RIR de esta serie.");
}
exerciseAdvice = function (e) {
  const hist = matchingHistory(e),
    sets = hist[0] && effectiveAttempts(hist[0]),
    low = targetRIRRange(e.rir)[0],
    min = +e.min || 8,
    max = +e.max || 12;
  if (!sets?.length)
    return `Primera referencia: ${min}–${max} reps, RIR ${e.rir || "1–2"}. Elige una carga controlable; no hace falta llegar al fallo.`;
  const sides = (a) =>
    loadProfile(e).unilateral
      ? [a, { reps: a.rightReps, rir: a.rightRir }]
      : [a];
  if (sets.flatMap(sides).some((a) => +a.reps < min || +a.rir < low))
    return "Mantén o baja un pequeño paso la carga si, tras descansar, no recuperas reps y RIR. No añadas series para compensar la fatiga.";
  const ready = (h) => {
    const a = effectiveAttempts(h);
    return (
      a.length >= (+e.sets || 3) &&
      a
        .flatMap(sides)
        .every((s) => +s.reps >= max && s.rir !== "" && +s.rir >= low)
    );
  };
  if (hist.length >= 2 && hist.slice(0, 2).every(ready))
    return `Dos sesiones en el techo del rango: prueba el menor incremento disponible (orientación 2–10%) y vuelve a ${min} reps. Mantén el RIR; si el salto es excesivo, conserva el peso.`;
  if (ready(hist[0]))
    return "Mantén peso y confirma el techo del rango otra sesión antes de subir. En unilateral manda el lado con menos margen.";
  return "Mantén peso y busca una repetición más sin salir del RIR objetivo. No aumentes series automáticamente: revisa recuperación y tendencia de varias sesiones.";
};
lastPerformanceSummary = function (e) {
  const h = matchingHistory(e)[0];
  return h
    ? effectiveAttempts(h)
        .map(
          (a) =>
            `${a.kg} kg × ${a.reps}${loadProfile(e).unilateral ? ` / D: ${a.rightKg} kg × ${a.rightReps}` : ""}`,
        )
        .join(" · ")
    : "";
};
const legacyExerciseCard = exerciseCardHTML;
exerciseCardHTML = function (e, i, scope) {
  if (e.type === "mobility") return legacyExerciseCard(e, i, scope);
  const p = loadProfile(e),
    arr = allAttempts(e),
    done = effectiveCount(e),
    goal = +e.sets || 3;
  let html = `<article class="exercise"><div class="exhead"><h3>${esc(e.name)}</h3><p>${goal} series${p.unilateral ? " por lado" : ""} · ${e.min || 8}–${e.max || 12} reps · RIR ${esc(e.rir || "1–2")}</p><div class="actions"><button class="btn ghost" onclick="openExercisePicker('replace','${scope}',${i})">Cambiar ejercicio</button><button class="btn secondary" onclick="equipmentSettings('${scope}',${i})">Equipo y peso</button></div><p class="load-convention">${esc(loadLabel(e))}</p><strong>${done}/${goal} series registradas</strong><p>${esc(lastPerformanceSummary(e))}</p><div class="recommend">${esc(exerciseAdvice(e))}</div></div>`;
  arr.forEach((a, j) => {
    const uni = p.unilateral;
    html += `<div class="attempt-block"><h4>${a.attemptType === "warmup" ? "Aproximación" : "Serie"} ${j + 1}${a.completedAt ? " · Guardada" : ""}</h4>`;
    for (const side of uni ? ["left", "right"] : ["left"]) {
      const right = side === "right",
        stamp = right ? a.rightCompletedAt : a.leftCompletedAt || a.completedAt;
      html += `<fieldset class="set-side"><legend>${uni ? (right ? "Derecha" : "Izquierda") : "Registro"}</legend><div class="set-input-grid">`;
      for (const [id, k, label] of right
        ? [
            ["rkg", "rightKg", "Kg"],
            ["rrp", "rightReps", "Reps"],
            ["rrr", "rightRir", "RIR"],
          ]
        : [
            ["kg", "kg", "Kg"],
            ["rp", "reps", "Reps"],
            ["rr", "rir", "RIR"],
          ])
        html += `<label>${label}<input aria-label="${label} ${uni ? (side === "right" ? "derecha" : "izquierda") : ""} serie ${j + 1}" id="${scope}_${id}_${i}_${j}" data-gym="${scope}" inputmode="decimal" value="${esc(a[k] ?? "")}" ${stamp ? "readonly" : ""}></label>`;
      html += `</div>${uni && !stamp ? `<button class="btn secondary" onclick="completeSide('${scope}',${i},${j},'${side}')">Registrar ${right ? "derecha" : "izquierda"}</button>` : ""}</fieldset>`;
    }
    if (!a.completedAt)
      html += `<div class="actions"><button class="btn ghost" onclick="copySet('${scope}',${i},${j},'previous')">Repetir anterior</button><button class="btn ghost" onclick="copySet('${scope}',${i},${j},'history')">Última sesión</button>${uni ? `<button class="btn ghost" onclick="copySet('${scope}',${i},${j},'side')">Copiar I → D</button>` : `<button class="btn" onclick="completeStrengthSet('${scope}',${i},${j})">Serie hecha · descansar</button>`}</div>`;
    else html += `<p>${esc(classifyAttempt(e, a).text)}</p>`;
    if (["plates", "sideplates"].includes(p.mode))
      html += `<p>Carga nominal: ${nominalLoad(e, a.kg) ?? "—"} kg${p.base === "" ? " + base desconocida" : ""}</p>`;
    html += `<button class="btn danger small" onclick="discardSetAttempt('${scope}',${i},${j})">Descartar serie</button></div>`;
  });
  return (
    html +
    `<div class="actions"><button class="btn ghost" onclick="addSetAttempt('${scope}',${i},'warmup')">+ Aproximación</button><button class="btn" ${done >= goal ? "disabled" : ""} onclick="addSetAttempt('${scope}',${i},'effective')">+ Serie</button></div><p class="exnote">${esc(e.note || "")} ${p.unilateral ? "Completa ambos lados para cerrar la serie. El descanso comienza después del segundo lado." : ""}</p></article>`
  );
};
function validSet(a, right = false, warmup = false) {
  const v = (k) =>
    a[
      (right
        ? { kg: "rightKg", reps: "rightReps", rir: "rightRir" }
        : { kg: "kg", reps: "reps", rir: "rir" })[k]
    ];
  return (
    v("kg") !== "" &&
    Number.isFinite(+v("kg")) &&
    +v("kg") >= 0 &&
    Number.isInteger(+v("reps")) &&
    +v("reps") > 0 &&
    (warmup ||
      (v("rir") !== "" &&
        Number.isFinite(+v("rir")) &&
        +v("rir") >= 0 &&
        +v("rir") <= 10))
  );
}
function watchReminder(next) {
  document.getElementById("modalRoot").innerHTML =
    `<div class="modal"><div class="sheet"><h2>Antes de empezar</h2><p>Activa en el smartwatch el entrenamiento de pesas en el gimnasio para contabilizar calorías.</p><p>El reloj y la app se inician y se pausan por separado. Las calorías del reloj son una estimación.</p><button class="btn" id="watchReady">Listo · iniciar entreno</button><button class="btn ghost" onclick="closeModal()">Todavía no</button></div></div>`;
  document.getElementById("watchReady").onclick = () => {
    closeModal();
    next();
  };
}
const legacyStartGym = startGym;
startGym = function () {
  saveScopeInputs("planned");
  const s = normalizePlannedSession();
  if (!s.startedAt) watchReminder(legacyStartGym);
  else legacyStartGym();
};
const legacyCreateExtra = createExtraSession;
createExtraSession = function () {
  const title = val("exTitle");
  watchReminder(() => {
    const id = "extra_" + Date.now().toString(36);
    state.extraSessions.push({
      id,
      date: currentDate(),
      title: title || "Sesión libre",
      completed: false,
      startedAt: Date.now(),
      exercises: [],
    });
    saveState(true);
    editExtraSession(id);
  });
};
function completeSide(scope, i, j, side) {
  saveScopeInputs(scope);
  const e = scopeExercise(scope, i),
    a = e.recordedSets[j];
  if (!a || a.completedAt) return;
  if (!validSet(a, side === "right", a.attemptType === "warmup")) {
    toast("Introduce kg (0 si corresponde), reps enteras y RIR entre 0 y 10");
    return;
  }
  const finish = () => {
    const current = scopeExercise(scope, i),
      set = current.recordedSets[j];
    current.loadProfile = { ...loadProfile(current) };
    set[side === "right" ? "rightCompletedAt" : "leftCompletedAt"] = Date.now();
    if (set.leftCompletedAt && set.rightCompletedAt)
      finishRecordedSet(scope, i, j);
    else {
      saveState(true);
      refreshScope(scope);
      toast("Lado guardado. Completa el otro lado.");
    }
  };
  const s =
    scope === "planned"
      ? normalizePlannedSession()
      : state.extraSessions.find((s) => s.id === scope);
  if (!s.startedAt)
    watchReminder(() => {
      s.startedAt = Date.now();
      saveState(true);
      finish();
    });
  else if (s.pausedAt) toast("Reanuda el entrenamiento antes de registrar");
  else finish();
}
function finishRecordedSet(scope, i, j) {
  const e = scopeExercise(scope, i),
    a = e.recordedSets[j];
  e.loadProfile = { ...loadProfile(e) };
  a.completedAt = Date.now();
  a.status = a.attemptType === "warmup" ? "warmup" : "effective";
  a.feedback = classifyAttempt(e, a).title;
  const seconds = parseRestSeconds(e.rest);
  state.restTimer = {
    date: currentDate(),
    scope,
    exerciseIndex: i,
    attemptIndex: j,
    endAt: Date.now() + seconds * 1000,
    duration: seconds,
    exercise: e.name,
    set: j + 1,
    feedback: classifyAttempt(e, a),
    done: false,
    paused: false,
  };
  saveState(true);
  refreshScope(scope);
  startRuntimeTicker();
}
completeStrengthSet = function (scope, i, j) {
  saveScopeInputs(scope);
  const e = scopeExercise(scope, i),
    a = e.recordedSets[j];
  if (!a || a.completedAt) return;
  if (loadProfile(e).unilateral) {
    toast("Registra cada lado por separado");
    return;
  }
  if (!validSet(a, false, a.attemptType === "warmup")) {
    toast("Introduce kg (0 si corresponde), reps enteras y RIR entre 0 y 10");
    return;
  }
  const s =
    scope === "planned"
      ? normalizePlannedSession()
      : state.extraSessions.find((s) => s.id === scope);
  if (s.pausedAt) {
    toast("Reanuda el entrenamiento antes de registrar");
    return;
  }
  if (!s.startedAt)
    watchReminder(() => {
      s.startedAt = Date.now();
      saveState(true);
      finishRecordedSet(scope, i, j);
    });
  else finishRecordedSet(scope, i, j);
};
const legacyPauseGym = toggleGymPause;
toggleGymPause = function () {
  saveScopeInputs("planned");
  legacyPauseGym();
  renderWorkout();
};
const legacyShowView = showView;
showView = function (v) {
  if (activeView === "Workout") saveScopeInputs("planned");
  document.body.dataset.view = v;
  legacyShowView(v);
};
const legacyRenderWorkout = renderWorkout;
renderWorkout = function () {
  legacyRenderWorkout();
  document
    .getElementById("viewWorkout")
    .insertAdjacentHTML(
      "afterbegin",
      `<div class="card"><button class="btn secondary" onclick="openPendingWorkouts()">Hacer un entreno pendiente otro día</button></div>`,
    );
};
function pendingWorkouts() {
  const out = [];
  for (let n = 1; n <= (weekday(currentDate()) + 6) % 7; n++) {
    const d = new Date(currentDate() + "T12:00:00");
    d.setDate(d.getDate() - n);
    const date = d.toISOString().slice(0, 10),
      p = planFor(date);
    if (p.type !== "gym") continue;
    const s = state.sessions.find((s) => s.date === date && s.key === p.key);
    if (
      s?.completed ||
      state.extraSessions.some(
        (s) => s.sourceDate === date && s.sourceKey === p.key,
      )
    )
      continue;
    out.push({ date, p, s });
  }
  return out;
}
function openPendingWorkouts() {
  saveScopeInputs("planned");
  document.getElementById("modalRoot").innerHTML =
    `<div class="modal"><div class="sheet"><h2>Entrenamientos pendientes</h2><p>Solo días anteriores de esta semana (lunes a domingo), según la fecha seleccionada y tu plan actual. Se registra en la fecha seleccionada; no cambia la plantilla ni el calendario.</p>${
      pendingWorkouts()
        .map(
          (x, i) =>
            `<button class="btn secondary pending-choice" onclick="recoverWorkout(${i})">Hacer ${esc(x.p.title)} · ${esc(pretty(x.date))} · ${x.s?.startedAt ? "iniciado" : "no realizado"}</button>`,
        )
        .join("") || "<p>No hay entrenamientos pendientes esta semana.</p>"
    }<button class="btn ghost" onclick="closeModal()">Cerrar</button></div></div>`;
}
function recoverWorkout(i) {
  const item = pendingWorkouts()[i];
  if (!item) return;
  if (item.s?.startedAt) {
    toast("Hay datos en esa sesión: ábrela en su fecha para completarla.");
    return;
  }
  watchReminder(() => {
    const id = "extra_" + Date.now().toString(36);
    state.extraSessions.push({
      id,
      date: currentDate(),
      title: item.p.title + " · recuperado del " + item.date,
      sourceDate: item.date,
      sourceKey: item.p.key,
      completed: false,
      startedAt: Date.now(),
      exercises: structuredClone(item.p.exercises || []).map((e) =>
        normalizeSessionExercise({ ...e, recordedSets: [] }),
      ),
    });
    saveState(true);
    renderWorkout();
    editExtraSession(id);
  });
}
// Catalogue models are options, not a guarantee of availability in every Fitness Park.
for (const [key, name, muscle, unilateral] of [
  ["hs_chest", "Hammer Strength · Iso-Lateral Bench Press", "Pecho", false],
  ["hs_incline", "Hammer Strength · Iso-Lateral Incline Press", "Pecho", false],
  ["hs_row", "Hammer Strength · Iso-Lateral Row", "Espalda", false],
  ["hs_highrow", "Hammer Strength · Iso-Lateral High Row", "Espalda", false],
  ["hs_shoulder", "Hammer Strength · Shoulder Press", "Hombros", false],
  ["hs_legpress", "Hammer Strength · Linear Leg Press", "Cuádriceps", false],
  ["hs_glute", "Hammer Strength · Glute Drive", "Glúteos", false],
  ["hs_smith", "Hammer Strength · Vertical Smith", "Cuádriceps", false],
  ["one_row", "Remo con mancuerna unilateral", "Espalda", true],
  ["one_split", "Sentadilla búlgara unilateral", "Cuádriceps", true],
  ["one_legpress", "Prensa unilateral", "Cuádriceps", true],
  ["one_curl", "Curl de bíceps unilateral", "Bíceps", true],
  ["one_lateral", "Elevación lateral unilateral en polea", "Hombros", true],
  ["one_legcurl", "Curl femoral unilateral", "Isquios", true],
  ["one_extension", "Extensión de rodilla unilateral", "Cuádriceps", true],
])
  EXERCISE_LIBRARY.push({
    key,
    name,
    muscle,
    group: muscle,
    pattern: name,
    type: "strength",
    sets: 3,
    min: 8,
    max: 12,
    rir: "1–2",
    rest: "2 min",
    unilateral,
    note: "Selecciona equipo y convención de carga antes de registrar. Disponibilidad según club.",
  });
document.body.dataset.view = activeView;
// Extra and recovered workouts share pause and rest behavior with planned sessions.
const legacyEditExtra = editExtraSession;
editExtraSession = function (id) {
  legacyEditExtra(id);
  const sheet = document.querySelector("#modalRoot .sheet");
  if (sheet) {
    sheet.dataset.extraScope = id;
    sheet.insertAdjacentHTML(
      "afterbegin",
      `<div class="extra-clock" id="extraClock"></div>`,
    );
    updateExtraClock();
    startRuntimeTicker();
  }
};
function toggleExtraPause(id) {
  saveScopeInputs(id);
  const s = state.extraSessions.find((s) => s.id === id);
  if (!s || s.completed) return;
  if (s.pausedAt) {
    s.pausedDuration = (+s.pausedDuration || 0) + Date.now() - s.pausedAt;
    s.pausedAt = null;
    if (state.restTimer?.scope === id && state.restTimer.pausedBySession) {
      Object.assign(state.restTimer, {
        paused: false,
        pausedBySession: false,
        endAt: Date.now() + (state.restTimer.pausedRemaining || 0) * 1000,
      });
    }
  } else {
    s.pausedAt = Date.now();
    if (state.restTimer?.scope === id && !state.restTimer.paused) {
      Object.assign(state.restTimer, {
        paused: true,
        pausedBySession: true,
        pausedRemaining: Math.max(
          0,
          (state.restTimer.endAt - Date.now()) / 1000,
        ),
      });
    }
  }
  saveState(true);
  updateExtraClock();
}
function updateExtraClock() {
  const el = document.getElementById("extraClock"),
    id = el?.closest("[data-extra-scope]")?.dataset.extraScope,
    s = state.extraSessions.find((s) => s.id === id);
  if (!el || !s) return;
  const t = state.restTimer?.scope === id ? state.restTimer : null;
  el.innerHTML = `<strong>${s.pausedAt ? "En pausa" : "Tiempo de sesión"} · ${formatClock(sessionElapsedSeconds(s))}</strong><button class="btn secondary" onclick="toggleExtraPause('${id}')">${s.pausedAt ? "Reanudar" : "Pausar"}</button>${t ? `<p class="rest-status">Descanso · ${formatClock(t.paused ? t.pausedRemaining : Math.max(0, (t.endAt - Date.now()) / 1000))} ${t.paused ? "(pausado)" : ""}</p><button class="btn ghost" onclick="addRestTime(30)">+30 s</button><button class="btn ghost" onclick="skipRestTimer()">Terminar descanso</button>` : ""}`;
}
const legacyRestPanel = updateRestTimerPanel;
updateRestTimerPanel = function () {
  legacyRestPanel();
  updateExtraClock();
};
const legacyFinishExtraOpen = openFinishExtra;
openFinishExtra = function (id) {
  legacyFinishExtraOpen(id);
  const s = state.extraSessions.find((s) => s.id === id);
  document.getElementById("exDur").value = Math.max(
    1,
    Math.round(sessionElapsedSeconds(s) / 60),
  );
};
finishExtra = function (id) {
  const s = state.extraSessions.find((s) => s.id === id);
  if (!s) return;
  const duration = num("exDur"),
    rpe = num("exRPE"),
    kcal = num("exKcal");
  if (
    !(duration > 0) ||
    !(rpe >= 1 && rpe <= 10) ||
    (kcal != null && kcal < 0)
  ) {
    toast("Revisa duración, RPE (1–10) y calorías");
    return;
  }
  Object.assign(s, {
    completed: true,
    finishedAt: s.pausedAt || Date.now(),
    pausedAt: null,
    duration,
    rpe,
    activeKcal: kcal,
  });
  if (state.restTimer?.scope === id) state.restTimer = null;
  saveState(true);
  closeModal();
  renderAll();
};
const legacyCloseModal = closeModal;
closeModal = function () {
  const scope =
    document.querySelector("[data-extra-scope]")?.dataset.extraScope;
  if (scope) saveScopeInputs(scope);
  legacyCloseModal();
};
// One selected exercise/equipment at a time; chart range is independent of daily totals.
function strengthChartGroups(ref) {
  const groups = new Map();
  [...state.sessions, ...state.extraSessions]
    .filter((s) => s.completed && s.date <= ref)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((s) =>
      (s.exercises || []).forEach((e) => {
        if (e.type === "mobility") return;
        const sets = effectiveAttempts(e).filter(
          (a) => a.kg !== "" && Number.isFinite(+a.kg),
        );
        if (!sets.length) return;
        const key = JSON.stringify([e.key, profileSignature(e)]);
        if (!groups.has(key)) groups.set(key, { key, exercise: e, points: [] });
        const right = sets.filter(
          (a) => a.rightKg !== "" && Number.isFinite(+a.rightKg),
        );
        groups.get(key).points.push({
          date: s.date,
          left: Math.max(...sets.map((a) => +a.kg)),
          right:
            loadProfile(e).unilateral && right.length
              ? Math.max(...right.map((a) => +a.rightKg))
              : null,
          reps: sets.reduce((n, a) => n + (+a.reps || 0), 0),
          sets: sets.length,
        });
      }),
    );
  return [...groups.values()].sort((a, b) =>
    a.exercise.name.localeCompare(b.exercise.name),
  );
}
let activeStrengthChartKey = null;
function setStrengthChartExercise(index) {
  const group = strengthChartGroups(currentDate())[+index];
  if (!group) return;
  activeStrengthChartKey = activeStrengthChartKey === group.key ? null : group.key;
  renderProgress();
}
function setStrengthChartRange(range) {
  if (!["28", "84", "all"].includes(range)) return;
  state.settings.strengthChartRange = range;
  saveState(true);
  renderProgress();
}
function strengthEvolutionSVG(points, unilateral) {
  const width = 600,
    height = 250,
    left = 48,
    right = 18,
    top = 22,
    bottom = 42;
  const values = points.flatMap((p) =>
    p.right == null ? [p.left] : [p.left, p.right],
  );
  const max = Math.max(1, ...values) * 1.12,
    plotW = width - left - right,
    plotH = height - top - bottom;
  const times = points.map((p) => Date.parse(p.date + "T12:00:00Z")),
    start = Math.min(...times),
    end = Math.max(...times);
  const x = (i) =>
      left +
      (end === start
        ? plotW / 2
        : ((times[i] - start) / (end - start)) * plotW),
    y = (v) => top + plotH * (1 - v / max);
  let svg = `<svg class="strength-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolución de la carga máxima registrada por sesión, en kilogramos. Valores exactos en el detalle inferior.">`;
  for (let i = 0; i <= 4; i++) {
    const value = (max * i) / 4,
      yy = y(value);
    svg += `<line x1="${left}" y1="${yy}" x2="${width - right}" y2="${yy}" stroke="#334155"/><text x="${left - 8}" y="${yy + 4}" text-anchor="end" fill="#cbd5e1" font-size="13">${Math.round(value * 10) / 10}</text>`;
  }
  svg += '<text x="8" y="14" fill="#cbd5e1" font-size="13">kg</text>';
  for (const [field, color, label] of unilateral
    ? [
        ["left", "#7dd3fc", "Izquierda"],
        ["right", "#fbbf24", "Derecha"],
      ]
    : [["left", "#7dd3fc", "Carga"]]) {
    const entries = points
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => p[field] != null);
    svg += `<polyline fill="none" stroke="${color}" stroke-width="3" ${field === "right" ? 'stroke-dasharray="6 4"' : ""} points="${entries.map(({ p, i }) => `${x(i)},${y(p[field])}`).join(" ")}"/>`;
    entries.forEach(
      ({ p, i }) =>
        (svg += `<circle cx="${x(i)}" cy="${y(p[field])}" r="5" fill="${color}"><title>${esc(p.date)} · ${label}: ${p[field]} kg</title></circle>`),
    );
  }
  svg += `<text x="${left}" y="${height - 12}" fill="#cbd5e1" font-size="13">${esc(points[0].date)}</text><text x="${width - right}" y="${height - 12}" text-anchor="end" fill="#cbd5e1" font-size="13">${points.length > 1 ? esc(points.at(-1).date) : ""}</text></svg>`;
  return svg;
}
function strengthMuscleMenu(groups, selected, ref) {
  const regions = new Map([['Tren superior',new Map()],['Tren inferior',new Map()],['Core',new Map()]]);
  groups.forEach((group, index) => {
    const source = exerciseFamily(group.exercise);
    const family = ({Pecho:'Pectoral',Hombro:'Deltoides',Bíceps:'Brazo',Tríceps:'Brazo','Isquios / cadena posterior':'Isquiosurales',Glúteo:'Glúteo'})[source] || source;
    const region = source === 'Core' ? 'Core' : ['Cuádriceps','Isquios / cadena posterior','Glúteo','Aductores','Gemelos'].includes(source) ? 'Tren inferior' : 'Tren superior';
    const families = regions.get(region);
    if (!families.has(family)) families.set(family, []);
    families.get(family).push({ group, index });
  });
  const exercisesHTML = items => items.map(({group,index})=>`<div class="strength-exercise-item"><button type="button" class="strength-exercise-choice" aria-expanded="${index===selected}" aria-pressed="${index===selected}" onclick="setStrengthChartExercise(${index})"><strong>${esc(group.exercise.name)}</strong><small>${esc(loadLabel(group.exercise))}</small></button>${index===selected ? strengthExerciseChartHTML(group,ref) : ''}</div>`).join('');
  return [...regions.entries()].filter(([,families])=>families.size).map(([region,families])=>{
    const items=[...families.values()].flat(),open=items.some(x=>x.index===selected);
    const content=region==='Core' ? `<div class="strength-muscle-exercises">${exercisesHTML(items)}</div>` : [...families.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([family,entries])=>`<details class="strength-muscle-group" ${entries.some(x=>x.index===selected)?'open':''}><summary>${esc(family)}<span class="muscle-count">${entries.length}</span></summary><div class="strength-muscle-exercises">${exercisesHTML(entries)}</div></details>`).join('');
    return `<details class="strength-region" ${open?'open':''}><summary>${region}<span class="muscle-count">${items.length}</span></summary><div class="strength-region-content">${content}</div></details>`;
  }).join('');
}
strengthProgressHTML = function (ref) {
  const groups = strengthChartGroups(ref);
  if (!groups.length)
    return '<div class="card"><p>Completa una sesión de fuerza para ver la evolución de tus cargas.</p></div>';
  const selected = groups.findIndex(g=>g.key===activeStrengthChartKey);
  return `<div class="card strength-explorer"><p>Despliega una zona y selecciona un ejercicio para ver su evolución.</p><div id="strengthExercise" class="strength-muscle-menu" aria-label="Ejercicios por zona y grupo muscular">${strengthMuscleMenu(groups,selected,ref)}</div></div>`;
};
function strengthExerciseChartHTML(group, ref) {
  const range = state.settings.strengthChartRange || "84",
    cutoff = range === "all" ? "0000-01-01" : addDaysISO(ref, -(+range - 1));
  const points = group.points.filter((p) => p.date >= cutoff),
    uni = loadProfile(group.exercise).unilateral;
  return `<div class="strength-inline-chart" role="region" aria-label="Evolución de ${esc(group.exercise.name)}"><div class="period-tabs" role="group" aria-label="Periodo de la gráfica de fuerza">${[
    ["28", "4 semanas"],
    ["84", "12 semanas"],
    ["all", "Todo"],
  ]
    .map(
      ([k, label]) =>
        `<button type="button" aria-pressed="${range === k}" class="${range === k ? "active" : ""}" onclick="setStrengthChartRange('${k}')">${label}</button>`,
    )
    .join(
      "",
    )}</div><p class="strength-chart-caption">Carga máxima registrada por sesión · ${esc(loadLabel(group.exercise))}</p>${points.length ? `${strengthEvolutionSVG(points, uni)}${uni ? '<p class="strength-legend"><span>● Izquierda</span><span>┄ Derecha</span></p>' : ""}<p>${points.length === 1 ? "Una sesión registrada. La curva aparecerá al añadir más sesiones." : `${points.length} sesiones en este periodo.`} Los kg siguen tu convención de registro; no equivalen por sí solos a una mejora de fuerza.</p><details><summary>Ver registros y repeticiones</summary><div class="strength-table-wrap"><table><thead><tr><th>Fecha</th><th>${uni ? "Máx. I" : "Máx."} (kg)</th>${uni ? "<th>Máx. D (kg)</th>" : ""}<th>Series</th><th>Reps${uni ? " I" : ""}</th></tr></thead><tbody>${points.map((p) => `<tr><td>${esc(p.date)}</td><td>${p.left}</td>${uni ? `<td>${p.right ?? "—"}</td>` : ""}<td>${p.sets}</td><td>${p.reps}</td></tr>`).join("")}</tbody></table></div></details>` : "<p>No hay registros de este ejercicio en este periodo. Prueba «Todo».</p>"}</div>`;
};
// Completed sessions are review-only. No silent edits to historical loads.
const editableExerciseCard = exerciseCardHTML;
exerciseCardHTML = function (e, i, scope) {
  const s =
    scope === "planned"
      ? findSession(currentDate(), planFor(currentDate()).key)
      : state.extraSessions.find((s) => s.id === scope);
  if (s?.completed && e.type !== "mobility")
    return `<article class="exercise"><h3>${esc(e.name)}</h3><p>${esc(loadLabel(e))}</p>${allAttempts(
      e,
    )
      .map(
        (a) =>
          `<p>${a.completedAt ? "Registrada" : "Incompleta"}: ${esc(a.kg)} kg × ${esc(a.reps)} · RIR ${esc(a.rir)}${loadProfile(e).unilateral ? ` / D: ${esc(a.rightKg ?? "—")} kg × ${esc(a.rightReps ?? "—")} · RIR ${esc(a.rightRir ?? "—")}` : ""}</p>`,
      )
      .join("")}</article>`;
  return editableExerciseCard(e, i, scope);
};
const historicalExerciseAdvice = exerciseAdvice;
exerciseAdvice = function (e) {
  const current = effectiveAttempts(e).at(-1);
  if (current) {
    const side =
      loadProfile(e).unilateral &&
      (+current.rightReps < +current.reps || +current.rightRir < +current.rir)
        ? { reps: current.rightReps, rir: current.rightRir }
        : current;
    return (
      "Para la siguiente serie: " +
      setCoachFeedback(e, side.reps, side.rir).text +
      " " +
      (loadProfile(e).unilateral
        ? "Toma como referencia el lado con menos margen."
        : "")
    );
  }
  return historicalExerciseAdvice(e);
};
const currentExerciseCard = exerciseCardHTML;
exerciseCardHTML = function (e, i, scope) {
  let html = currentExerciseCard(e, i, scope);
  const s =
    scope === "planned"
      ? findSession(currentDate(), planFor(currentDate()).key)
      : state.extraSessions.find((s) => s.id === scope);
  if (e.type !== "mobility" && !s?.completed)
    html += `<div class="session-volume"><button class="btn ghost small" onclick="adjustSessionSets('${scope}',${i},-1)">−1 serie hoy</button><button class="btn ghost small" onclick="adjustSessionSets('${scope}',${i},1)">+1 serie hoy</button></div>`;
  return html;
};
function adjustSessionSets(scope, i, delta) {
  saveScopeInputs(scope);
  const e = scopeExercise(scope, i),
    next = (+e.sets || 3) + delta;
  if (next < Math.max(1, effectiveCount(e)) || next > 20) {
    toast("No puedes quitar series ya realizadas ni bajar de una");
    return;
  }
  openAppConfirm(
    "Ajustar solo esta sesión",
    delta > 0
      ? "No añadas volumen para compensar una serie difícil. Considera una serie extra solo si recuperas bien y el volumen del plan lo permite."
      : "Puedes reducir una serie si la fatiga impide mantener la técnica. Se conserva todo lo ya registrado.",
    "Aplicar",
    () => {
      scopeExercise(scope, i).sets = next;
      saveState(true);
      closeModal();
      refreshScope(scope);
    },
    () => {
      closeModal();
      refreshScope(scope);
    },
  );
}

// Apply rest styling to the actual runtime panels, including paused rests.
const themedRestPanel = updateRestTimerPanel;
updateRestTimerPanel = function () {
  themedRestPanel();
  const t = state.restTimer;
  document
    .getElementById("sessionCoachPanel")
    ?.classList.toggle(
      "is-rest",
      !!t && t.date === currentDate() && t.scope === "planned",
    );
  const extra = document.getElementById("extraClock");
  extra?.classList.toggle(
    "is-rest",
    !!t && t.scope === extra.closest("[data-extra-scope]")?.dataset.extraScope,
  );
};
const themedWorkout = renderWorkout;
renderWorkout = function () {
  themedWorkout();
  document
    .querySelector("#viewWorkout .hero")
    ?.classList.toggle("rest-day", planFor(currentDate()).type === "rest");
};
const nestedStrengthShowView = showView;
showView = function(view) {
  if(view === 'Progress' && activeView !== 'Progress') activeStrengthChartKey = null;
  nestedStrengthShowView(view);
};
// Initialize once, after all adapters are installed.
renderAll();
