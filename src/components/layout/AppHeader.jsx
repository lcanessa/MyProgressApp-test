import { CalendarDays, Sun, Moon, ClipboardList, List, Settings } from 'lucide-react';
import MyProgressLogo from '../brand/MyProgressLogo';
import DayCalendarStrip from './DayCalendarStrip';
import RoutineSelectorStrip from './RoutineSelectorStrip';
import WorkoutProgressBar from './WorkoutProgressBar';

const SECTIONS = {
  edit:     { title: 'Rutinas',        Icon: ClipboardList },
  library:  { title: 'Ejercicios',     Icon: List },
  settings: { title: 'Configuración',  Icon: Settings },
};

export default function AppHeader({ app }) {
  const section = SECTIONS[app.activeTab] ?? null;
  const isDark = app.isDark;

  return (
    <header className={`shrink-0 flex flex-col pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-3xl backdrop-saturate-[180%] transition-colors duration-500 ${
      isDark ? 'bg-[#050505]/50 border-b border-white/5' : 'bg-white/50 border-b border-slate-200/60'
    }`}>

      {/* Fila 1: logo + acciones */}
      <div className="flex justify-between items-center px-4 pt-1 pb-2">
        <MyProgressLogo isDark={isDark} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => app.setIsDark(!isDark)}
            className={`p-1.5 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {app.activeTab === 'workout' && (
            <div className="flex items-center gap-1 animate-in fade-in">
              <button
                onClick={() => { app.setCalendarViewDate(new Date()); app.setShowFullCalendar(true); }}
                className={`p-1.5 rounded-xl transition-colors border ${isDark ? 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20' : 'text-purple-600 bg-white/25 hover:bg-white/40 border-purple-200/40 backdrop-blur-sm'}`}
              >
                <CalendarDays size={18} />
              </button>
              <button
                type="button"
                onClick={app.goToToday}
                className={`text-[9px] font-semibold px-2 py-1 rounded-lg transition-colors border ${isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border-white/5' : 'bg-white/25 text-slate-600 hover:bg-white/40 hover:text-slate-900 border-purple-200/40 backdrop-blur-sm'}`}
              >
                Ir a hoy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fila 2: título de sección con ícono */}
      {section && (
        <div className="px-4 pb-3 pt-1 flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/15' : 'bg-purple-100'}`}>
            <section.Icon size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} strokeWidth={2.5} />
          </div>
          <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {section.title}
          </h1>
        </div>
      )}

      {/* Workout extras */}
      {app.activeTab === 'workout' && <DayCalendarStrip app={app} blend />}
      {app.activeTab === 'workout' && <RoutineSelectorStrip app={app} blend />}
      {app.activeTab === 'workout' && <WorkoutProgressBar app={app} />}

      {/* Rutinas: selector de rutinas */}
      {app.activeTab === 'edit' && (
        <div className="px-4 pb-3">
          <RoutineSelectorStrip app={app} showAddButton blend />
        </div>
      )}
    </header>
  );
}
