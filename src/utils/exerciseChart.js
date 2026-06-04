import { parseWeightNumber } from './sessionValues';

/** Peso máximo y reps en ese peso por sesión (mismo ejercicio / rutina). */
export function getExerciseProgressChart(exerciseName, routineId, diary, routines) {
  const weightData = [];
  const repsData = [];

  if (!routineId || !exerciseName) {
    return { weightData, repsData };
  }

  Object.keys(diary).forEach((dateStr) => {
    const dayData = diary[dateStr];
    if (!dayData?.sessions || dayData.routineId !== routineId) return;

    const exercises = routines[routineId] || [];
    const exIdx = exercises.findIndex((ex) => ex.customName === exerciseName);
    if (exIdx === -1) return;

    const completeKey = `${routineId}-${exIdx}`;
    if (dayData.completed?.[completeKey] !== true) return;

    const ex = exercises[exIdx];
    let maxWeight = 0;
    let repsAtMaxWeight = 0;
    let hasData = false;

    for (let s = 0; s < parseInt(ex.sets, 10) || 0; s++) {
      const w = parseWeightNumber(dayData.sessions[`${routineId}-${exIdx}-s${s}-w`]);
      const r = parseFloat(dayData.sessions[`${routineId}-${exIdx}-s${s}-r`]);
      if (isNaN(w) || w <= 0) continue;

      hasData = true;
      const reps = !isNaN(r) && r > 0 ? r : 0;

      if (w > maxWeight) {
        maxWeight = w;
        repsAtMaxWeight = reps;
      } else if (w === maxWeight) {
        repsAtMaxWeight = Math.max(repsAtMaxWeight, reps);
      }
    }

    if (!hasData || maxWeight <= 0) return;

    const [yy, mm, dd] = dateStr.split('-');
    const dObj = new Date(yy, mm - 1, dd, 12, 0, 0);
    const label = `${dObj.getDate()}/${dObj.getMonth() + 1}`;
    const point = { date: dateStr, label, value: maxWeight };

    weightData.push(point);
    repsData.push({ date: dateStr, label, value: repsAtMaxWeight });
  });

  const sortByDate = (a, b) => new Date(a.date) - new Date(b.date);
  weightData.sort(sortByDate);
  repsData.sort(sortByDate);

  return { weightData, repsData };
}
