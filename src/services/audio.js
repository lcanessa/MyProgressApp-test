let audioCtx = null;

export const initAudio = () => {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) {
    console.log(e);
  }
};

export const playBeep = () => {
  try {
    if (!audioCtx) initAudio();
    const playTone = (freq, type, time, dur, vol) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + time);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + time);
      gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + time + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + time);
      osc.stop(audioCtx.currentTime + time + dur);
    };
    playTone(523.25, 'sine', 0, 0.5, 0.6);
    playTone(659.25, 'sine', 0.2, 0.7, 0.6);
  } catch (e) {
    console.log('Audio no soportado', e);
  }
};

export const playCelebrationSound = () => {
  try {
    if (!audioCtx) initAudio();
    const playTone = (freq, type, time, dur, vol) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + time);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + time);
      gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + time + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + time);
      osc.stop(audioCtx.currentTime + time + dur);
    };
    [[523.25, 0], [659.25, 0.12], [783.99, 0.24], [1046.5, 0.38], [1318.51, 0.52]].forEach(([freq, t]) => {
      playTone(freq, 'triangle', t, 0.45, 0.38);
    });
    playTone(1760, 'sine', 0.08, 0.2, 0.15);
    playTone(2093, 'sine', 0.55, 0.7, 0.2);
  } catch (e) {
    console.log('Audio no soportado', e);
  }
};
