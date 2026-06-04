import { useState, useEffect, useMemo } from 'react';
import { Search, X, Plus, ChevronRight } from 'lucide-react';
import { searchCatalog } from '../../services/db';

export default function CatalogPicker({ app, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const libraryIds = useMemo(
    () => new Set(app.library.map((ex) => ex.catalogId).filter(Boolean)),
    [app.library]
  );

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(async () => {
      const data = await searchCatalog(query);
      setResults(data);
      setLoading(false);
    }, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [query]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const ex of results) {
      if (!groups[ex.muscle]) groups[ex.muscle] = [];
      groups[ex.muscle].push(ex);
    }
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [results]);

  async function handleAdd(item) {
    if (adding) return;
    setAdding(item.id);
    await app.handleAddFromCatalog(item);
    setAdding(null);
  }

  const isDark = app.isDark;
  const card = isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-slate-200';
  const input = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-purple-500'
    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-purple-500';

  return (
    <div className={`rounded-3xl border shadow-xl overflow-hidden ${card}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className={`font-black tracking-widest text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
          AGREGAR EJERCICIO
        </h3>
        <button onClick={onClose} className={`p-1.5 rounded-full ${isDark ? 'text-slate-400 hover:text-white bg-white/5' : 'text-slate-500 bg-slate-100'}`}>
          <X size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            autoFocus
            placeholder="Buscar ejercicio..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full rounded-xl py-3 pl-10 pr-4 text-sm font-semibold outline-none border transition-colors ${input}`}
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-h-80 overflow-y-auto px-5 pb-3 space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <p className={`text-center py-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            No se encontraron ejercicios.
          </p>
        ) : (
          grouped.map(([group, exercises]) => (
            <div key={group}>
              <p className={`text-[10px] font-black tracking-widest mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                {group.toUpperCase()}
              </p>
              <div className="space-y-1">
                {exercises.map((ex) => {
                  const inLibrary = libraryIds.has(ex.id);
                  return (
                    <button
                      key={ex.id}
                      disabled={inLibrary || adding === ex.id}
                      onClick={() => handleAdd(ex)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors text-sm font-semibold ${
                        inLibrary
                          ? isDark ? 'text-slate-600 cursor-default' : 'text-slate-300 cursor-default'
                          : isDark
                          ? 'text-slate-200 hover:bg-white/5 active:bg-white/10'
                          : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
                      }`}
                    >
                      <span>{ex.name}</span>
                      {inLibrary ? (
                        <span className={`text-[10px] font-bold ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>✓ agregado</span>
                      ) : adding === ex.id ? (
                        <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                      ) : (
                        <Plus size={16} className="text-purple-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom exercise option */}
      <div className={`border-t px-5 py-3 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
        {!showCustomForm ? (
          <button
            onClick={() => setShowCustomForm(true)}
            className={`w-full flex items-center justify-between py-2 text-sm font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <span>No encontré el ejercicio, agregar personalizado</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div className="space-y-3 pt-1">
            <input
              placeholder="Nombre del ejercicio..."
              value={app.newExData.name}
              onChange={(e) => app.setNewExData({ ...app.newExData, name: e.target.value })}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none border transition-colors ${input}`}
            />
            <select
              value={app.newExData.muscle}
              onChange={(e) => app.setNewExData({ ...app.newExData, muscle: e.target.value })}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold outline-none border transition-colors ${isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            >
              {['Pecho','Espalda','Piernas','Hombros','Brazos','Core','Cardio','Otro'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => { app.handleAddNewExercise(); onClose(); }}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowCustomForm(false)}
                className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
