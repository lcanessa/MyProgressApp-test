import fs from 'fs';

const src = fs.readFileSync('src/App.jsx', 'utf8');

function slice(start, end) {
  const s = src.indexOf(start);
  if (s === -1) throw new Error(`Start not found: ${start}`);
  const e = end ? src.indexOf(end, s + start.length) : src.length;
  return src.slice(s, e).trim();
}

const sections = {
  AppHeader: [ '{/* CABECERA (Dinámica) */}', '{/* ÁREA CENTRAL */}' ],
  WorkoutTab: [ '{/* --- TAB: WORKOUT --- */}', '{/* --- TAB: EDIT RUTINA --- */}' ],
  EditRoutineTab: [ '{/* --- TAB: EDIT RUTINA --- */}', '{/* --- TAB: ABM CATALOGO AGRUPADO --- */}' ],
  LibraryTab: [ '{/* --- TAB: ABM CATALOGO AGRUPADO --- */}', '{/* --- TAB: ESTADÍSTICAS --- */}' ],
  StatsTab: [ '{/* --- TAB: ESTADÍSTICAS --- */}', '{/* --- MODALES FLOTANTES --- */}' ],
  DeleteRoutineModal: [ '{/* Modal Confirmación Borrar Rutina */}', '{/* Modal Selector Múltiple de Ejercicios */}' ],
  MultiSelectModal: [ '{/* Modal Selector Múltiple de Ejercicios */}', '{/* Modal de Calendario Completo Mensual */}' ],
  FullCalendarModal: [ '{/* Modal de Calendario Completo Mensual */}', '{/* --- MENU INFERIOR SLIM --- */}' ],
  BottomNav: [ '{/* --- MENU INFERIOR SLIM --- */}', '</motion>' ],
};

const appVars = [
  'isDark', 'setIsDark', 'activeTab', 'goToToday', 'setCalendarViewDate', 'setShowFullCalendar',
  'calendarRef', 'calendarDays', 'selectedDate', 'changeDate', 'diary', 'getAlias', 'routinesRef',
  'activeBlocks', 'currentBlock', 'activeRoutineId', 'changeRoutineManually', 'handleAddRoutineBlock',
  'workoutProgress', 'currentRoutineExercises', 'currentDayData', 'expandedEx', 'setExpandedEx',
  'history', 'toggleComplete', 'startTimer', 'updateSessionData', 'currentRoutineName',
  'routineBlocks', 'setRoutineBlocks', 'setShowDeleteModal', 'setShowMultiSelect', 'setSelectedExIds',
  'setSearchTerm', 'routines', 'setRoutines', 'removeExerciseFromRoutine', 'showNewExForm',
  'setShowNewExForm', 'newExData', 'setNewExData', 'handleAddNewExercise', 'searchTerm', 'groupedLibrary',
  'filteredLibrary', 'editingExId', 'editingExData', 'setEditingExData', 'saveEditedEx', 'setEditingExId',
  'startEditingEx', 'deleteExerciseFromLibrary', 'statsRoutineId', 'setStatsRoutineId',
  'statsChartData', 'showDeleteModal', 'confirmDeleteRoutine', 'showMultiSelect', 'selectedExIds',
  'toggleExSelection', 'confirmMultiAdd', 'showFullCalendar', 'setShowFullCalendar', 'calendarViewDate',
  'setCalendarViewDate', 'displayMonthName', 'fullCalendarGrid', 'setActiveTab',
];

function prefixApp(jsx) {
  let r = jsx
    .replace(/^\{activeTab === '[^']+' && \(\n?/m, '')
    .replace(/^\{show\w+ && \(\n?/m, '')
    .replace(/\)\}\s*$/m, '');
  for (const v of [...appVars].sort((a, b) => b.length - a.length)) {
    r = r.replace(new RegExp(`(?<![.\\w])${v}(?![\\w])`, 'g'), `app.${v}`);
  }
  r = r.replace(/(\w+)={app\.(\w+)}/g, (m, prop, varName) => (prop === varName ? `${prop}={app.${varName}}` : m));
  r = r.replace(/<MyProgressLogo app\.isDark=/g, '<MyProgressLogo isDark=');
  r = r.replace(/app\.MUSCLE_GROUPS/g, 'MUSCLE_GROUPS');
  r = r.replace(/app\.toLocalISODate/g, 'toLocalISODate');
  return r;
}

const files = {
  AppHeader: {
    path: 'src/components/layout/AppHeader.jsx',
    imports: `import { Sun, Moon, CalendarDays, Plus } from 'lucide-react';\nimport MyProgressLogo from '../brand/MyProgressLogo';\n`,
  },
  WorkoutTab: {
    path: 'src/features/workout/WorkoutTab.jsx',
    imports: `import { CheckCircle2, ChevronDown, Timer, Dumbbell } from 'lucide-react';\n`,
  },
  EditRoutineTab: {
    path: 'src/features/edit/EditRoutineTab.jsx',
    imports: `import { AlertTriangle, Edit2, Trash2, Plus, X } from 'lucide-react';\n`,
  },
  LibraryTab: {
    path: 'src/features/library/LibraryTab.jsx',
    imports: `import { Search, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';\nimport { MUSCLE_GROUPS } from '../../constants/muscles';\n`,
  },
  StatsTab: {
    path: 'src/features/stats/StatsTab.jsx',
    imports: `import { BarChart3, Award } from 'lucide-react';\nimport SimpleLineChart from '../../components/charts/SimpleLineChart';\n`,
  },
  DeleteRoutineModal: {
    path: 'src/modals/DeleteRoutineModal.jsx',
    imports: `import { Trash2 } from 'lucide-react';\n`,
  },
  MultiSelectModal: {
    path: 'src/modals/MultiSelectModal.jsx',
    imports: `import { Search, X, Plus, CheckCircle2, Circle } from 'lucide-react';\n`,
  },
  FullCalendarModal: {
    path: 'src/modals/FullCalendarModal.jsx',
    imports: `import { ChevronLeft, ChevronRight } from 'lucide-react';\nimport { toLocalISODate } from '../utils/date';\n`,
  },
  BottomNav: {
    path: 'src/components/layout/BottomNav.jsx',
    imports: `import { Dumbbell, ClipboardList, List, BarChart3 } from 'lucide-react';\n`,
  },
};

for (const [name, [start, end]] of Object.entries(sections)) {
  let body = prefixApp(slice(start, end));
  if (name === 'AppHeader') body = body.replace('{/* CABECERA (Dinámica) */}\n', '');
  if (name === 'BottomNav') body = body.replace('{/* --- MENU INFERIOR SLIM --- */}\n', '');
  const { path, imports } = files[name];
  const content = `${imports}
export default function ${name}({ app }) {
  return (
${body.split('\n').map((l) => '    ' + l).join('\n')}
  );
}
`;
  fs.writeFileSync(path, content);
  console.log('wrote', path);
}
