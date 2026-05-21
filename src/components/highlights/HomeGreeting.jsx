import { useMemo } from 'react';
import { Dumbbell, ChevronRight } from 'lucide-react';
import { toLocalISODate } from '../../utils/date';
import { resolveRoutineIdForDate } from '../../utils/routineRotation';
import { getMotivationalGreeting } from '../../utils/motivationalGreeting';

export default function HomeGreeting({ app, weekStreak = 0 }) {
  const isDark = app.isDark;
  const todayStr = toLocalISODate(new Date());

  const todayRoutineId = useMemo(
    () => resolveRoutineIdForDate(app.diary, todayStr, app.activeBlocks),
    [app.diary, todayStr, app.activeBlocks]
  );

  const todayBlock = app.activeBlocks.find((b) => b.id === todayRoutineId);
  const todayAlias = todayRoutineId ? app.getAlias(todayRoutineId) : '';
  const { title, subtitle } = getMotivationalGreeting({ weekStreak });
  const noRoutines = app.activeBlocks.length === 0;

  return (
    <section className="space-y-3">
      <div>
        <h1 className={`text-2xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h1>
        <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={app.startTodayWorkout}
        disabled={noRoutines}
        className={`w-full flex items-center gap-4 rounded-3xl border p-4 text-left transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${
          isDark
            ? 'bg-gradient-to-r from-purple-600/90 to-purple-500/80 border-purple-400/30 text-white shadow-lg shadow-purple-900/40 hover:from-purple-500 hover:to-purple-400/90'
            : 'bg-gradient-to-r from-purple-600 to-purple-500 border-purple-400/40 text-white shadow-lg shadow-purple-300/50 hover:from-purple-500 hover:to-purple-600'
        }`}
      >
        <div
          className={`p-3 rounded-2xl shrink-0 ${isDark ? 'bg-white/15' : 'bg-white/25'}`}
        >
          <Dumbbell size={26} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80">
            Rutina de hoy
          </p>
          {todayBlock ? (
            <>
              <p className="text-lg font-black leading-tight mt-0.5 truncate">
                Rutina {todayAlias}
              </p>
              <p className="text-xs font-medium text-white/85 truncate mt-0.5">
                {todayBlock.name}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold mt-0.5">Creá una rutina para empezar</p>
          )}
        </div>
        <ChevronRight size={22} className="shrink-0 text-white/90" strokeWidth={2.5} />
      </button>
    </section>
  );
}
