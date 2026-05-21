import { Search, X, Plus, CheckCircle2, Circle } from 'lucide-react';

export default function MultiSelectModal({ app }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-auto animate-in fade-in duration-200">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => app.setShowMultiSelect(false)} />
    
    <div className={`relative w-full max-w-md mx-auto h-[85vh] rounded-t-[2.5rem] flex flex-col shadow-2xl overflow-hidden border-t border-x transition-colors duration-500 ${app.isDark ? 'bg-[#121212] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
    
    <div className={`p-5 border-b flex items-center justify-between shrink-0 ${app.isDark ? 'border-white/5 bg-[#121212]' : 'border-slate-200 bg-white'}`}>
    <h3 className={`font-black text-lg ${app.isDark ? 'text-white' : 'text-slate-800'}`}>Agregar a <span className="text-purple-500">{app.currentRoutineName}</span></h3>
    <button onClick={() => app.setShowMultiSelect(false)} className={`p-2 rounded-full transition-colors ${app.isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'}`}>
    <X size={20}/>
    </button>
    </div>
    
    <div className={`p-5 shrink-0 border-b ${app.isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-100'}`}>
    <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
    <input
    placeholder="Buscar para agregar..."
    value={app.searchTerm}
    onChange={(e) => app.setSearchTerm(e.target.value)}
    className={`w-full rounded-2xl py-3 pl-12 pr-4 text-[16px] font-bold outline-none transition-colors border ${app.isDark ? 'bg-white/5 border-white/10 text-white focus:border-purple-500 placeholder-white/30' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-500 placeholder-slate-400'}`}
    />
    </div>
    </div>
    
    <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar pb-32">
    {app.groupedAddableLibrary.map(([groupName, exercises]) => (
    <div key={groupName} className="space-y-3">
    <h3 className={`font-black uppercase tracking-widest text-xs pl-2 ${app.isDark ? 'text-purple-400' : 'text-purple-600'}`}>{groupName}</h3>
    {exercises.map(ex => {
    const isSelected = app.selectedExIds.includes(ex.id);
    return (
    <div
    key={ex.id}
    onClick={() => app.toggleExSelection(ex.id)}
    className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
    isSelected
    ? (app.isDark ? 'bg-purple-600/20 border-purple-500/50' : 'bg-purple-50 border-purple-300')
    : (app.isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50')
    }`}
    >
    <div>
    <h4 className={`font-black text-[16px] ${isSelected ? (app.isDark ? 'text-purple-300' : 'text-purple-700') : (app.isDark ? 'text-white' : 'text-slate-800')}`}>{ex.name}</h4>
    </div>
    <div className={`transition-transform ${isSelected ? 'scale-110' : ''}`}>
    {isSelected
    ? <CheckCircle2 size={24} className={app.isDark ? 'text-purple-400' : 'text-purple-600'} fill="currentColor" color={app.isDark ? '#121212' : 'white'} />
    : <Circle size={24} className={app.isDark ? 'text-white/20' : 'text-slate-300'} />
    }
    </div>
    </div>
    );
    })}
    </div>
    ))}
    
    {app.addableLibrary.length === 0 && (
    <div className="text-center py-10 opacity-50 font-bold text-sm">
    {app.filteredLibrary.length > 0
      ? 'Todos los ejercicios visibles ya están en esta rutina.'
      : 'No se encontraron ejercicios.'}
    </div>
    )}
    </div>
    
    <div className={`absolute bottom-0 left-0 right-0 p-5 border-t backdrop-blur-xl ${app.isDark ? 'border-white/10 bg-[#121212]/80' : 'border-slate-200 bg-white/90'}`}>
    <button
    onClick={app.confirmMultiAdd}
    disabled={app.selectedExIds.length === 0}
    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
    app.selectedExIds.length > 0
    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
    : (app.isDark ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
    }`}
    >
    <Plus size={20} /> Agregar {app.selectedExIds.length} {app.selectedExIds.length === 1 ? 'Ejercicio' : 'Ejercicios'}
    </button>
    </div>
    </div>
    </div>
  );
}
