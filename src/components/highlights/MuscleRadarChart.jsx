import { ChartNetwork } from 'lucide-react';
import HighlightCardCornerFade from './HighlightCardCornerFade';

const CX = 120;
const CY = 120;
const RADIUS = 78;
const LABEL_RADIUS = 96;
const LEVELS = [0.25, 0.5, 0.75, 1];
const START_ANGLE = -Math.PI / 2;

function polar(angleIndex, count, radius) {
  const angle = START_ANGLE + (angleIndex * 2 * Math.PI) / count;
  return {
    x: CX + radius * Math.cos(angle),
    y: CY + radius * Math.sin(angle),
  };
}

function polygonPoints(axes, scale) {
  return axes
    .map((_, i) => {
      const { x, y } = polar(i, axes.length, RADIUS * scale);
      return `${x},${y}`;
    })
    .join(' ');
}

function dataPolygonPoints(axes) {
  return axes
    .map((axis, i) => {
      const r = RADIUS * axis.normalized;
      const { x, y } = polar(i, axes.length, r);
      return `${x},${y}`;
    })
    .join(' ');
}

function axisLineEnd(i, count) {
  const { x, y } = polar(i, count, RADIUS);
  return { x1: CX, y1: CY, x2: x, y2: y };
}

function labelPosition(i, count) {
  return polar(i, count, LABEL_RADIUS);
}

export default function MuscleRadarChart({ radar, isDark }) {
  const { axes, weakest, isBalanced, hasTraining } = radar;
  const n = axes.length;

  const gridStroke = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.35)';
  const axisStroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.4)';
  const labelFill = isDark ? '#94a3b8' : '#64748b';
  const countFill = isDark ? '#c4b5fd' : '#7c3aed';

  let insight = null;
  if (hasTraining) {
    if (isBalanced) {
      insight = 'Entrenamiento equilibrado — ¡seguí así!';
    } else if (weakest) {
      insight = `Más atrasado: ${weakest.label}. Entrenalo para redondear el gráfico.`;
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-5 ${isDark ? 'bg-[#121212]/80 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
    >
      <HighlightCardCornerFade isDark={isDark} />
      <div className="relative pb-4 mb-3 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-600'}`}
          >
            <ChartNetwork size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}
            >
              Balance muscular
            </p>
            <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Ejercicios completados por grupo muscular
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-[280px] mx-auto">
        <svg
          viewBox="0 0 240 240"
          className="w-full h-auto"
          role="img"
          aria-label="Gráfico radar de balance muscular por grupo"
        >
          {LEVELS.map((level) => (
            <polygon
              key={level}
              points={polygonPoints(axes, level)}
              fill="none"
              stroke={gridStroke}
              strokeWidth={level === 1 ? 1.25 : 1}
            />
          ))}

          {axes.map((_, i) => {
            const { x1, y1, x2, y2 } = axisLineEnd(i, n);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={axisStroke}
                strokeWidth={1}
              />
            );
          })}

          {hasTraining && (
            <>
              <polygon
                points={dataPolygonPoints(axes)}
                fill={isDark ? 'rgba(168,85,247,0.35)' : 'rgba(139,92,246,0.25)'}
                stroke={isDark ? '#a78bfa' : '#7c3aed'}
                strokeWidth={2}
                strokeLinejoin="round"
              />
              {axes.map((axis, i) => {
                const r = RADIUS * axis.normalized;
                const { x, y } = polar(i, n, r);
                return (
                  <circle
                    key={axis.label}
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill={isDark ? '#c4b5fd' : '#7c3aed'}
                    stroke={isDark ? '#1e1b4b' : '#fff'}
                    strokeWidth={1.5}
                  />
                );
              })}
            </>
          )}

          {axes.map((axis, i) => {
            const { x, y } = labelPosition(i, n);
            const anchor = x < CX - 8 ? 'end' : x > CX + 8 ? 'start' : 'middle';
            return (
              <g key={axis.label}>
                <text
                  x={x}
                  y={y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fill={labelFill}
                  fontSize="9"
                  fontWeight="800"
                >
                  {axis.label}
                </text>
                {axis.count > 0 && (
                  <text
                    x={x}
                    y={y + (y >= CY ? 11 : -11)}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    fill={countFill}
                    fontSize="8"
                    fontWeight="700"
                  >
                    {axis.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {insight && (
        <p
          className={`relative text-xs font-bold text-center mt-3 leading-relaxed ${
            isBalanced
              ? isDark
                ? 'text-emerald-400'
                : 'text-emerald-600'
              : isDark
                ? 'text-amber-400/90'
                : 'text-amber-600'
          }`}
        >
          {insight}
        </p>
      )}
    </div>
  );
}
