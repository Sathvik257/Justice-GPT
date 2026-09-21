/**
 * LegalConstellation turns the generated report into an explorable knowledge
 * graph: case facts in the center, with laws, evidence, procedure, rights, and
 * trust signals arranged around it.
 */
import { useMemo, useState, type ElementType } from 'react';
import { BookOpen, ClipboardCheck, ExternalLink, Fingerprint, Gavel, Network, Scale, ShieldCheck } from 'lucide-react';
import type { AnalysisMetadata, CaseStrengthScore, LawTransitionDetails, ProcedureStage } from '../../types';

interface ReportSection {
  title: string;
  content: string;
}

interface LawTransitionItem {
  oldLaw: LawTransitionDetails;
  newLaw: LawTransitionDetails;
}

interface LegalConstellationProps {
  sections: ReportSection[];
  lawTransitions: LawTransitionItem[];
  stages: ProcedureStage[];
  currentStageIndex: number;
  metadata?: AnalysisMetadata | null;
  caseStrengthScores: CaseStrengthScore[];
}

type NodeGroup = 'case' | 'law' | 'procedure' | 'evidence' | 'rights' | 'trust';

interface ConstellationNode {
  id: string;
  label: string;
  kicker: string;
  detail: string;
  plain: string;
  group: NodeGroup;
  x: number;
  y: number;
  url?: string;
}

interface ConstellationLink {
  from: string;
  to: string;
}

const nodeStyles: Record<NodeGroup, { button: string; dot: string; line: string; Icon: ElementType }> = {
  case: {
    button: 'border-ink bg-ink text-paper shadow-ledger',
    dot: 'bg-paper',
    line: '#1C1B18',
    Icon: Network,
  },
  law: {
    button: 'border-stamp-red bg-stamp-red text-white shadow-ledger',
    dot: 'bg-white',
    line: '#A3312A',
    Icon: Gavel,
  },
  procedure: {
    button: 'border-graphite bg-graphite text-white shadow-ledger',
    dot: 'bg-white',
    line: '#3A3F44',
    Icon: ClipboardCheck,
  },
  evidence: {
    button: 'border-seal-gold bg-seal-gold text-ink shadow-ledger',
    dot: 'bg-ink',
    line: '#B08D3E',
    Icon: Fingerprint,
  },
  rights: {
    button: 'border-teal-700 bg-teal-700 text-white shadow-ledger',
    dot: 'bg-white',
    line: '#0F766E',
    Icon: Scale,
  },
  trust: {
    button: 'border-emerald-700 bg-emerald-700 text-white shadow-ledger',
    dot: 'bg-white',
    line: '#047857',
    Icon: ShieldCheck,
  },
};

const lawNodePositions = [
  { x: 146, y: 82 },
  { x: 308, y: 66 },
  { x: 472, y: 66 },
  { x: 620, y: 82 },
];

function cleanReportText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shorten(value: string, maxLength = 180) {
  const clean = cleanReportText(value);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}...`;
}

function findSection(sections: ReportSection[], title: string) {
  return sections.find((section) => section.title === title)?.content ?? '';
}

function findLineValue(content: string, label: string) {
  const line = content
    .split('\n')
    .map((item) => item.trim())
    .find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));

  return line ? line.slice(label.length + 1).trim() : '';
}

function getCaseSummary(sections: ReportSection[]) {
  const classification = findSection(sections, 'Case Classification');
  const analysis = findSection(sections, 'Detailed Legal Analysis');
  const caseType = findLineValue(classification, 'Case Type') || 'General legal matter';
  const location = findLineValue(classification, 'Location');
  const date = findLineValue(classification, 'Date');
  const facts = findLineValue(analysis, 'Facts Provided');

  return {
    caseType,
    location,
    date,
    facts,
  };
}

function getEvidenceSignal(sections: ReportSection[], scores: CaseStrengthScore[]) {
  const reportText = sections.map((section) => section.content).join(' ').toLowerCase();
  const evidenceScore = scores.find((score) => score.label === 'Evidence clarity');
  const signals = [
    { test: 'screenshots', label: 'screenshots' },
    { test: 'cctv', label: 'CCTV' },
    { test: 'medical', label: 'medical records' },
    { test: 'witness', label: 'witness details' },
    { test: 'documents', label: 'documents' },
    { test: 'chain of custody', label: 'chain of custody' },
  ].filter((signal) => reportText.includes(signal.test));

  return {
    score: evidenceScore?.value ?? 50,
    signals: signals.map((signal) => signal.label),
  };
}

function buildConstellationNodes({
  sections,
  lawTransitions,
  stages,
  currentStageIndex,
  metadata,
  caseStrengthScores,
}: LegalConstellationProps): ConstellationNode[] {
  const caseSummary = getCaseSummary(sections);
  const procedure = stages[currentStageIndex] ?? stages[0];
  const evidence = getEvidenceSignal(sections, caseStrengthScores);
  const rights = shorten(findSection(sections, 'Constitutional Implications'), 210);
  const actionPlan = shorten(findSection(sections, 'Professional Action Plan'), 210);

  const lawNodes = lawTransitions.slice(0, 4).map((transition, index) => {
    const point = lawNodePositions[index] ?? lawNodePositions[lawNodePositions.length - 1];
    return {
      id: `law-${index}`,
      label: transition.newLaw.section,
      kicker: 'Current law',
      detail: transition.newLaw.text,
      plain: `This is the current section the app believes may matter most for the old reference ${transition.oldLaw.section}.`,
      group: 'law' as const,
      x: point.x,
      y: point.y,
      url: transition.newLaw.url,
    };
  });

  return [
    {
      id: 'case',
      label: caseSummary.caseType,
      kicker: 'Case theory',
      detail: caseSummary.facts
        ? shorten(caseSummary.facts, 210)
        : `Reported for ${caseSummary.location || 'the stated location'}${caseSummary.date ? ` on ${caseSummary.date}` : ''}.`,
      plain: 'Start here: these facts drive every law, evidence, and procedure node around the map.',
      group: 'case',
      x: 360,
      y: 232,
    },
    ...lawNodes,
    {
      id: 'procedure',
      label: procedure?.label ?? 'Procedure',
      kicker: 'Next legal station',
      detail: procedure ? `${procedure.description} Typical duration: ${procedure.typicalDuration}.` : actionPlan,
      plain: 'This shows where the matter is likely to move next so the report feels like a route map, not a wall of text.',
      group: 'procedure',
      x: 620,
      y: 258,
    },
    {
      id: 'evidence',
      label: `Evidence ${evidence.score}`,
      kicker: 'Proof docket',
      detail:
        evidence.signals.length > 0
          ? `Evidence signals found: ${evidence.signals.join(', ')}. ${actionPlan}`
          : `Evidence still needs tightening. ${actionPlan}`,
      plain: 'This node translates legal strength into practical proof to collect, preserve, or verify.',
      group: 'evidence',
      x: 480,
      y: 374,
    },
    {
      id: 'rights',
      label: 'Rights layer',
      kicker: 'Constitutional angle',
      detail: rights || 'Article 21 and fair procedure may be relevant depending on liberty, dignity, safety, and state action.',
      plain: 'This keeps the report from being only offence-focused by showing the rights lens behind the case.',
      group: 'rights',
      x: 230,
      y: 374,
    },
    {
      id: 'trust',
      label: metadata?.coverageLevel ? `${metadata.coverageLevel} coverage` : 'Trust signals',
      kicker: 'Retrieval audit',
      detail: metadata
        ? `${metadata.coverageSummary} Retrieval: ${metadata.retrievalStrategy}. Records: ${metadata.retrievalCount}. Verified: ${metadata.verifiedOn}.`
        : 'The report includes source and coverage checks when analysis metadata is available.',
      plain: 'This explains where the answer came from and how much confidence the app has in the retrieved legal context.',
      group: 'trust',
      x: 100,
      y: 258,
    },
  ];
}

function buildConstellationLinks(nodes: ConstellationNode[]): ConstellationLink[] {
  const ids = new Set(nodes.map((node) => node.id));
  return nodes
    .filter((node) => node.id !== 'case')
    .map((node) => ({ from: 'case', to: node.id }))
    .filter((link) => ids.has(link.from) && ids.has(link.to));
}

export const LegalConstellation: React.FC<LegalConstellationProps> = (props) => {
  const nodes = useMemo(() => buildConstellationNodes(props), [props]);
  const links = useMemo(() => buildConstellationLinks(nodes), [nodes]);
  const [selectedId, setSelectedId] = useState('case');
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const SelectedIcon = nodeStyles[selected.group].Icon;

  if (!selected) return null;

  return (
    <section className="border border-ink/15 bg-paper p-5 shadow-insetPaper print:hidden" aria-labelledby="constellation-title">
      <div className="mb-4 flex min-w-0 flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-stamp-red">Legal constellation</p>
          <h3 id="constellation-title" className="mt-1 font-ledger text-2xl font-black text-ink">
            Explore the case as connected law intelligence
          </h3>
        </div>
        <span className="w-fit border border-ink/15 bg-paper-dark px-3 py-1.5 font-mono text-xs font-black uppercase tracking-wide text-ink-faded">
          Tap a node
        </span>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.36fr)] lg:items-start">
        <div className="min-w-0 overflow-hidden border border-ink/10 bg-[#fbfaf5]">
          <svg className="h-auto min-h-[320px] w-full" viewBox="0 0 720 456" role="img" aria-label="Interactive legal knowledge graph">
            <defs>
              <filter id="constellation-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#1C1B18" floodOpacity="0.18" />
              </filter>
            </defs>

            {links.map((link, index) => {
              const source = nodes.find((node) => node.id === link.from);
              const target = nodes.find((node) => node.id === link.to);
              if (!source || !target) return null;

              const isSelected = selected.id === source.id || selected.id === target.id;
              return (
                <line
                  key={`${link.from}-${link.to}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isSelected ? nodeStyles[target.group].line : '#8A8579'}
                  strokeWidth={isSelected ? 3 : 1.6}
                  strokeOpacity={isSelected ? 0.82 : 0.32}
                  className="constellation-link"
                  style={{ animationDelay: `${index * 0.05}s` }}
                />
              );
            })}

            {nodes.map((node, index) => {
              const style = nodeStyles[node.group];
              const Icon = style.Icon;
              const isSelected = selected.id === node.id;
              const width = node.group === 'case' ? 172 : 134;
              const height = node.group === 'case' ? 88 : 72;

              return (
                <foreignObject
                  key={node.id}
                  x={node.x - width / 2}
                  y={node.y - height / 2}
                  width={width}
                  height={height}
                  className="constellation-node"
                  style={{ animationDelay: `${0.14 + index * 0.05}s` }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(node.id)}
                    className={`flex h-full w-full flex-col justify-between border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-seal-gold ${
                      style.button
                    } ${isSelected ? 'ring-4 ring-seal-gold/45' : 'hover:-translate-y-0.5'}`}
                    aria-pressed={isSelected}
                    aria-label={`Show ${node.label}`}
                    title={node.plain}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center border border-current/25 ${style.dot}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate font-mono text-[0.61rem] font-black uppercase tracking-wide opacity-80">
                        {node.kicker}
                      </span>
                    </span>
                    <span className="line-clamp-2 break-words font-ledger text-sm font-black leading-4 sm:text-base">
                      {node.label}
                    </span>
                  </button>
                </foreignObject>
              );
            })}
          </svg>

          <div className="grid gap-2 border-t border-ink/10 bg-paper/70 p-3 sm:grid-cols-2">
            {nodes.map((node) => {
              const style = nodeStyles[node.group];
              const Icon = style.Icon;
              const isSelected = selected.id === node.id;

              return (
                <button
                  key={`switch-${node.id}`}
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  className={`flex min-h-11 items-center gap-2 border px-2.5 text-left text-xs font-black transition focus:outline-none focus:ring-2 focus:ring-seal-gold ${
                    isSelected ? style.button : 'border-ink/10 bg-white text-ink-faded hover:border-seal-gold hover:text-ink'
                  }`}
                  aria-pressed={isSelected}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{node.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="border border-ink/10 bg-paper-dark/70 p-4">
          <div className="flex items-start gap-3">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center border ${nodeStyles[selected.group].button}`}>
              <SelectedIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-stamp-red">{selected.kicker}</p>
              <h4 className="mt-1 font-ledger text-2xl font-black text-ink">{selected.label}</h4>
            </div>
          </div>

          <div className="mt-4 border border-seal-gold/40 bg-seal-gold/10 p-3 text-sm leading-6 text-ink">
            <span className="font-bold">Plain English:</span> {selected.plain}
          </div>

          <p className="mt-4 text-sm leading-6 text-ink-faded">{selected.detail}</p>

          {selected.url && (
            <a
              href={selected.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 border border-ink/15 bg-paper px-3 text-sm font-bold text-ink transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-seal-gold"
            >
              <ExternalLink className="h-4 w-4" />
              Open source text
            </a>
          )}

          {selected.id === 'trust' && props.metadata?.references.length ? (
            <div className="mt-4 grid gap-2">
              <p className="font-mono text-xs font-black uppercase tracking-wide text-ink-faded">Source trail</p>
              {props.metadata.references.slice(0, 3).map((reference) => (
                <a
                  key={`${reference.title}-${reference.url}`}
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 border border-ink/10 bg-paper/70 p-2 text-xs font-bold leading-5 text-ink transition hover:bg-white"
                >
                  <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
                  <span>{reference.title}</span>
                </a>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
};
