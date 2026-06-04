import { toLocalISODate } from './date';

export const generateMonthDays = () => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = -180; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dayName: d.toLocaleDateString('es-ES', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: i === 0,
      id: toLocalISODate(d),
      timestamp: d.getTime(),
    });
  }
  return days;
};
