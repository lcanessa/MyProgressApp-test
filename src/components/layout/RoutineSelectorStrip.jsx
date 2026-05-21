import { Plus } from 'lucide-react';

/**
 * @param {boolean} blend - Sin fondos opacos en chips; deja ver el degradé de la app.
 */
export default function RoutineSelectorStrip({ app, showAddButton = false, blend = false }) {
  const inactiveChip = blend
    ? app.isDark
      ? 'bg-transparent text-slate-400 border-white/10 hover:bg-white/5 hover:text-slate-200'
      : 'bg-white/25 text-slate-600 border-purple-200/40 hover:bg-white/40 backdrop-blur-sm'
    : app.isDark
      ? 'bg-transparent text-slate-500 border-white/5 hover:bg-white/5'
      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50';

  const activeChip = blend
    ? 'bg-purple-600 border-purple-400/80 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)]'
    : app.isDark
      ? 'bg-white/10 text-white border-white/20 shadow-sm'
      : 'bg-slate-800 text-white border-slate-800 shadow-sm';

  const addBtn = blend
    ? app.isDark
      ? 'border-white/15 text-slate-300 hover:bg-white/10 hover:text-white'
      : 'border-purple-300/50 text-purple-700 bg-white/25 hover:bg-white/40 backdrop-blur-sm'
    : app.isDark
      ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
      : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100';

  return (
    <div
      ref={app.routinesRef}
      className={`flex gap-2 overflow-x-auto no-scrollbar px-4 py-2 items-center ${blend ? '' : 'py-3 animate-in slide-in-from-top-2 fade-in'}`}
    >
      {app.currentBlock?.isArchived && (
        <button
          type="button"
          data-routine-id={app.currentBlock.id}
          className={`shrink-0 px-4 py-2 rounded-xl transition-colors flex items-center justify-center border shadow-sm ${app.isDark ? 'bg-white/5 text-white border-white/20' : 'bg-slate-800 text-white border-slate-800'}`}
        >
          <span className="uppercase text-[10px] font-semibold leading-tight tracking-wide">
            {app.getAlias(app.currentBlock.id)} - {app.currentBlock.name} (Archivada)
          </span>
        </button>
      )}

      {app.activeBlocks.map((block) => {
        const isActive = app.activeRoutineId === block.id && !app.currentBlock?.isArchived;
        return (
          <button
            type="button"
            key={block.id}
            data-routine-id={block.id}
            onClick={() => app.changeRoutineManually(block.id)}
            className={`shrink-0 px-4 py-2 rounded-xl flex items-center justify-center border ${
              isActive ? activeChip : inactiveChip
            }`}
          >
            <span className="uppercase text-[10px] font-semibold leading-tight tracking-wide">
              {app.getAlias(block.id)} - {block.name}
            </span>
          </button>
        );
      })}

      {showAddButton && (
        <button
          onClick={app.handleAddRoutineBlock}
          className={`shrink-0 p-2 rounded-xl border transition-colors ${addBtn}`}
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  );
}
