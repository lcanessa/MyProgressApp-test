import { toLocalISODate } from './date';
import { sanitizeDiarySessions, sanitizeHistory } from './sessionValues';

export const BACKUP_FORMAT_VERSION = 1;
export const BACKUP_FILE_PREFIX = 'myprogress-backup';

export function buildBackupPayload({
  isDark,
  routineBlocks,
  routines,
  history,
  library,
  diary,
  hasLoadedRecommendedRoutines,
}) {
  return {
    myprogressBackup: true,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      isDark,
      routineBlocks,
      routines,
      history,
      library,
      diary,
      hasLoadedRecommendedRoutines,
    },
  };
}

export function parseBackupJson(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'El archivo no es un JSON válido.' };
  }

  if (!parsed || parsed.myprogressBackup !== true || !parsed.data || typeof parsed.data !== 'object') {
    return { ok: false, error: 'No es una copia de seguridad de MyProgress.' };
  }

  const v = parsed.formatVersion == null ? 1 : Number(parsed.formatVersion);
  if (Number.isNaN(v) || v < 1) {
    return { ok: false, error: 'Formato de copia no reconocido.' };
  }
  if (v > BACKUP_FORMAT_VERSION) {
    return { ok: false, error: 'Versión de copia más nueva que esta app. Actualizá MyProgress e intentá de nuevo.' };
  }

  const d = parsed.data;
  if (!Array.isArray(d.routineBlocks) || !Array.isArray(d.library)) {
    return { ok: false, error: 'Formato de datos inválido.' };
  }
  if (typeof d.routines !== 'object' || d.routines === null) {
    return { ok: false, error: 'Formato de datos inválido.' };
  }
  if (typeof d.history !== 'object' || d.history === null) {
    return { ok: false, error: 'Formato de datos inválido.' };
  }
  if (typeof d.diary !== 'object' || d.diary === null) {
    return { ok: false, error: 'Formato de datos inválido.' };
  }

  const isDark = typeof d.isDark === 'boolean' ? d.isDark : true;
  const hasLoadedRecommendedRoutines =
    typeof d.hasLoadedRecommendedRoutines === 'boolean' ? d.hasLoadedRecommendedRoutines : false;

  return {
    ok: true,
    data: {
      isDark,
      routineBlocks: d.routineBlocks,
      routines: d.routines,
      history: sanitizeHistory(d.history),
      library: d.library,
      diary: sanitizeDiarySessions(d.diary),
      hasLoadedRecommendedRoutines,
    },
  };
}

/** Asegura entrada del día actual para no dejar la UI sin rutina activa. */
export function mergeDiaryForTodayAfterRestore(diary, routineBlocks) {
  const today = toLocalISODate(new Date());
  const mergedDiary = { ...diary };
  const active = routineBlocks.filter((b) => !b.isArchived);
  const fallbackRid = active[0]?.id ?? routineBlocks[0]?.id ?? null;

  if (!mergedDiary[today] && fallbackRid) {
    mergedDiary[today] = { routineId: fallbackRid, sessions: {}, completed: {} };
  }

  let rid = mergedDiary[today]?.routineId ?? fallbackRid;
  if (rid && !active.some((b) => b.id === rid)) {
    rid = fallbackRid;
  }

  if (mergedDiary[today] && rid) {
    mergedDiary[today] = { ...mergedDiary[today], routineId: rid };
  }

  return { mergedDiary, activeRoutineId: rid, selectedDate: today };
}
