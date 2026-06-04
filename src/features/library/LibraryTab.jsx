import { useState } from 'react';
import { Search, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';
import { MUSCLE_GROUPS } from '../../constants/muscles';
import ExercisePlayButton from '../../components/exercise/ExercisePlayButton';
import CatalogPicker from '../../components/exercise/CatalogPicker';

export default function LibraryTab({ app }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
    {showPicker ? (
      <CatalogPicker app={app} onClose={() => setShowPicker(false)} />
    ) : (
    <div className="flex gap-2 mb-6">
    <div className="relative flex-1">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
    <input placeholder="Buscar en mi biblioteca..." value={app.searchTerm} onChange={(e) => app.setSearchTerm(e.target.value)} className={`w-full rounded-2xl py-3.5 pl-12 pr-4 text-[16px] font-bold shadow-xl outline-none transition-colors border ${app.isDark ? 'bg-[#121212] border-white/5 text-white focus:border-purple-500 placeholder-white/20' : 'bg-white border-slate-200 text-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 placeholder-slate-400'}`} />
    </div>
    <button onClick={() => setShowPicker(true)} className={`px-4 rounded-2xl shadow-lg transition-colors ${app.isDark ? 'bg-purple-600 text-white shadow-purple-600/20 hover:bg-purple-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}><Plus size={24} /></button>
    </div>
    )}
    
    {app.groupedLibrary.map(([groupName, exercises]) => (
    <div key={groupName} className="mb-8">
    <h3 className={`font-black uppercase tracking-widest text-xs mb-3 pl-2 ${app.isDark ? 'text-purple-400' : 'text-purple-600'}`}>{groupName}</h3>
    <div className="grid grid-cols-1 gap-3">
    {exercises.map(ex => {
    const isEditing = app.editingExId === ex.id;
    return (
    <div key={ex.id} className={`p-4 rounded-3xl border shadow-sm flex flex-col gap-3 ${app.isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-200'}`}>
    {isEditing ? (
    <div className="space-y-4 animate-in fade-in">
    <input value={app.editingExData.name} onChange={(e) => app.setEditingExData({...app.editingExData, name: e.target.value})} className={`w-full bg-transparent border-b font-black text-[16px] pb-2 outline-none ${app.isDark ? 'border-white/10 focus:border-purple-500 text-white' : 'border-slate-200 focus:border-purple-500 text-slate-800'}`} />
    <div className="flex gap-2">
    <select value={app.editingExData.muscle} onChange={(e) => app.setEditingExData({...app.editingExData, muscle: e.target.value})} className={`flex-1 rounded-xl px-3 py-2.5 text-[16px] font-bold outline-none border ${app.isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
    {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
    <button onClick={app.saveEditedEx} className="bg-purple-600 text-white px-5 rounded-xl font-bold text-xs"><Save size={16} /></button>
    <button onClick={() => app.setEditingExId(null)} className={`px-4 rounded-xl transition-colors ${app.isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><X size={16} /></button>
    </div>
    </div>
    ) : (
    <div className="flex justify-between items-center">
    <div>
    <h4 className={`font-black text-[15px] ${app.isDark ? 'text-white' : 'text-slate-800'}`}>{ex.name}</h4>
    </div>
    <div className="flex gap-2">
    <ExercisePlayButton
    isDark={app.isDark}
    onClick={() => app.openExerciseVideo({ exId: ex.id, name: ex.name, customName: ex.name })}
    />
    <button onClick={() => app.startEditingEx(ex)} className={`p-2 rounded-xl transition-colors ${app.isDark ? 'text-slate-400 hover:text-white bg-white/5' : 'text-slate-400 hover:text-purple-600 bg-slate-50'}`}><Edit2 size={16} /></button>
    <button type="button" onClick={() => app.setLibraryExerciseToDelete(ex.id)} className={`p-2 rounded-xl transition-colors ${app.isDark ? 'text-slate-400 hover:text-red-400 bg-white/5' : 'text-slate-400 hover:text-red-500 bg-slate-50'}`} aria-label="Eliminar del catálogo"><Trash2 size={16} /></button>
    </div>
    </div>
    )}
    </div>
    );
    })}
    </div>
    </div>
    ))}
    
    {app.filteredLibrary.length === 0 && (
    <div className="text-center py-10 opacity-50 font-bold text-sm">No se encontraron ejercicios.</div>
    )}
    </div>
  );
}
