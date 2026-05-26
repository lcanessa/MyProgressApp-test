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
  return (
    <nav
      className={`fixed bottom-0 left-0 w-full z-40 transition-colors duration-500 ${
        app.isDark
          ? 'bg-[#0f172a] backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
          : 'bg-white backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(100,100,111,0.05)]'
      }`}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
    >
      {/* "Pollera": bloque que cuelga por debajo para cubrir cualquier hueco del Safe Area */}
      <div
        className="absolute top-full left-0 w-full h-[50px]"
        style={{ backgroundColor: app.isDark ? '#0f172a' : '#ffffff' }}
      />

      {/* Contenedor centralizado para no estirar demasiado los íconos en pantallas anchas */}
      <div className="w-full max-w-md mx-auto px-2 flex justify-between items-center relative h-16">
        {TABS.map((tab) => {
          const isActive = app.activeTab === tab.id;

          if (tab.center) {
            // Botón central: anclado absoluto para que sobresalga de la barra hacia arriba
            return (
              <div key={tab.id} className="relative flex-1 flex justify-center h-full items-center">
                <button
                  onClick={() => app.setActiveTab(tab.id)}
                  className={`absolute -top-6 flex items-center justify-center w-[3.5rem] h-[3.5rem] rounded-full transition-all duration-300 ${
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
              onClick={() => app.setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 ${
                isActive
                  ? (app.isDark ? 'text-purple-400' : 'text-purple-600')
                  : (app.isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700')
              }`}
            >
              {tab.icon}
              {/* Si quisieras agregar texto debajo del icono en el futuro, iría aquí */}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
