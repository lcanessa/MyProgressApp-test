import { useLayoutEffect } from 'react';
import { useGymApp } from './hooks/useGymApp';
import { useAuth } from './context/AuthContext';
import AuthScreen from './features/auth/AuthScreen';
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

function AppContent({ userId, firstName }) {
  const app = useGymApp(userId);
  const pwaUpdate = usePwaUpdate();
  useAppViewport();

  useLayoutEffect(() => {
    applyAppTheme(app.isDark);
  }, [app.isDark]);

  useLayoutEffect(() => {
    app.mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    refreshAppViewport();
  }, [app.activeTab]);

  if (app.dataLoading) return (
    <div className={`min-h-screen w-full flex items-center justify-center ${app.isDark ? 'bg-[#050505]' : 'bg-[#f8fafc]'}`}>
      <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div
      className={`h-[100dvh] w-full flex flex-col overflow-hidden selection:bg-purple-500/30 ${app.isDark ? 'bg-[#050505] text-slate-200' : 'bg-[#f8fafc] text-slate-800'}`}
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

      <main ref={app.mainRef} className="flex-1 w-full relative z-10 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] space-y-4">
          {app.activeTab === 'workout' && <WorkoutTab app={app} />}
          {app.activeTab === 'highlights' && <HighlightsTab app={app} firstName={firstName} />}
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

export default function App() {
  const { user, loading, firstName } = useAuth();

  if (loading) return null;
  if (!user) return <AuthScreen isDark={true} />;
  return <AppContent userId={user.id} firstName={firstName} />;
}
