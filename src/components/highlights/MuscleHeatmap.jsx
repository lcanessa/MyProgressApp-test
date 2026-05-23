import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Center } from '@react-three/drei';
import * as THREE from 'three';
import { muscleHeatColor } from '../../utils/highlights';

// ─── Constantes ────────────────────────────────────────────────────────────────

const MUSCLE_GROUPS_LIST = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio', 'Otro'];

const LEVEL_COLORS = ['#475569', '#22c55e', '#eab308', '#f97316', '#dc2626'];

// ── MUSCLE MAPPING ────────────────────────────────────────────────────────────
// Completar con los nombres reales de los nodos del GLB.
// Para descubrirlos: abrí la app, andá a Cuerpo y tocá cada zona del modelo
// → la consola mostrará: [MuscleHeatmap] Clickeaste: "NombreDelNodo"
// Cada grupo puede tener múltiples nodos (ej: izquierdo + derecho).
// ─────────────────────────────────────────────────────────────────────────────
const MUSCLE_MAPPING = {
  Pecho:   ['Object_29'],
  Espalda: ['Object_13'],
  Piernas: ['Object_9'],
  Hombros: ['Object_5'],
  Brazos:  ['Object_33'],
  Core:    ['Object_23'],
};

const LEGEND = [
  { label: 'Sin trabajo', pct: 0    },
  { label: 'Ligero',      pct: 0.15 },
  { label: 'Moderado',    pct: 0.45 },
  { label: 'Intenso',     pct: 0.73 },
  { label: 'Pico',        pct: 1    },
];

const formatSets = (n) => n === 1 ? '1 serie' : `${n} series`;

// ─── Lookup inverso: nodeName → muscleName ─────────────────────────────────

const NODE_TO_MUSCLE = (() => {
  const map = {};
  Object.entries(MUSCLE_MAPPING).forEach(([muscle, names]) => {
    names.forEach((n) => { map[n] = muscle; });
  });
  return map;
})();

// ─── Modelo 3D ─────────────────────────────────────────────────────────────────

function HumanModel({ muscleStats, isDark }) {
  const { scene } = useGLTF('/male_full_body.glb');
  const matsRef = useRef(new Map()); // meshName → { mesh, mat }

  // ── Primera carga: loguear nombres y clonar materiales ──────────────────────
  useEffect(() => {
    const names = [];
    const map   = new Map();

    scene.traverse((child) => {
      if (!child.isMesh) return;
      names.push(child.name);

      // Clonar material para que cada mesh tenga el suyo propio
      const mat = new THREE.MeshStandardMaterial({
        metalness: 0.08,
        roughness: 0.68,
        side: THREE.DoubleSide,
      });
      child.material = mat;
      map.set(child.name, { mesh: child, mat });
    });

    matsRef.current = map;
    console.log('[MuscleHeatmap] Meshes disponibles (tocá uno para identificarlo):', names);
  }, [scene]);

  // ── Actualizar colores en vivo cuando cambian las stats ─────────────────────
  useEffect(() => {
    const statsByMuscle = Object.fromEntries(muscleStats.map((m) => [m.muscle, m]));

    matsRef.current.forEach(({ mat }, name) => {
      const muscleName = NODE_TO_MUSCLE[name];
      const stat  = muscleName ? statsByMuscle[muscleName] : null;
      const level = stat?.colorLevel ?? 0;
      const hex   = LEVEL_COLORS[level];

      // Sin mapping → color carne base; con mapping → tono calor emissive
      mat.color.set(isDark ? '#a07858' : '#b8916a');
      mat.emissive.set(hex);
      mat.emissiveIntensity = level === 0 ? 0.02 : 0.5;
    });
  }, [muscleStats, isDark]);

  // ── Click: imprime el nombre del mesh tocado en la consola ─────────────────
  const handleClick = (e) => {
    e.stopPropagation();
    const name = e.object?.name;
    if (name) console.log(`[MuscleHeatmap] Clickeaste: "${name}"`);
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
        <directionalLight position={[3, 5, 3]}  intensity={1.5} />
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
    const stats = {};
    MUSCLE_GROUPS_LIST.forEach((m) => { stats[m] = 0; });

    const now = new Date();
    const todayStr    = now.toISOString().split('T')[0];
    const cutoffObj   = new Date(now);
    cutoffObj.setDate(cutoffObj.getDate() - 30);
    const cutoffStr   = cutoffObj.toISOString().split('T')[0];

    Object.keys(diary).forEach((dateStr) => {
      if (dateStr < cutoffStr || dateStr > todayStr) return;
      const dayData = diary[dateStr];
      if (!dayData?.sessions) return;

      const counted = new Set();
      Object.entries(dayData.sessions).forEach(([key, value]) => {
        const parts = key.split('-');
        if (parts.length < 4) return;

        const rId    = parts[0];
        const exIdx  = parseInt(parts[1], 10);
        const sIdxStr = parts[2];

        if (!dayData.completed?.[`${rId}-${exIdx}`]) return;

        const valNum = parseFloat(value);
        if (isNaN(valNum) || valNum <= 0) return;

        const uid = `${dateStr}-${rId}-${exIdx}-${sIdxStr}`;
        if (counted.has(uid)) return;
        counted.add(uid);

        const routineEx = routines[rId]?.[exIdx];
        if (!routineEx) return;

        const libEx = library.find(
          (l) => l.id === routineEx.exId || l.name === routineEx.customName,
        );
        const muscle = libEx ? libEx.muscle : 'Otro';
        if (stats[muscle] !== undefined) stats[muscle] += 1;
        else stats['Otro'] += 1;
      });
    });

    const sorted  = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    const maxSets = sorted[0][1] || 1;

    return sorted.map(([muscle, totalSets]) => {
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

  const hasData = muscleStats.some((m) => m.totalSets > 0);

  return (
    <div className="space-y-5">
      {/* Modelo 3D interactivo */}
      <BodyScene3D muscleStats={muscleStats} isDark={isDark} />

      {/* Leyenda */}
      <div className="flex justify-between px-1">
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
              <span className={`text-[11px] font-black tabular-nums shrink-0 ${m.totalSets === 0 ? (isDark ? 'text-slate-600' : 'text-slate-400') : (isDark ? 'text-slate-300' : 'text-slate-600')}`}>
                {m.totalSets === 0 ? '—' : formatSets(m.totalSets)}
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
