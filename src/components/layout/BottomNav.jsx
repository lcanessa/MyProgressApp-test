import { Dumbbell, ClipboardList, List, Crown, Settings } from 'lucide-react';

// Orden: Destacados · Rutinas · [Datos del día – centro] · Catálogo · Configuración
const TABS = [
  { id: 'highlights', icon: <Crown        size={24} strokeWidth={2.5} />, center: false },
  { id: 'edit',       icon: <ClipboardList size={24} strokeWidth={2.5} />, center: false },
  { id: 'workout',    icon: <Dumbbell     size={28} strokeWidth={2.5} />, center: true  },
  { id: 'library',    icon: <List         size={24} strokeWidth={2.5} />, center: false },
  { id: 'settings',   icon: <Settings     size={24} strokeWidth={2.5} />, center: false },
];

export default function BottomNav({ app }) {
  const handleNav = (e, tabId) => {
    e.stopPropagation();
    app.setActiveTab(tabId);
  };

  return (
    <nav 
      className={`fixed bottom-0 left-0 w-full z-40 flex flex-col transition-colors duration-500 ${
        app.isDark
          ? 'bg-[#0f172a]/50 backdrop-blur-3xl backdrop-saturate-[180%] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]'
          : 'bg-white/50 backdrop-blur-3xl backdrop-saturate-[180%] border-t border-slate-200/60 shadow-[0_-10px_40px_rgba(100,100,111,0.05)]'
      }`}
    >
      {/* Contenedor estricto para los íconos */}
      <div className="w-full max-w-md mx-auto px-2 flex justify-between items-center relative h-16">
        {TABS.map((tab) => {
          const isActive = app.activeTab === tab.id;

          if (tab.center) {
            return (
              <div key={tab.id} className="relative flex-1 flex justify-center h-full items-center">
                <button
                  onTouchStart={(e) => handleNav(e, tab.id)}
                  onClick={(e) => handleNav(e, tab.id)}
                  className={`absolute -top-5 flex items-center justify-center w-[3.5rem] h-[3.5rem] rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-purple-500 text-white scale-105 shadow-[0_4px_20px_rgba(168,85,247,0.5)]'
                      : (app.isDark
                          ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-black/50'
                          : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/30')
                  }`}
                >
                  {tab.icon}
                </button>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onTouchStart={(e) => handleNav(e, tab.id)}
              onClick={(e) => handleNav(e, tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 ${
                isActive
                  ? (app.isDark ? 'text-purple-400' : 'text-purple-600')
                  : (app.isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700')
              }`}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>

      {/* Bloque fantasma exclusivo para el Safe Area de iOS */}
      <div className="w-full" style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
}
