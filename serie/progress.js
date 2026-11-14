/* Public SERIE muscle-volume analytics: completed effective sets, one primary zone per exercise. */
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
  function volumes(sessions, catalog, mode) {
    const result = new Map();
    for (const session of sessions) {
      if (!session?.completed || !isDate(session.date) || !Array.isArray(session.exercises)) continue;
      const period = periodKey(session.date, mode);
      if (!result.has(period)) result.set(period, empty());
      const current = result.get(period);
      for (const exercise of session.exercises) {
        const muscle = zone(exercise, catalog);
        if (muscle) current[muscle] += workSets(exercise).length;
      }
    }
    return result;
  }
  function snapshot(sessions, catalog, today, mode) {
    const type = mode === 'month' ? 'month' : 'week';
    const map = volumes(sessions, catalog, type);
    const dates = recentKeys(today, type);
    const rows = dates.map(key => {
      const values = map.get(key) || empty();
      return { key, values, total: keys.reduce((sum, name) => sum + values[name], 0) };
    });
    const previous = map.get(previousKey(dates.at(-1), type)) || empty();
    return { mode: type, rows, previous, current: rows.at(-1).values, total: rows.at(-1).total };
  }
  function periodLabel(key, mode) {
    if (mode === 'month') {
      const [year, month] = key.split('-').map(Number);
      return months[month - 1] + ' ' + year;
    }
    const [year, month, day] = key.split('-');
    return day + '/' + month;
  }
  function radarSvg(current, previous) {
    const n = AXES.length, W = 540, H = 440, cx = 270, cy = 218, R = 135;
    const maxValue = Math.max(4, ...keys.map(k => Math.max(current[k] || 0, previous[k] || 0)));
    const max = Math.ceil(maxValue / 4) * 4;
    const pt = (i, r) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [+(cx + Math.cos(a) * r).toFixed(1), +(cy + Math.sin(a) * r).toFixed(1)];
    };
    const polygon = (values, scale) => keys.map((k, i) => pt(i, R * (values[k] || 0) / scale).join(',')).join(' ');
    let svg = '<svg class="muscle-radar-svg" viewBox="0 0 ' + W + ' ' + H +
      '" role="img" aria-label="Radar de series efectivas por zona muscular: periodo actual y anterior">';
    for (let level = 1; level <= 4; level++) {
      svg += '<polygon class="radar-grid" points="' + keys.map((_, i) => pt(i, R * level / 4).join(',')).join(' ') + '"/>';
    }
    keys.forEach((k, i) => {
      const p = pt(i, R);
      svg += '<line class="radar-axis" x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '"/>';
    });
    svg += '<polygon class="radar-previous" points="' + polygon(previous, max) + '"/>';
    svg += '<polygon class="radar-current" points="' + polygon(current, max) + '"/>';
    keys.forEach((k, i) => {
      const p = pt(i, R * (current[k] || 0) / max);
      svg += '<circle class="radar-point" cx="' + p[0] + '" cy="' + p[1] +
        '" r="3.8"><title>' + AXES[i][1] + ': ' + (current[k] || 0) + ' series</title></circle>';
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
  return {AXES,empty,periodKey,previousKey,recentKeys,zone,workSets,volumes,snapshot,periodLabel,radarSvg,trendSvg};
});
