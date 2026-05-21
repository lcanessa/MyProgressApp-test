export default function SimpleLineChart({ data, color = '#a855f7', isDark }) {
  if (!data || data.length < 2) {
    return (
      <div className={`text-center text-xs py-6 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
        Datos insuficientes para graficar (mínimo 2 sesiones).
      </div>
    );
  }

  const minV = Math.min(...data.map((d) => d.value)) * 0.9;
  const maxV = Math.max(...data.map((d) => d.value)) * 1.1;
  const range = maxV - minV || 1;
  const width = 100;
  const height = 40;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.value - minV) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full mt-4">
      <svg viewBox={`-5 -5 ${width + 10} ${height + 15}`} className="w-full h-32 overflow-visible">
        <line x1="0" y1="0" x2={width} y2="0" stroke={isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'} strokeWidth="0.5" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'} strokeWidth="0.5" />
        <line x1="0" y1={height} x2={width} y2={height} stroke={isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'} strokeWidth="0.5" />
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.value - minV) / range) * height;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="2.5" fill={isDark ? '#050505' : '#ffffff'} stroke={color} strokeWidth="1.5" />
              <text x={x} y={y - 5} fontSize="4" fill={isDark ? '#f8fafc' : '#334155'} textAnchor="middle" fontWeight="bold">
                {d.value}
              </text>
              <text x={x} y={height + 6} fontSize="3" fill={isDark ? '#64748b' : '#94a3b8'} textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
