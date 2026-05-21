import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toLocalISODate } from '../utils/date';
import { getDayCalendarBadge } from '../utils/diaryDisplay';

export default function FullCalendarModal({ app }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-200">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => app.setShowFullCalendar(false)} />
    
    <div className={`relative w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl border transition-colors duration-500 ${app.isDark ? 'bg-[#121212]/90 border-white/10' : 'bg-white/95 border-slate-200'}`}>
    
    <div className="flex justify-between items-center mb-6">
    <button
    onClick={() => app.setCalendarViewDate(new Date(app.calendarViewDate.getFullYear(), app.calendarViewDate.getMonth() - 1, 1))}
    className={`p-2 rounded-full transition-colors ${app.isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'}`}
    >
    <ChevronLeft size={24} />
    </button>
    <h3 className={`font-black text-lg uppercase tracking-widest ${app.isDark ? 'text-white' : 'text-slate-800'}`}>
    {app.displayMonthName}
    </h3>
    <button
    onClick={() => app.setCalendarViewDate(new Date(app.calendarViewDate.getFullYear(), app.calendarViewDate.getMonth() + 1, 1))}
    className={`p-2 rounded-full transition-colors ${app.isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'}`}
    >
    <ChevronRight size={24} />
    </button>
    </div>
    
    <div className="grid grid-cols-7 gap-1 mb-2">
    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
    <div key={day} className={`text-center text-[10px] font-black uppercase ${app.isDark ? 'text-slate-500' : 'text-slate-400'}`}>
    {day}
    </div>
    ))}
    </div>
    
    <div className="grid grid-cols-7 gap-1">
    {app.fullCalendarGrid.map((dateStr, idx) => {
    if (!dateStr) return <div key={idx} className="h-10" />;
    
    const isSelected = app.selectedDate === dateStr;
    const isToday = toLocalISODate(new Date()) === dateStr;
    
    const dObj = new Date(dateStr + 'T12:00:00Z');
    const dayNum = dObj.getDate();
    
    const dayData = app.diary[dateStr];
    const displayAlias = getDayCalendarBadge(dayData, app.routines, app.getAlias);
    
    return (
    <button
    key={dateStr}
    onClick={() => {
    app.changeDate(dateStr);
    app.setShowFullCalendar(false);
    }}
    className={`h-12 w-full flex flex-col items-center justify-center rounded-xl relative transition-all ${
    isSelected
    ? (app.isDark ? 'bg-purple-600/30 border border-purple-500' : 'bg-purple-100 border border-purple-300')
    : isToday
    ? (app.isDark ? 'bg-white/10' : 'bg-slate-100')
    : (app.isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50')
    }`}
    >
    <span className={`font-black text-sm ${isSelected ? (app.isDark ? 'text-purple-300' : 'text-purple-700') : isToday ? (app.isDark ? 'text-white' : 'text-slate-900') : (app.isDark ? 'text-slate-400' : 'text-slate-500')}`}>
    {dayNum}
    </span>
    {displayAlias && (
    <span className={`text-[9px] font-black leading-none mt-0.5 ${app.isDark ? 'text-emerald-400 drop-shadow-[0_0_2px_rgba(16,185,129,0.5)]' : 'text-emerald-500'}`}>
    {displayAlias}
    </span>
    )}
    </button>
    )
    })}
    </div>
    
    <button
    onClick={() => app.setShowFullCalendar(false)}
    className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-colors border ${app.isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
    >
    Cerrar
    </button>
    </div>
    </div>
  );
}
