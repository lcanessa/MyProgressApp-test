import { CheckCircle2 } from 'lucide-react';
import HighlightCardCornerFade from './HighlightCardCornerFade';

export default function Last7DaysStrip({ days, isDark }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 ${isDark ? 'bg-[#121212]/80 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
    >
      <HighlightCardCornerFade isDark={isDark} />
      <h3 className={`relative text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
        Últimos 7 días
      </h3>
      <div className="relative flex justify-between gap-2">
        {days.map((d) => (
          <div key={d.dateStr} className="flex flex-col items-center gap-2 flex-1">
            <span className={`text-[9px] font-bold uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {d.label}
            </span>
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition-colors ${
                d.complete
                  ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                  : d.trained
                    ? isDark
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-purple-100 border-purple-200 text-purple-600'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-slate-600'
                      : 'bg-slate-50 border-slate-200 text-slate-300'
              }`}
            >
              {d.complete ? <CheckCircle2 size={18} /> : d.trained ? <span className="w-2 h-2 rounded-full bg-current" /> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
