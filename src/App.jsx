import { useLayoutEffect } from 'react';
import { useGymApp } from './hooks/useGymApp';
import { useAppViewport } from './hooks/useAppViewport';
import AppBackground from './components/layout/AppBackground';
import AppHeader from './components/layout/AppHeader';
import BottomNav from './components/layout/BottomNav';
import UpdateBanner from './components/layout/UpdateBanner';
import { usePwaUpdate } from './hooks/usePwaUpdate';
import RestTimer from './components/workout/RestTimer';
import WorkoutCelebration from './components/workout/WorkoutCelebration';
import WorkoutTab from './features/workout/WorkoutTab';
import EditRoutineTab from './features/edit/EditRoutineTab';
import LibraryTab from './features/library/LibraryTab';
import SettingsTab from './features/settings/SettingsTab';
import HighlightsTab from './features/highlights/HighlightsTab';
import { refreshAppViewport } from './hooks/useAppViewport';
import { applyAppTheme } from './utils/theme';
import DeleteRoutineModal from './modals/DeleteRoutineModal';
import DeleteLibraryExerciseModal from './modals/DeleteLibraryExerciseModal';
import RemoveExerciseFromRoutineModal from './modals/RemoveExerciseFromRoutineModal';
import MultiSelectModal from './modals/MultiSelectModal';
import FullCalendarModal from './modals/FullCalendarModal';
import ExerciseVideoModal from './modals/ExerciseVideoModal';

export default function App() {
  const app = useGymApp();
  const pwaUpdate = usePwaUpdate();
  useAppViewport();

  useLayoutEffect(() => {
    applyAppTheme(app.isDark);
  }, [app.isDark]);

  useLayoutEffect(() => {
    app.mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    refreshAppViewport();
  }, [app.activeTab]);

  return (
    <div
      className={`h-[100dvh] w-full flex flex-col overflow-hidden relative selection:bg-purple-500/30 bg-[var(--app-bg)] ${app.isDark ? 'text-slate-200' : 'text-slate-800'}`}
    >
      <AppBackground isDark={app.isDark} />

      {app.celebrationKey > 0 && <WorkoutCelebration key={app.celebrationKey} />}

      {app.activeTab === 'workout' && (
        <RestTimer
          isOpen={app.isRestTimerOpen}
          isRunning={app.isTimerRunning}
          timeRemaining={app.timerRemaining}
          isFinished={app.isTimerFinished}
          onStart={app.startTimer}
          onSetDuration={app.setRestDuration}
          onStop={app.stopTimer}
          onAdd15s={app.add15sToTimer}
          onClose={app.closeTimer}
          soundEnabled={app.soundEnabled}
          toggleSound={app.toggleSound}
          isDark={app.isDark}
        />
      )}

      <AppHeader app={app} />

      <main ref={app.mainRef} className="app-scroll no-scrollbar w-full relative z-10">
        <div className="max-w-md mx-auto px-4 pt-4 pb-content-nav space-y-4">
          {app.activeTab === 'workout' && <WorkoutTab app={app} />}
          {app.activeTab === 'highlights' && <HighlightsTab app={app} />}
          {app.activeTab === 'edit' && <EditRoutineTab app={app} />}
          {app.activeTab === 'library' && <LibraryTab app={app} />}
          {app.activeTab === 'settings' && <SettingsTab app={app} pwaUpdate={pwaUpdate} />}
        </div>
      </main>

      {app.showDeleteModal && <DeleteRoutineModal app={app} />}
      {app.libraryExerciseToDelete && <DeleteLibraryExerciseModal app={app} />}
      {app.routineExerciseIndexToRemove != null && <RemoveExerciseFromRoutineModal app={app} />}
      {app.showMultiSelect && <MultiSelectModal app={app} />}
      {app.showFullCalendar && <FullCalendarModal app={app} />}
      {app.exerciseVideo && <ExerciseVideoModal app={app} />}

      <div className="bottom-content-fade" aria-hidden />

      <UpdateBanner status={pwaUpdate.status} onUpdateNow={pwaUpdate.applyUpdate} isDark={app.isDark} />

      <BottomNav app={app} />
    </div>
  );
}
