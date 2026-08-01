/**
 * ProceduralSubwayMap visualizes the legal process as a station line. Mobile
 * uses a vertical SVG line with stacked stations; desktop enhances to a
 * horizontal metro diagram. Tapping any station opens details and optional law
 * transition citations.
 */
import { useMemo, useState } from 'react';
import type { ProcedureStage } from '../../types';
import { LawTransitionCard } from '../law/LawTransitionCard';

interface ProceduralSubwayMapProps {
  stages: ProcedureStage[];
  currentStageIndex: number;
}

export const ProceduralSubwayMap: React.FC<ProceduralSubwayMapProps> = ({ stages, currentStageIndex }) => {
  const [selectedIndex, setSelectedIndex] = useState(currentStageIndex);
  const selected = stages[selectedIndex] ?? stages[0];

  const mobilePoints = useMemo(
    () => stages.map((_, index) => ({ x: 28, y: 38 + index * 82 })),
    [stages],
  );
  const desktopPoints = useMemo(
    () => stages.map((_, index) => ({ x: 46 + index * (508 / Math.max(stages.length - 1, 1)), y: 46 })),
    [stages],
  );

  if (stages.length === 0 || !selected) return null;

  return (
    <section className="border border-ink/15 bg-paper p-5 shadow-insetPaper print:hidden" aria-labelledby="subway-title">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-stamp-red">
            Procedural subway map
          </p>
          <h3 id="subway-title" className="mt-1 font-ledger text-2xl font-black text-ink">
            Where this case sits in the legal journey
          </h3>
        </div>
        <span className="w-fit border border-stamp-red bg-stamp-red/10 px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wide text-stamp-red">
          You are here
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.36fr)] lg:items-start">
        <div className="lg:hidden">
          <svg
            className="h-auto w-full"
            viewBox={`0 0 360 ${Math.max(110, 58 + (stages.length - 1) * 82)}`}
            role="img"
            aria-label="Vertical procedure station map"
          >
            <line
              x1="28"
              y1="38"
              x2="28"
              y2={38 + (stages.length - 1) * 82}
              stroke="#3A3F44"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {stages.map((stage, index) => {
              const point = mobilePoints[index];
              const isPast = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              return (
                <g key={stage.id}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="13"
                    fill={isPast ? '#3A3F44' : isCurrent ? '#F5F1E8' : '#F5F1E8'}
                    stroke={isCurrent ? '#A3312A' : '#3A3F44'}
                    strokeWidth={isCurrent ? 5 : 3}
                    className={isCurrent ? 'subway-current-pulse' : ''}
                  />
                  <foreignObject x="56" y={point.y - 28} width="286" height="64">
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`flex min-h-14 w-full items-center border px-3 text-left text-sm font-bold ${
                        selectedIndex === index
                          ? 'border-stamp-red bg-stamp-red/10 text-ink'
                          : 'border-ink/10 bg-paper-dark/60 text-ink-faded'
                      }`}
                    >
                      {stage.label}
                    </button>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="hidden lg:block">
          <svg className="h-auto w-full" viewBox="0 0 600 170" role="img" aria-label="Horizontal procedure station map">
            <line x1="46" y1="46" x2="554" y2="46" stroke="#3A3F44" strokeWidth="6" strokeLinecap="round" />
            {stages.map((stage, index) => {
              const point = desktopPoints[index];
              const isPast = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              return (
                <g key={stage.id}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="15"
                    fill={isPast ? '#3A3F44' : '#F5F1E8'}
                    stroke={isCurrent ? '#A3312A' : '#3A3F44'}
                    strokeWidth={isCurrent ? 5 : 3}
                    className={isCurrent ? 'subway-current-pulse' : ''}
                  />
                  <foreignObject x={point.x - 48} y="74" width="96" height="82">
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`min-h-14 w-full border px-2 py-2 text-center text-xs font-bold leading-4 ${
                        selectedIndex === index
                          ? 'border-stamp-red bg-stamp-red/10 text-ink'
                          : 'border-ink/10 bg-paper-dark/60 text-ink-faded hover:border-seal-gold'
                      }`}
                      title={stage.description}
                    >
                      {stage.label}
                    </button>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="border border-ink/10 bg-paper-dark/70 p-4">
          <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-stamp-red">Station details</p>
          <h4 className="mt-1 font-ledger text-2xl font-black text-ink">{selected.label}</h4>
          <p className="mt-2 text-sm leading-6 text-ink-faded">{selected.description}</p>
          <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wide text-ink-faded">
            Typical duration: {selected.typicalDuration}
          </p>
          {selected.citations && selected.citations.length > 0 && (
            <div className="mt-4 grid gap-3">
              {selected.citations.map((citation) => (
                <LawTransitionCard
                  key={`${citation.oldLaw.section}-${citation.newLaw.section}`}
                  oldLaw={citation.oldLaw}
                  newLaw={citation.newLaw}
                  defaultRevealed
                />
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};
