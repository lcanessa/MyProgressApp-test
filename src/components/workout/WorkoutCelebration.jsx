import { useMemo } from 'react';
import { Award } from 'lucide-react';

const createCelebrationParticles = () =>
  Array.from({ length: 96 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2.2,
    duration: 2.4 + Math.random() * 2.2,
    color: ['#a855f7', '#c084fc', '#e9d5ff', '#fbbf24', '#f472b6', '#34d399', '#ffffff', '#7e22ce'][Math.floor(Math.random() * 8)],
    w: 4 + Math.random() * 5,
    h: 3 + Math.random() * 7,
    driftX: (Math.random() - 0.5) * 120,
    rotate: 360 + Math.random() * 720,
    isRect: Math.random() > 0.45,
  }));

export default function WorkoutCelebration() {
  const particles = useMemo(() => createCelebrationParticles(), []);

  return (
    <div className="fixed inset-0 z-[55] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 celebration-flash" aria-hidden="true" />
      {particles.map((p) => (
        <span
          key={p.id}
          className={`celebration-particle absolute ${p.isRect ? 'rounded-sm' : 'rounded-full'}`}
          style={{
            left: `${p.left}%`,
            top: '-12px',
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ['--drift-x']: `${p.driftX}px`,
            ['--spin']: `${p.rotate}deg`,
          }}
        />
      ))}
      <div className="celebration-badge absolute left-1/2 top-1/2 flex flex-col items-center justify-center gap-1.5 text-center">
        <Award size={40} className="text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" strokeWidth={2.5} />
        <span className="text-base font-black uppercase tracking-widest text-white drop-shadow-md text-center whitespace-nowrap">
          ¡Día listo!
        </span>
      </div>
    </div>
  );
}
