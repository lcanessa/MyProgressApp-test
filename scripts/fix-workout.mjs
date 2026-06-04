import fs from 'fs';

const src = fs.readFileSync('src/App.jsx', 'utf8');
const s = src.indexOf('{/* --- TAB: WORKOUT --- */}');
const e = src.indexOf('{/* --- TAB: EDIT RUTINA --- */}');
let body = src.slice(s, e)
  .replace('{/* --- TAB: WORKOUT --- */}\n{activeTab === \'workout\' && (\n', '')
  .replace(/\)\}\s*$/, '');

const vars = [
  'isDark', 'currentRoutineExercises', 'currentBlock', 'currentDayData', 'activeRoutineId',
  'expandedEx', 'setExpandedEx', 'history', 'toggleComplete', 'startTimer', 'updateSessionData',
];
for (const v of vars.sort((a, b) => b.length - a.length)) {
  body = body.replace(new RegExp(`(?<![.\\w])${v}(?![\\w])`, 'g'), `app.${v}`);
}

const content = `import { CheckCircle2, ChevronDown, Timer, Dumbbell } from 'lucide-react';

export default function WorkoutTab({ app }) {
  return (
${body.split('\n').map((l) => '    ' + l).join('\n')}
  );
}
`;

fs.writeFileSync('src/features/workout/WorkoutTab.jsx', content);
