import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import DualLineChart from '../charts/DualLineChart';
import { getExerciseProgressChart } from '../../utils/exerciseChart';

export default function ExerciseProgressChart({ exerciseName, routineId, diary, routines, isDark }) {
  const { weightData, repsData } = useMemo(
    () => getExerciseProgressChart(exerciseName, routineId, diary, routines),
    [exerciseName, routineId, diary, routines]
  );

  return (
    <div
      className={`mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`flex items-center gap-2 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <TrendingUp size={14} className="text-purple-500 shrink-0" />
        <span className="text-[9px] font-black uppercase tracking-widest">Tu progreso</span>
      </div>
      <DualLineChart
        weightData={weightData}
        repsData={repsData}
        isDark={isDark}
        weightColor="#a855f7"
        repsColor="#38bdf8"
      />
    </div>
  );
}
