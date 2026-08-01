/**
 * CaseStrengthRadar renders a small dependency-free SVG spider chart for the
 * report's case-strength heuristic. Vertices are clickable touch targets; the
 * selected score explanation appears below the chart on mobile and beside it
 * on wider screens.
 */
import { useMemo, useState } from 'react';
import type { CaseStrengthScore } from '../../types';

interface CaseStrengthRadarProps {
  scores: CaseStrengthScore[];
}

function getPoint(index: number, count: number, radius: number, center: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

export const CaseStrengthRadar: React.FC<CaseStrengthRadarProps> = ({ scores }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const size = 320;
  const center = size / 2;
  const maxRadius = 112;

  const polygon = useMemo(
    () =>
      scores
        .map((score, index) => {
          const point = getPoint(index, scores.length, (score.value / 100) * maxRadius, center);
          return `${point.x},${point.y}`;
        })
        .join(' '),
    [center, scores],
  );

  if (scores.length < 3) return null;

  const selected = scores[selectedIndex];

  return (
    <section className="border border-ink/15 bg-paper p-5 shadow-insetPaper print:hidden" aria-labelledby="radar-title">
      <div className="mb-4">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-stamp-red">Case strength radar</p>
        <h3 id="radar-title" className="mt-1 font-ledger text-2xl font-black text-ink">
          One-glance litigation posture
        </h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto w-full max-w-[320px]">
          <svg className="radar-chart h-auto w-full" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Case strength radar chart">
            {[0.25, 0.5, 0.75, 1].map((scale) => (
              <polygon
                key={scale}
                points={scores
                  .map((_, index) => {
                    const point = getPoint(index, scores.length, maxRadius * scale, center);
                    return `${point.x},${point.y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#3A3F44"
                strokeOpacity={scale === 1 ? 0.35 : 0.16}
              />
            ))}
            {scores.map((score, index) => {
              const outer = getPoint(index, scores.length, maxRadius, center);
              const valuePoint = getPoint(index, scores.length, (score.value / 100) * maxRadius, center);

              return (
                <g key={score.label}>
                  <line className="radar-axis" x1={center} y1={center} x2={outer.x} y2={outer.y} stroke="#3A3F44" strokeOpacity="0.38" />
                  <text
                    x={outer.x}
                    y={outer.y}
                    textAnchor={outer.x < center - 8 ? 'end' : outer.x > center + 8 ? 'start' : 'middle'}
                    dominantBaseline={outer.y < center ? 'auto' : 'hanging'}
                    className="fill-ink text-[10px] font-bold"
                  >
                    {score.label.split(' ')[0]}
                  </text>
                  <button type="button" onClick={() => setSelectedIndex(index)} aria-label={`Explain ${score.label}`}>
                    <circle
                      cx={valuePoint.x}
                      cy={valuePoint.y}
                      r={selectedIndex === index ? 9 : 7}
                      fill={selectedIndex === index ? '#A3312A' : '#B08D3E'}
                      stroke="#F5F1E8"
                      strokeWidth="3"
                    />
                  </button>
                </g>
              );
            })}
            <polygon className="radar-polygon" points={polygon} fill="#A3312A" fillOpacity="0.18" stroke="#A3312A" strokeWidth="2.5" />
          </svg>
        </div>

        <aside className="border border-ink/10 bg-paper-dark/70 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h4 className="font-ledger text-xl font-black text-ink">{selected.label}</h4>
            <p className="font-mono text-2xl font-black text-stamp-red">{selected.value}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink-faded">{selected.explanation}</p>
        </aside>
      </div>
    </section>
  );
};
