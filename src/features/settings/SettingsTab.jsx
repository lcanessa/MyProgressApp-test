import { useRef } from 'react';
import { Download, Upload, RefreshCw } from 'lucide-react';
import { APP_VERSION_LABEL } from '../../constants/appVersion';

export default function SettingsTab({ app, pwaUpdate }) {
  const backupFileRef = useRef(null);
  const isChecking = pwaUpdate?.status === 'checking';
  const isUpdating = pwaUpdate?.status === 'updating';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section
        className={`rounded-3xl border p-5 flex flex-col gap-4 ${app.isDark ? 'bg-[#121212]/80 border-white/10' : 'bg-white border-slate-200'}`}
      >
        <div>
          <h3 className={`font-black tracking-widest text-xs mb-2 ${app.isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            ACTUALIZACIÓN
          </h3>
          <p className={`text-[11px] leading-relaxed font-medium ${app.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Si algo no se ve bien o creés que falta una mejora reciente, tocá el botón y la app buscará la última
            versión. Se va a recargar sola si hay novedades.
          </p>
        </div>
        <button
          type="button"
          disabled={isChecking || isUpdating}
          onClick={() => pwaUpdate?.checkAndApplyUpdate?.()}
          className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-colors disabled:opacity-60 ${
            app.isDark
              ? 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
              : 'border-purple-200 text-purple-700 hover:bg-purple-50'
          }`}
        >
          <RefreshCw size={16} className={isChecking || isUpdating ? 'animate-spin' : ''} />
          {isUpdating ? 'Actualizando…' : isChecking ? 'Buscando…' : 'Actualizar app'}
        </button>
      </section>

      <section
        className={`rounded-3xl border p-5 flex flex-col gap-6 ${app.isDark ? 'bg-[#121212]/80 border-white/10' : 'bg-white border-slate-200'}`}
      >
        <div>
          <h3 className={`font-black tracking-widest text-xs mb-2 ${app.isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            COPIA DE SEGURIDAD
          </h3>
          <p className={`text-[11px] leading-relaxed font-medium ${app.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Descargá un archivo JSON con rutinas, diario, historial y catálogo. Si borrás datos del navegador, podés
            restaurar desde ese archivo.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => app.exportBackup()}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${app.isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
          >
            <Download size={16} /> Descargar copia (.json)
          </button>
          <input
            ref={backupFileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onBlur={() => app.refreshAppLayout?.()}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              app.refreshAppLayout?.();
              if (!file) return;
              const r = await app.importBackup(file);
              if (r.cancelled) return;
              if (!r.ok) {
                window.alert(r.error || 'No se pudo restaurar la copia.');
                return;
              }
              window.alert('Copia restaurada correctamente.');
            }}
          />
          <button
            type="button"
            onClick={() => backupFileRef.current?.click()}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-colors ${app.isDark ? 'border-white/15 text-slate-200 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Upload size={16} /> Restaurar desde archivo…
          </button>
        </div>
      </section>

      <p
        className={`text-center text-[10px] font-medium tracking-wide pb-2 ${
          app.isDark ? 'text-slate-600' : 'text-slate-400'
        }`}
      >
        MyProgress {APP_VERSION_LABEL}
      </p>
    </div>
  );
}
