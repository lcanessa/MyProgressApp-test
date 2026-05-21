export default function WeeklyActivityChart({ weeks, maxDays, isDark }) {
  const peak = Math.max(1, maxDays);
  const trackClass = isDark ? 'bg-white/5' : 'bg-slate-100';

  return (
    <div className={`rounded-3xl border p-5 ${isDark ? 'bg-[#121212]/80 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
      <h3 className={`text-[10px] font-black uppercase tracking-widest mb-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
        Actividad semanal
      </h3>
      <div className="flex items-end justify-between gap-1.5">
        {weeks.map((w) => {
          const pct = (w.days / peak) * 100;
          const hasDays = w.days > 0;
          return (
            <div key={w.weekKey} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div
                className={`relative w-full rounded-t-lg overflow-hidden flex items-end ${trackClass}`}
                style={{ height: '5.5rem' }}
              >
                <span
                  className={`absolute top-1.5 left-0 right-0 text-center text-[9px] font-black tabular-nums leading-none z-10 pointer-events-none ${
                    hasDays ? (isDark ? 'text-purple-200' : 'text-purple-700') : isDark ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {w.days}
                </span>
                <div
                  className={`w-full rounded-t-lg ${
                    hasDays
                      ? 'bg-gradient-to-t from-purple-600 to-violet-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                      : isDark
                        ? 'bg-white/5'
                        : 'bg-slate-200/80'
                  }`}
                  style={{ height: `${Math.max(hasDays ? 16 : 8, pct)}%` }}
                />
              </div>
              <span
                className={`text-[8px] font-bold uppercase truncate w-full text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
              >
                {w.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
