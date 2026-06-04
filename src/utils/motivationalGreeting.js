/**
 * Saludo motivacional para la pantalla de inicio según hora y racha semanal.
 */
export function getMotivationalGreeting({ hour = new Date().getHours(), weekStreak = 0, firstName } = {}) {
  const nombre = firstName ? `, ${firstName}` : '';
  if (weekStreak >= 12) {
    return {
      title: `¡Imparable${nombre}!`,
      subtitle: `${weekStreak} semanas seguidas entrenando. Sos una máquina.`,
    };
  }
  if (weekStreak >= 8) {
    return {
      title: `¡Constancia de hierro${nombre}!`,
      subtitle: `Llevás ${weekStreak} semanas de racha. No pares ahora.`,
    };
  }
  if (weekStreak >= 4) {
    return {
      title: `¡Vas muy bien${nombre}!`,
      subtitle: `${weekStreak} semanas seguidas con al menos un entreno.`,
    };
  }
  if (weekStreak >= 2) {
    return {
      title: `¡Buena racha${nombre}!`,
      subtitle: 'Dos semanas seguidas sumando. Seguí así.',
    };
  }
  if (weekStreak === 1) {
    return {
      title: `¡Arrancaste la racha${nombre}!`,
      subtitle: 'Con un día por semana ya cuenta. Mantenela viva.',
    };
  }

  if (hour < 12) {
    return {
      title: `¡Buenos días${nombre}!`,
      subtitle: 'Hoy es un gran día para entrenar.',
    };
  }
  if (hour < 19) {
    return {
      title: `¡Buenas tardes${nombre}!`,
      subtitle: 'Tu cuerpo te está esperando. ¿Empezamos?',
    };
  }
  return {
    title: `¡Buenas noches${nombre}!`,
    subtitle: 'Si aún no entrenaste, todavía estás a tiempo.',
  };
}
