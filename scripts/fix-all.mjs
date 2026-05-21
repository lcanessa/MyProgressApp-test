import fs from 'fs';
import path from 'path';

const files = [
  'src/features/edit/EditRoutineTab.jsx',
  'src/features/library/LibraryTab.jsx',
  'src/features/stats/StatsTab.jsx',
  'src/modals/DeleteRoutineModal.jsx',
  'src/modals/MultiSelectModal.jsx',
  'src/modals/FullCalendarModal.jsx',
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/return \(\n\s*\{\/\*[\s\S]*?\*\/\}\n/g, 'return (\n');
  c = c.replace(/\{\/\*[\s\S]*?\*\/\}\n\s*(?=<div)/g, '');
  c = c.replace(/\.\.\.newExData/g, '...app.newExData');
  c = c.replace(/\.\.\.editingExData/g, '...app.editingExData');
  c = c.replace(/\[\.\.\.currentRoutineExercises\]/g, '[...app.currentRoutineExercises]');
  c = c.replace(/\{\.\.\.routines,/g, '{...app.routines,');
  c = c.replace(
    /app\.setCalendarViewDate\(new Date\(app\.calendarViewDate\.getFullYear\(\), app\.calendarViewDate\.getMonth\(\) - 1, 1\)\n/g,
    'app.setCalendarViewDate(new Date(app.calendarViewDate.getFullYear(), app.calendarViewDate.getMonth() - 1, 1))}\n',
  );
  if (file.includes('EditRoutineTab')) {
    c = c.replace(
      /(<p className="text-xs font-medium">Esta rutina está archivada[\s\S]*?<\/div>)\n\s*\n\s*(\{\/\* CABECERA)/,
      '$1\n    )}\n\n    $2'.replace('{\/\* CABECERA', '<motion'),
    );
    c = c.replace(
      '    <p className="text-xs font-medium">Esta rutina está archivada porque la eliminaste. Puedes verla pero ya no puedes modificarla ni agregarle ejercicios.</p>\n    </motion>\n    \n    <motion className="flex items-center gap-3 mb-2">',
      '    <p className="text-xs font-medium">Esta rutina está archivada porque la eliminaste. Puedes verla pero ya no puedes modificarla ni agregarle ejercicios.</p>\n    </div>\n    )}\n\n    <div className="flex items-center gap-3 mb-2">',
    );
    c = c.replace(/\n    \)\}\n  \);\n}\s*$/, '\n  );\n}\n');
  }
  if (file.includes('modals') || file.includes('FullCalendar')) {
    c = c.replace(/\n    \)\}\n  \);\n}\s*$/, '\n  );\n}\n');
  }
  if (file.includes('LibraryTab')) {
    c = c.replace(/\n    \)\}\n  \);\n}\s*$/, '\n  );\n}\n');
    c = c.replace('{MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>\n    </select>', '{MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}\n    </select>');
  }
  fs.writeFileSync(file, c);
  console.log('fixed', file);
}
