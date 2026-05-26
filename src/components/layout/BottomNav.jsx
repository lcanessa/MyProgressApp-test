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
    <div
      className="fixed bottom-0 left-0 w-full z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Pill flotante con glass */}
      <div className="mx-4 mb-3">
        <nav
          className={`relative w-full max-w-md mx-auto rounded-[2rem] transition-colors duration-500 ${
            app.isDark
              ? 'bg-[#0f172a]/60 backdrop-blur-3xl backdrop-saturate-[180%] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]'
              : 'bg-white/60 backdrop-blur-3xl backdrop-saturate-[180%] border border-slate-200/60 shadow-[0_8px_32px_rgba(100,100,111,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]'
          }`}
        >
          <div className="px-2 flex justify-between items-center relative h-16">
            {TABS.map((tab) => {
              const isActive = app.activeTab === tab.id;

              if (tab.center) {
                return (
                  <div key={tab.id} className="relative flex-1 flex justify-center h-full items-center">
                    <button
                      onTouchStart={(e) => handleNav(e, tab.id)}
                      onClick={(e) => handleNav(e, tab.id)}
                      className={`absolute -top-4 flex items-center justify-center w-[3.25rem] h-[3.25rem] rounded-full transition-all duration-300 ${
                        isActive
                          ? 'bg-purple-500 text-white scale-105 shadow-[0_4px_20px_rgba(168,85,247,0.6)]'
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
                      : (app.isDark ? 'text-slate-500 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700')
                  }`}
                >
                  {tab.icon}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
