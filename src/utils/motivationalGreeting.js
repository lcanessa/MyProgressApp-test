/**
 * Saludo motivacional para la pantalla de inicio según hora y racha.
 */
export function getMotivationalGreeting({ hour = new Date().getHours(), dayStreak = 0 } = {}) {
  if (dayStreak >= 14) {
    return {
      title: '¡Imparable!',
      subtitle: `${dayStreak} días seguidos. Hoy sumás uno más.`,
    };
  }
  if (dayStreak >= 7) {
    return {
      title: '¡Semana épica!',
      subtitle: `Llevás ${dayStreak} días de racha. No pares ahora.`,
    };
  }
  if (dayStreak >= 3) {
    return {
      title: '¡Vas muy bien!',
      subtitle: `${dayStreak} días seguidos entrenando. Seguí así.`,
    };
  }
  if (dayStreak === 2) {
    return {
      title: '¡Dos días seguidos!',
      subtitle: 'La constancia es lo que marca la diferencia.',
    };
  }
  if (dayStreak === 1) {
    return {
      title: '¡Buen arranque!',
      subtitle: 'Ayer entrenaste. Hoy es tu turno otra vez.',
    };
  }

  if (hour < 12) {
    return {
      title: '¡Buenos días!',
      subtitle: 'Hoy es un gran día para entrenar.',
    };
  }
  if (hour < 19) {
    return {
      title: '¡Buenas tardes!',
      subtitle: 'Tu cuerpo te está esperando. ¿Empezamos?',
    };
  }
  return {
    title: '¡Buenas noches!',
    subtitle: 'Si aún no entrenaste, todavía estás a tiempo.',
  };
}
