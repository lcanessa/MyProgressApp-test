import { Dumbbell, ClipboardList, List, Crown, Settings } from 'lucide-react';

// Orden: Destacados · Rutinas · [Datos del día – centro] · Catálogo · Configuración
const TABS = [
  { id: 'highlights', icon: <Crown        size={20} strokeWidth={2.5} />, center: false },
  { id: 'edit',       icon: <ClipboardList size={20} strokeWidth={2.5} />, center: false },
  { id: 'workout',    icon: <Dumbbell     size={22} strokeWidth={2.8} />, center: true  },
  { id: 'library',    icon: <List         size={20} strokeWidth={2.5} />, center: false },
  { id: 'settings',   icon: <Settings     size={20} strokeWidth={2.5} />, center: false },
];

export default function BottomNav({ app }) {
  return (
    <nav className="fixed bottom-nav-bar z-40 flex justify-center items-end pointer-events-none">
      <div
        className={`w-full max-w-sm rounded-[2rem] px-1.5 py-1.5 flex justify-between items-center pointer-events-auto ${
          app.isDark
            ? 'bg-[#0f172a]/60 backdrop-blur-2xl backdrop-saturate-[150%] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
            : 'bg-white/70 backdrop-blur-2xl backdrop-saturate-[150%] border border-white/60 shadow-[0_10px_40px_rgba(100,100,111,0.1)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]'
        }`}
      >
        {TABS.map((tab) => {
          const isActive = app.activeTab === tab.id;

          if (tab.center) {
            // Botón central: círculo que sobresale simétricamente de la barra
            return (
              <button
                key={tab.id}
                onClick={() => app.setActiveTab(tab.id)}
                className={`relative flex items-center justify-center w-13 h-13 rounded-full shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-purple-500 text-white scale-105'
                    : (app.isDark
                        ? 'bg-purple-600/80 text-white hover:bg-purple-500'
                        : 'bg-purple-500 text-white hover:bg-purple-600')
                }`}
                style={{
                  width: 52, height: 52,
                  marginTop: -10, marginBottom: -10,
                  boxShadow: '0 4px 20px rgba(168,85,247,0.5)',
                }}
              >
                {tab.icon}
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => app.setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? (app.isDark ? 'bg-white/10 text-purple-400' : 'bg-black/5 text-purple-600')
                  : (app.isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
              }`}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
