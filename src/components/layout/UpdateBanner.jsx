import { RefreshCw } from 'lucide-react';

export default function UpdateBanner({ status, onUpdateNow, isDark }) {
  if (status === 'idle') return null;

  const isUpdating = status === 'updating';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-4 right-4 z-50 max-w-sm mx-auto bottom-[5.25rem] rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in duration-300 ${
        isDark ? 'bg-[#121212]/95 border-purple-500/30 text-slate-100' : 'bg-white/95 border-purple-200 text-slate-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-600'}`}
        >
          <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-tight">
            {isUpdating ? 'Actualizando MyProgress…' : 'Nueva versión disponible'}
          </p>
          <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isUpdating
              ? 'Un momento, estamos aplicando los cambios.'
              : 'Se actualizará sola en unos segundos. No hace falta cerrar la app.'}
          </p>
          {!isUpdating && (
            <button
              type="button"
              onClick={onUpdateNow}
              className={`mt-2 text-[11px] font-bold underline underline-offset-2 ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}`}
            >
              Actualizar ahora
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
