import { toLocalISODate } from './date';
import { parseWeightNumber } from './sessionValues';

/** Grupos del gráfico radar (sin Cardio/Otro). */
export const RADAR_MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

function parseDate(dateStr) {
  return new Date(`${dateStr}T12:00:00`);
}

/** Lunes de la semana (clave ISO local). */
export function getWeekKey(dateStr) {
  const d = parseDate(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toLocalISODate(d);
}

function addDays(dateStr, n) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return toLocalISODate(d);
}

function getTrainingDates(diary) {
  return Object.entries(diary)
    .filter(([, day]) => Object.values(day?.completed || {}).some((v) => v === true))
    .map(([date]) => date)
    .sort();
}

function countCompletedExercises(diary) {
  let n = 0;
  for (const day of Object.values(diary)) {
    for (const v of Object.values(day?.completed || {})) {
      if (v === true) n += 1;
    }
  }
  return n;
}

function countSetsLogged(diary) {
  let n = 0;
  for (const day of Object.values(diary)) {
    for (const key of Object.keys(day?.sessions || {})) {
      if (/-s\d+-w$/.test(key)) n += 1;
    }
  }
  return n;
}

function sumVolumeKg(diary) {
  let total = 0;
  for (const day of Object.values(diary)) {
    const sessions = day?.sessions || {};
    const seen = new Set();
    for (const [key, raw] of Object.entries(sessions)) {
      const m = key.match(/^(.*-s\d+)-w$/);
      if (!m || seen.has(m[1])) continue;
      seen.add(m[1]);
      const w = parseWeightNumber(raw);
      const r = parseFloat(sessions[`${m[1]}-r`]);
      if (!Number.isFinite(w) || w <= 0) continue;
      const reps = Number.isFinite(r) && r > 0 ? r : 1;
      total += w * reps;
    }
  }
  return Math.round(total);
}

function isDayFullyComplete(day, routines) {
  const rid = day?.routineId;
  const exercises = routines[rid];
  if (!exercises?.length) return false;
  return exercises.every((_, i) => day.completed?.[`${rid}-${i}`] === true);
}

/** Mejor racha histórica de semanas consecutivas (lun–dom) con al menos un entreno. */
function longestWeekStreak(trainingDates) {
  const weekKeys = [...new Set(trainingDates.map(getWeekKey))].sort();
  if (!weekKeys.length) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < weekKeys.length; i += 1) {
    const prev = parseDate(weekKeys[i - 1]);
    const curr = parseDate(weekKeys[i]);
    const diffDays = Math.round((curr - prev) / 86400000);
    if (diffDays === 7) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function computeWeekStreak(weekSet, today) {
  let streak = 0;
  let cursor = getWeekKey(today);
  if (!weekSet.has(cursor)) {
    cursor = getWeekKey(addDays(cursor, -7));
  }
  const visited = new Set();
  while (weekSet.has(cursor) && !visited.has(cursor)) {
    visited.add(cursor);
    streak += 1;
    cursor = getWeekKey(addDays(cursor, -7));
  }
  return streak;
}

function getMuscleBreakdown(diary, routines, library) {
  const libById = Object.fromEntries(library.map((ex) => [ex.id, ex]));
  const counts = {};

  for (const day of Object.values(diary)) {
    const rid = day?.routineId;
    if (!rid) continue;
    const exercises = routines[rid] || [];
    for (const [key, done] of Object.entries(day.completed || {})) {
      if (!done || !key.startsWith(`${rid}-`)) continue;
      const idx = Number(key.slice(rid.length + 1));
      const ex = exercises[idx];
      if (!ex) continue;
      const lib = ex.exId ? libById[ex.exId] : null;
      const muscle = lib?.muscle || ex.muscle || 'Otro';
      counts[muscle] = (counts[muscle] || 0) + 1;
    }
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { top: sorted[0] || null, counts };
}

/** Datos normalizados para el gráfico radar de balance muscular. */
export function buildMuscleRadar(muscleCounts) {
  const values = RADAR_MUSCLE_GROUPS.map((label) => muscleCounts[label] || 0);
  const max = Math.max(1, ...values);
  const total = values.reduce((sum, n) => sum + n, 0);

  const axes = RADAR_MUSCLE_GROUPS.map((label, i) => ({
    label,
    count: values[i],
    normalized: values[i] / max,
  }));

  const minCount = Math.min(...values);
  const maxCount = Math.max(...values);
  const weakest =
    total > 0 ? axes.find((a) => a.count === minCount) ?? null : null;
  const isBalanced = total > 0 && maxCount === minCount;

  return { axes, total, weakest, isBalanced, hasTraining: total > 0 };
}

function getWeeklyActivity(diary, weeks = 8) {
  const today = toLocalISODate(new Date());
  const currentWeek = getWeekKey(today);
  const buckets = [];

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const weekStart = getWeekKey(addDays(currentWeek, -7 * i));
    const weekEnd = addDays(weekStart, 6);
    let days = 0;
    for (const [dateStr, day] of Object.entries(diary)) {
      if (dateStr < weekStart || dateStr > weekEnd) continue;
      if (Object.values(day?.completed || {}).some((v) => v === true)) days += 1;
    }
    const label = parseDate(weekStart).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    buckets.push({ weekKey: weekStart, label, days });
  }

  return buckets;
}

function getLast7DaysActivity(diary, routines, today) {
  const out = [];
  for (let i = 6; i >= 0; i -= 1) {
    const dateStr = addDays(today, -i);
    const day = diary[dateStr];
    const trained = Object.values(day?.completed || {}).some((v) => v === true);
    out.push({
      dateStr,
      label: parseDate(dateStr).toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 2),
      trained,
      complete: trained && day && isDayFullyComplete(day, routines),
    });
  }
  return out;
}

function formatDateShort(dateStr) {
  return parseDate(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/** Mejor peso registrado por ejercicio (récord personal). */
export function computePersonalRecords(diary, routines) {
  const bestByName = new Map();

  for (const [dateStr, day] of Object.entries(diary)) {
    const rid = day?.routineId;
    if (!rid) continue;
    const exercises = routines[rid] || [];

    exercises.forEach((ex, exIdx) => {
      const name = ex.customName || ex.name || 'Ejercicio';
      const prefix = `${rid}-${exIdx}`;
      let maxW = 0;
      let repsAtMax = 0;

      for (const [key, raw] of Object.entries(day.sessions || {})) {
        if (!key.startsWith(prefix) || !key.endsWith('-w')) continue;
        const w = parseWeightNumber(raw);
        if (!Number.isFinite(w) || w <= 0) continue;
        const setMatch = key.match(/-s(\d+)-w$/);
        const r = setMatch ? parseFloat(day.sessions[`${prefix}-s${setMatch[1]}-r`]) : 0;
        if (w > maxW) {
          maxW = w;
          repsAtMax = Number.isFinite(r) && r > 0 ? r : 0;
        }
      }

      if (maxW <= 0) return;

      const prev = bestByName.get(name);
      if (!prev || maxW > prev.weight) {
        bestByName.set(name, {
          name,
          weight: maxW,
          reps: repsAtMax,
          date: dateStr,
          dateLabel: formatDateShort(dateStr),
        });
      }
    });
  }

  const all = [...bestByName.values()].sort((a, b) => b.weight - a.weight);
  return {
    topRecord: all[0] || null,
    topRecords: all.slice(0, 5),
    totalRecords: all.length,
  };
}

function countMonthTrainingDays(diary, year, month) {
  let n = 0;
  for (const [dateStr, day] of Object.entries(diary)) {
    const d = parseDate(dateStr);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    if (Object.values(day?.completed || {}).some((v) => v === true)) n += 1;
  }
  return n;
}

export function computeHighlights({ diary, routines, library }) {
  const today = toLocalISODate(new Date());
  const trainingDates = getTrainingDates(diary);
  const weekSet = new Set(trainingDates.map(getWeekKey));

  let perfectDays = 0;
  for (const day of Object.values(diary)) {
    if (isDayFullyComplete(day, routines)) perfectDays += 1;
  }

  const now = new Date();
  const muscle = getMuscleBreakdown(diary, routines, library);
  const weeklyActivity = getWeeklyActivity(diary, 8);
  const maxWeekDays = Math.max(1, ...weeklyActivity.map((w) => w.days));
  const personalRecords = computePersonalRecords(diary, routines);

  return {
    hasData: trainingDates.length > 0,
    today,
    weekStreak: computeWeekStreak(weekSet, today),
    bestWeekStreak: longestWeekStreak(trainingDates),
    totalExercisesCompleted: countCompletedExercises(diary),
    totalTrainingDays: trainingDates.length,
    perfectDays,
    setsLogged: countSetsLogged(diary),
    volumeKg: sumVolumeKg(diary),
    monthTrainingDays: countMonthTrainingDays(diary, now.getFullYear(), now.getMonth()),
    muscleRadar: buildMuscleRadar(muscle.counts),
    weeklyActivity,
    maxWeekDays,
    last7Days: getLast7DaysActivity(diary, routines, today),
    personalRecords,
  };
}

export function formatVolume(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${kg.toLocaleString('es-AR')} kg`;
}

/** Devuelve el color de calor según el porcentaje relativo al músculo pico. */
export function muscleHeatColor(pct, isDark) {
  if (pct <= 0.10) return isDark ? '#334155' : '#cbd5e1';
  if (pct <= 0.30) return '#22c55e';
  if (pct <= 0.60) return '#eab308';
  if (pct <= 0.85) return '#f97316';
  return '#dc2626';
}

/**
 * Calcula el volumen histórico (kg×reps) por grupo muscular
 * y devuelve datos listos para el MuscleHeatmap.
 */
export function buildMuscleHeatmap(diary, routines, library) {
  const HEATMAP_MUSCLES = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];
  const libById = Object.fromEntries(library.map((ex) => [ex.id, ex]));
  const muscleVolume = {};

  for (const day of Object.values(diary)) {
    const rid = day?.routineId;
    if (!rid) continue;
    const exercises = routines[rid] || [];
    const sessions = day?.sessions || {};
    const seen = new Set();

    for (const [key, raw] of Object.entries(sessions)) {
      const m = key.match(/^(.*-s\d+)-w$/);
      if (!m) continue;
      if (seen.has(m[1])) continue;
      seen.add(m[1]);

      const prefix = `${rid}-`;
      if (!m[1].startsWith(prefix)) continue;
      const rest = m[1].slice(prefix.length);
      const exIdxMatch = rest.match(/^(\d+)-/);
      if (!exIdxMatch) continue;
      const exIdx = Number(exIdxMatch[1]);
      const ex = exercises[exIdx];
      if (!ex) continue;

      const lib = ex.exId ? libById[ex.exId] : null;
      const muscle = lib?.muscle || ex.muscle || 'Otro';

      const w = parseWeightNumber(raw);
      const r = parseFloat(sessions[`${m[1]}-r`]);
      const reps = Number.isFinite(r) && r > 0 ? r : 0;

      let volume = 0;
      if (Number.isFinite(w) && w > 0) {
        volume = w;
      } else if (reps > 0) {
        volume = reps;
      }

      if (volume > 0) {
        muscleVolume[muscle] = (muscleVolume[muscle] || 0) + volume;
      }
    }
  }

  const values = HEATMAP_MUSCLES.map((m) => muscleVolume[m] || 0);
  const maxVol = Math.max(1, ...values);
  const total = values.reduce((s, n) => s + n, 0);

  const muscles = HEATMAP_MUSCLES.map((label) => ({
    label,
    volume: muscleVolume[label] || 0,
    pct: (muscleVolume[label] || 0) / maxVol,
  }));

  const top3 = [...muscles]
    .filter((m) => m.volume > 0)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 3);

  return { muscles, top3, hasData: total > 0 };
}
