import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Center } from '@react-three/drei';
import * as THREE from 'three';
import { muscleHeatColor } from '../../utils/highlights';

// ─── Constantes ────────────────────────────────────────────────────────────────

const MUSCLE_GROUPS_LIST = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core', 'Cardio', 'Otro'];

// Colores por nivel de entrenamiento
const LEVEL_COLORS = ['#475569', '#22c55e', '#eab308', '#f97316', '#dc2626'];

// Mapa de keywords → grupo muscular.
// Si el modelo tiene meshes con nombres descriptivos (ej: "chest", "bicep"),
// se mapean automáticamente. El modelo actual tiene nombres genéricos (Object_N),
// por lo que se aplica el color global a todo el modelo.
const MUSCLE_KEYWORDS = {
  Pecho:   ['pecho', 'chest', 'pectoral', 'pect'],
  Espalda: ['espalda', 'back', 'lat', 'dorsal', 'trap'],
  Piernas: ['pierna', 'leg', 'quad', 'hamstring', 'glute', 'calf'],
  Hombros: ['hombro', 'shoulder', 'delt'],
  Brazos:  ['brazo', 'arm', 'bicep', 'tricep', 'forearm'],
  Core:    ['core', 'abs', 'abdom', 'oblique'],
};

const LEGEND = [
  { label: 'Sin trabajo', pct: 0    },
  { label: 'Ligero',      pct: 0.15 },
  { label: 'Moderado',    pct: 0.45 },
  { label: 'Intenso',     pct: 0.73 },
  { label: 'Pico',        pct: 1    },
];

const formatSets = (n) => n === 1 ? '1 serie' : `${n} series`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getMuscleFromMeshName(name) {
  const lower = name.toLowerCase();
  for (const [muscle, keywords] of Object.entries(MUSCLE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return muscle;
  }
  return null;
}

// ─── Modelo 3D ─────────────────────────────────────────────────────────────────

function HumanModel({ muscleStats, isDark }) {
  const { scene } = useGLTF('/scene.gltf');
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const materialsRef = useRef([]);

  // Construir lookup muscle → colorLevel
  const statsByMuscle = useMemo(
    () => Object.fromEntries(muscleStats.map((m) => [m.muscle, m])),
    [muscleStats],
  );

  // Color global = nivel del músculo más trabajado (fallback cuando no hay nombres)
  const globalLevel = useMemo(
    () => Math.max(0, ...muscleStats.map((m) => m.colorLevel)),
    [muscleStats],
  );

  // Primera pasada: clonar materiales y guardar referencias
  useEffect(() => {
    const mats = [];
    clonedScene.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const mat = new THREE.MeshStandardMaterial({
        metalness: 0.08,
        roughness: 0.65,
        side: THREE.DoubleSide,
      });
      child.material = mat;
      mats.push({ mesh: child, mat });
    });
    materialsRef.current = mats;
  }, [clonedScene]);

  // Segunda pasada: actualizar colores en vivo cuando cambian muscleStats
  useEffect(() => {
    materialsRef.current.forEach(({ mesh, mat }) => {
      const muscleName = getMuscleFromMeshName(mesh.name);
      const stat = muscleName ? statsByMuscle[muscleName] : null;
      // Si no hay match por nombre, usa el nivel global del cuerpo
      const level = stat?.colorLevel ?? globalLevel;
      const hex = LEVEL_COLORS[level] ?? LEVEL_COLORS[0];

      const baseColor = isDark ? '#c8a882' : '#c8a882';
      mat.color = new THREE.Color(baseColor);
      mat.emissive = new THREE.Color(hex);
      mat.emissiveIntensity = level === 0 ? 0.05 : 0.45;
    });
  }, [statsByMuscle, globalLevel, isDark]);

  return <primitive object={clonedScene} dispose={null} />;
}

// Preload para que empiece a cargar antes de renderizar
useGLTF.preload('/scene.gltf');

// ─── Escena completa ───────────────────────────────────────────────────────────

function LoadingBody({ isDark }) {
  return (
    <mesh>
      <boxGeometry args={[0.01, 0.01, 0.01]} />
      <meshBasicMaterial color={isDark ? '#334155' : '#cbd5e1'} />
    </mesh>
  );
}

function BodyScene3D({ muscleStats, isDark }) {
  const bgColor = isDark ? '#0f172a' : '#f1f5f9';

  return (
    <div
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: 360 }}
    >
      <Canvas
        camera={{ fov: 45, near: 0.001, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: bgColor }}
      >
        <ambientLight intensity={isDark ? 0.55 : 0.75} />
        <directionalLight position={[2, 4, 3]} intensity={1.4} castShadow={false} />
        <directionalLight position={[-2, -1, -2]} intensity={0.35} />

        <Suspense fallback={<LoadingBody isDark={isDark} />}>
          {/* Bounds auto-ajusta la cámara al bounding box real del modelo */}
          <Bounds fit clip observe margin={1.1}>
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

// ─── Cálculo de datos (useMemo) ────────────────────────────────────────────────

export default function MuscleHeatmap({ diary, routines, library, isDark, selectedDate }) {
  const muscleStats = useMemo(() => {
    const stats = {};
    MUSCLE_GROUPS_LIST.forEach((m) => { stats[m] = 0; });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const cutoffObj = new Date(now);
    cutoffObj.setDate(cutoffObj.getDate() - 30);
    const cutoffDateStr = cutoffObj.toISOString().split('T')[0];

    Object.keys(diary).forEach((dateStr) => {
      if (dateStr < cutoffDateStr || dateStr > todayStr) return;

      const dayData = diary[dateStr];
      if (!dayData?.sessions) return;

      const countedSets = new Set();

      Object.entries(dayData.sessions).forEach(([key, value]) => {
        const parts = key.split('-');
        if (parts.length < 4) return;

        const rId = parts[0];
        const exIdx = parseInt(parts[1], 10);
        const sIdxStr = parts[2];

        const completedKey = `${rId}-${exIdx}`;
        if (!dayData.completed?.[completedKey]) return;

        const valNum = parseFloat(value);
        if (isNaN(valNum) || valNum <= 0) return;

        const uniqueSetId = `${dateStr}-${rId}-${exIdx}-${sIdxStr}`;
        if (countedSets.has(uniqueSetId)) return;
        countedSets.add(uniqueSetId);

        const routineEx = routines[rId]?.[exIdx];
        if (!routineEx) return;

        const libEx = library.find(
          (l) => l.id === routineEx.exId || l.name === routineEx.customName,
        );
        const muscleName = libEx ? libEx.muscle : 'Otro';
        if (stats[muscleName] !== undefined) stats[muscleName] += 1;
        else stats['Otro'] += 1;
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

  const hasData = muscleStats.some((m) => m.totalSets > 0);

  return (
    <div className="space-y-5">
      {/* Modelo 3D */}
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
      ) : (
        <p className={`text-center text-sm font-medium py-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Completá ejercicios para ver tu mapa muscular.
        </p>
      )}
    </div>
  );
}
