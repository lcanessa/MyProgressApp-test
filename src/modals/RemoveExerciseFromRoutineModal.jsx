import { Trash2 } from 'lucide-react';

export default function RemoveExerciseFromRoutineModal({ app }) {
  const idx = app.routineExerciseIndexToRemove;
  const ex = idx != null ? (app.routines[app.activeRoutineId] || [])[idx] : null;
  const name = ex?.customName || ex?.name || 'este ejercicio';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-200">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => app.setRoutineExerciseIndexToRemove(null)} />
    <div className={`relative w-full max-w-sm rounded-[2rem] p-6 flex flex-col shadow-2xl border transition-colors duration-500 ${app.isDark ? 'bg-[#121212]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 border ${app.isDark ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
    <Trash2 size={24} />
    </div>
    <h3 className={`font-black text-xl mb-2 ${app.isDark ? 'text-white' : 'text-slate-800'}`}>¿Quitar de la rutina?</h3>
    <p className={`text-sm mb-6 ${app.isDark ? 'text-slate-400' : 'text-slate-500'}`}>
    Vas a quitar <strong>&quot;{name}&quot;</strong> de esta rutina. Se borrarán también los pesos y repeticiones guardados de este ejercicio en el diario. Esta acción no se puede deshacer.
    </p>
    <div className="flex gap-3">
    <button onClick={() => app.setRoutineExerciseIndexToRemove(null)} className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors border ${app.isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}>Cancelar</button>
    <button type="button" onClick={app.confirmRemoveExerciseFromRoutine} className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors border border-transparent bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20">Quitar</button>
    </div>
    </div>
    </div>
    
  );
}
