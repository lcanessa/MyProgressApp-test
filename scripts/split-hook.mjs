import fs from 'fs';

const src = fs.readFileSync('src/App.jsx', 'utf8');
const fnStart = src.indexOf('export default function App() {') + 'export default function App() {'.length;
const returnIdx = src.indexOf('return (\n<div className={`h-full w-full', fnStart);
let hookBody = src.slice(fnStart, returnIdx);

hookBody = hookBody
  .replace(/localStorage\.getItem\('myprogress_theme_pref'/g, "localStorage.getItem(STORAGE_KEYS.THEME")
  .replace(/loadSafely\('myprogress_blocks_v28'/g, 'loadSafely(STORAGE_KEYS.BLOCKS')
  .replace(/loadSafely\('myprogress_lib_v27'/g, 'loadSafely(STORAGE_KEYS.LIBRARY')
  .replace(/loadSafely\('myprogress_routines_v28'/g, 'loadSafely(STORAGE_KEYS.ROUTINES')
  .replace(/loadSafely\('myprogress_hist_v28'/g, 'loadSafely(STORAGE_KEYS.HISTORY')
  .replace(/loadSafely\('myprogress_diary_v28'/g, 'loadSafely(STORAGE_KEYS.DIARY')
  .replace(/localStorage\.setItem\('myprogress_theme_pref'/g, 'localStorage.setItem(STORAGE_KEYS.THEME')
  .replace(/localStorage\.setItem\('myprogress_blocks_v28'/g, 'localStorage.setItem(STORAGE_KEYS.BLOCKS')
  .replace(/localStorage\.setItem\('myprogress_routines_v28'/g, 'localStorage.setItem(STORAGE_KEYS.ROUTINES')
  .replace(/localStorage\.setItem\('myprogress_hist_v28'/g, 'localStorage.setItem(STORAGE_KEYS.HISTORY')
  .replace(/localStorage\.setItem\('myprogress_lib_v27'/g, 'localStorage.setItem(STORAGE_KEYS.LIBRARY')
  .replace(/localStorage\.setItem\('myprogress_diary_v28'/g, 'localStorage.setItem(STORAGE_KEYS.DIARY')
  .replace(
    "['myprogress_blocks_v27', 'myprogress_routines_v27', 'myprogress_hist_v27', 'myprogress_diary_v27']",
    'LEGACY_KEYS_V27',
  );

const imports = `import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MUSCLE_GROUPS } from '../constants/muscles';
import { MOCK_LIBRARY, DEFAULT_BLOCKS, DEFAULT_ROUTINES } from '../constants/defaults';
import { STORAGE_KEYS, LEGACY_KEYS_V27 } from '../constants/storageKeys';
import { toLocalISODate } from '../utils/date';
import { loadSafely } from '../utils/storage';
import { generateMonthDays } from '../utils/calendar';
import { initAudio, playBeep, playCelebrationSound } from '../services/audio';

export function useGymApp() {
`;

const returnBlock = `
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
    statsRoutineId, setStatsRoutineId,
    expandedEx, setExpandedEx,
    searchTerm, setSearchTerm,
    celebrationKey,
    showNewExForm, setShowNewExForm,
    showMultiSelect, setShowMultiSelect,
    showDeleteModal, setShowDeleteModal,
    showFullCalendar, setShowFullCalendar,
    calendarViewDate, setCalendarViewDate,
    newExData, setNewExData,
    editingExId, setEditingExId,
    editingExData, setEditingExData,
    selectedExIds, setSelectedExIds,
    timerRemaining, isTimerRunning, isTimerFinished, soundEnabled,
    workoutProgress,
    getAlias,
    changeDate,
    goToToday,
    scrollRoutineIntoView,
    startTimer, stopTimer, closeTimer, add15sToTimer, toggleSound,
    changeRoutineManually,
    handleAddRoutineBlock,
    confirmDeleteRoutine,
    handleAddNewExercise,
    startEditingEx, saveEditedEx, deleteExerciseFromLibrary,
    filteredLibrary, groupedLibrary,
    toggleExSelection, confirmMultiAdd,
    removeExerciseFromRoutine,
    updateSessionData,
    handleInputBlur,
    toggleComplete,
    fullCalendarGrid, displayMonthName,
    currentDayData, currentRoutineExercises, currentBlock, currentRoutineName,
    statsChartData,
  };
}
`;

fs.writeFileSync('src/hooks/useGymApp.js', imports + hookBody + returnBlock);
console.log('useGymApp.js written');
