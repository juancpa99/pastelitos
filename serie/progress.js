/* SERIE: completed hard sets, 1 direct + 0.5 indirect equivalent; transparent per-muscle breakdown.
 * Fractional estimate: Pelland et al., Sports Medicine (2026), DOI 10.1007/s40279-025-02344-w.
 * Muscle roles are editorial approximations (not validated coefficients for each exercise).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SerieProgress = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const AXES = [
    ['Pectoral', 'Pecho'], ['Espalda', 'Espalda'], ['Hombros', 'Hombros'],
    ['Bíceps', 'Bíceps'], ['Tríceps', 'Tríceps'], ['Antebrazo', 'Antebrazo'],
    ['Cuádriceps', 'Cuádriceps'], ['Isquios', 'Femoral'], ['Glúteos', 'Glúteos'],
    ['Aductores', 'Aductores'], ['Gemelos', 'Gemelos'], ['Abdomen y oblicuos', 'Core']
  ];
  const keys = AXES.map(item => item[0]);
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const empty = () => Object.fromEntries(keys.map(key => [key, 0]));
  const isDate = date => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);
  function addDays(date, n) {
    const d = new Date(date + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function periodKey(date, mode) {
    if (!isDate(date)) return null;
    if (mode === 'month') return date.slice(0, 7);
    const d = new Date(date + 'T12:00:00Z');
    return addDays(date, -(d.getUTCDay() + 6) % 7);
  }
  function previousKey(key, mode) {
    if (mode === 'month') {
      const [year, month] = key.split('-').map(Number);
      return (month === 1 ? year - 1 : year) + '-' + String(month === 1 ? 12 : month - 1).padStart(2, '0');
    }
    return addDays(key, -7);
  }
  function recentKeys(today, mode) {
    const count = mode === 'month' ? 6 : 8;
    let key = periodKey(today, mode);
    const result = [];
    for (let i = 0; i < count; i++) { result.unshift(key); key = previousKey(key, mode); }
    return result;
  }
  function zone(e, catalog) {
    const match = catalog.find(item => item.key === e.key);
    if (match && keys.includes(match.muscle)) return match.muscle;
    if (keys.includes(e.muscle)) return e.muscle;
    const label = String(e.muscle || '').toLowerCase();
    // For legacy compound descriptions, attribute the set only to its first known primary zone.
    return keys.find(key => label.includes(key.toLowerCase())) || null;
  }
  function workSets(e) {
    if (!e || e.type === 'mobility' || !Array.isArray(e.recordedSets)) return [];
    return e.recordedSets.filter(a => a && a.attemptType !== 'warmup' && !!a.completedAt &&
      (!e.loadProfile?.unilateral || !!a.rightCompletedAt));
  }

  const INDIRECT_WEIGHT = 0.5;
  // Each catalog movement has one primary zone. These specific exercises add
  // secondary dynamic contributors; isometric stabilizers/grip are not
  // assumed to deliver a uniform half-set. Unknown custom movements stay
  // primary-only unless their editor specifies progressSecondary.
  const SECONDARY = {};
  function associate(list, groups) {
    for (const key of list.split(/\s+/).filter(Boolean)) SECONDARY[key] = groups;
  }
  associate('bench_press incline_db_press incline_barbell_press flat_db_press decline_press chest_machine_press incline_machine_press smith_bench smith_incline push_up incline_push_up chest_dip', ['Tríceps','Hombros']);
  associate('close_grip_bench triceps_dip assisted_dip', ['Pectoral','Hombros']);
  associate('pull_up chin_up neutral_pull_up assisted_pull_up lat_pulldown neutral_pulldown single_pulldown', ['Bíceps']);
  associate('seated_cable_row single_arm_cable_row barbell_row db_row chest_supported_row t_bar_row machine_row inverted_row', ['Bíceps','Hombros']);
  associate('military_press db_shoulder_press machine_shoulder_press smith_shoulder_press arnold_press landmine_press', ['Tríceps']);
  associate('face_pull reverse_fly reverse_pec_deck rear_cable_fly', ['Espalda']);
  associate('db_pullover', ['Pectoral']);
  associate('hammer_curl reverse_curl', ['Antebrazo']);
  associate('back_squat front_squat goblet_squat hack_squat smith_squat belt_squat leg_press single_leg_press bulgarian_split_squat walking_lunge reverse_lunge step_up split_squat', ['Glúteos','Aductores']);
  associate('rdl db_rdl single_leg_rdl good_morning', ['Glúteos']);
  associate('sumo_deadlift deadlift trap_bar_deadlift', ['Cuádriceps','Isquios','Aductores']);
  associate('cable_pullthrough', ['Isquios']);
  associate('back_extension', ['Glúteos']);
  associate('lateral_lunge', ['Cuádriceps','Glúteos']);
  const PRIMARY_OVERRIDE = Object.freeze({db_pullover:'Espalda'});
  function roles(e, catalog) {
    const primary = e.progressPrimary && keys.includes(e.progressPrimary) ?
      e.progressPrimary : PRIMARY_OVERRIDE[e.key] || zone(e, catalog);
    const supplied = Array.isArray(e.progressSecondary) ? e.progressSecondary : SECONDARY[e.key] || [];
    const indirect = [...new Set(supplied)].filter(k => keys.includes(k) && k !== primary);
    return {primary, indirect};
  }
  const emptyBreakdown = () => ({
    direct: empty(), indirect: empty(), combined: empty()
  });
  function detailedVolumes(sessions, catalog, mode) {
    const result = new Map();
    for (const session of sessions) {
      if (!session?.completed || !isDate(session.date) || !Array.isArray(session.exercises)) continue;
      const key = periodKey(session.date, mode);
      if (!result.has(key)) result.set(key, emptyBreakdown());
      const counts = result.get(key);
      for (const e of session.exercises) {
        const count = workSets(e).length;
        if (!count) continue;
        const {primary, indirect} = roles(e, catalog);
        if (primary) counts.direct[primary] += count;
        for (const muscle of indirect) counts.indirect[muscle] += count * INDIRECT_WEIGHT;
      }
    }
    for (const values of result.values()) {
      for (const muscle of keys) {
        values.combined[muscle] = +(values.direct[muscle] + values.indirect[muscle]).toFixed(5);
      }
    }
    return result;
  }
  function contributions(sessions, catalog, period, mode) {
    const grouped = new Map();
    for (const session of sessions) {
      if (!session?.completed || periodKey(session.date, mode) !== period) continue;
      for (const e of session.exercises || []) {
        const count = workSets(e).length;
        if (!count) continue;
        const {primary,indirect} = roles(e,catalog);
        for (const muscle of [primary,...indirect]) {
          if (!muscle) continue;
          const type = muscle === primary ? 'direct' : 'indirect';
          const id = muscle + '|' + e.key + '|' + (e.name || '') + '|' + type;
          if (!grouped.has(id)) grouped.set(id, {muscle,name:e.name||e.key,type,sets:0,equivalent:0});
          const entry = grouped.get(id);
          entry.sets += count;
          entry.equivalent += type === 'direct' ? count : count*INDIRECT_WEIGHT;
        }
      }
    }
    return [...grouped.values()].sort((a,b)=>a.muscle.localeCompare(b.muscle) || b.equivalent-a.equivalent || a.name.localeCompare(b.name));
  }

  function volumes(sessions, catalog, mode) {
    return new Map([...detailedVolumes(sessions, catalog, mode)].map(([key,b]) => [key,b.combined]));
  }
  function snapshot(sessions, catalog, today, mode) {
    const type = mode === 'month' ? 'month' : 'week';
    const map = detailedVolumes(sessions, catalog, type);
    const dates = recentKeys(today, type);
    const rows = dates.map(key => {
      const groups = map.get(key) || emptyBreakdown();
      return {key,values:groups.combined, direct:groups.direct, indirect:groups.indirect,
        total:keys.reduce((sum, name) => sum + groups.combined[name], 0)};
    });
    const previousDetail = map.get(previousKey(dates.at(-1),type)) || emptyBreakdown();
    return {mode:type,rows,previous:previousDetail.combined,previousDetail,
      current:rows.at(-1).values,currentDetail:{
        direct:rows.at(-1).direct,indirect:rows.at(-1).indirect,combined:rows.at(-1).values
      },total:rows.at(-1).total};
  }
  function periodLabel(key, mode) {
    if (mode === 'month') {
      const [year, month] = key.split('-').map(Number);
      return months[month - 1] + ' ' + year;
    }
    const [year, month, day] = key.split('-');
    return day + '/' + month;
  }
  function radarSvg(current, previous, directOnly = null) {
    const n = AXES.length, W = 540, H = 440, cx = 270, cy = 218, R = 135;
    const maxValue = Math.max(4, ...keys.map(k => Math.max(current[k] || 0, previous[k] || 0, directOnly?.[k] || 0)));
    const max = Math.ceil(maxValue / 4) * 4;
    const pt = (i, r) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [+(cx + Math.cos(a) * r).toFixed(1), +(cy + Math.sin(a) * r).toFixed(1)];
    };
    const polygon = (values, scale) => keys.map((k, i) => pt(i, R * (values[k] || 0) / scale).join(',')).join(' ');
    let svg = '<svg class="muscle-radar-svg" viewBox="0 0 ' + W + ' ' + H +
      '" role="img" aria-label="Radar de volumen equivalente por músculo: total directo e indirecto actual, directas actuales y total anterior">';
    for (let level = 1; level <= 4; level++) {
      svg += '<polygon class="radar-grid" points="' + keys.map((_, i) => pt(i, R * level / 4).join(',')).join(' ') + '"/>';
    }
    keys.forEach((k, i) => {
      const p = pt(i, R);
      svg += '<line class="radar-axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/>';
    });
    svg += '<polygon class="radar-previous" points="' + polygon(previous, max) + '"/>'; 
    if (directOnly) svg += '<polygon class="radar-direct" points="' + polygon(directOnly, max) + '"/>';
    svg += '<polygon class="radar-current" points="' + polygon(current, max) + '"/>';
    keys.forEach((k, i) => {
      const p = pt(i, R * (current[k] || 0) / max);
      svg += '<circle class="radar-point" cx="' + p[0] + '" cy="' + p[1] +
        '" r="3.8"><title>' + AXES[i][1] + ': ' + (current[k] || 0) + ' series equivalentes (' +
        (directOnly?.[k] ?? current[k] ?? 0) + ' directas + ' +
        +((current[k]||0)-(directOnly?.[k] ?? current[k] ?? 0)).toFixed(2) +
        ' indirectas ponderadas)</title></circle>';
      const l = pt(i, R + 29);
      const anchor = l[0] < cx - 12 ? 'end' : l[0] > cx + 12 ? 'start' : 'middle';
      svg += '<text class="radar-label" x="' + l[0] + '" y="' + l[1] +
        '" text-anchor="' + anchor + '" dominant-baseline="middle">' + AXES[i][1] + '</text>';
    });
    svg += '</svg>';
    return svg;
  }
  function trendSvg(rows, muscle, mode) {
    const n = rows.length, values = rows.map(r => muscle === 'all' ? r.total : r.values[muscle] || 0);
    const maxValue = Math.max(4, ...values), max = Math.ceil(maxValue / 4) * 4;
    const W = 540, H = 242, left = 45, right = 516, top = 20, bottom = 184;
    const point = (i, v) => [+(left + i * (right-left)/Math.max(1,n-1)).toFixed(1),
      +(bottom - v / max * (bottom-top)).toFixed(1)];
    let svg = '<svg class="muscle-trend-svg" viewBox="0 0 ' + W + ' ' + H +
      '" role="img" aria-label="Evolución ' + (mode === 'month' ? 'mensual' : 'semanal') + ' de series efectivas">';
    for (let i = 0; i <= 4; i++) {
      const y = bottom - (bottom-top) * i / 4;
      svg += '<line class="trend-grid" x1="' + left + '" y1="' + y + '" x2="' + right + '" y2="' + y + '"/>';
      svg += '<text class="trend-tick" x="' + (left-9) + '" y="' + (y+4) + '" text-anchor="end">' + max * i / 4 + '</text>';
    }
    svg += '<polyline class="trend-line" points="' +
      values.map((v,i) => point(i,v).join(',')).join(' ') + '"/>';
    values.forEach((v,i) => {
      const [x,y] = point(i,v);
      svg += '<circle class="trend-dot" cx="' + x + '" cy="' + y + '" r="4.3"><title>' +
        periodLabel(rows[i].key, mode) + ': ' + v + ' series</title></circle>';
      svg += '<text class="trend-tick" x="' + x + '" y="' + (bottom+23) +
        '" text-anchor="middle">' + periodLabel(rows[i].key,mode) + '</text>';
    });
    svg += '</svg>';
    return svg;
  }
  return {AXES,INDIRECT_WEIGHT,SECONDARY,PRIMARY_OVERRIDE,roles,empty,emptyBreakdown,periodKey,previousKey,recentKeys,zone,workSets,detailedVolumes,contributions,volumes,snapshot,periodLabel,radarSvg,trendSvg};
});
