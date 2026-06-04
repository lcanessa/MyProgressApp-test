import fs from 'fs';

const deleteLib = `import { AlertTriangle } from 'lucide-react';

export default function DeleteLibraryExerciseModal({ app }) {
  const ex = app.library.find((e) => e.id === app.libraryExerciseToDelete);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-200">
      <motionlessModalBackdrop />
    </div>
  );
}
`;

// Fix: use real JSX
const deleteLibFixed = deleteLib.replace(
  '<motionlessModalBackdrop />',
  `<motionlessModalBackdrop />`
);
