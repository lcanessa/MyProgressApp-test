import { Sun, Moon, CalendarDays, ClipboardList, List, Settings, PersonStanding } from 'lucide-react';
import MyProgressLogo from '../brand/MyProgressLogo';
import TabPageTitle from './TabPageTitle';
import DayCalendarStrip from './DayCalendarStrip';
import RoutineSelectorStrip from './RoutineSelectorStrip';
import WorkoutProgressBar from './WorkoutProgressBar';

export default function AppHeader({ app }) {
  return (
    <header className="app-header sticky top-0 z-30 shrink-0 flex flex-col pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex justify-between items-center px-4 pt-2 pb-3">
        <MyProgressLogo isDark={app.isDark} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => app.setIsDark(!app.isDark)}
            className={`p-2 rounded-full transition-colors ${app.isDark ? 'text-slate-400 hover:text-yellow-400 hover:bg-white/5' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100/80'}`}
          >
            {app.isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {app.activeTab === 'workout' && (
            <div className="flex items-center gap-1 animate-in fade-in">
              <button
                onClick={() => {
                  const todayObj = new Date();
                  app.setCalendarViewDate(todayObj);
                  app.setShowFullCalendar(true);
                }}
                className={`p-1.5 rounded-xl transition-colors border ${app.isDark ? 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20' : 'text-purple-600 bg-white/25 hover:bg-white/40 border-purple-200/40 backdrop-blur-sm'}`}
              >
                <CalendarDays size={18} />
              </button>
              <button
                type="button"
                onClick={app.goToToday}
                className={`text-[9px] font-semibold px-2 py-1 rounded-lg transition-colors border ${app.isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border-white/5' : 'bg-white/25 text-slate-600 hover:bg-white/40 hover:text-slate-900 border-purple-200/40 backdrop-blur-sm'}`}
              >
                Ir a hoy
              </button>
            </div>
          )}
        </div>
      </div>

      {app.activeTab === 'workout' && <DayCalendarStrip app={app} blend />}

      {app.activeTab === 'workout' && <RoutineSelectorStrip app={app} blend />}

      {app.activeTab === 'workout' && <WorkoutProgressBar app={app} />}

      {app.activeTab === 'edit' && (
        <div className="px-4 pb-2">
          <TabPageTitle
            icon={ClipboardList}
            title="Rutinas"
            subtitle="Organizá y editá tus bloques de entrenamiento"
            isDark={app.isDark}
            className="mb-3"
            glass
          />
          <RoutineSelectorStrip app={app} showAddButton blend />
        </div>
      )}

      {app.activeTab === 'library' && (
        <div className="px-4 pb-3">
          <TabPageTitle
            icon={List}
            title="Ejercicios"
            subtitle="Catálogo y videos de referencia"
            isDark={app.isDark}
            className="mb-0"
            glass
          />
        </div>
      )}

      {app.activeTab === 'body' && (
        <div className="px-4 pb-3">
          <TabPageTitle
            icon={PersonStanding}
            title="Mapa muscular"
            subtitle="Volumen histórico por grupo muscular"
            isDark={app.isDark}
            className="mb-0"
            glass
          />
        </div>
      )}

      {app.activeTab === 'settings' && (
        <div className="px-4 pb-3">
          <TabPageTitle
            icon={Settings}
            title="Configuración"
            subtitle="Ajustes y copia de seguridad"
            isDark={app.isDark}
            className="mb-0"
            glass
          />
        </div>
      )}

    </header>
  );
}
