/** Letra del calendario: solo si el día tiene rutina y hubo ejercicios completados de esa rutina. */
export function getDayCalendarBadge(dayData, routines, getAlias) {
  if (!dayData?.routineId) return null;

  const routineId = dayData.routineId;
  const exercises = routines[routineId];
  if (!exercises?.length) return null;

  const prefix = `${routineId}-`;
  const hasCompletedForRoutine = Object.entries(dayData.completed || {}).some(
    ([key, value]) => value === true && key.startsWith(prefix)
  );

  if (!hasCompletedForRoutine) return null;

  const alias = getAlias(routineId);
  return alias || null;
}
