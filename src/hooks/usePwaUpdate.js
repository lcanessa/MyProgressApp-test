import { useState, useEffect, useRef, useCallback } from 'react';
import { registerSW } from 'virtual:pwa-register';

const UPDATE_CHECK_MS = 30 * 60 * 1000;
/** Segundos antes de aplicar la actualización sin cerrar la app */
const AUTO_APPLY_MS = 3500;

function waitForServiceWorkerInstall(registration, timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (registration.waiting) {
      resolve();
      return;
    }

    const installing = registration.installing;
    if (!installing) {
      window.setTimeout(resolve, 400);
      return;
    }

    const onStateChange = () => {
      if (installing.state === 'installed') {
        installing.removeEventListener('statechange', onStateChange);
        resolve();
      }
    };

    installing.addEventListener('statechange', onStateChange);
    window.setTimeout(() => {
      installing.removeEventListener('statechange', onStateChange);
      resolve();
    }, timeoutMs);
  });
}

export function usePwaUpdate() {
  const [status, setStatus] = useState('idle'); // idle | checking | available | updating
  const updateSWRef = useRef(null);
  const registrationRef = useRef(null);
  const autoTimerRef = useRef(null);

  const applyUpdate = useCallback(() => {
    setStatus((current) => {
      if (current === 'updating') return current;
      clearTimeout(autoTimerRef.current);
      updateSWRef.current?.(true);
      return 'updating';
    });
  }, []);

  const checkAndApplyUpdate = useCallback(async () => {
    if (status === 'updating' || status === 'checking') return;

    clearTimeout(autoTimerRef.current);
    setStatus('checking');

    const reloadApp = () => {
      window.location.reload();
    };

    try {
      if (!('serviceWorker' in navigator)) {
        reloadApp();
        return;
      }

      const reg =
        registrationRef.current ?? (await navigator.serviceWorker.getRegistration());

      if (!reg) {
        reloadApp();
        return;
      }

      await reg.update();
      await waitForServiceWorkerInstall(reg);

      if (reg.waiting) {
        setStatus('updating');
        updateSWRef.current?.(true);
        return;
      }

      // Sin SW nuevo en espera: recarga para traer index y assets recientes
      setStatus('idle');
      reloadApp();
    } catch {
      setStatus('idle');
      reloadApp();
    }
  }, [status]);

  useEffect(() => {
    let intervalId;
    let registration;

    const checkForUpdate = () => {
      if (document.visibilityState === 'visible') {
        registration?.update().catch(() => {});
      }
    };

    updateSWRef.current = registerSW({
      immediate: true,
      onNeedRefresh() {
        setStatus((s) => (s === 'checking' || s === 'updating' ? s : 'available'));
      },
      onRegisteredSW(_swUrl, reg) {
        registration = reg ?? undefined;
        registrationRef.current = registration;
        if (!registration) return;

        checkForUpdate();
        intervalId = window.setInterval(checkForUpdate, UPDATE_CHECK_MS);
        document.addEventListener('visibilitychange', checkForUpdate);
        window.addEventListener('focus', checkForUpdate);
      },
    });

    return () => {
      clearTimeout(autoTimerRef.current);
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', checkForUpdate);
      window.removeEventListener('focus', checkForUpdate);
    };
  }, []);

  useEffect(() => {
    if (status !== 'available') return undefined;

    autoTimerRef.current = window.setTimeout(() => applyUpdate(), AUTO_APPLY_MS);
    return () => clearTimeout(autoTimerRef.current);
  }, [status, applyUpdate]);

  const supportsServiceWorker =
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  return { status, applyUpdate, checkAndApplyUpdate, supportsServiceWorker };
}
