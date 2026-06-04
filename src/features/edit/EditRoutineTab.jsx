import { AlertTriangle, Edit2, Trash2, Plus, GripVertical, Sparkles } from 'lucide-react';
import SortableExerciseList from '../../components/edit/SortableExerciseList';
import ExercisePlayButton from '../../components/exercise/ExercisePlayButton';

export default function EditRoutineTab({ app }) {
  if (app.activeBlocks.length === 0) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className={`rounded-3xl p-10 text-center border shadow-xl ${app.isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-200'}`}>
          <p className={`font-bold text-sm mb-2 ${app.isDark ? 'text-slate-300' : 'text-slate-600'}`}>No tenés rutinas activas</p>
          <p className={`text-xs ${app.isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tocá el botón + arriba para crear una, o cargá las recomendadas.</p>
        </div>
        {app.showRecommendedRoutinesButton && (
          <button
            type="button"
            onClick={app.loadRecommendedRoutines}
            className={`w-full py-3.5 rounded-2xl border font-black text-sm flex items-center justify-center gap-2 transition-colors ${
              app.isDark
                ? 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-white'
                : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-400'
            }`}
          >
            <Sparkles size={18} /> Cargar rutinas recomendadas
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
    
    {app.currentBlock?.isArchived && (
    <div className={`p-4 rounded-2xl mb-4 border flex gap-3 ${app.isDark ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
    <AlertTriangle size={20} className="shrink-0" />
    <p className="text-xs font-medium">Esta rutina está archivada porque la eliminaste. Puedes verla pero ya no puedes modificarla ni agregarle ejercicios.</p>
    </div>
    )}

    <div className="flex items-center gap-3 mb-2">
    <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl border shadow-sm ${app.isDark ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
    {app.getAlias(app.currentBlock?.id)}
    </div>
    <div className="flex-1 relative">
    <input
    value={app.currentRoutineName}
    disabled={app.currentBlock?.isArchived}
    onChange={(e) => {
    const newBlocks = app.routineBlocks.map(b => b.id === app.activeRoutineId ? { ...b, name: e.target.value } : b);
    app.setRoutineBlocks(newBlocks);
    }}
    placeholder="Nombre de la rutina..."
    className={`w-full bg-transparent border-b-2 font-black text-[16px] pb-1 outline-none transition-colors ${
    app.isDark ? 'border-white/10 focus:border-purple-500 text-white placeholder-white/20' : 'border-slate-200 focus:border-purple-500 text-slate-800 placeholder-slate-300'
    }`}
    />
    {!app.currentBlock?.isArchived && <Edit2 size={14} className={`absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity ${app.isDark ? 'text-white/20' : 'text-slate-300'}`} />}
    </div>
    {!app.currentBlock?.isArchived && (
    <button
    onClick={() => app.setShowDeleteModal(true)}
    className={`p-3 rounded-xl transition-colors border shadow-sm ${app.isDark ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border-red-500/20' : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'}`}
    title="Eliminar Rutina"
    >
    <Trash2 size={18} />
    </button>
    )}
    </div>

    {!app.currentBlock?.isArchived && app.showRecommendedRoutinesButton && (
    <button
    type="button"
    onClick={app.loadRecommendedRoutines}
    className={`w-full py-3.5 rounded-2xl border font-black text-sm flex items-center justify-center gap-2 transition-colors mb-4 ${
    app.isDark
      ? 'border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-white'
      : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-400'
    }`}
    >
    <Sparkles size={18} /> Cargar rutinas recomendadas
    </button>
    )}

    {!app.currentBlock?.isArchived && (
    <button
    onClick={() => { app.setShowMultiSelect(true); app.setSelectedExIds([]); app.setSearchTerm(''); }}
    className={`w-full py-4 border border-dashed rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-colors mb-6 ${app.isDark ? 'border-purple-500/50 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-white' : 'border-purple-300 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:border-purple-400'}`}
    >
    <Plus size={18} /> Agregar Ejercicio
    </button>
    )}
    
    {app.currentRoutineExercises.length > 0 && (
    <SortableExerciseList
    items={app.currentRoutineExercises}
    disabled={!!app.currentBlock?.isArchived}
    isDark={app.isDark}
    onReorder={app.reorderRoutineExercises}
    >
    {(ex, idx, { dragHandleProps }) => (
    <div data-sortable-card className={`p-5 rounded-3xl border flex flex-col shadow-xl gap-4 ${app.isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-200'}`}>
    <div className="flex justify-between items-start gap-2">
    <input
    value={ex.customName}
    disabled={app.currentBlock?.isArchived}
    onChange={(e) => {
    const newR = [...app.currentRoutineExercises];
    newR[idx].customName = e.target.value;
    app.setRoutines({...app.routines, [app.activeRoutineId]: newR});
    }}
    className={`font-black text-[16px] flex-1 min-w-0 bg-transparent border-b focus:border-purple-500 outline-none truncate pb-1 ${app.isDark ? 'text-white border-white/10' : 'text-slate-800 border-slate-200'}`}
    />
    <div className="flex items-center gap-0.5 shrink-0">
    <ExercisePlayButton
    isDark={app.isDark}
    onClick={() => app.openExerciseVideo(ex)}
    />
    {!app.currentBlock?.isArchived && (
    <button type="button" onClick={() => app.setRoutineExerciseIndexToRemove(idx)} className={`p-1.5 rounded-lg transition-colors ${app.isDark ? 'text-white/20 hover:text-red-400 hover:bg-white/5' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`} aria-label="Quitar ejercicio"><Trash2 size={16} /></button>
    )}
    {dragHandleProps && (
    <div
    {...dragHandleProps}
    className={`${dragHandleProps.className} ${app.isDark ? 'text-white/25 hover:text-white/50' : 'text-slate-300 hover:text-slate-500'}`}
    >
    <GripVertical size={18} className="pointer-events-none" />
    </div>
    )}
    </div>
    </div>
    <div className="flex gap-4">
    <div className="flex-1">
    <span className={`text-[9px] font-black uppercase ml-1 ${app.isDark ? 'text-slate-500' : 'text-slate-400'}`}>Series</span>
    <input type="number" disabled={app.currentBlock?.isArchived} value={ex.sets} onChange={(e) => {const newR=[...app.currentRoutineExercises]; newR[idx].sets=e.target.value; app.setRoutines({...app.routines, [app.activeRoutineId]: newR})}} className={`w-full text-[16px] font-bold rounded-xl py-2 px-3 text-center outline-none mt-1 transition-colors border ${app.isDark ? 'text-white bg-white/5 border-white/10 focus:border-purple-500' : 'text-purple-600 bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`} />
    </div>
    <div className="flex-[2]">
    <span className={`text-[9px] font-black uppercase ml-1 ${app.isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reps Obj.</span>
    <input value={ex.targetReps} disabled={app.currentBlock?.isArchived} onChange={(e) => {const newR=[...app.currentRoutineExercises]; newR[idx].targetReps=e.target.value; app.setRoutines({...app.routines, [app.activeRoutineId]: newR})}} className={`w-full text-[16px] font-bold rounded-xl py-2 px-3 text-center outline-none mt-1 transition-colors border ${app.isDark ? 'text-white bg-white/5 border-white/10 focus:border-purple-500' : 'text-purple-600 bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`} />
    </div>
    </div>
    </div>
    )}
    </SortableExerciseList>
    )}
    
    {app.currentRoutineExercises.length === 0 && !app.currentBlock?.isArchived && (
    <div className={`text-center py-10 opacity-50 font-bold text-sm ${app.isDark ? 'text-white' : 'text-slate-500'}`}>
    Empieza agregando tu primer ejercicio.
    </div>
    )}
    </div>
  );
}
