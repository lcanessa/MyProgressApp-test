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

  const remapped = remapBackupIds({
    routineBlocks: d.routineBlocks,
    routines: d.routines,
    library: d.library,
    diary: sanitizeDiarySessions(d.diary),
  });

  return {
    ok: true,
    data: {
      isDark,
      routineBlocks: remapped.routineBlocks,
      routines: remapped.routines,
      history: sanitizeHistory(d.history),
      library: remapped.library,
      diary: remapped.diary,
      hasLoadedRecommendedRoutines,
    },
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (id) => UUID_RE.test(id);

/**
 * Remapea todos los IDs no-UUID de blocks y exercises a UUIDs válidos.
 * Actualiza todas las referencias en routines, diary, y library.
 */
export function remapBackupIds(data) {
  // Mapas de ID viejo → nuevo UUID
  const blockMap = {};
  const exMap = {};

  // Remap blocks
  const routineBlocks = data.routineBlocks.map((b) => {
    const newId = isUUID(b.id) ? b.id : crypto.randomUUID();
    blockMap[b.id] = newId;
    return { ...b, id: newId };
  });

  // Remap library exercises
  const library = data.library.map((ex) => {
    const newId = isUUID(ex.id) ? ex.id : crypto.randomUUID();
    exMap[ex.id] = newId;
    return { ...ex, id: newId };
  });

  // Remap routines: keys (blockId) y exId dentro de cada lista
  const routines = {};
  for (const [oldBlockId, exercises] of Object.entries(data.routines)) {
    const newBlockId = blockMap[oldBlockId] ?? oldBlockId;
    routines[newBlockId] = (exercises || []).map((ex) => ({
      ...ex,
      exId: exMap[ex.exId] ?? ex.exId,
    }));
  }

  // Remap diary: routineId, sessions keys, completed keys
  const diary = {};
  for (const [date, day] of Object.entries(data.diary)) {
    const newRoutineId = day.routineId ? (blockMap[day.routineId] ?? day.routineId) : day.routineId;

    // Remap sessions keys: "{oldBlockId}-{rest}" → "{newBlockId}-{rest}"
    const sessions = {};
    for (const [key, val] of Object.entries(day.sessions || {})) {
      const newKey = remapKey(key, blockMap);
      sessions[newKey] = val;
    }

    // Remap completed keys
    const completed = {};
    for (const [key, val] of Object.entries(day.completed || {})) {
      const newKey = remapKey(key, blockMap);
      completed[newKey] = val;
    }

    diary[date] = { ...day, routineId: newRoutineId, sessions, completed };
  }

  return { ...data, routineBlocks, library, routines, diary };
}

function remapKey(key, blockMap) {
  // Keys have format "{blockId}-{rest...}" — replace only the blockId prefix
  for (const [oldId, newId] of Object.entries(blockMap)) {
    if (key.startsWith(oldId + '-')) {
      return newId + key.slice(oldId.length);
    }
  }
  return key;
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
