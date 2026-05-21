export default function DualLineChart({
  weightData,
  repsData,
  weightColor = '#a855f7',
  repsColor = '#38bdf8',
  isDark,
}) {
  if (!weightData || weightData.length < 2) {
    return (
      <div className={`text-center text-xs py-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
        Datos insuficientes para graficar (mínimo 2 sesiones).
      </div>
    );
  }

  const minW = Math.min(...weightData.map((d) => d.value)) * 0.9;
  const maxW = Math.max(...weightData.map((d) => d.value)) * 1.1;
  const rangeW = maxW - minW || 1;

  const repValues = repsData.map((d) => d.value);
  const minR = Math.min(...repValues, 0) * 0.9;
  const maxR = Math.max(...repValues, 1) * 1.1;
  const rangeR = maxR - minR || 1;

  const width = 100;
  const height = 40;

  const weightPoints = weightData
    .map((d, i) => {
      const x = (i / (weightData.length - 1)) * width;
      const y = height - ((d.value - minW) / rangeW) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const repsPoints = repsData
    .map((d, i) => {
      const x = (i / (repsData.length - 1)) * width;
      const y = height - ((d.value - minR) / rangeR) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const gridStroke = isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0';

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 mb-2 text-[9px] font-black uppercase">
        <span className="flex items-center gap-1.5" style={{ color: weightColor }}>
          <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: weightColor }} />
          Peso máx. (kg)
        </span>
        <span className="flex items-center gap-1.5" style={{ color: repsColor }}>
          <span className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: repsColor }} />
          Reps en ese peso
        </span>
      </div>
      <svg viewBox={`-5 -12 ${width + 10} ${height + 15}`} className="w-full h-28 overflow-visible">
        <line x1="0" y1="0" x2={width} y2="0" stroke={gridStroke} strokeWidth="0.5" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={gridStroke} strokeWidth="0.5" />
        <line x1="0" y1={height} x2={width} y2={height} stroke={gridStroke} strokeWidth="0.5" />
        <polyline
          fill="none"
          stroke={repsColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={repsPoints}
          opacity="0.85"
        />
        <polyline
          fill="none"
          stroke={weightColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={weightPoints}
        />
        {weightData.map((d, i) => {
          const x = (i / (weightData.length - 1)) * width;
          const yW = height - ((d.value - minW) / rangeW) * height;
          const repsVal = repsData[i]?.value ?? 0;
          const yR = height - ((repsVal - minR) / rangeR) * height;
          const pointsClose = Math.abs(yW - yR) < 7;
          const topY = Math.min(yW, yR);
          const repsLabelY = pointsClose ? topY - 5 : yR - 5;
          const weightLabelY = pointsClose ? topY - 10 : yW - 5;
          return (
            <g key={d.date}>
              <circle
                cx={x}
                cy={yR}
                r="2"
                fill={isDark ? '#050505' : '#ffffff'}
                stroke={repsColor}
                strokeWidth="1.25"
              />
              <circle
                cx={x}
                cy={yW}
                r="2.5"
                fill={isDark ? '#050505' : '#ffffff'}
                stroke={weightColor}
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={weightLabelY}
                fontSize="3.5"
                fill={weightColor}
                textAnchor="middle"
                fontWeight="bold"
              >
                {d.value}
              </text>
              <text
                x={x}
                y={repsLabelY}
                fontSize="3.2"
                fill={repsColor}
                textAnchor="middle"
                fontWeight="bold"
              >
                {repsVal > 0 ? repsVal : ''}
              </text>
              <text
                x={x}
                y={height + 6}
                fontSize="3"
                fill={isDark ? '#64748b' : '#94a3b8'}
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
