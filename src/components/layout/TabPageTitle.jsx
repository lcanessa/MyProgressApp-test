export default function TabPageTitle({ icon: Icon, title, subtitle, isDark, className = '', glass = false }) {
  const iconSurface = glass
    ? isDark
      ? 'bg-purple-500/15 text-purple-400 border border-white/5'
      : 'bg-purple-500/10 text-purple-600 border border-purple-200/30 backdrop-blur-sm'
    : isDark
      ? 'bg-purple-500/15 text-purple-400'
      : 'bg-purple-100 text-purple-600';

  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      <div className={`p-2.5 rounded-2xl shrink-0 ${iconSurface}`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
        {subtitle && (
          <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}
