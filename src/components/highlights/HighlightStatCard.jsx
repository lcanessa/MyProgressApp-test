export default function HighlightStatCard({ icon: Icon, label, value, hint, isDark, accent = 'purple' }) {
  const accents = {
    purple: isDark
      ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
      : 'bg-purple-50 border-purple-200 text-purple-600',
    amber: isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600',
    emerald: isDark
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      : 'bg-emerald-50 border-emerald-200 text-emerald-600',
    sky: isDark ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : 'bg-sky-50 border-sky-200 text-sky-600',
  };

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-2 ${isDark ? 'bg-[#121212]/80 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${accents[accent] || accents.purple}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <p className={`text-2xl font-black tabular-nums leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
        <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          {label}
        </p>
        {hint && <p className={`text-[10px] mt-0.5 leading-snug ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{hint}</p>}
      </div>
    </div>
  );
}
