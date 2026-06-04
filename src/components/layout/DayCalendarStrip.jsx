import { getDayCalendarBadge } from '../../utils/diaryDisplay';

/**
 * @param {boolean} blend - Chips semitransparentes; deja ver el degradé del fondo.
 */
export default function DayCalendarStrip({ app, blend = false }) {
  const edgeFade = blend ? null : 'from-[var(--scroll-fade)] to-transparent';

  const inactiveDay = blend
    ? app.isDark
      ? 'bg-transparent border-white/5 text-slate-500 hover:bg-white/5'
      : 'bg-white/25 border-purple-200/40 text-slate-600 hover:bg-white/40 backdrop-blur-sm'
    : app.isDark
      ? 'bg-transparent border-white/5 text-slate-500 hover:bg-white/5'
      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50';

  const todayDay = blend
    ? app.isDark
      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
      : 'bg-purple-500/15 border-purple-300/50 text-purple-700 backdrop-blur-sm'
    : app.isDark
      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
      : 'bg-purple-50 border-purple-200 text-purple-700';

  return (
    <div className={`relative ${blend ? '' : `border-b ${app.isDark ? 'border-white/5' : 'border-slate-100/80'}`}`}>
      {edgeFade && (
        <>
          <div className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r ${edgeFade} z-10 pointer-events-none`} />
          <div className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l ${edgeFade} z-10 pointer-events-none`} />
        </>
      )}

      <div ref={app.calendarRef} className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2 items-center w-full">
        {app.calendarDays.map((day) => {
          const isSelected = app.selectedDate === day.id;
          const dayData = app.diary[day.id];
          const displayAlias = getDayCalendarBadge(dayData, app.routines, app.getAlias);

          return (
            <button
              key={day.id}
              data-date={day.id}
              onClick={() => app.changeDate(day.id)}
              className={`shrink-0 flex flex-col items-center justify-start pt-1.5 w-[3.25rem] h-14 rounded-2xl border transition-colors relative ${isSelected ? 'is-selected' : ''} ${day.isToday ? 'is-today' : ''} ${
                isSelected
                  ? app.isDark
                    ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] z-20'
                    : 'bg-purple-600 border-purple-500 text-white shadow-md z-20'
                  : day.isToday
                    ? todayDay
                    : inactiveDay
              }`}
            >
              <span
                className={`text-[9px] font-bold uppercase leading-none mb-0.5 ${isSelected ? (app.isDark ? 'text-purple-200' : 'text-purple-100') : ''}`}
              >
                {day.dayName}
              </span>
              <span
                className={`text-lg font-black leading-none ${isSelected ? 'text-white' : app.isDark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                {day.dayNumber}
              </span>
              {displayAlias && (
                <span
                  className={`absolute bottom-1 text-[10px] font-black leading-none ${app.isDark ? 'text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]' : 'text-emerald-500'}`}
                >
                  {displayAlias}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
