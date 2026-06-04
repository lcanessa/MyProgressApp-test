/**
 * Última sesión con datos cargados para un ejercicio (por nombre), antes de `beforeDate`.
 */
export function findLastExerciseSession(diary, routines, exerciseName, beforeDate) {
  if (!exerciseName || !beforeDate) return null;

  const dates = Object.keys(diary)
    .filter((d) => d < beforeDate)
    .sort()
    .reverse();

  for (const dateStr of dates) {
    const day = diary[dateStr];
    if (!day?.sessions) continue;

    const routineId = day.routineId;
    const list = routines[routineId] || [];
    const exIdx = list.findIndex((ex) => ex.customName === exerciseName);
    if (exIdx === -1) continue;

    const ex = list[exIdx];
    const numSets = parseInt(ex.sets, 10) || 0;
    let hasData = false;

    for (let s = 0; s < numSets; s++) {
      const w = day.sessions[`${routineId}-${exIdx}-s${s}-w`];
      const r = day.sessions[`${routineId}-${exIdx}-s${s}-r`];
      if (hasSessionValue(w) || hasSessionValue(r)) {
        hasData = true;
        break;
      }
    }

    if (hasData) {
      return { dateStr, routineId, exIdx, sessions: day.sessions };
    }
  }

  return null;
}

function hasSessionValue(v) {
  return v != null && String(v).trim() !== '';
}

function applyLastSessionToSets(sessions, prefix, last, numSets) {
  for (let s = 0; s < numSets; s++) {
    const wKey = `${prefix}-s${s}-w`;
    const rKey = `${prefix}-s${s}-r`;
    const srcW = last.sessions[`${last.routineId}-${last.exIdx}-s${s}-w`];
    const srcR = last.sessions[`${last.routineId}-${last.exIdx}-s${s}-r`];

    if (!hasSessionValue(sessions[wKey]) && hasSessionValue(srcW)) {
      sessions[wKey] = String(srcW).trim();
    }
    if (!hasSessionValue(sessions[rKey]) && hasSessionValue(srcR)) {
      sessions[rKey] = String(srcR).trim();
    }
  }
}

/**
 * Completa en el diario los sets vacíos del día con la última sesión registrada de cada ejercicio.
 */
export function prefillDaySessions(diary, dateStr, routineId, routines) {
  const day = diary[dateStr] || { sessions: {}, completed: {} };
  const sessions = { ...(day.sessions || {}) };
  const exercises = routines[routineId] || [];

  for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
    const name = exercises[exIdx].customName;
    const last = findLastExerciseSession(diary, routines, name, dateStr);
    if (!last) continue;

    const prefix = `${routineId}-${exIdx}`;
    const numSets = parseInt(exercises[exIdx].sets, 10) || 0;
    applyLastSessionToSets(sessions, prefix, last, numSets);
  }

  return sessions;
}

/** Prellena un solo ejercicio si sus sets de hoy están vacíos. */
export function prefillExerciseSessions(diary, dateStr, routineId, exIdx, routines) {
  const day = diary[dateStr] || { sessions: {}, completed: {} };
  const sessions = { ...(day.sessions || {}) };
  const exercises = routines[routineId] || [];
  const ex = exercises[exIdx];
  if (!ex) return sessions;

  const last = findLastExerciseSession(diary, routines, ex.customName, dateStr);
  if (!last) return sessions;

  const prefix = `${routineId}-${exIdx}`;
  const numSets = parseInt(ex.sets, 10) || 0;
  applyLastSessionToSets(sessions, prefix, last, numSets);
  return sessions;
}
