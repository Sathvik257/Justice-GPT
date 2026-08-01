import type { AnalysisSource, ConfidenceLevel, CoverageLevel } from '../types';
import type { CitationValidationResult } from './citationValidation';
import type { RetrievedLaw } from './retrieval';

function toConfidence(score: number): ConfidenceLevel {
  if (score >= 0.72) return 'high';
  if (score >= 0.46) return 'medium';
  return 'low';
}

export function scoreRetrievalConfidence(laws: RetrievedLaw[]) {
  if (laws.length === 0) return 0;

  const averageSimilarity =
    laws.slice(0, 5).reduce((total, law) => total + Math.max(law.similarity, 0), 0) / Math.min(laws.length, 5);
  const countBoost = Math.min(laws.length / 8, 1) * 0.28;
  const embeddingBoost = laws.some((law) => law.retrievalSource === 'embedding') ? 0.16 : 0;

  return Math.min(1, averageSimilarity + countBoost + embeddingBoost);
}

export function getRetrievalStrategy(laws: RetrievedLaw[]) {
  return laws.some((law) => law.retrievalSource === 'embedding') ? 'local-embedding-rag' : 'keyword-fallback';
}

export function buildSectionConfidence(input: {
  source: AnalysisSource;
  coverageLevel: CoverageLevel;
  retrievedLaws: RetrievedLaw[];
  citationValidation: CitationValidationResult;
}): Record<string, ConfidenceLevel> {
  const retrievalConfidence = scoreRetrievalConfidence(input.retrievedLaws);
  const unsupportedPenalty = input.citationValidation.unsupportedCitations.length > 0 ? 0.24 : 0;
  const sourcePenalty = input.source === 'gemini' ? 0.04 : 0;
  const coverageBoost = input.coverageLevel === 'strong' ? 0.18 : input.coverageLevel === 'moderate' ? 0.08 : -0.12;
  const groundedScore = Math.max(0, retrievalConfidence + coverageBoost - unsupportedPenalty - sourcePenalty);

  return {
    'Case Classification': toConfidence(groundedScore),
    'Indicative Laws and Sections': toConfidence(groundedScore + 0.08),
    'Current Law Mapping (BNS / BNSS / BSA)': toConfidence(0.82 - unsupportedPenalty),
    'Dataset Matches': toConfidence(retrievalConfidence),
    'Detailed Legal Analysis': toConfidence(groundedScore - 0.04),
    'Procedural Aspects': toConfidence(groundedScore - 0.08),
    'Legal Precedents': toConfidence(input.coverageLevel === 'thin' ? 0.34 : 0.52),
    'Professional Action Plan': toConfidence(groundedScore - 0.02),
    'Constitutional Implications': toConfidence(0.62),
  };
}
