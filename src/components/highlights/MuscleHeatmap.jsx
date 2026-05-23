import { useMemo } from 'react';

// ─── Grupos y factores de balance muscular ─────────────────────────────────────
const MUSCLE_FACTORS = {
  Brazos:  1.80,
  Hombros: 1.45,
  Core:    1.30,
  Pecho:   1.00,
  Espalda: 0.90,
  Piernas: 0.55,
};

const MUSCLE_GROUPS_LIST = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

// ─── Escala de colores (7 niveles con interpolación) ──────────────────────────
const COLOR_STOPS = [
  { at: 0.00, hex: '#334155' },
  { at: 0.15, hex: '#3b82f6' },
  { at: 0.35, hex: '#22c55e' },
  { at: 0.55, hex: '#eab308' },
  { at: 0.75, hex: '#f97316' },
  { at: 0.90, hex: '#dc2626' },
  { at: 1.00, hex: '#fbbf24' },
];

function lerpColor(hex1, hex2, t) {
  const p = (h, o, l) => parseInt(h.slice(o, l), 16);
  const r = Math.round(p(hex1,1,3) + (p(hex2,1,3) - p(hex1,1,3)) * t);
  const g = Math.round(p(hex1,3,5) + (p(hex2,3,5) - p(hex1,3,5)) * t);
  const b = Math.round(p(hex1,5,7) + (p(hex2,5,7) - p(hex1,5,7)) * t);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function progressToColor(progress) {
  const p = Math.min(Math.max(progress, 0), 1.2);
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const a = COLOR_STOPS[i], b = COLOR_STOPS[i + 1];
    if (p >= a.at && p <= b.at) {
      return lerpColor(a.hex, b.hex, (p - a.at) / (b.at - a.at));
    }
  }
  return '#f59e0b';
}

const formatProgress = (p) =>
  p >= 1.0 ? 'PR' : p < 0.02 ? '—' : `${Math.round(p * 100)}%`;

// ─── Blobs SVG: posiciones sobre viewBox 0 0 100 240 ─────────────────────────
// Ajustar cx/cy/rx/ry si las imágenes tienen proporciones distintas.
// cx/cy = centro del blob en %, rx/ry = radios en unidades del viewBox.

const FRONT_BLOBS = [
  { muscle: 'Pecho',
    shapes: [{ cx: 50, cy: 87, rx: 18, ry: 12 }] },
  { muscle: 'Hombros',
    shapes: [{ cx: 25, cy: 73, rx: 10, ry: 9 }, { cx: 75, cy: 73, rx: 10, ry: 9 }] },
  { muscle: 'Brazos',
    shapes: [{ cx: 15, cy: 107, rx: 7, ry: 16 }, { cx: 85, cy: 107, rx: 7, ry: 16 }] },
  { muscle: 'Core',
    shapes: [{ cx: 50, cy: 112, rx: 13, ry: 17 }] },
  { muscle: 'Piernas',
    shapes: [{ cx: 38, cy: 168, rx: 13, ry: 32 }, { cx: 62, cy: 168, rx: 13, ry: 32 }] },
];

const BACK_BLOBS = [
  { muscle: 'Espalda',
    shapes: [{ cx: 50, cy: 87, rx: 22, ry: 22 }] },
  { muscle: 'Hombros',
    shapes: [{ cx: 25, cy: 73, rx: 10, ry: 9 }, { cx: 75, cy: 73, rx: 10, ry: 9 }] },
  { muscle: 'Brazos',
    shapes: [{ cx: 15, cy: 107, rx: 7, ry: 16 }, { cx: 85, cy: 107, rx: 7, ry: 16 }] },
  { muscle: 'Core',
    shapes: [{ cx: 50, cy: 108, rx: 12, ry: 10 }] },
  { muscle: 'Piernas',
    shapes: [{ cx: 38, cy: 165, rx: 14, ry: 32 }, { cx: 62, cy: 165, rx: 14, ry: 32 }] },
];

// ─── Vista 2D: imagen + SVG overlay ───────────────────────────────────────────

function BodyView({ side, blobs, statsMap, isDark }) {
  const src      = side === 'front' ? '/muscle-front.png' : '/muscle-back.png';
  const filterId = `mhm-blur-${side}`;

  return (
    <div className="flex-1 min-w-0" style={{ aspectRatio: '2 / 5' }}>
      <div className="relative w-full h-full">
        <img
          src={src}
          alt={side}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />
        <svg
          viewBox="0 0 100 240"
          className="absolute inset-0 w-full h-full"
          style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
          aria-hidden="true"
        >
          <defs>
            <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          <g filter={`url(#${filterId})`} opacity={isDark ? 0.80 : 0.65}>
            {blobs.map(({ muscle, shapes }) => {
              const stat     = statsMap[muscle];
              const progress = stat?.progress ?? 0;
              if (progress < 0.02) return null;
              const color = progressToColor(progress);
              return shapes.map((s, i) => (
                <ellipse
                  key={`${muscle}-${i}`}
                  cx={s.cx} cy={s.cy}
                  rx={s.rx} ry={s.ry}
                  fill={color}
                />
              ));
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function MuscleHeatmap({ diary, routines, library, isDark, selectedDate }) {
  const muscleStats = useMemo(() => {
    // ── 1. Puntaje por día y músculo ─────────────────────────────────────────
    const dayScores = {};

    Object.keys(diary).forEach(dateStr => {
      const dayData = diary[dateStr];
      if (!dayData?.sessions) return;

      // Agrupa por set para obtener peso Y reps del mismo set
      const setMap = {};
      Object.entries(dayData.sessions).forEach(([key, value]) => {
        const parts = key.split('-');
        if (parts.length < 4) return;
        const [rId, exIdxStr, sIdxStr, type] = parts;
        if (type !== 'w' && type !== 'r') return;
        const setKey = `${rId}-${exIdxStr}-${sIdxStr}`;
        if (!setMap[setKey]) setMap[setKey] = { rId, exIdx: parseInt(exIdxStr, 10), w: 0, r: 0 };
        const val = parseFloat(value) || 0;
        if (type === 'w') setMap[setKey].w = val;
        else               setMap[setKey].r = val;
      });

      Object.values(setMap).forEach(({ rId, exIdx, w, r }) => {
        if (!dayData.completed?.[`${rId}-${exIdx}`]) return;
        if (w <= 0 && r <= 0) return;

        const routineEx = routines[rId]?.[exIdx];
        if (!routineEx) return;

        const libEx  = library.find(l => l.id === routineEx.exId || l.name === routineEx.customName);
        const muscle = libEx?.muscle;
        if (!muscle || !MUSCLE_FACTORS[muscle]) return;

        // Peso cero / nulo = ejercicio corporal: peso virtual de 10
        const effectiveW = (w > 0 && !isNaN(w)) ? w : 10;
        const rawVol     = effectiveW * Math.max(r, 1);
        const score      = Math.pow(rawVol, 0.7) * MUSCLE_FACTORS[muscle];

        if (!dayScores[dateStr]) dayScores[dateStr] = {};
        dayScores[dateStr][muscle] = (dayScores[dateStr][muscle] || 0) + score;
      });
    });

    // ── 2. Score actual (siempre últimos 30 días hasta HOY) ──────────────────
    const todayStr  = new Date().toISOString().split('T')[0];
    const cutoffObj = new Date();
    cutoffObj.setDate(cutoffObj.getDate() - 30);
    const cutoffStr = cutoffObj.toISOString().split('T')[0];

    const currentScores = {};
    Object.keys(MUSCLE_FACTORS).forEach(m => { currentScores[m] = 0; });

    Object.entries(dayScores).forEach(([dateStr, scores]) => {
      if (dateStr < cutoffStr || dateStr > todayStr) return;
      Object.entries(scores).forEach(([muscle, score]) => {
        if (currentScores[muscle] !== undefined) currentScores[muscle] += score;
      });
    });

    // ── 3. Mejor período histórico de 30 días (ventana deslizante) ───────────
    const bestScores = {};
    Object.keys(MUSCLE_FACTORS).forEach(m => { bestScores[m] = 0; });

    const allDates = Object.keys(dayScores).sort();
    for (let end = 0; end < allDates.length; end++) {
      const endMs  = new Date(allDates[end] + 'T00:00:00').getTime();
      const winTot = {};
      Object.keys(MUSCLE_FACTORS).forEach(m => { winTot[m] = 0; });

      for (let s = end; s >= 0; s--) {
        const diffDays = (endMs - new Date(allDates[s] + 'T00:00:00').getTime()) / 86400000;
        if (diffDays > 30) break;
        Object.entries(dayScores[allDates[s]] || {}).forEach(([muscle, score]) => {
          if (winTot[muscle] !== undefined) winTot[muscle] += score;
        });
      }
      Object.keys(MUSCLE_FACTORS).forEach(m => {
        if (winTot[m] > bestScores[m]) bestScores[m] = winTot[m];
      });
    }

    // ── 4. Calcular progreso y color ─────────────────────────────────────────
    return MUSCLE_GROUPS_LIST.map(muscle => {
      const current  = currentScores[muscle] ?? 0;
      const best     = bestScores[muscle]    ?? 0;
      const progress = best > 0 ? Math.min(current / best, 1.2) : (current > 0 ? 1.0 : 0);
      return { muscle, progress, isPR: progress >= 1.0, color: progressToColor(progress) };
    }).sort((a, b) => b.progress - a.progress);

  }, [diary, routines, library, selectedDate]);

  // Mapa rápido muscle → stat para los blobs
  const statsMap = Object.fromEntries(muscleStats.map(m => [m.muscle, m]));
  const hasData  = muscleStats.some(m => m.progress > 0.02);

  return (
    <div className="space-y-1">

      {/* ── Vistas del cuerpo ──────────────────────────────────────────── */}
      <div className="flex gap-2 justify-center px-1">
        <BodyView side="front" blobs={FRONT_BLOBS} statsMap={statsMap} isDark={isDark} />
        <BodyView side="back"  blobs={BACK_BLOBS}  statsMap={statsMap} isDark={isDark} />
      </div>

      {/* Leyenda – barra de gradiente */}
      <div className="px-1">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-semibold shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Sin trabajo
            </span>
            <div
              className="flex-1 h-2 rounded-full"
              style={{ background: `linear-gradient(to right, ${COLOR_STOPS.map(s => s.hex).join(', ')})` }}
            />
            <span className={`text-[9px] font-semibold shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              PR
            </span>
          </div>
          <div className="flex justify-between mt-0.5">
            {['Leve', 'Medio', 'Bueno', 'Intenso', 'Pico'].map(l => (
              <span key={l} className={`text-[8px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{l}</span>
            ))}
          </div>
      </div>
      {/* ── Lista de músculos ──────────────────────────────────────────── */}
      {hasData ? (
        <div className={`rounded-2xl px-4 py-3.5 space-y-2.5 ${isDark ? 'bg-white/5' : 'bg-slate-50 border border-slate-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>
            Últimos 30 días
          </p>
          {muscleStats.map((m, i) => (
            <div key={m.muscle} className="flex items-center gap-2.5">
              <span className={`text-[11px] font-black w-4 shrink-0 tabular-nums ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {i + 1}
              </span>
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.isPR ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: m.color }}
              />
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className={`text-sm font-bold shrink-0 ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ minWidth: '4.5rem' }}>
                  {m.muscle}
                </span>
                <div
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(m.progress, 1) * 100}%`,
                      backgroundColor: m.color,
                      boxShadow: m.isPR ? `0 0 8px 2px #fbbf24` : undefined,
                      filter:    m.isPR ? 'drop-shadow(0 0 4px #fbbf24)' : undefined,
                    }}
                  />
                </div>
              </div>
              <span
                className={`text-[11px] font-black tabular-nums shrink-0 transition-colors duration-500 ${m.isPR ? 'animate-pulse' : m.progress < 0.02 ? (isDark ? 'text-slate-600' : 'text-slate-400') : (isDark ? 'text-slate-300' : 'text-slate-600')}`}
                style={{ color: m.isPR ? '#f59e0b' : undefined, minWidth: '2.2rem', textAlign: 'right' }}
              >
                {formatProgress(m.progress)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-center text-sm font-medium py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Completá ejercicios para ver tu mapa muscular.
        </p>
      )}
    </div>
  );
}
