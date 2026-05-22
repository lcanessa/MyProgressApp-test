import { useMemo } from 'react';
import { PersonStanding } from 'lucide-react';
import { buildMuscleHeatmap, muscleHeatColor, formatVolume } from '../../utils/highlights';
import HighlightCardCornerFade from './HighlightCardCornerFade';

const LEGEND = [
  { label: 'Sin trabajo', pct: 0 },
  { label: 'Ligero', pct: 0.20 },
  { label: 'Moderado', pct: 0.45 },
  { label: 'Intenso', pct: 0.73 },
  { label: 'Pico', pct: 1 },
];

function getMuscleColors(muscles, isDark) {
  const map = Object.fromEntries(muscles.map((m) => [m.label, muscleHeatColor(m.pct, isDark)]));
  const base = muscleHeatColor(0, isDark);
  return {
    Pecho:   map.Pecho   || base,
    Espalda: map.Espalda || base,
    Piernas: map.Piernas || base,
    Hombros: map.Hombros || base,
    Brazos:  map.Brazos  || base,
    Core:    map.Core    || base,
  };
}

/* ─── VISTA FRONTAL ─── */
function FrontBody({ c, neutral }) {
  return (
    <svg viewBox="0 0 90 196" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm">
      {/* Head */}
      <ellipse cx="45" cy="13" rx="12" ry="13" fill={neutral} />
      {/* Neck */}
      <rect x="40" y="25" width="10" height="8" rx="3" fill={neutral} />

      {/* Chest (Pecho) — drawn first so shoulders can overlap naturally */}
      <path
        d="M28 33 Q36 28 45 31 Q54 28 62 33 L62 53 Q54 57 45 56 Q36 57 28 53 Z"
        fill={c.Pecho}
      />
      {/* Core (Abs) */}
      <rect x="28" y="54" width="34" height="26" rx="5" fill={c.Core} />

      {/* Left Bicep */}
      <rect x="11" y="35" width="11" height="35" rx="5" fill={c.Brazos} />
      {/* Right Bicep */}
      <rect x="68" y="35" width="11" height="35" rx="5" fill={c.Brazos} />

      {/* Left Shoulder cap — on top of bicep + chest edge */}
      <ellipse cx="22" cy="41" rx="10" ry="7" fill={c.Hombros} />
      {/* Right Shoulder cap */}
      <ellipse cx="68" cy="41" rx="10" ry="7" fill={c.Hombros} />

      {/* Left Forearm (neutral) */}
      <rect x="11" y="72" width="9" height="27" rx="4" fill={neutral} />
      {/* Right Forearm */}
      <rect x="70" y="72" width="9" height="27" rx="4" fill={neutral} />

      {/* Hips connector (neutral) */}
      <rect x="24" y="81" width="42" height="13" rx="7" fill={neutral} />

      {/* Left Quad */}
      <rect x="25" y="96" width="17" height="43" rx="7" fill={c.Piernas} />
      {/* Right Quad */}
      <rect x="48" y="96" width="17" height="43" rx="7" fill={c.Piernas} />

      {/* Left Calf */}
      <rect x="26" y="142" width="14" height="36" rx="6" fill={c.Piernas} />
      {/* Right Calf */}
      <rect x="50" y="142" width="14" height="36" rx="6" fill={c.Piernas} />

      {/* Feet (neutral) */}
      <ellipse cx="33" cy="182" rx="10" ry="5" fill={neutral} />
      <ellipse cx="57" cy="182" rx="10" ry="5" fill={neutral} />
    </svg>
  );
}

/* ─── VISTA POSTERIOR ─── */
function BackBody({ c, neutral }) {
  return (
    <svg viewBox="0 0 90 196" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm">
      {/* Head */}
      <ellipse cx="45" cy="13" rx="12" ry="13" fill={neutral} />
      {/* Neck */}
      <rect x="40" y="25" width="10" height="8" rx="3" fill={neutral} />

      {/* Back (Espalda) — traps + lats + lumbar — full torso back */}
      <path
        d="M28 33 Q36 28 45 31 Q54 28 62 33 L62 80 Q54 84 45 83 Q36 84 28 80 Z"
        fill={c.Espalda}
      />

      {/* Left Tricep */}
      <rect x="11" y="35" width="11" height="35" rx="5" fill={c.Brazos} />
      {/* Right Tricep */}
      <rect x="68" y="35" width="11" height="35" rx="5" fill={c.Brazos} />

      {/* Left Shoulder cap (rear delt) — on top */}
      <ellipse cx="22" cy="41" rx="10" ry="7" fill={c.Hombros} />
      {/* Right Shoulder cap */}
      <ellipse cx="68" cy="41" rx="10" ry="7" fill={c.Hombros} />

      {/* Left Forearm (neutral) */}
      <rect x="11" y="72" width="9" height="27" rx="4" fill={neutral} />
      {/* Right Forearm */}
      <rect x="70" y="72" width="9" height="27" rx="4" fill={neutral} />

      {/* Glutes (Piernas) — wider than waist */}
      <path
        d="M24 81 Q35 93 45 91 Q55 93 66 81 L66 107 Q55 112 45 110 Q35 112 24 107 Z"
        fill={c.Piernas}
      />

      {/* Left Hamstring */}
      <rect x="25" y="109" width="17" height="37" rx="7" fill={c.Piernas} />
      {/* Right Hamstring */}
      <rect x="48" y="109" width="17" height="37" rx="7" fill={c.Piernas} />

      {/* Left Calf back */}
      <rect x="26" y="149" width="14" height="29" rx="6" fill={c.Piernas} />
      {/* Right Calf back */}
      <rect x="50" y="149" width="14" height="29" rx="6" fill={c.Piernas} />

      {/* Feet (neutral) */}
      <ellipse cx="33" cy="182" rx="10" ry="5" fill={neutral} />
      <ellipse cx="57" cy="182" rx="10" ry="5" fill={neutral} />
    </svg>
  );
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function MuscleHeatmap({ diary, routines, library, isDark }) {
  const data = useMemo(
    () => buildMuscleHeatmap(diary, routines, library),
    [diary, routines, library]
  );

  const neutral = isDark ? '#1e293b' : '#e2e8f0';
  const colors = getMuscleColors(data.muscles, isDark);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${
        isDark
          ? 'bg-gradient-to-br from-amber-950/40 via-[#121212] to-[#121212] border-amber-500/25'
          : 'bg-gradient-to-br from-amber-50 via-white to-white border-amber-200 shadow-sm'
      }`}
    >
      <HighlightCardCornerFade isDark={isDark} />

      {/* Header */}
      <div className="relative p-5 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl shrink-0 ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'}`}
          >
            <PersonStanding size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}
            >
              Mapa muscular
            </p>
            <p className={`text-[11px] mt-0.5 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Volumen histórico por grupo muscular
            </p>
          </div>
        </div>
      </div>

      <div className="relative p-5 space-y-5">
        {!data.hasData ? (
          <p className={`text-center text-sm font-medium py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Registrá series con peso o repeticiones para ver tu mapa muscular.
          </p>
        ) : (
          <>
            {/* Cuerpos SVG frente / espalda */}
            <div className="flex justify-center gap-6">
              <div className="flex flex-col items-center gap-1.5 w-[42%] max-w-[120px]">
                <FrontBody c={colors} neutral={neutral} />
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Frente
                </p>
              </div>
              <div className="flex flex-col items-center gap-1.5 w-[42%] max-w-[120px]">
                <BackBody c={colors} neutral={neutral} />
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Espalda
                </p>
              </div>
            </div>

            {/* Leyenda de colores */}
            <div className={`rounded-2xl px-4 py-3 border ${isDark ? 'bg-white/5 border-white/8' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Leyenda
              </p>
              <div className="flex gap-2 flex-wrap">
                {LEGEND.map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: muscleHeatColor(pct, isDark) }}
                    />
                    <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 músculos */}
            {data.top3.length > 0 && (
              <div className="space-y-2">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>
                  Más trabajados
                </p>
                {data.top3.map((m, i) => (
                  <div key={m.label} className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-black w-4 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      {i + 1}
                    </span>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: muscleHeatColor(m.pct, isDark) }}
                    />
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {m.label}
                      </span>
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round(m.pct * 100)}%`,
                            backgroundColor: muscleHeatColor(m.pct, isDark),
                          }}
                        />
                      </div>
                    </div>
                    <span className={`text-[11px] font-black tabular-nums shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatVolume(m.volume)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
