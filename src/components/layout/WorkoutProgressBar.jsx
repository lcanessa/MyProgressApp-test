export default function WorkoutProgressBar({ app }) {
  if (app.workoutProgress.total === 0) return null;

  return (
    <div className="px-4 pb-3 animate-in fade-in duration-300">
      <div className="flex w-full items-center gap-2.5">
        <div className={`h-1.5 min-w-0 flex-1 overflow-hidden rounded-full ${app.isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400 transition-[width] duration-500 ease-out shadow-[0_0_8px_rgba(168,85,247,0.5)]"
            style={{ width: `${app.workoutProgress.percent}%` }}
          />
        </div>
        <span
          className={`shrink-0 text-[10px] font-black tabular-nums ${app.workoutProgress.percent === 100 ? 'text-purple-500' : app.isDark ? 'text-slate-400' : 'text-slate-500'}`}
        >
          {app.workoutProgress.percent}%
        </span>
      </div>
    </div>
  );
}
