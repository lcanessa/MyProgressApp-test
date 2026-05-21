import { Medal } from 'lucide-react';

export default function PersonalRecordsCard({ personalRecords, isDark }) {
  const { topRecord, topRecords, totalRecords } = personalRecords;

  if (!topRecord) return null;

  return (
    <div
      className={`rounded-3xl border overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-amber-950/40 via-[#121212] to-[#121212] border-amber-500/25'
          : 'bg-gradient-to-br from-amber-50 via-white to-white border-amber-200 shadow-sm'
      }`}
    >
      <div className="p-5 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'}`}
          >
            <Medal size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>
              Récord personal
            </p>
            <p className={`text-lg font-black leading-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {topRecord.name}
            </p>
          </div>
        </div>
        <p className={`mt-3 text-3xl font-black tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {topRecord.weight}
          <span className={`text-base ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>kg</span>
          {topRecord.reps > 0 && (
            <span className={`text-sm font-bold ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              × {topRecord.reps} reps
            </span>
          )}
        </p>
        <p className={`text-[10px] mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          Registrado el {topRecord.dateLabel}
        </p>
      </div>

      {topRecords.length > 1 && (
        <ul className="px-5 py-3 space-y-2">
          {topRecords.slice(1).map((rec, i) => (
            <li
              key={rec.name}
              className={`flex items-center justify-between gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 w-5 text-center font-black ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                >
                  {i + 2}
                </span>
                <span className="font-bold truncate">{rec.name}</span>
              </span>
              <span className="shrink-0 font-black tabular-nums">
                {rec.weight} kg
                {rec.reps > 0 ? ` · ${rec.reps}r` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}

      {totalRecords > 1 && (
        <p className={`px-5 pb-4 text-[10px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          {totalRecords} ejercicios con récord registrado
        </p>
      )}
    </div>
  );
}
