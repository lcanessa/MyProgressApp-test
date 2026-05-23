import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Center } from '@react-three/drei';
import * as THREE from 'three';

// ─── Grupos y factores de balance muscular ─────────────────────────────────────
// El factor compensa que piernas/espalda mueven mucho más peso por naturaleza.
const MUSCLE_FACTORS = {
  Brazos:  1.80,
  Hombros: 1.45,
  Core:    1.30,
  Pecho:   1.00,
  Espalda: 0.90,
  Piernas: 0.55,
};

const MUSCLE_GROUPS_LIST = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio'];

// ─── Escala de colores (7 niveles) ────────────────────────────────────────────
const COLOR_STOPS = [
  { at: 0.00, hex: '#334155' }, // sin trabajo – gris oscuro
  { at: 0.15, hex: '#3b82f6' }, // leve        – azul
  { at: 0.35, hex: '#22c55e' }, // medio        – verde
  { at: 0.55, hex: '#eab308' }, // bueno        – amarillo
  { at: 0.75, hex: '#f97316' }, // intenso      – naranja
  { at: 0.90, hex: '#dc2626' }, // pico         – rojo
  { at: 1.00, hex: '#f59e0b' }, // PR           – dorado
];

// ─── MUSCLE MAPPING ────────────────────────────────────────────────────────────
// Completar con los nombres reales de los nodos del GLB.
// Para descubrirlos: abrí la app → pestaña Cuerpo → tocá una zona del modelo.
// La consola muestra: [MuscleHeatmap] Clickeaste: "NombreDelNodo"
const MUSCLE_MAPPING = {
  Pecho:   [],
  Espalda: [],
  Piernas: [],
  Hombros: [],
  Brazos:  [],
  Core:    [],
};

// ─── Utilidades de color ───────────────────────────────────────────────────────

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
      const t = (p - a.at) / (b.at - a.at);
      return lerpColor(a.hex, b.hex, t);
    }
  }
  return '#f59e0b'; // dorado para > 1.0
}

const formatProgress = (progress) =>
  progress >= 1.0 ? 'PR' : progress < 0.02 ? '—' : `${Math.round(progress * 100)}%`;

// ─── Lookup inverso: nodeName → muscleName ────────────────────────────────────

const NODE_TO_MUSCLE = (() => {
  const map = {};
  Object.entries(MUSCLE_MAPPING).forEach(([muscle, names]) => {
    names.forEach(n => { map[n] = muscle; });
  });
  return map;
})();

// ─── Modelo 3D ─────────────────────────────────────────────────────────────────

function HumanModel({ muscleStats, isDark }) {
  const { scene }  = useGLTF('/male_full_body.glb');
  const matsRef    = useRef(new Map()); // meshName → { mat, isPR }
  const clockRef   = useRef(0);

  // Primera carga: loguear nodos y clonar materiales
  useEffect(() => {
    const names = [];
    const map   = new Map();
    scene.traverse(child => {
      if (!child.isMesh) return;
      names.push(child.name);
      const mat = new THREE.MeshStandardMaterial({
        metalness: 0.08,
        roughness: 0.68,
        side: THREE.DoubleSide,
      });
      child.material = mat;
      map.set(child.name, { mat, isPR: false });
    });
    matsRef.current = map;
    console.log(`%c[MuscleHeatmap] ${names.length} meshes en el modelo:`, 'color:#f59e0b;font-weight:bold');
    names.forEach((n, i) => console.log(`  ${String(i+1).padStart(2,'0')}. "${n}"`));
  }, [scene]);

  // Actualizar colores cuando cambian las stats
  useEffect(() => {
    const byMuscle = Object.fromEntries(muscleStats.map(m => [m.muscle, m]));
    matsRef.current.forEach((entry, name) => {
      const muscleName = NODE_TO_MUSCLE[name];
      const stat     = muscleName ? byMuscle[muscleName] : null;
      const progress = stat?.progress ?? 0;
      const color    = progressToColor(progress);
      const isPR     = progress >= 1.0;
      entry.isPR = isPR;
      entry.mat.color.set(isDark ? '#a07858' : '#b8916a');
      entry.mat.emissive.set(color);
      entry.mat.emissiveIntensity = progress < 0.05 ? 0.02 : (isPR ? 0.65 : 0.45);
    });
  }, [muscleStats, isDark]);

  // Animación de pulso dorado para músculos en PR
  useFrame((_, delta) => {
    clockRef.current += delta;
    const pulse = 0.45 + 0.55 * Math.abs(Math.sin(clockRef.current * 2.5));
    matsRef.current.forEach(({ mat, isPR }) => {
      if (isPR) mat.emissiveIntensity = pulse;
    });
  });

  const handleClick = e => {
    e.stopPropagation();
    const name = e.object?.name;
    if (name) console.log(`%c[MuscleHeatmap] Clickeaste: "${name}"`, 'color:#22c55e;font-weight:bold');
  };

  return <primitive object={scene} dispose={null} onClick={handleClick} />;
}

useGLTF.preload('/male_full_body.glb');

// ─── Escena ────────────────────────────────────────────────────────────────────

function BodyScene3D({ muscleStats, isDark }) {
  const bg = isDark ? '#0f172a' : '#f1f5f9';
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ height: 380 }}>
      <Canvas
        camera={{ fov: 45, near: 0.001, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: bg }}
      >
        <ambientLight intensity={isDark ? 0.55 : 0.8} />
        <directionalLight position={[3, 5, 3]}   intensity={1.5} />
        <directionalLight position={[-3, -2, -3]} intensity={0.4} />

        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.15}>
            <Center>
              <HumanModel muscleStats={muscleStats} isDark={isDark} />
            </Center>
          </Bounds>
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={(Math.PI * 5) / 6}
          autoRotate
          autoRotateSpeed={0.7}
        />
      </Canvas>
    </div>
  );
}

// ─── Cálculo de datos ──────────────────────────────────────────────────────────

export default function MuscleHeatmap({ diary, routines, library, isDark, selectedDate }) {
  const muscleStats = useMemo(() => {
    // ── 1. Puntaje por día y músculo ─────────────────────────────────────────
    const dayScores = {}; // dateStr → { muscle → score }

    Object.keys(diary).forEach(dateStr => {
      const dayData = diary[dateStr];
      if (!dayData?.sessions) return;

      // Agrupar por set (rId-exIdx-sIdx) para obtener peso Y reps del mismo set
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
        // Solo series de ejercicios completados
        if (!dayData.completed?.[`${rId}-${exIdx}`]) return;
        if (w <= 0 && r <= 0) return;

        const routineEx = routines[rId]?.[exIdx];
        if (!routineEx) return;

        const libEx  = library.find(l => l.id === routineEx.exId || l.name === routineEx.customName);
        const muscle = libEx?.muscle;
        if (!muscle || !MUSCLE_FACTORS[muscle]) return;

        // Peso cero → ejercicio corporal: volumen = reps
        const rawVol = w > 0 ? w * Math.max(r, 1) : Math.max(r, 1);
        const score  = Math.pow(rawVol, 0.7) * MUSCLE_FACTORS[muscle];

        if (!dayScores[dateStr]) dayScores[dateStr] = {};
        dayScores[dateStr][muscle] = (dayScores[dateStr][muscle] || 0) + score;
      });
    });

    // ── 2. Score actual (últimos 30 días desde hoy) ──────────────────────────
    const now       = new Date();
    const todayStr  = now.toISOString().split('T')[0];
    const cutoff    = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString().split('T')[0];

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
      const current = currentScores[muscle] ?? 0;
      const best    = bestScores[muscle]    ?? 0;
      const progress = best > 0 ? Math.min(current / best, 1.2) : (current > 0 ? 1.0 : 0);
      return {
        muscle,
        progress,
        isPR:  progress >= 1.0,
        color: progressToColor(progress),
      };
    }).sort((a, b) => b.progress - a.progress);

  }, [diary, routines, library]);

  const hasData = muscleStats.some(m => m.progress > 0.02);

  return (
    <div className="space-y-5">
      {/* Modelo 3D */}
      <BodyScene3D muscleStats={muscleStats} isDark={isDark} />

      {/* Leyenda – barra de gradiente compacta */}
      <div className="px-1">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-semibold shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Sin trabajo
          </span>
          <div
            className="flex-1 h-2 rounded-full"
            style={{
              background: `linear-gradient(to right, ${COLOR_STOPS.map(s => s.hex).join(', ')})`,
            }}
          />
          <span className={`text-[9px] font-semibold shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            PR
          </span>
        </div>
        <div className="flex justify-between mt-0.5 px-0">
          {['Leve', 'Medio', 'Bueno', 'Intenso', 'Pico'].map(l => (
            <span key={l} className={`text-[8px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{l}</span>
          ))}
        </div>
      </div>

      {/* Lista de músculos */}
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
              {/* Dot con pulso dorado para PRs */}
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.isPR ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: m.color }}
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
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min(m.progress, 1) * 100}%`,
                      backgroundColor: m.color,
                      boxShadow: m.isPR ? `0 0 6px 1px ${m.color}` : undefined,
                    }}
                  />
                </div>
              </div>
              {/* Progreso % o badge PR */}
              <span
                className={`text-[11px] font-black tabular-nums shrink-0 transition-colors duration-500 ${
                  m.isPR
                    ? 'animate-pulse'
                    : m.progress < 0.02
                    ? (isDark ? 'text-slate-600' : 'text-slate-400')
                    : (isDark ? 'text-slate-300' : 'text-slate-600')
                }`}
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
