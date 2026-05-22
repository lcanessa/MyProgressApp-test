import { useMemo, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { muscleHeatColor } from '../../utils/highlights';

const MUSCLE_GROUPS_LIST = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio', 'Otro'];

const FRONT_BLOBS = [
  { muscle: 'Pecho',   cx: 35, cy: 27, rx: 11, ry: 7  },
  { muscle: 'Pecho',   cx: 65, cy: 27, rx: 11, ry: 7  },
  { muscle: 'Hombros', cx: 18, cy: 22, rx: 7,  ry: 5  },
  { muscle: 'Hombros', cx: 82, cy: 22, rx: 7,  ry: 5  },
  { muscle: 'Brazos',  cx: 11, cy: 33, rx: 5,  ry: 10 },
  { muscle: 'Brazos',  cx: 89, cy: 33, rx: 5,  ry: 10 },
  { muscle: 'Core',    cx: 50, cy: 41, rx: 10, ry: 7  },
  { muscle: 'Piernas', cx: 38, cy: 62, rx: 9,  ry: 11 },
  { muscle: 'Piernas', cx: 62, cy: 62, rx: 9,  ry: 11 },
  { muscle: 'Piernas', cx: 38, cy: 80, rx: 7,  ry: 7  },
  { muscle: 'Piernas', cx: 62, cy: 80, rx: 7,  ry: 7  },
];

const BACK_BLOBS = [
  { muscle: 'Hombros', cx: 18, cy: 22, rx: 7,  ry: 5  },
  { muscle: 'Hombros', cx: 82, cy: 22, rx: 7,  ry: 5  },
  { muscle: 'Espalda', cx: 50, cy: 25, rx: 14, ry: 5  },
  { muscle: 'Espalda', cx: 34, cy: 34, rx: 8,  ry: 9  },
  { muscle: 'Espalda', cx: 66, cy: 34, rx: 8,  ry: 9  },
  { muscle: 'Espalda', cx: 50, cy: 43, rx: 9,  ry: 5  },
  { muscle: 'Brazos',  cx: 11, cy: 33, rx: 5,  ry: 10 },
  { muscle: 'Brazos',  cx: 89, cy: 33, rx: 5,  ry: 10 },
  { muscle: 'Piernas', cx: 50, cy: 53, rx: 17, ry: 6  },
  { muscle: 'Piernas', cx: 38, cy: 64, rx: 9,  ry: 10 },
  { muscle: 'Piernas', cx: 62, cy: 64, rx: 9,  ry: 10 },
  { muscle: 'Piernas', cx: 38, cy: 80, rx: 7,  ry: 7  },
  { muscle: 'Piernas', cx: 62, cy: 80, rx: 7,  ry: 7  },
];

const LEGEND = [
  { label: 'Sin trabajo', pct: 0    },
  { label: 'Ligero',      pct: 0.15 },
  { label: 'Moderado',    pct: 0.45 },
  { label: 'Intenso',     pct: 0.73 },
  { label: 'Pico',        pct: 1    },
];

const formatSets = (n) => n === 1 ? '1 serie' : `${n} series`;

function getMuscleColors(muscleStats, isDark) {
  const map = {};
  muscleStats.forEach(({ muscle, percentage }) => {
    map[muscle] = muscleHeatColor(percentage / 100, isDark);
  });
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

const BODY_ASPECT = '1 / 1.73';

function BodyView({ src, blobs, colors, filterId }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="flex-1">
      <div className="relative w-full" style={{ aspectRatio: BODY_ASPECT }}>
        {imgOk ? (
          <>
            <img
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-contain object-top select-none"
              onError={() => setImgOk(false)}
              draggable={false}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                maskImage: `url(${src})`,
                WebkitMaskImage: `url(${src})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'top center',
                WebkitMaskPosition: 'top center',
              }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ mixBlendMode: 'overlay' }}
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
                    <feGaussianBlur stdDeviation="4" />
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
                    opacity={0.92}
                  />
                ))}
              </svg>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-800/40 border border-white/8">
            <ImageOff size={20} className="text-slate-500" />
            <span className="text-[9px] font-bold text-slate-500 text-center leading-tight px-2">
              Agregá<br />{src.replace('/', '')}<br />a /public
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MuscleHeatmap({ diary, routines, library, isDark, selectedDate }) {
  const muscleStats = useMemo(() => {
    const stats = {};
    MUSCLE_GROUPS_LIST.forEach(m => { stats[m] = 0; });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const cutoffObj = new Date(now);
    cutoffObj.setDate(cutoffObj.getDate() - 30);
    const cutoffDateStr = cutoffObj.toISOString().split('T')[0];

    Object.keys(diary).forEach(dateStr => {
      if (dateStr < cutoffDateStr || dateStr > todayStr) return;

      const dayData = diary[dateStr];
      if (!dayData || !dayData.sessions) return;

      const countedSets = new Set();

      Object.entries(dayData.sessions).forEach(([key, value]) => {
        const parts = key.split('-');
        if (parts.length < 4) return;

        const rId = parts[0];
        const exIdx = parseInt(parts[1], 10);
        const sIdxStr = parts[2];

        // Solo contar sets de ejercicios explícitamente marcados como completados.
        // Esto evita que los datos pre-rellenados (de sesiones anteriores) se cuenten
        // antes de que el usuario haya hecho el ejercicio hoy.
        const completedKey = `${rId}-${exIdx}`;
        if (!dayData.completed?.[completedKey]) return;

        const valNum = parseFloat(value);
        if (isNaN(valNum) || valNum <= 0) return;

        const uniqueSetId = `${dateStr}-${rId}-${exIdx}-${sIdxStr}`;

        if (!countedSets.has(uniqueSetId)) {
          countedSets.add(uniqueSetId);

          const routineEx = routines[rId]?.[exIdx];
          if (routineEx) {
            const libEx = library.find(l => l.id === routineEx.exId || l.name === routineEx.customName);
            const muscleName = libEx ? libEx.muscle : 'Otro';

            if (stats[muscleName] !== undefined) {
              stats[muscleName] += 1;
            } else {
              stats['Otro'] += 1;
            }
          }
        }
      });
    });
    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    const maxSets = sortedStats[0][1] || 1;

    return sortedStats.map(([muscle, totalSets]) => {
      const percentage = (totalSets / maxSets) * 100;
      let colorLevel = 0;
      if (totalSets > 0) {
        if (percentage <= 30) colorLevel = 1;
        else if (percentage <= 60) colorLevel = 2;
        else if (percentage <= 85) colorLevel = 3;
        else colorLevel = 4;
      }
      return { muscle, totalSets, percentage, colorLevel };
    });
  }, [diary, routines, library, selectedDate]);

  const colors = getMuscleColors(muscleStats, isDark);
  const hasData = muscleStats.some(m => m.totalSets > 0);

  if (!hasData) {
    return (
      <p className={`text-center text-sm font-medium py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Registrá series con peso para ver tu mapa muscular.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex gap-5">
          <BodyView
            src="/muscle-front.png"
            blobs={FRONT_BLOBS}
            colors={colors}
            filterId="blur-front"
          />
          <BodyView
            src="/muscle-back.png"
            blobs={BACK_BLOBS}
            colors={colors}
            filterId="blur-back"
          />
        </div>

        <div className="flex justify-between">
          {LEGEND.map(({ label, pct }) => (
            <div key={label} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: muscleHeatColor(pct, isDark) }}
              />
              <span className={`text-[9px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`rounded-2xl px-4 py-3.5 space-y-2.5 ${
          isDark ? 'bg-white/5' : 'bg-slate-50 border border-slate-200'
        }`}
      >
        <p
          className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
            isDark ? 'text-amber-400/90' : 'text-amber-600'
          }`}
        >
          Últimos 30 días
        </p>
        {muscleStats.map((m, i) => (
          <div key={m.muscle} className="flex items-center gap-2.5">
            <span
              className={`text-[11px] font-black w-4 shrink-0 tabular-nums ${
                isDark ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {i + 1}
            </span>
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: muscleHeatColor(m.percentage / 100, isDark) }}
            />
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span
                className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
                style={{ minWidth: '4.5rem' }}
              >
                {m.muscle}
              </span>
              <div
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(m.percentage)}%`,
                    backgroundColor: muscleHeatColor(m.percentage / 100, isDark),
                  }}
                />
              </div>
            </div>
            <span
              className={`text-[11px] font-black tabular-nums shrink-0 ${
                m.totalSets === 0
                  ? isDark ? 'text-slate-600' : 'text-slate-400'
                  : isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {m.totalSets === 0 ? '—' : formatSets(m.totalSets)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
