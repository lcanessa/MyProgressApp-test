import { Dumbbell, ClipboardList, List, Settings, Crown } from 'lucide-react';

export default function BottomNav({ app }) {
  return (
    <nav className="fixed bottom-nav-bar z-40 flex justify-center items-end pointer-events-none">
      <div
        className={`w-full max-w-sm rounded-[2rem] px-1.5 py-2 flex justify-between items-center pointer-events-auto ${
          app.isDark
            ? 'bg-[#0f172a]/60 backdrop-blur-2xl backdrop-saturate-[150%] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
            : 'bg-white/70 backdrop-blur-2xl backdrop-saturate-[150%] border border-white/60 shadow-[0_10px_40px_rgba(100,100,111,0.1)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]'
        }`}
      >
        {[
          { id: 'workout', icon: <Dumbbell size={20} strokeWidth={2.5} /> },
          { id: 'highlights', icon: <Crown size={20} strokeWidth={2.5} /> },
          { id: 'edit', icon: <ClipboardList size={20} strokeWidth={2.5} /> },
          { id: 'library', icon: <List size={20} strokeWidth={2.5} /> },
          { id: 'settings', icon: <Settings size={20} strokeWidth={2.5} /> },
        ].map((tab) => {
          const isActive = app.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => app.setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-[1.15rem] transition-all duration-300 ${
                isActive
                  ? (app.isDark ? 'bg-white/10 text-purple-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white text-purple-600 shadow-sm border border-slate-100')
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
