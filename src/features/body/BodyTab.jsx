import MuscleHeatmap from '../../components/highlights/MuscleHeatmap';

export default function BodyTab({ app }) {
  return (
    <div className="animate-in fade-in duration-300">
      <MuscleHeatmap
        diary={app.diary}
        routines={app.routines}
        library={app.library}
        isDark={app.isDark}
        selectedDate={app.selectedDate}
      />
    </div>
  );
}
