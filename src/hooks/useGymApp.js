import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MUSCLE_GROUPS } from '../constants/muscles';
import { MOCK_LIBRARY, DEFAULT_BLOCKS, DEFAULT_ROUTINES } from '../constants/defaults';
import { STORAGE_KEYS, LEGACY_KEYS_V27, SAMPLE_PROGRESS_LOADED_KEY, SAMPLE_CLEARED_KEY } from '../constants/storageKeys';
import { toLocalISODate } from '../utils/date';
import { loadSafely } from '../utils/storage';
import { buildBackupPayload, parseBackupJson, mergeDiaryForTodayAfterRestore, BACKUP_FILE_PREFIX } from '../utils/backup';
import { refreshAppViewport, VIEWPORT_REFRESH_EVENT } from './useAppViewport';
import { applyAppTheme } from '../utils/theme';
import { generateMonthDays } from '../utils/calendar';
import { initAudio, playBeep, playCelebrationSound } from '../services/audio';
import { startTimerKeepAlive, stopTimerKeepAlive } from '../services/timerKeepAlive';
import {
  buildReorderPermutation,
  buildDeletePermutation,
  remapDiaryForRoutineReorder,
  purgeDiaryForExerciseId,
} from '../utils/diaryRemap';
import { prefillDaySessions, prefillExerciseSessions } from '../utils/sessionPrefill';
import { getRecommendedSetup, RECOMMENDED_ROUTINES_LOADED_KEY } from '../constants/recommendedRoutines';
import {
  normalizeSessionFieldValue,
  parseWeightInput,
  sanitizeDiarySessions,
  sanitizeHistory,
} from '../utils/sessionValues';
import {
  getTodayISO,
  buildExerciseSnapshot,
  getLockedDayExercises,
  isPastCompletedLockedDay,
  withDaySnapshotIfComplete,
} from '../utils/diaryDayLock';
import {
  resolveExerciseVideo,
  resolveExerciseVideoAsync,
  findVideoIdForName,
  attachVideoToLibraryEntry,
} from '../utils/exerciseVideo';
import { resolveRoutineIdForDate } from '../utils/routineRotation';

/** Quita datos de ejemplo si quedaron de una versión anterior. */
function clearLegacySampleData() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SAMPLE_PROGRESS_LOADED_KEY) !== '1') return;

  localStorage.removeItem(STORAGE_KEYS.DIARY);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  localStorage.removeItem(STORAGE_KEYS.BLOCKS);
  localStorage.removeItem(STORAGE_KEYS.ROUTINES);
  localStorage.removeItem(SAMPLE_PROGRESS_LOADED_KEY);
  localStorage.removeItem(RECOMMENDED_ROUTINES_LOADED_KEY);
  localStorage.setItem(SAMPLE_CLEARED_KEY, '1');
}

function loadInitialWorkoutState() {
  if (typeof window === 'undefined') {
    return {
      blocks: DEFAULT_BLOCKS,
      routines: DEFAULT_ROUTINES,
      diary: {},
      history: {},
      recommendedLoaded: false,
    };
  }

  clearLegacySampleData();

  return {
    blocks: loadSafely(STORAGE_KEYS.BLOCKS, DEFAULT_BLOCKS),
    routines: loadSafely(STORAGE_KEYS.ROUTINES, DEFAULT_ROUTINES),
    diary: sanitizeDiarySessions(loadSafely(STORAGE_KEYS.DIARY, {})),
    history: sanitizeHistory(loadSafely(STORAGE_KEYS.HISTORY, {})),
    recommendedLoaded: localStorage.getItem(RECOMMENDED_ROUTINES_LOADED_KEY) === '1',
  };
}

const DEFAULT_REST_SECONDS = 90;

export function useGymApp() {

const [activeTab, setActiveTab] = useState('highlights');
const calendarRef = useRef(null);
const routinesRef = useRef(null);
const mainRef = useRef(null);
const [calendarDays] = useState(generateMonthDays());
const [selectedDate, setSelectedDate] = useState(() => toLocalISODate(new Date()));

// Estado LocalStorage - v28 (rutinas/diario vacíos; catálogo en v27)
const [isDark, setIsDarkState] = useState(() => {
const saved = localStorage.getItem(STORAGE_KEYS.THEME);
if (saved !== null) return JSON.parse(saved);
return true;
});

const setIsDark = useCallback((value) => {
setIsDarkState((prev) => {
const next = typeof value === 'function' ? value(prev) : value;
applyAppTheme(next);
return next;
});
}, []);

const [initialWorkout] = useState(() => loadInitialWorkoutState());
const [routineBlocks, setRoutineBlocks] = useState(() => initialWorkout.blocks);
const [library, setLibrary] = useState(() => loadSafely(STORAGE_KEYS.LIBRARY, MOCK_LIBRARY));
const [routines, setRoutines] = useState(() => initialWorkout.routines);
const [history, setHistory] = useState(() => initialWorkout.history);
const [diary, setDiary] = useState(() => initialWorkout.diary);

const activeBlocks = useMemo(() => routineBlocks.filter(b => !b.isArchived), [routineBlocks]);

// UI States
const [activeRoutineId, setActiveRoutineId] = useState(activeBlocks[0]?.id ?? null);
const [expandedEx, setExpandedEx] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [celebrationKey, setCelebrationKey] = useState(0);
const celebrationContextRef = useRef('');
const wasCompleteForContextRef = useRef(false);
const celebrationTimerRef = useRef(null);

// Modals
const [showNewExForm, setShowNewExForm] = useState(false);
const [showMultiSelect, setShowMultiSelect] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [libraryExerciseToDelete, setLibraryExerciseToDelete] = useState(null);
const [routineExerciseIndexToRemove, setRoutineExerciseIndexToRemove] = useState(null);
const [showFullCalendar, setShowFullCalendar] = useState(false);
const [exerciseVideo, setExerciseVideo] = useState(null);
const [hasLoadedRecommendedRoutines, setHasLoadedRecommendedRoutines] = useState(
  () => initialWorkout.recommendedLoaded
);
const [calendarViewDate, setCalendarViewDate] = useState(() => new Date());

const [newExData, setNewExData] = useState({ name: '', muscle: MUSCLE_GROUPS[0] });
const [editingExId, setEditingExId] = useState(null);
const [editingExData, setEditingExData] = useState({ name: '', muscle: '' });
const [selectedExIds, setSelectedExIds] = useState([]);

// Timer State
const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
const [timerRemaining, setTimerRemaining] = useState(0);
const [isTimerRunning, setIsTimerRunning] = useState(false);
const [isTimerFinished, setIsTimerFinished] = useState(false);
const [soundEnabled, setSoundEnabled] = useState(true);
const isTimerRunningRef = useRef(false);
const soundEnabledRef = useRef(true);
const TIMER_END_KEY = 'myprogress_test_timer_end_ts';

const todayISO = getTodayISO();

const isDayLocked = useMemo(() => {
  const day = diary[selectedDate];
  return isPastCompletedLockedDay(selectedDate, day, routines, todayISO);
}, [selectedDate, diary, routines, todayISO]);

// --- LÓGICA DE ALIAS AUTOMÁTICO ---
const workoutProgress = useMemo(() => {
const dayData = diary[selectedDate] || { completed: {} };
const rid = dayData.routineId || activeRoutineId;
const exercises = isDayLocked
  ? getLockedDayExercises(dayData, rid, routines)
  : routines[rid] || [];
const total = exercises.length;
if (total === 0) return { total: 0, completed: 0, percent: 0, isComplete: false };
const completed = exercises.filter((_, exIdx) => dayData.completed?.[`${rid}-${exIdx}`] === true).length;
return {
total,
completed,
percent: Math.round((completed / total) * 100),
isComplete: completed === total,
};
}, [routines, activeRoutineId, diary, selectedDate, isDayLocked]);

const dismissCelebration = useCallback(() => {
if (celebrationTimerRef.current) {
clearTimeout(celebrationTimerRef.current);
celebrationTimerRef.current = null;
}
setCelebrationKey(0);
}, []);

const triggerCelebration = useCallback(() => {
dismissCelebration();
setCelebrationKey((k) => k + 1);
if (soundEnabled) playCelebrationSound();
if (navigator.vibrate) navigator.vibrate([40, 30, 40, 30, 60]);
celebrationTimerRef.current = setTimeout(dismissCelebration, 6500);
}, [soundEnabled, dismissCelebration]);

useEffect(() => () => dismissCelebration(), [dismissCelebration]);

useEffect(() => {
if (activeTab !== 'workout' || workoutProgress.total === 0) return;

const contextKey = `${selectedDate}-${activeRoutineId}`;

// Cambió fecha o rutina: sincronizar y ocultar confeti previo
if (celebrationContextRef.current !== contextKey) {
celebrationContextRef.current = contextKey;
wasCompleteForContextRef.current = workoutProgress.isComplete;
dismissCelebration();
return;
}

// Mismo día y rutina: celebrar solo al pasar de incompleto → completo
if (workoutProgress.isComplete && !wasCompleteForContextRef.current) {
triggerCelebration();
wasCompleteForContextRef.current = true;
return;
}

wasCompleteForContextRef.current = workoutProgress.isComplete;
}, [workoutProgress.isComplete, workoutProgress.total, activeTab, selectedDate, activeRoutineId, triggerCelebration, dismissCelebration]);

useEffect(() => {
  if (!workoutProgress.isComplete || workoutProgress.total === 0) return;

  setDiary((prev) => {
    const day = prev[selectedDate];
    if (!day) return prev;
    const rid = day.routineId || activeRoutineId;
    const nextDay = withDaySnapshotIfComplete(day, rid, routines);
    if (nextDay === day) return prev;
    return { ...prev, [selectedDate]: nextDay };
  });
}, [workoutProgress.isComplete, workoutProgress.total, selectedDate, activeRoutineId, routines]);

useEffect(() => {
  if (!isDayLocked) return;

  setDiary((prev) => {
    const day = prev[selectedDate];
    if (!day || day.exerciseSnapshot?.length) return prev;
    const rid = day.routineId || activeRoutineId;
    const snap = buildExerciseSnapshot(getLockedDayExercises(day, rid, routines));
    if (!snap.length) return prev;
    return { ...prev, [selectedDate]: { ...day, locked: true, exerciseSnapshot: snap } };
  });
}, [isDayLocked, selectedDate, activeRoutineId, routines]);

const getAlias = useCallback((blockId) => {
const block = routineBlocks.find(b => b.id === blockId);
if (!block) return '';
if (block.isArchived) return block.archivedAlias || '?';
const activeIdx = activeBlocks.findIndex(b => b.id === blockId);
return activeIdx >= 0 ? String.fromCharCode(65 + activeIdx) : '';
}, [routineBlocks, activeBlocks]);

// Guardado persistente
useEffect(() => {
try {
localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(routineBlocks));
localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library));
localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(diary));
} catch (e) { console.error("Error guardando", e); }
}, [isDark, routineBlocks, routines, history, library, diary]);

// --- LÓGICA INTELIGENTE: Cambio de Fecha ---
const changeDate = useCallback((newDateStr) => {
setSelectedDate(newDateStr);

setDiary(prev => {
const targetId = resolveRoutineIdForDate(prev, newDateStr, activeBlocks);
setActiveRoutineId(targetId);

const dayData = prev[newDateStr];

if (!targetId) return prev;

const existing = prev[newDateStr] || { sessions: {}, completed: {} };

if (isPastCompletedLockedDay(newDateStr, existing, routines, todayISO)) {
  return prev;
}

const sessions = prefillDaySessions(prev, newDateStr, targetId, routines);
const completed = existing.completed || {};

if (
existing.routineId === targetId &&
JSON.stringify(existing.sessions || {}) === JSON.stringify(sessions) &&
JSON.stringify(completed) === JSON.stringify(dayData?.completed || {})
) {
return prev;
}

return {
...prev,
[newDateStr]: { routineId: targetId, sessions, completed },
};
});
setExpandedEx(null);
}, [activeBlocks, routines, todayISO]);

// Limpia datos viejos hardcodeados (rutinas/diario v27)
useEffect(() => {
LEGACY_KEYS_V27.forEach((key) => {
localStorage.removeItem(key);
});
}, []);

// Ejecución al iniciar
useEffect(() => {
changeDate(toLocalISODate(new Date()));
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const scrollRoutineIntoView = useCallback((routineId) => {
if (!routinesRef.current) return;
const container = routinesRef.current;
const targetEl = container.querySelector(`[data-routine-id="${routineId}"]`);
if (!targetEl) return;
const scrollPos = targetEl.offsetLeft - container.offsetWidth / 2 + targetEl.offsetWidth / 2 - 16;
try {
container.scrollTo({ left: scrollPos, behavior: 'smooth' });
} catch {
container.scrollLeft = scrollPos;
}
}, []);

const scrollCalendarToDate = useCallback((dateStr) => {
if (!calendarRef.current) return;
const container = calendarRef.current;
const targetEl =
container.querySelector(`[data-date="${dateStr}"]`) ||
container.querySelector('.is-today');
if (!targetEl) return;
const scrollPos = targetEl.offsetLeft - container.offsetWidth / 2 + targetEl.offsetWidth / 2 - 16;
try {
container.scrollTo({ left: scrollPos, behavior: 'smooth' });
} catch {
container.scrollLeft = scrollPos;
}
}, []);

const goToToday = useCallback(() => {
const today = toLocalISODate(new Date());
changeDate(today);
setTimeout(() => scrollCalendarToDate(today), 50);
mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
}, [changeDate, scrollCalendarToDate]);

const startTodayWorkout = useCallback(() => {
goToToday();
setActiveTab('workout');
}, [goToToday]);

// Scroll del calendario al cambiar fecha
useEffect(() => {
if (activeTab === 'workout') {
const t = setTimeout(() => scrollCalendarToDate(selectedDate), 50);
return () => clearTimeout(t);
}
}, [activeTab, selectedDate, scrollCalendarToDate]);

// Scroll del selector de rutinas al cambiar rutina activa
useEffect(() => {
if (activeTab === 'workout' || activeTab === 'edit') {
const t = setTimeout(() => scrollRoutineIntoView(activeRoutineId), 50);
return () => clearTimeout(t);
}
}, [activeTab, activeRoutineId, scrollRoutineIntoView]);

// Sync refs for use inside non-reactive handlers
useEffect(() => { isTimerRunningRef.current = isTimerRunning; }, [isTimerRunning]);
useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

const handleTimerFinished = useCallback(() => {
  localStorage.removeItem(TIMER_END_KEY);
  stopTimerKeepAlive();
  if (soundEnabledRef.current) playBeep();
}, []);

// On mount: recover timer if app was reopened after screen lock
useEffect(() => {
  const saved = localStorage.getItem(TIMER_END_KEY);
  if (!saved) return;
  const remaining = Math.ceil((Number(saved) - Date.now()) / 1000);
  if (remaining <= 0) {
    setIsRestTimerOpen(true);
    setIsTimerFinished(true);
    handleTimerFinished();
  } else {
    setIsRestTimerOpen(true);
    setTimerRemaining(remaining);
    setIsTimerRunning(true);
    startTimerKeepAlive();
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Recover timer state when returning from background (screen lock)
useEffect(() => {
  const onVisible = () => {
    if (document.visibilityState !== 'visible') return;
    if (!isTimerRunningRef.current) return;
    const saved = localStorage.getItem(TIMER_END_KEY);
    if (!saved) return;
    const remaining = Math.ceil((Number(saved) - Date.now()) / 1000);
    if (remaining <= 0) {
      setIsTimerRunning(false);
      setTimerRemaining(0);
      setIsRestTimerOpen(true);
      setIsTimerFinished(true);
      handleTimerFinished();
    } else {
      setIsRestTimerOpen(true);
      setTimerRemaining(remaining);
      startTimerKeepAlive();
    }
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => document.removeEventListener('visibilitychange', onVisible);
}, [handleTimerFinished]);

// Timer Effects
useEffect(() => {
let interval = null;
if (isTimerRunning && timerRemaining > 0) {
interval = setInterval(() => { setTimerRemaining(prev => prev - 1); }, 1000);
} else if (isTimerRunning && timerRemaining === 0) {
setIsTimerRunning(false);
setIsTimerFinished(true);
handleTimerFinished();
}
return () => clearInterval(interval);
}, [isTimerRunning, timerRemaining, handleTimerFinished]);

const startTimer = async (seconds = DEFAULT_REST_SECONDS) => {
  initAudio();
  setIsRestTimerOpen(true);
  setIsTimerFinished(false);
  setTimerRemaining(seconds);
  setIsTimerRunning(true);
  const endTs = Date.now() + seconds * 1000;
  localStorage.setItem(TIMER_END_KEY, String(endTs));
  await startTimerKeepAlive();
};
const openRestTimer = (seconds = DEFAULT_REST_SECONDS) => {
  initAudio();
  setIsRestTimerOpen(true);
  setIsTimerFinished(false);
  setTimerRemaining(seconds);
  setIsTimerRunning(false);
  localStorage.removeItem(TIMER_END_KEY);
  stopTimerKeepAlive();
};
const setRestDuration = async (seconds) => {
  initAudio();
  setIsRestTimerOpen(true);
  setIsTimerFinished(false);
  setTimerRemaining(seconds);
  if (isTimerRunningRef.current) {
    const endTs = Date.now() + seconds * 1000;
    localStorage.setItem(TIMER_END_KEY, String(endTs));
  }
};
const stopTimer = () => {
  setIsTimerRunning(false);
  localStorage.removeItem(TIMER_END_KEY);
  stopTimerKeepAlive();
};
const closeTimer = () => {
  setIsRestTimerOpen(false);
  setIsTimerRunning(false);
  setTimerRemaining(0);
  setIsTimerFinished(false);
  localStorage.removeItem(TIMER_END_KEY);
  stopTimerKeepAlive();
};
const add15sToTimer = () => {
  initAudio();
  setTimerRemaining((prev) => {
    const newVal = prev + 15;
    if (isTimerRunningRef.current) {
      const saved = localStorage.getItem(TIMER_END_KEY);
      const newEndTs = saved ? Number(saved) + 15000 : Date.now() + newVal * 1000;
      localStorage.setItem(TIMER_END_KEY, String(newEndTs));
    }
    return newVal;
  });
};
const toggleSound = () => { initAudio(); setSoundEnabled(!soundEnabled); };

const prefillExerciseIfNeeded = useCallback(
(exIdx) => {
if (!activeRoutineId || !selectedDate || isDayLocked) return;
setDiary((prev) => {
const existing = prev[selectedDate] || { sessions: {}, completed: {} };
const sessions = prefillExerciseSessions(prev, selectedDate, activeRoutineId, exIdx, routines);
if (JSON.stringify(existing.sessions || {}) === JSON.stringify(sessions)) return prev;
return {
...prev,
[selectedDate]: {
...existing,
routineId: activeRoutineId,
sessions,
completed: existing.completed || {},
},
};
});
},
[activeRoutineId, selectedDate, routines, isDayLocked]
);

const changeRoutineManually = (routineId) => {
if (isDayLocked) return;
setActiveRoutineId(routineId);
setDiary((prev) => {
const existing = prev[selectedDate] || { sessions: {}, completed: {} };
const sessions = prefillDaySessions(prev, selectedDate, routineId, routines);
return {
...prev,
[selectedDate]: { ...existing, routineId, sessions, completed: existing.completed || {} },
};
});
setExpandedEx(null);
setTimeout(() => scrollRoutineIntoView(routineId), 50);
};

// --- LÓGICA DE ABM RUTINAS ---
const handleAddRoutineBlock = () => {
const newId = 'r' + Date.now();
const newBlock = { id: newId, name: 'Nueva Rutina' };
setRoutineBlocks([...routineBlocks, newBlock]);
setRoutines({ ...routines, [newId]: [] });
setActiveRoutineId(newId);
};

const confirmDeleteRoutine = () => {
const currentAlias = getAlias(activeRoutineId);
const newBlocks = routineBlocks.map(b =>
b.id === activeRoutineId ? { ...b, isArchived: true, archivedAlias: currentAlias } : b
);

const remainingActive = newBlocks.filter(b => !b.isArchived);

if (remainingActive.length > 0) {
setRoutineBlocks(newBlocks);
const nextId = remainingActive[0].id;
setActiveRoutineId(nextId);
setDiary(prev => ({
...prev,
[selectedDate]: { ...prev[selectedDate], routineId: nextId },
}));
} else {
const newId = 'r' + Date.now();
const newBlock = { id: newId, name: 'Nueva Rutina' };
setRoutineBlocks([...newBlocks, newBlock]);
setRoutines({ ...routines, [newId]: [] });
setActiveRoutineId(newId);
setDiary(prev => ({
...prev,
[selectedDate]: { ...prev[selectedDate], routineId: newId },
}));
localStorage.removeItem(RECOMMENDED_ROUTINES_LOADED_KEY);
setHasLoadedRecommendedRoutines(false);
}

setExpandedEx(null);
setShowDeleteModal(false);
};

// --- LÓGICA DE CATÁLOGO Y AGRUPACIÓN ---
const handleAddNewExercise = () => {
if (!newExData.name || !newExData.name.trim()) return;
const safeMuscle = newExData.muscle || MUSCLE_GROUPS[0];

const exId = Date.now().toString();
const exName = newExData.name.trim();
const presetVideo = findVideoIdForName(exName, library);

const newEx = {
id: exId,
name: exName,
muscle: safeMuscle,
...(presetVideo ? { videoId: presetVideo } : {}),
};

setLibrary(prev => [newEx, ...prev]);
if (!presetVideo) attachVideoToLibraryEntry(exId, exName, library, setLibrary);
setNewExData({ name: '', muscle: MUSCLE_GROUPS[0] });
setShowNewExForm(false);
};

const startEditingEx = (ex) => { setEditingExId(ex.id); setEditingExData({ name: ex.name, muscle: ex.muscle }); };
const saveEditedEx = () => {
if (!editingExData.name || !editingExData.name.trim()) return;
const trimmed = editingExData.name.trim();
const presetVideo = findVideoIdForName(trimmed, library);
setLibrary(library.map(ex => {
if (ex.id !== editingExId) return ex;
const next = { ...ex, ...editingExData, name: trimmed };
if (presetVideo) next.videoId = presetVideo;
return next;
}));
if (!presetVideo) attachVideoToLibraryEntry(editingExId, trimmed, library, setLibrary);
setEditingExId(null);
};
const confirmDeleteLibraryExercise = () => {
  const id = libraryExerciseToDelete;
  if (!id) return;

  const namesToDrop = new Set();
  const libEx = library.find((e) => e.id === id);
  if (libEx?.name) namesToDrop.add(libEx.name);

  let nextDiary = diary;
  const newRoutines = { ...routines };

  for (const [routineId, list] of Object.entries(routines)) {
    let newList = [...list];
    const indices = newList
      .map((ex, i) => (ex.exId === id ? i : -1))
      .filter((i) => i >= 0)
      .sort((a, b) => b - a);

    for (const idx of indices) {
      const ex = newList[idx];
      namesToDrop.add(ex.customName || ex.name);
      const perm = buildDeletePermutation(newList.length, idx);
      nextDiary = remapDiaryForRoutineReorder(nextDiary, routineId, perm, newList.length);
      newList.splice(idx, 1);
    }

    if (indices.length > 0) {
      newRoutines[routineId] = newList;
    }
  }

  const newHistory = { ...history };
  for (const name of namesToDrop) delete newHistory[name];

  setLibrary(library.filter((ex) => ex.id !== id));
  setRoutines(newRoutines);
  setDiary(nextDiary);
  setHistory(newHistory);
  setLibraryExerciseToDelete(null);
  setExpandedEx((ex) => {
    if (ex === null) return null;
    const len = newRoutines[activeRoutineId]?.length ?? 0;
    if (ex >= len) return null;
    return ex;
  });
};

const filteredLibrary = useMemo(() => {
return (library || []).filter(ex => {
const term = (searchTerm || '').toLowerCase();
return (ex?.name || '').toLowerCase().includes(term) || (ex?.muscle || '').toLowerCase().includes(term);
});
}, [library, searchTerm]);

const routineExerciseIds = useMemo(() => {
const inRoutine = routines[activeRoutineId] || [];
return new Set(inRoutine.map((ex) => ex.exId).filter(Boolean));
}, [routines, activeRoutineId]);

const addableLibrary = useMemo(() => {
return filteredLibrary.filter((ex) => !routineExerciseIds.has(ex.id));
}, [filteredLibrary, routineExerciseIds]);

const groupedLibrary = useMemo(() => {
const groups = {};
filteredLibrary.forEach(ex => {
const m = ex.muscle || 'Otro';
if (!groups[m]) groups[m] = [];
groups[m].push(ex);
});
return Object.entries(groups).sort((a,b) => a[0].localeCompare(b[0]));
}, [filteredLibrary]);

const groupedAddableLibrary = useMemo(() => {
const groups = {};
addableLibrary.forEach(ex => {
const m = ex.muscle || 'Otro';
if (!groups[m]) groups[m] = [];
groups[m].push(ex);
});
return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
}, [addableLibrary]);

// --- LÓGICA DE MULTI-SELECCIÓN ---
const toggleExSelection = (id) => {
setSelectedExIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
};

const confirmMultiAdd = () => {
const exercisesToAdd = library.filter(
(ex) => selectedExIds.includes(ex.id) && !routineExerciseIds.has(ex.id)
);
const newEntries = exercisesToAdd.map(ex => ({
exId: ex.id, name: ex.name, sets: 3, targetReps: '10-12', customName: ex.name
}));

setRoutines({
...routines,
[activeRoutineId]: [...(routines[activeRoutineId] || []), ...newEntries],
});

setShowMultiSelect(false);
setSelectedExIds([]);
setSearchTerm('');
};

const removeExerciseFromRoutine = (idx) => {
  const list = routines[activeRoutineId] || [];
  if (idx < 0 || idx >= list.length) return;

  const ex = list[idx];
  const exId = ex?.exId;
  const exName = ex?.customName || ex?.name;

  setDiary((d) => {
    let next = exId ? purgeDiaryForExerciseId(d, routines, exId) : d;
    const perm = buildDeletePermutation(list.length, idx);
    return remapDiaryForRoutineReorder(next, activeRoutineId, perm, list.length);
  });

  if (exName) {
    setHistory((h) => {
      const next = { ...h };
      delete next[exName];
      return next;
    });
  }

  setRoutines((prev) => {
    const current = [...(prev[activeRoutineId] || [])];
    if (idx < 0 || idx >= current.length) return prev;
    current.splice(idx, 1);
    return { ...prev, [activeRoutineId]: current };
  });
  setExpandedEx((exIdx) => {
    if (exIdx === null) return null;
    if (exIdx === idx) return null;
    if (exIdx > idx) return exIdx - 1;
    return exIdx;
  });
};

const confirmRemoveExerciseFromRoutine = () => {
  const idx = routineExerciseIndexToRemove;
  if (idx == null) return;
  setRoutineExerciseIndexToRemove(null);
  removeExerciseFromRoutine(idx);
};

const reorderRoutineExercises = useCallback((fromIndex, toIndex) => {
if (fromIndex === toIndex) return;
setRoutines((prev) => {
const list = [...(prev[activeRoutineId] || [])];
if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) return prev;
const [moved] = list.splice(fromIndex, 1);
list.splice(toIndex, 0, moved);
const perm = buildReorderPermutation(list.length, fromIndex, toIndex);
setDiary((d) => remapDiaryForRoutineReorder(d, activeRoutineId, perm));
return { ...prev, [activeRoutineId]: list };
});
}, [activeRoutineId]);

const updateSessionData = (exIdx, setIdx, field, value) => {
if (isDayLocked) return;
const key = `${activeRoutineId}-${exIdx}-s${setIdx}-${field}`;
const cleaned =
  field === 'w' ? parseWeightInput(value) : normalizeSessionFieldValue(value, 'r');
const todayDiary = diary[selectedDate] || { sessions: {}, completed: {} };
setDiary({ ...diary, [selectedDate]: { ...todayDiary, sessions: { ...todayDiary.sessions, [key]: cleaned }, routineId: activeRoutineId } });
const exName = routines[activeRoutineId][exIdx].customName;
const newHistory = { ...history };
if (!newHistory[exName]) newHistory[exName] = {};
if (field === 'w') newHistory[exName][`s${setIdx}w`] = cleaned;
if (field === 'r') newHistory[exName][`s${setIdx}r`] = cleaned;
if (hasSessionValue(cleaned)) newHistory[exName].lastDate = selectedDate;
setHistory(newHistory);
};

function hasSessionValue(v) {
  return v != null && String(v).trim() !== '';
}

const toggleComplete = (exIdx) => {
if (isDayLocked) return;
const key = `${activeRoutineId}-${exIdx}`;
const todayDiary = diary[selectedDate] || { sessions: {}, completed: {} };
const markingComplete = !todayDiary.completed[key];
setDiary({
...diary,
[selectedDate]: {
...todayDiary,
completed: { ...todayDiary.completed, [key]: markingComplete },
routineId: activeRoutineId,
},
});
if (markingComplete) setExpandedEx((prev) => (prev === exIdx ? null : prev));
};

// --- LÓGICA DE CALENDARIO COMPLETO (MODAL) ---
const fullCalendarGrid = useMemo(() => {
const year = calendarViewDate.getFullYear();
const month = calendarViewDate.getMonth();
const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);

let startOffset = firstDay.getDay() - 1;
if (startOffset === -1) startOffset = 6;

const grid = [];
for (let i = 0; i < startOffset; i++) grid.push(null);
for (let i = 1; i <= lastDay.getDate(); i++) {
grid.push(toLocalISODate(new Date(year, month, i)));
}
return grid;
}, [calendarViewDate]);

const monthName = calendarViewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
const displayMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

// Extraer información actual
const currentDayData = diary[selectedDate] || { sessions: {}, completed: {} };
/** Rutina viva para editar en pestaña Rutina (siempre la lista actual). */
const currentRoutineExercises = useMemo(
  () => routines[activeRoutineId] || [],
  [routines, activeRoutineId]
);

/** Ejercicios mostrados en Home según el día (snapshot si el día pasado está bloqueado). */
const workoutDayExercises = useMemo(() => {
  const day = diary[selectedDate];
  const rid = day?.routineId || activeRoutineId;
  if (isDayLocked && day) {
    return getLockedDayExercises(day, rid, routines);
  }
  return routines[activeRoutineId] || [];
}, [routines, activeRoutineId, diary, selectedDate, isDayLocked]);
const currentBlock = routineBlocks.find(r => r.id === activeRoutineId) || activeBlocks[0];
const currentRoutineName = currentBlock?.name || '';

const openExerciseVideo = useCallback((exercise) => {
const initial = resolveExerciseVideo(library, exercise);
if (!initial) return;

if (initial.videoId) {
setExerciseVideo(initial);
return;
}

setExerciseVideo({ ...initial, loading: true });
resolveExerciseVideoAsync(library, exercise).then((resolved) => {
setExerciseVideo((current) => {
if (!current || current.title !== resolved?.title) return current;
return resolved || { ...initial, loading: false };
});
if (resolved?.videoId && exercise.exId) {
setLibrary((prev) =>
prev.map((ex) => (ex.id === exercise.exId ? { ...ex, videoId: resolved.videoId } : ex))
);
}
});
}, [library]);

const closeExerciseVideo = useCallback(() => {
setExerciseVideo(null);
}, []);

const loadRecommendedRoutines = useCallback(() => {
const hasExercises = Object.values(routines).some((list) => list?.length > 0);
if (hasExercises && !window.confirm('Esto reemplazará tus rutinas actuales por las 3 recomendadas. ¿Continuar?')) return;
const { blocks, routines: recommended } = getRecommendedSetup();
setRoutineBlocks(blocks);
setRoutines(recommended);
const firstId = blocks[0]?.id || 'r1';
setActiveRoutineId(firstId);
setExpandedEx(null);
localStorage.setItem(RECOMMENDED_ROUTINES_LOADED_KEY, '1');
setHasLoadedRecommendedRoutines(true);
}, [routines]);

const refreshAppLayout = useCallback(() => {
refreshAppViewport();
window.dispatchEvent(new Event(VIEWPORT_REFRESH_EVENT));
mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}, []);

const exportBackup = useCallback(() => {
const payload = buildBackupPayload({
isDark,
routineBlocks,
routines,
history,
library,
diary,
hasLoadedRecommendedRoutines,
});
const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${BACKUP_FILE_PREFIX}-${stamp}.json`;
document.body.appendChild(a);
a.click();
a.remove();
setTimeout(() => {
URL.revokeObjectURL(url);
refreshAppLayout();
}, 400);
}, [isDark, routineBlocks, routines, history, library, diary, hasLoadedRecommendedRoutines, refreshAppLayout]);

const importBackup = useCallback((file) => new Promise((resolve) => {
if (!file) {
resolve({ ok: false, error: 'No elegiste ningún archivo.' });
return;
}
const reader = new FileReader();
reader.onload = () => {
const parsed = parseBackupJson(reader.result);
if (!parsed.ok) {
resolve({ ok: false, error: parsed.error });
return;
}
if (!window.confirm('Restaurar esta copia reemplazará todo lo que tenés ahora (rutinas, diario, catálogo, etc.). ¿Continuar?')) {
resolve({ ok: false, cancelled: true });
return;
}
const d = parsed.data;
const { mergedDiary, activeRoutineId: nextRid, selectedDate: nextDate } = mergeDiaryForTodayAfterRestore(
d.diary,
d.routineBlocks
);
setIsDark(d.isDark);
setRoutineBlocks(d.routineBlocks);
setRoutines(d.routines);
setHistory(d.history);
setLibrary(d.library);
setDiary(mergedDiary);
setActiveRoutineId(nextRid ?? null);
setSelectedDate(nextDate);
setExpandedEx(null);
setHasLoadedRecommendedRoutines(d.hasLoadedRecommendedRoutines);
if (d.hasLoadedRecommendedRoutines) {
localStorage.setItem(RECOMMENDED_ROUTINES_LOADED_KEY, '1');
} else {
localStorage.removeItem(RECOMMENDED_ROUTINES_LOADED_KEY);
}
refreshAppLayout();
resolve({ ok: true });
};
reader.onerror = () => resolve({ ok: false, error: 'No se pudo leer el archivo.' });
reader.readAsText(file, 'UTF-8');
}), [refreshAppLayout]);

  return {
    activeTab, setActiveTab,
    calendarRef, routinesRef, mainRef,
    calendarDays, selectedDate, setSelectedDate,
    isDark, setIsDark,
    routineBlocks, setRoutineBlocks,
    library, setLibrary,
    routines, setRoutines,
    history, setHistory,
    diary, setDiary,
    activeBlocks,
    activeRoutineId, setActiveRoutineId,
    expandedEx, setExpandedEx,
    searchTerm, setSearchTerm,
    celebrationKey,
    showNewExForm, setShowNewExForm,
    showMultiSelect, setShowMultiSelect,
    showDeleteModal, setShowDeleteModal,
    showFullCalendar, setShowFullCalendar,
    exerciseVideo, openExerciseVideo, closeExerciseVideo,
    calendarViewDate, setCalendarViewDate,
    newExData, setNewExData,
    editingExId, setEditingExId,
    editingExData, setEditingExData,
    selectedExIds, setSelectedExIds,
    isRestTimerOpen, timerRemaining, isTimerRunning, isTimerFinished, soundEnabled,
    isDayLocked,
    workoutProgress,
    getAlias,
    changeDate,
    goToToday,
    startTodayWorkout,
    scrollRoutineIntoView,
    startTimer, openRestTimer, setRestDuration, stopTimer, closeTimer, add15sToTimer, toggleSound,
    changeRoutineManually,
    handleAddRoutineBlock,
    confirmDeleteRoutine,
    handleAddNewExercise,
    startEditingEx, saveEditedEx,
    libraryExerciseToDelete, setLibraryExerciseToDelete,
    confirmDeleteLibraryExercise,
    routineExerciseIndexToRemove, setRoutineExerciseIndexToRemove,
    confirmRemoveExerciseFromRoutine,
    filteredLibrary, groupedLibrary, addableLibrary, groupedAddableLibrary,
    toggleExSelection, confirmMultiAdd,
    removeExerciseFromRoutine,
    reorderRoutineExercises,
    prefillExerciseIfNeeded,
    updateSessionData,
    toggleComplete,
    fullCalendarGrid, displayMonthName,
    currentDayData, currentRoutineExercises, workoutDayExercises, currentBlock, currentRoutineName,
    loadRecommendedRoutines,
    exportBackup,
    importBackup,
    refreshAppLayout,
    showRecommendedRoutinesButton: !hasLoadedRecommendedRoutines,
  };
}
