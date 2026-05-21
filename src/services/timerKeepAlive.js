/**
 * Audio casi silencioso en loop para que iOS/Android no suspendan el timer
 * con pantalla bloqueada (misma idea que apps de timer web en Safari).
 */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let keepAliveAudio = null;

export async function startTimerKeepAlive() {
  stopTimerKeepAlive();
  try {
    keepAliveAudio = new Audio(SILENT_WAV);
    keepAliveAudio.loop = true;
    keepAliveAudio.volume = 0.02;
    keepAliveAudio.setAttribute('playsinline', 'true');
    keepAliveAudio.setAttribute('webkit-playsinline', 'true');
    await keepAliveAudio.play();

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Descanso en curso',
        artist: 'MyProgress',
      });
      navigator.mediaSession.playbackState = 'playing';
    }
  } catch {
    keepAliveAudio = null;
  }
}

export function stopTimerKeepAlive() {
  if (keepAliveAudio) {
    try {
      keepAliveAudio.pause();
      keepAliveAudio.removeAttribute('src');
      keepAliveAudio.load();
    } catch {
      /* ignore */
    }
    keepAliveAudio = null;
  }
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    } catch {
      /* ignore */
    }
  }
}
