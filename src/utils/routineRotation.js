/**
 * Resuelve qué rutina corresponde a una fecha:
 * - Si el día ya tiene sesiones, usa su routineId.
 * - Si no, rota a la siguiente rutina activa tras el último día pasado con al menos un ejercicio completado.
 */
export function resolveRoutineIdForDate(diary, dateStr, activeBlocks) {
  if (!activeBlocks.length) return null;

  const dayData = diary[dateStr];
  const hasData = dayData && Object.keys(dayData.sessions || {}).length > 0;
  let targetId = activeBlocks[0]?.id;

  if (hasData) {
    targetId = dayData.routineId;
  } else {
    const pastDates = Object.keys(diary)
      .filter((d) => d < dateStr)
      .sort()
      .reverse();
    for (const d of pastDates) {
      if (
        diary[d]?.completed &&
        Object.values(diary[d].completed).some((v) => v === true)
      ) {
        const idx = activeBlocks.findIndex((b) => b.id === diary[d].routineId);
        if (idx !== -1) {
          targetId = activeBlocks[(idx + 1) % activeBlocks.length]?.id;
        } else {
          targetId = activeBlocks[0]?.id;
        }
        break;
      }
    }
  }

  return targetId ?? null;
}
