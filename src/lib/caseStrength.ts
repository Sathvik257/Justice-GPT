import type { AnalysisMetadata, CaseStrengthScore } from '../types';

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

export function getCaseStrengthScores(markdown: string, metadata?: AnalysisMetadata | null): CaseStrengthScore[] {
  const text = markdown.toLowerCase();
  const evidenceScore =
    44 +
    (includesAny(text, ['photos', 'screenshots', 'cctv', 'medical', 'witness', 'documents', 'records']) ? 28 : 0) +
    (includesAny(text, ['chain of custody', 'preserve original', 'device logs', 'call records']) ? 16 : 0);

  const procedureScore =
    48 +
    (includesAny(text, ['fir', 'cognizable', 'police process', 'magistrate', 'sessions']) ? 24 : 0) +
    (includesAny(text, ['limitation', 'bail', 'forum', 'jurisdiction']) ? 14 : 0);

  const precedentScore =
    38 +
    (includesAny(text, [' v. ', 'precedent', 'supreme court', 'high court']) ? 30 : 0) +
    ((metadata?.retrievalCount ?? 0) > 3 ? 12 : 0);

  const urgencyScore =
    40 +
    (includesAny(text, ['serious', 'survivor safety', 'medical care', 'ongoing risk', 'ransom', 'murder']) ? 34 : 0) +
    (includesAny(text, ['preserve evidence immediately', 'immediate safety', 'avoid deleting']) ? 14 : 0);

  const jurisdictionScore =
    42 +
    (includesAny(text, ['location:', 'local jurisdiction', 'state law', 'forum depend']) ? 25 : 0) +
    (metadata?.coverageLevel === 'strong' ? 16 : metadata?.coverageLevel === 'moderate' ? 8 : 0);

  return [
    {
      label: 'Evidence clarity',
      value: clamp(evidenceScore),
      explanation: 'Higher when the report mentions documents, witnesses, medical records, CCTV, or digital originals.',
    },
    {
      label: 'Procedure fit',
      value: clamp(procedureScore),
      explanation: 'Higher when the facts clearly point to FIR, police process, court forum, or limitation checkpoints.',
    },
    {
      label: 'Precedent support',
      value: clamp(precedentScore),
      explanation: 'Higher when the report includes case law and multiple retrieved legal references.',
    },
    {
      label: 'Urgency',
      value: clamp(urgencyScore),
      explanation: 'Higher when safety, serious offences, evidence preservation, or immediate relief are implicated.',
    },
    {
      label: 'Jurisdiction clarity',
      value: clamp(jurisdictionScore),
      explanation: 'Higher when location, forum, current-code mapping, and local-law verification are explicit.',
    },
  ];
}
