import { useMemo, useState } from 'react';
import { PersonStanding, ImageOff } from 'lucide-react';
import { buildMuscleHeatmap, muscleHeatColor, formatVolume } from '../../utils/highlights';
import HighlightCardCornerFade from './HighlightCardCornerFade';

// ─── Posiciones de los blobs en espacio 0-100 (% del ancho/alto de la imagen).
// Ajustar las coordenadas una vez que tengas las PNGs en /public.
const FRONT_BLOBS = [
  // Pecho
  { muscle: 'Pecho',   cx: 35, cy: 27, rx: 11, ry: 7 },
  { muscle: 'Pecho',   cx: 65, cy: 27, rx: 11, ry: 7 },
  // Hombros
  { muscle: 'Hombros', cx: 18, cy: 22, rx: 7,  ry: 5 },
  { muscle: 'Hombros', cx: 82, cy: 22, rx: 7,  ry: 5 },
  // Brazos (bíceps)
  { muscle: 'Brazos',  cx: 11, cy: 33, rx: 5,  ry: 10 },
  { muscle: 'Brazos',  cx: 89, cy: 33, rx: 5,  ry: 10 },
  // Core (abdominales)
  { muscle: 'Core',    cx: 50, cy: 41, rx: 10, ry: 7  },
  // Piernas (cuádriceps)
  { muscle: 'Piernas', cx: 38, cy: 62, rx: 9,  ry: 11 },
  { muscle: 'Piernas', cx: 62, cy: 62, rx: 9,  ry: 11 },
  // Piernas (gemelos)
  { muscle: 'Piernas', cx: 38, cy: 80, rx: 7,  ry: 7  },
  { muscle: 'Piernas', cx: 62, cy: 80, rx: 7,  ry: 7  },
];

const BACK_BLOBS = [
  // Hombros (deltoides posteriores)
  { muscle: 'Hombros', cx: 18, cy: 22, rx: 7,  ry: 5  },
  { muscle: 'Hombros', cx: 82, cy: 22, rx: 7,  ry: 5  },
  // Espalda (trapecio)
  { muscle: 'Espalda', cx: 50, cy: 25, rx: 14, ry: 5  },
  // Espalda (dorsales)
  { muscle: 'Espalda', cx: 34, cy: 34, rx: 8,  ry: 9  },
  { muscle: 'Espalda', cx: 66, cy: 34, rx: 8,  ry: 9  },
  // Espalda (lumbar)
  { muscle: 'Espalda', cx: 50, cy: 43, rx: 9,  ry: 5  },
  // Brazos (tríceps)
  { muscle: 'Brazos',  cx: 11, cy: 33, rx: 5,  ry: 10 },
  { muscle: 'Brazos',  cx: 89, cy: 33, rx: 5,  ry: 10 },
  // Piernas (glúteos)
  { muscle: 'Piernas', cx: 50, cy: 53, rx: 17, ry: 6  },
  // Piernas (isquiotibiales)
  { muscle: 'Piernas', cx: 38, cy: 64, rx: 9,  ry: 10 },
  { muscle: 'Piernas', cx: 62, cy: 64, rx: 9,  ry: 10 },
  // Piernas (gemelos)
  { muscle: 'Piernas', cx: 38, cy: 80, rx: 7,  ry: 7  },
  { muscle: 'Piernas', cx: 62, cy: 80, rx: 7,  ry: 7  },
];

const LEGEND = [
  { label: 'Sin trabajo', pct: 0 },
  { label: 'Ligero',      pct: 0.20 },
  { label: 'Moderado',    pct: 0.45 },
  { label: 'Intenso',     pct: 0.73 },
  { label: 'Pico',        pct: 1    },
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

/* ─── Vista del cuerpo: imagen PNG + blobs SVG superpuestos ─── */
function BodyView({ src, blobs, colors, filterId, label }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="flex flex-col items-center gap-2 w-[44%] max-w-[140px]">
      <div className="relative w-full overflow-hidden rounded-2xl isolation-isolate">
        {imgOk ? (
          <>
            <img
              src={src}
              alt={label}
              className="w-full h-auto block select-none"
              onError={() => setImgOk(false)}
              draggable={false}
            />
            {/* SVG de manchas — preserveAspectRatio="none" mapea coords 0-100 a % del contenedor */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter
                  id={filterId}
                  x="-60%"
                  y="-60%"
                  width="220%"
                  height="220%"
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation="3.5" />
                </filter>
              </defs>
              {blobs.map((b, i) => (
                <ellipse
                  key={i}
                  cx={b.cx}
                  cy={b.cy}
                  rx={b.rx}
                  ry={b.ry}
                  fill={colors[b.muscle]}
                  filter={`url(#${filterId})`}
                  style={{ mixBlendMode: 'multiply', opacity: 0.72 }}
                />
              ))}
            </svg>
          </>
        ) : (
          <div className="w-full aspect-[1/2.4] flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-800/40 border border-white/8">
            <ImageOff size={20} className="text-slate-500" />
            <span className="text-[9px] font-bold text-slate-500 text-center leading-tight px-2">
              Agregá<br />{src.replace('/', '')}<br />a /public
            </span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

/* ─── Componente principal ─── */
export default function MuscleHeatmap({ diary, routines, library, isDark }) {
  const data = useMemo(
    () => buildMuscleHeatmap(diary, routines, library),
    [diary, routines, library]
  );

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
            Registrá series con peso para ver tu mapa muscular.
          </p>
        ) : (
          <>
            {/* Cuerpos: imagen PNG + manchas SVG */}
            <div className="flex justify-center gap-6">
              <BodyView
                src="/muscle-front.png"
                blobs={FRONT_BLOBS}
                colors={colors}
                filterId="blur-front"
                label="Frente"
              />
              <BodyView
                src="/muscle-back.png"
                blobs={BACK_BLOBS}
                colors={colors}
                filterId="blur-back"
                label="Espalda"
              />
            </div>

            {/* Leyenda */}
            <div
              className={`rounded-2xl px-4 py-3 border ${
                isDark ? 'bg-white/5 border-white/8' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <p
                className={`text-[10px] font-black uppercase tracking-widest mb-2.5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Leyenda
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {LEGEND.map(({ label, pct }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: muscleHeatColor(pct, isDark) }}
                    />
                    <span
                      className={`text-[10px] font-semibold ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 músculos */}
            {data.top3.length > 0 && (
              <div className="space-y-2.5">
                <p
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    isDark ? 'text-amber-400/90' : 'text-amber-600'
                  }`}
                >
                  Más trabajados
                </p>
                {data.top3.map((m, i) => (
                  <div key={m.label} className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-black w-4 shrink-0 tabular-nums ${
                        isDark ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: muscleHeatColor(m.pct, isDark) }}
                    />
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span
                        className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
                        style={{ minWidth: '5rem' }}
                      >
                        {m.label}
                      </span>
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0',
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round(m.pct * 100)}%`,
                            backgroundColor: muscleHeatColor(m.pct, isDark),
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-black tabular-nums shrink-0 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
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
