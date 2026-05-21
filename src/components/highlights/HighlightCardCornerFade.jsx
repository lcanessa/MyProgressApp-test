/** Degradado suave en esquina superior izquierda (como Récord personal). */
export default function HighlightCardCornerFade({ isDark, rounded = '3xl' }) {
  const radius = rounded === '2xl' ? 'rounded-2xl' : 'rounded-3xl';
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${radius} bg-gradient-to-br ${
        isDark
          ? 'from-amber-950/40 via-transparent to-transparent'
          : 'from-amber-50 via-transparent to-transparent'
      }`}
    />
  );
}
