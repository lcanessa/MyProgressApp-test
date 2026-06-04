import { useEffect } from 'react';

export const VIEWPORT_REFRESH_EVENT = 'myprogress-viewport-refresh';

/** Altura estable: evita franja negra abajo en iOS PWA y recupera altura tras cerrar/abrir. */
export function refreshAppViewport() {
  const doc = document.documentElement;
  const ih = window.innerHeight || doc.clientHeight || 0;
  const vvh = window.visualViewport?.height;
  const clientH = doc.clientHeight || 0;

  // Usar el mayor valor fiable (al abrir, innerHeight suele ser el correcto en standalone)
  let h = Math.max(ih, clientH);
  if (vvh != null) {
    if (vvh < ih * 0.85) {
      h = ih;
    } else {
      h = Math.max(h, vvh);
    }
  }

  doc.style.setProperty('--app-height', `${Math.round(h)}px`);
  document.body.style.overflow = 'hidden';
  document.body.style.position = '';
  doc.style.overflow = '';
  doc.style.minHeight = '';
  document.body.style.minHeight = '';
}

/** En iOS PWA, 100vh deja franja vacía abajo; usamos la altura real del viewport. */
export function useAppViewport() {
  useEffect(() => {
    const apply = () => refreshAppViewport();

    apply();
    window.visualViewport?.addEventListener('resize', apply);
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    window.addEventListener('pageshow', apply);
    window.addEventListener('focus', apply);
    window.addEventListener(VIEWPORT_REFRESH_EVENT, apply);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        apply();
        requestAnimationFrame(apply);
        setTimeout(apply, 50);
        setTimeout(apply, 150);
        setTimeout(apply, 400);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.visualViewport?.removeEventListener('resize', apply);
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
      window.removeEventListener('pageshow', apply);
      window.removeEventListener('focus', apply);
      window.removeEventListener(VIEWPORT_REFRESH_EVENT, apply);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
