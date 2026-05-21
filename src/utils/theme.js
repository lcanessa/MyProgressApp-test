import { STORAGE_KEYS } from '../constants/storageKeys';

export const APP_BG = { dark: '#050505', light: '#f8fafc' };

export function readStoredIsDark() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved !== null) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return true;
}

/** Aplica tema en el DOM de forma síncrona (sin esperar a React). */
export function applyAppTheme(isDark) {
  if (typeof document === 'undefined') return;

  const theme = isDark ? 'dark' : 'light';
  const bg = isDark ? APP_BG.dark : APP_BG.light;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.style.backgroundColor = bg;
  document.body.style.backgroundColor = bg;
  document.getElementById('root')?.style.setProperty('background-color', bg);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);

  if (typeof window !== 'undefined' && window.innerHeight > 0) {
    document.documentElement.style.setProperty('--app-height', `${Math.round(window.innerHeight)}px`);
  }
}
