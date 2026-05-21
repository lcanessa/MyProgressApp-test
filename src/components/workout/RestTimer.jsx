import { useState, useEffect, useRef } from 'react';
import { Timer, Square, Play, Volume2, VolumeX, X, Zap } from 'lucide-react';

const REST_PRESETS = [
  { label: '1:00', seconds: 60 },
  { label: '1:30', seconds: 90 },
  { label: '2:00', seconds: 120 },
  { label: '2:30', seconds: 150 },
];

export default function RestTimer({
  isOpen,
  isRunning,
  timeRemaining,
  isFinished,
  onStart,
  onSetDuration,
  onStop,
  onAdd15s,
  onClose,
  soundEnabled,
  toggleSound,
  isDark,
}) {
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const timerRef = useRef(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) {
      setPos({ x: -1, y: -1 });
      return;
    }
    if (timerRef.current && pos.x === -1) {
      const rect = timerRef.current.getBoundingClientRect();
      setPos({ x: Math.max(0, (window.innerWidth - rect.width) / 2), y: 140 });
    }
  }, [isOpen, pos.x, isRunning, isFinished]);

  useEffect(() => {
    const handleResize = () => {
      if (timerRef.current && pos.x !== -1) {
        const rect = timerRef.current.getBoundingClientRect();
        setPos((p) => ({
          x: Math.max(0, Math.min(p.x, window.innerWidth - rect.width)),
          y: Math.max(0, Math.min(p.y, window.innerHeight - rect.height)),
        }));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pos.x]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isWarning = timeRemaining > 0 && timeRemaining <= 10;

  const onPointerDown = (e) => {
    if (e.target.closest('button')) return;
    isDragging.current = true;
    const rect = timerRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging.current || !timerRef.current) return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    const rect = timerRef.current.getBoundingClientRect();
    setPos({
      x: Math.max(0, Math.min(newX, window.innerWidth - rect.width)),
      y: Math.max(0, Math.min(newY, window.innerHeight - rect.height)),
    });
  };

  const onPointerUp = (e) => {
    isDragging.current = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  const baseStyle =
    pos.x === -1
      ? { top: '140px', left: '50%', transform: 'translateX(-50%)', touchAction: 'none' }
      : { left: `${pos.x}px`, top: `${pos.y}px`, touchAction: 'none' };

  const chipClass = (sec) =>
    `flex-1 min-w-0 py-1.5 rounded-lg text-[10px] font-black tabular-nums border transition-colors ${timeRemaining === sec ? (isDark ? 'bg-purple-600 text-white border-purple-500' : 'bg-purple-600 text-white border-purple-500') : isDark ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`;

  if (isFinished) {
    return (
      <div
        ref={timerRef}
        style={baseStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="fixed z-50 flex flex-col items-center justify-center p-6 w-56 rounded-[2rem] shadow-[0_0_40px_rgba(168,85,247,0.4)] bg-purple-600 border-[2px] border-purple-400 text-white animate-bounce cursor-grab active:cursor-grabbing"
      >
        <Zap size={40} className="text-white fill-white animate-pulse mb-2" />
        <span className="font-black tracking-widest uppercase text-3xl">¡A darle!</span>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  const themeClasses = isDark
    ? isRunning && isWarning
      ? 'bg-red-500/90 backdrop-blur-xl border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)]'
      : 'bg-[#121212]/90 backdrop-blur-xl border-white/10 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)]'
    : isRunning && isWarning
      ? 'bg-red-500/90 backdrop-blur-xl border-red-400 text-white shadow-lg'
      : 'bg-white/90 backdrop-blur-xl border-slate-200 text-slate-800 shadow-xl';

  return (
    <div
      ref={timerRef}
      style={baseStyle}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`fixed z-50 flex flex-col items-center p-3.5 w-56 rounded-[2rem] border transition-colors duration-300 cursor-grab active:cursor-grabbing ${themeClasses}`}
    >
      <div className={`w-10 h-1 rounded-full mb-2.5 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />

      <div className="flex w-full gap-1 mb-2">
        {REST_PRESETS.map((preset) => (
          <button
            key={preset.seconds}
            type="button"
            onClick={() => onSetDuration(preset.seconds)}
            className={chipClass(preset.seconds)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center pointer-events-none py-1 mb-2">
        <Timer
          size={20}
          className={
            isRunning
              ? isWarning
                ? 'animate-pulse text-white mb-0.5'
                : 'animate-spin-slow text-purple-500 mb-0.5'
              : isDark
                ? 'text-white/30 mb-0.5'
                : 'text-slate-400 mb-0.5'
          }
        />
        <span className="font-mono font-black text-5xl tracking-tight leading-none">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <div className={`flex items-center justify-between w-full p-1.5 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
        {isRunning ? (
          <button
            onClick={onStop}
            className={`p-2.5 rounded-xl transition-colors text-red-500 ${isDark ? 'hover:bg-white/10' : 'hover:bg-white shadow-sm'}`}
            title="Pausar"
          >
            <Square size={20} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={() => onStart(timeRemaining > 0 ? timeRemaining : 90)}
            className={`p-2.5 rounded-xl transition-colors border ${isDark ? 'text-purple-400 hover:bg-white/10 border-white/10' : 'text-purple-600 bg-white border-slate-200 shadow-sm hover:bg-slate-50'}`}
            title="Reanudar"
          >
            <Play size={20} fill="currentColor" />
          </button>
        )}
        <button
          onClick={onAdd15s}
          className={`px-2.5 py-2 font-black text-xs rounded-xl transition-colors border ${isDark ? 'text-white hover:bg-white/10 border-white/10' : 'text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50'}`}
          title="Añadir 15 seg"
        >
          +15
        </button>
        <button
          onClick={toggleSound}
          className={`p-2.5 rounded-xl transition-colors border ${isDark ? 'text-white hover:bg-white/10 border-white/10' : 'text-slate-700 bg-white border-slate-200 shadow-sm hover:bg-slate-50'}`}
          title="Sonido"
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="opacity-50" />}
        </button>
        <button
          onClick={onClose}
          className={`p-2.5 rounded-xl transition-colors border ${isDark ? 'text-red-400 hover:bg-red-500/20 border-white/10' : 'text-red-500 bg-white border-slate-200 shadow-sm hover:bg-red-50'}`}
          title="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
