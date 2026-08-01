import { indianLawDataset, lawDatasetSource, type LawDatasetRecord } from '../data/lawsAndActs';
import { officialCurrentLawAnchors } from '../data/currentLegalAnchors';
import type { CaseSubmission } from '../types';

export interface LawDatasetMatch extends LawDatasetRecord {
  score: number;
  matchedTerms: string[];
}

export interface LawDatasetStats {
  totalRecords: number;
  sources: number;
  places: number;
  unionRecords: number;
}

const domainExpansions: Record<string, string[]> = {
  bns: ['bharatiya nyaya sanhita', 'criminal', 'penal'],
  bnss: ['bharatiya nagarik suraksha sanhita', 'criminal procedure', 'police'],
  bsa: ['bharatiya sakshya adhiniyam', 'evidence', 'proof'],
  criminal: ['bharatiya nyaya sanhita', 'bharatiya nagarik suraksha sanhita', 'penal', 'procedure'],
  cyber: ['information technology', 'electronic', 'computer', 'digital', 'cert-in', 'intermediary'],
  hacking: ['information technology', 'computer', 'digital', 'intermediary'],
  fraud: ['consumer protection', 'contract', 'cheating', 'banking', 'financial'],
  consumer: ['consumer protection', 'product', 'service', 'complaint'],
  theft: ['penal', 'criminal', 'property'],
  robbery: ['penal', 'criminal', 'arms'],
  assault: ['penal', 'criminal', 'women', 'protection'],
  harassment: ['women', 'workplace', 'sexual harassment', 'protection'],
  domestic: ['women', 'domestic violence', 'family', 'protection'],
  child: ['juvenile', 'children', 'pocso', 'child'],
  labour: ['labour', 'employment', 'wages', 'industrial'],
  employment: ['labour', 'employment', 'wages', 'industrial'],
  property: ['land', 'rent', 'tenancy', 'registration', 'property'],
  traffic: ['motor vehicles', 'transport', 'road'],
  accident: ['motor vehicles', 'transport', 'compensation'],
  tax: ['tax', 'income tax', 'goods and services tax', 'gst'],
};

const allLawRecords = [...officialCurrentLawAnchors, ...indianLawDataset];

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

const stopWords = new Set([
  'about',
  'after',
  'against',
  'also',
  'and',
  'are',
  'because',
  'been',
  'before',
  'being',
  'case',
  'did',
  'does',
  'for',
  'from',
  'had',
  'has',
  'have',
  'into',
  'law',
  'legal',
  'not',
  'offence',
  'offense',
  'our',
  'that',
  'the',
  'their',
  'then',
  'there',
  'this',
  'under',
  'was',
  'were',
  'what',
  'when',
  'where',
  'with',
  'your',
]);

function tokenise(value: string) {
  return normalise(value)
    .split(' ')
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

function countTerms(tokens: string[]) {
  const counts = new Map<string, number>();
  tokens.forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1));
  return counts;
}

interface IndexedLawRecord {
  record: LawDatasetRecord;
  titleText: string;
  sourceText: string;
  placeText: string;
  combinedText: string;
  titleTokens: Set<string>;
  sourceTokens: Set<string>;
  placeTokens: Set<string>;
  tokenCounts: Map<string, number>;
  length: number;
}

interface SearchTerms {
  tokens: string[];
  phrases: string[];
  normalisedQuery: string;
}

const indexedRecords: IndexedLawRecord[] = allLawRecords.map((record) => {
  const titleText = normalise(record.title);
  const sourceText = normalise(record.source);
  const placeText = normalise(record.place);
  const combinedText = `${titleText} ${sourceText} ${placeText}`;
  const titleTokens = tokenise(record.title);
  const sourceTokens = tokenise(record.source);
  const placeTokens = tokenise(record.place);
  const weightedTokens = [
    ...titleTokens,
    ...titleTokens,
    ...titleTokens,
    ...sourceTokens,
    ...placeTokens,
    ...tokenise(record.publishedDate),
    ...tokenise(record.commencementDate),
  ];

  return {
    record,
    titleText,
    sourceText,
    placeText,
    combinedText,
    titleTokens: new Set(titleTokens),
    sourceTokens: new Set(sourceTokens),
    placeTokens: new Set(placeTokens),
    tokenCounts: countTerms(weightedTokens),
    length: Math.max(weightedTokens.length, 1),
  };
});

const documentFrequency = indexedRecords.reduce((frequencies, indexed) => {
  Array.from(indexed.tokenCounts.keys()).forEach((token) => {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  });
  return frequencies;
}, new Map<string, number>());

const averageDocumentLength =
  indexedRecords.reduce((total, indexed) => total + indexed.length, 0) / Math.max(indexedRecords.length, 1);

function getSearchTerms(query: string): SearchTerms {
  const baseTokens = tokenise(query);
  const expansionPhrases = baseTokens.flatMap((term) => domainExpansions[term] ?? []);
  const expansionTokens = expansionPhrases.flatMap(tokenise);
  const normalisedPhrases = expansionPhrases.map(normalise).filter((term) => term.includes(' '));

  return {
    tokens: Array.from(new Set([...baseTokens, ...expansionTokens])),
    phrases: Array.from(new Set(normalisedPhrases)),
    normalisedQuery: normalise(query),
  };
}

function getBm25Score(token: string, record: IndexedLawRecord) {
  const frequency = record.tokenCounts.get(token) ?? 0;
  if (frequency === 0) return 0;

  const totalRecords = indexedRecords.length;
  const matchingRecords = documentFrequency.get(token) ?? 0;
  const inverseDocumentFrequency = Math.log(1 + (totalRecords - matchingRecords + 0.5) / (matchingRecords + 0.5));
  const k1 = 1.2;
  const b = 0.72;
  const normalisedLength = frequency + k1 * (1 - b + b * (record.length / averageDocumentLength));

  return inverseDocumentFrequency * ((frequency * (k1 + 1)) / normalisedLength);
}

function scoreRecord(indexed: IndexedLawRecord, terms: SearchTerms) {
  const matchedTerms: string[] = [];
  let score = 0;

  terms.tokens.forEach((term) => {
    const bm25 = getBm25Score(term, indexed);
    if (bm25 <= 0) return;

    score += bm25;
    if (indexed.titleTokens.has(term)) score += 3.25;
    if (indexed.sourceTokens.has(term)) score += 1.25;
    if (indexed.placeTokens.has(term)) score += 0.75;
    matchedTerms.push(term);
  });

  terms.phrases.forEach((phrase) => {
    if (indexed.titleText.includes(phrase)) {
      score += 10;
      matchedTerms.push(phrase);
    } else if (indexed.combinedText.includes(phrase)) {
      score += 3.5;
      matchedTerms.push(phrase);
    }
  });

  if (terms.normalisedQuery.length > 4 && indexed.titleText.includes(terms.normalisedQuery)) {
    score += 12;
    matchedTerms.push(terms.normalisedQuery);
  }

  if (indexed.sourceText.includes('union of india') || indexed.placeText.includes('union of india')) score += 0.75;
  if (indexed.record.url.includes('indiacode.nic.in')) score += 1.5;
  if (/act|code|rules|regulation|sanhita|adhiniyam/.test(indexed.titleText)) score += 0.5;

  return { score, matchedTerms: Array.from(new Set(matchedTerms)) };
}

export function searchLawDataset(query: string, limit = 8): LawDatasetMatch[] {
  const terms = getSearchTerms(query);
  if (terms.tokens.length === 0 && terms.phrases.length === 0) return [];

  return indexedRecords
    .map((indexed) => {
      const { score, matchedTerms } = scoreRecord(indexed, terms);
      return { ...indexed.record, score, matchedTerms };
    })
    .filter((record) => record.score > 0)
    .sort((first, second) => second.score - first.score || first.title.localeCompare(second.title))
    .slice(0, limit);
}

export function getCaseDatasetMatches(caseInfo: CaseSubmission, limit = 8) {
  return searchLawDataset(`${caseInfo.incidentType} ${caseInfo.description} ${caseInfo.location}`, limit);
}

export function getLawDatasetStats(): LawDatasetStats {
  const sourceSet = new Set(allLawRecords.map((record) => record.source));
  const placeSet = new Set(allLawRecords.map((record) => record.place));

  return {
    totalRecords: lawDatasetSource.records + officialCurrentLawAnchors.length,
    sources: sourceSet.size,
    places: placeSet.size,
    unionRecords: allLawRecords.filter((record) => record.place.toLowerCase().includes('union of india')).length,
  };
}

export function getLawDatasetSources() {
  return Array.from(new Set(allLawRecords.map((record) => record.source))).sort();
}

export function getLawDatasetPlaces() {
  return Array.from(new Set(allLawRecords.map((record) => record.place))).sort();
}
