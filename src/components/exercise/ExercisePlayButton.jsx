import { CirclePlay } from 'lucide-react';

export default function ExercisePlayButton({ onClick, isDark, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ver técnica del ejercicio"
      title="Ver técnica"
      className={`p-2 rounded-xl transition-colors border shrink-0 ${
        isDark
          ? 'text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20'
          : 'text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-200'
      } ${className}`}
    >
      <CirclePlay size={18} />
    </button>
  );
}
