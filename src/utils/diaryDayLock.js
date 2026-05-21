import { toLocalISODate } from './date';

export function getTodayISO() {
  return toLocalISODate(new Date());
}

export function isDayFullyComplete(day, routines) {
  const rid = day?.routineId;
  const exercises = routines[rid];
  if (!exercises?.length) return false;
  return exercises.every((_, i) => day.completed?.[`${rid}-${i}`] === true);
}

/** Día anterior a hoy con rutina 100 % completada: solo lectura. */
export function isPastCompletedLockedDay(dateStr, day, routines, today = getTodayISO()) {
  if (!dateStr || !day || dateStr >= today) return false;
  if (day.locked === true) return true;
  if (day.exerciseSnapshot?.length) return true;
  return isDayFullyComplete(day, routines);
}

export function buildExerciseSnapshot(exercises) {
  return (exercises || []).map((ex) => ({
    exId: ex.exId,
    name: ex.name,
    customName: ex.customName,
    sets: ex.sets,
    targetReps: ex.targetReps,
  }));
}

function collectRoutineIndices(day, routineId) {
  const indices = new Set();
  const prefix = `${routineId}-`;

  for (const key of Object.keys(day.completed || {})) {
    if (!key.startsWith(prefix)) continue;
    const idx = Number(key.slice(prefix.length));
    if (Number.isFinite(idx)) indices.add(idx);
  }

  for (const key of Object.keys(day.sessions || {})) {
    if (!key.startsWith(prefix)) continue;
    const idx = Number(key.slice(prefix.length).split('-')[0]);
    if (Number.isFinite(idx)) indices.add(idx);
  }

  return [...indices].sort((a, b) => a - b);
}

/** Lista de ejercicios congelada para un día bloqueado. */
export function getLockedDayExercises(day, routineId, routines) {
  if (day.exerciseSnapshot?.length) return day.exerciseSnapshot;

  const list = routines[routineId] || [];
  const indices = collectRoutineIndices(day, routineId);
  return indices.map((i) => list[i]).filter(Boolean);
}

export function withDaySnapshotIfComplete(day, routineId, routines) {
  if (!day || day.locked) return day;

  const exercises = routines[routineId] || [];
  if (!exercises.length || !isDayFullyComplete(day, routines)) return day;

  return {
    ...day,
    locked: true,
    exerciseSnapshot: buildExerciseSnapshot(exercises),
  };
}
