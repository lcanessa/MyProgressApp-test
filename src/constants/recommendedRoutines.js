import { MOCK_LIBRARY } from './defaults';

export const RECOMMENDED_ROUTINES_LOADED_KEY = 'myprogress_test_recommended_loaded_v1';

export const RECOMMENDED_BLOCKS = [
  { id: 'r1', name: 'Empuje (Pecho/Tríceps)' },
  { id: 'r2', name: 'Tracción (Espalda/Bíceps)' },
  { id: 'r3', name: 'Piernas y Hombros' },
];

/** Plantilla PPL: ejercicios del catálogo con series y reps sugeridas. */
const RECOMMENDED_TEMPLATE = {
  r1: [
    { exId: '1', sets: 4, targetReps: '6-8' },
    { exId: '2', sets: 3, targetReps: '8-10' },
    { exId: '3', sets: 3, targetReps: '12-15' },
    { exId: '4', sets: 3, targetReps: '10-12' },
    { exId: '5', sets: 3, targetReps: '8-12' },
  ],
  r2: [
    { exId: '6', sets: 4, targetReps: '6-10' },
    { exId: '7', sets: 4, targetReps: '8-10' },
    { exId: '8', sets: 3, targetReps: '10-12' },
    { exId: '9', sets: 3, targetReps: '10-12' },
    { exId: '10', sets: 3, targetReps: '10-12' },
  ],
  r3: [
    { exId: '11', sets: 4, targetReps: '6-8' },
    { exId: '12', sets: 3, targetReps: '10-12' },
    { exId: '13', sets: 3, targetReps: '10-12' },
    { exId: '14', sets: 3, targetReps: '8-10' },
    { exId: '15', sets: 3, targetReps: '12-15' },
  ],
};

function toRoutineEntry({ exId, sets, targetReps }) {
  const lib = MOCK_LIBRARY.find((e) => e.id === exId);
  if (!lib) return null;
  return {
    exId,
    name: lib.name,
    customName: lib.name,
    sets,
    targetReps,
  };
}

export function getRecommendedSetup() {
  const routines = {};
  for (const [rid, template] of Object.entries(RECOMMENDED_TEMPLATE)) {
    routines[rid] = template.map(toRoutineEntry).filter(Boolean);
  }
  return {
    blocks: RECOMMENDED_BLOCKS.map((b) => ({ ...b })),
    routines,
  };
}
