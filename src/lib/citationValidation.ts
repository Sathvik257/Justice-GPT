import { constitutionalArticles } from '../data/constitutionalArticles';
import { currentLawEquivalents } from '../data/currentLawMapping';
import type { RetrievedLaw } from './retrieval';

export interface CitationValidationResult {
  supportedCount: number;
  unsupportedCitations: string[];
}

const citationPatterns = [
  /\b(?:IPC|CrPC|BNS|BNSS|BSA)\s+(?:Section\s+)?\d+[A-Z]?(?:\([^)]+\))?(?:-\([^)]+\))?/gi,
  /\b(?:IT Act|POCSO|JJ Act|DV Act|CPA|MV Act|DP Act)\s+(?:Section\s+)?\d+[A-Z]?(?:\([^)]+\))?/gi,
  /\bDrugs and Cosmetics Act\s+(?:Section\s+)?\d+[A-Z]?(?:\([^)]+\))?/gi,
  /\bRent Act\b/gi,
  /\bArticle\s+\d+[A-Z]?\b/gi,
];

export function normalizeCitationLabel(value: string) {
  return value
    .replace(/\bSection\s+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^article\s+/i, 'Article ')
    .replace(/^ipc\b/i, 'IPC')
    .replace(/^crpc\b/i, 'CrPC')
    .replace(/^bns\b/i, 'BNS')
    .replace(/^bnss\b/i, 'BNSS')
    .replace(/^bsa\b/i, 'BSA')
    .replace(/^it act\b/i, 'IT Act')
    .replace(/^pocso\b/i, 'POCSO')
    .replace(/^jj act\b/i, 'JJ Act')
    .replace(/^dv act\b/i, 'DV Act')
    .replace(/^cpa\b/i, 'CPA')
    .replace(/^mv act\b/i, 'MV Act')
    .replace(/^dp act\b/i, 'DP Act')
    .replace(/^drugs and cosmetics act\b/i, 'Drugs and Cosmetics Act')
    .replace(/^rent act$/i, 'Rent Act');
}

export function extractCitationLabels(markdown: string) {
  const citations = citationPatterns.flatMap((pattern) => markdown.match(pattern) ?? []);
  return Array.from(new Set(citations.map(normalizeCitationLabel)));
}

export function getStaticAllowedCitationLabels() {
  return Array.from(
    new Set([
      ...Object.keys(currentLawEquivalents),
      ...Object.values(currentLawEquivalents).map((equivalent) => equivalent.current),
      ...constitutionalArticles.map((article) =>
        /^\d+$/.test(article.number) ? `Article ${article.number}` : article.number,
      ),
    ]),
  );
}

function getCitationBase(label: string) {
  return normalizeCitationLabel(label).replace(/\([^)]+\)/g, '').replace(/-\([^)]+\)/g, '');
}

function isSupported(label: string, allowedLabels: Set<string>) {
  const normalized = normalizeCitationLabel(label);
  if (allowedLabels.has(normalized)) return true;

  const base = getCitationBase(normalized);
  if (allowedLabels.has(base)) return true;

  return Array.from(allowedLabels).some((allowed) => {
    const allowedBase = getCitationBase(allowed);
    return allowedBase === base || normalized.startsWith(`${allowedBase} `) || allowed.startsWith(`${base} `);
  });
}

export function validateCitations(markdown: string, allowedLabels: string[]): CitationValidationResult {
  const citations = extractCitationLabels(markdown);
  const allowed = new Set(allowedLabels.map(normalizeCitationLabel));
  const unsupportedCitations = citations.filter((citation) => !isSupported(citation, allowed));

  return {
    supportedCount: citations.length - unsupportedCitations.length,
    unsupportedCitations,
  };
}

export function getAllowedCitationLabelsFromRetrieval(laws: RetrievedLaw[]) {
  return laws.flatMap((law) => {
    const joined = [law.sectionNumber, law.actName, law.text].filter(Boolean).join(' ');
    return [law.sectionNumber, ...extractCitationLabels(joined)].filter(Boolean);
  });
}

export function appendCitationValidationNotice(markdown: string, validation: CitationValidationResult) {
  if (validation.unsupportedCitations.length === 0) return markdown;
  if (/^###\s+Citation Validation/m.test(markdown)) return markdown;

  return [
    markdown.trim(),
    '',
    '### Citation Validation',
    `- Low confidence citation check: ${validation.unsupportedCitations.join(', ')} appeared in the AI draft but was not present in the retrieved law records or the local mapping table. Verify before relying on it.`,
  ].join('\n');
}
