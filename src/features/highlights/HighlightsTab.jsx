import { useMemo } from 'react';
import {
  Flame,
  Calendar,
  Dumbbell,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { computeHighlights, formatVolume } from '../../utils/highlights';
import HighlightStatCard from '../../components/highlights/HighlightStatCard';
import WeeklyActivityChart from '../../components/highlights/WeeklyActivityChart';
import Last7DaysStrip from '../../components/highlights/Last7DaysStrip';
import PersonalRecordsCard from '../../components/highlights/PersonalRecordsCard';
import HomeGreeting from '../../components/highlights/HomeGreeting';
import MuscleRadarChart from '../../components/highlights/MuscleRadarChart';
import MuscleHeatmap from '../../components/highlights/MuscleHeatmap';

export default function HighlightsTab({ app }) {
  const stats = useMemo(
    () => computeHighlights({ diary: app.diary, routines: app.routines, library: app.library }),
    [app.diary, app.routines, app.library]
  );

  const isDark = app.isDark;

  if (!stats.hasData) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 pb-2">
        <HomeGreeting app={app} weekStreak={0} />
        <div className="flex flex-col items-center justify-center text-center w-full px-2 py-6">
          <div
            className={`w-full max-w-[17rem] mx-auto rounded-3xl border p-8 flex flex-col items-center ${isDark ? 'bg-[#121212]/80 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <Award size={40} className={`mb-4 shrink-0 ${isDark ? 'text-purple-500/40' : 'text-purple-300'}`} />
            <p className={`font-black text-sm w-full ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Tu progreso aparece acá
            </p>
            <p className={`text-xs mt-2 leading-relaxed w-full ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Completá ejercicios en Entreno y vas a ver rachas, récords y tu actividad semanal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-2">
      <HomeGreeting app={app} weekStreak={stats.weekStreak} />

      {/* Hero racha semanal */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-5 ${
          isDark
            ? 'bg-gradient-to-br from-purple-950/80 via-[#121212] to-[#121212] border-purple-500/25'
            : 'bg-gradient-to-br from-purple-100 via-white to-white border-purple-200 shadow-md'
        }`}
      >
        <div
          className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl ${isDark ? 'bg-purple-600/30' : 'bg-purple-300/50'}`}
          aria-hidden
        />
        <div className="relative flex items-center gap-4">
          <div
            className={`p-4 rounded-2xl ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'} border ${isDark ? 'border-amber-500/25' : 'border-amber-200'}`}
          >
            <Flame size={32} strokeWidth={2.5} />
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>
              Racha actual
            </p>
            <p className={`text-4xl font-black tabular-nums leading-none mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {stats.weekStreak}
              <span className={`text-lg ml-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {stats.weekStreak === 1 ? 'semana' : 'semanas'}
              </span>
            </p>
            <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {stats.weekStreak > 0
                ? 'Con al menos 1 entreno por semana (lun–dom)'
                : 'Entrená un día esta semana para empezar tu racha'}
            </p>
          </div>
        </div>
        {stats.bestWeekStreak > stats.weekStreak && (
          <p className={`relative text-[10px] mt-3 font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            Tu mejor racha: {stats.bestWeekStreak} {stats.bestWeekStreak === 1 ? 'semana' : 'semanas'}
          </p>
        )}
      </div>

      {stats.muscleRadar.hasTraining && (
        <MuscleRadarChart radar={stats.muscleRadar} isDark={isDark} />
      )}

      <Last7DaysStrip days={stats.last7Days} isDark={isDark} />

      <PersonalRecordsCard personalRecords={stats.personalRecords} isDark={isDark} />

      <div className="grid grid-cols-2 gap-3">
        <HighlightStatCard
          icon={Dumbbell}
          label="Ejercicios hechos"
          value={stats.totalExercisesCompleted}
          isDark={isDark}
          accent="purple"
        />
        <HighlightStatCard
          icon={Calendar}
          label="Días de entreno"
          value={stats.totalTrainingDays}
          isDark={isDark}
          accent="sky"
        />
        <HighlightStatCard
          icon={Trophy}
          label="Días perfectos"
          value={stats.perfectDays}
          hint="Rutina completa al 100%"
          isDark={isDark}
          accent="amber"
        />
        <HighlightStatCard
          icon={Target}
          label="Este mes"
          value={stats.monthTrainingDays}
          hint="Días con entreno"
          isDark={isDark}
          accent="emerald"
        />
        <HighlightStatCard
          icon={Zap}
          label="Series registradas"
          value={stats.setsLogged}
          isDark={isDark}
          accent="sky"
        />
        <HighlightStatCard
          icon={TrendingUp}
          label="Volumen total"
          value={formatVolume(stats.volumeKg)}
          hint="Peso × reps acumulado"
          isDark={isDark}
          accent="purple"
        />
      </div>

      <MuscleHeatmap
        diary={app.diary}
        routines={app.routines}
        library={app.library}
        isDark={isDark}
      />

      <WeeklyActivityChart weeks={stats.weeklyActivity} maxDays={stats.maxWeekDays} isDark={isDark} />
    </div>
  );
}
