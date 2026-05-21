/** Índices viejos → nuevos tras mover un ejercicio en la rutina. */
export function buildReorderPermutation(length, fromIndex, toIndex) {
  const order = Array.from({ length }, (_, i) => i);
  const [moved] = order.splice(fromIndex, 1);
  order.splice(toIndex, 0, moved);
  return order;
}

/** Tras borrar un ejercicio: perm[newIdx] = índice viejo que queda en esa posición. */
export function buildDeletePermutation(length, deleteIndex) {
  const perm = [];
  for (let i = 0; i < length; i++) {
    if (i !== deleteIndex) perm.push(i);
  }
  return perm;
}

/** Quita sesiones y completados del diario para un ejercicio del catálogo (todas las rutinas). */
export function purgeDiaryForExerciseId(diary, routines, exId) {
  if (!exId || !diary) return diary;

  const next = {};
  for (const [dateStr, day] of Object.entries(diary)) {
    if (!day) {
      next[dateStr] = day;
      continue;
    }

    if (day.locked) {
      next[dateStr] = day;
      continue;
    }

    const completed = { ...(day.completed || {}) };
    const sessions = { ...(day.sessions || {}) };
    let changed = false;

    for (const [routineId, list] of Object.entries(routines || {})) {
      (list || []).forEach((ex, exIdx) => {
        if (ex.exId !== exId) return;
        const prefix = `${routineId}-${exIdx}`;
        if (completed[prefix] !== undefined) {
          delete completed[prefix];
          changed = true;
        }
        for (const sk of Object.keys(sessions)) {
          if (sk.startsWith(`${prefix}-`)) {
            delete sessions[sk];
            changed = true;
          }
        }
      });
    }

    next[dateStr] = changed ? { ...day, completed, sessions } : day;
  }

  return next;
}

/** Reasigna claves de diario `${routineId}-${exIdx}` al nuevo orden. */
export function remapDiaryForRoutineReorder(diary, routineId, perm, oldCount = perm.length) {
  const newCount = perm.length;
  const next = {};

  for (const [dateStr, day] of Object.entries(diary)) {
    if (!day) {
      next[dateStr] = day;
      continue;
    }

    if (day.locked) {
      next[dateStr] = day;
      continue;
    }

    const completed = { ...(day.completed || {}) };
    const sessions = { ...(day.sessions || {}) };

    const stashCompleted = {};
    const stashSessions = {};

    for (let oldIdx = 0; oldIdx < oldCount; oldIdx++) {
      const prefix = `${routineId}-${oldIdx}`;
      if (completed[prefix] !== undefined) {
        stashCompleted[oldIdx] = completed[prefix];
        delete completed[prefix];
      }
      for (const sk of Object.keys(sessions)) {
        if (sk.startsWith(`${prefix}-`)) {
          stashSessions[sk] = sessions[sk];
          delete sessions[sk];
        }
      }
    }

    const hadStash =
      Object.keys(stashCompleted).length > 0 || Object.keys(stashSessions).length > 0;
    if (!hadStash) {
      next[dateStr] = day;
      continue;
    }

    for (let newIdx = 0; newIdx < newCount; newIdx++) {
      const oldIdx = perm[newIdx];
      const newPrefix = `${routineId}-${newIdx}`;
      const oldPrefix = `${routineId}-${oldIdx}`;

      if (stashCompleted[oldIdx] !== undefined) {
        completed[newPrefix] = stashCompleted[oldIdx];
      }
      for (const [sk, val] of Object.entries(stashSessions)) {
        if (sk.startsWith(`${oldPrefix}-`)) {
          const suffix = sk.slice(oldPrefix.length);
          sessions[`${newPrefix}${suffix}`] = val;
        }
      }
    }

    next[dateStr] = { ...day, completed, sessions };
  }

  return next;
}
