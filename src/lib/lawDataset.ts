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

function getTerms(query: string) {
  const baseTerms = normalise(query)
    .split(' ')
    .filter((term) => term.length > 2);
  const expanded = baseTerms.flatMap((term) => domainExpansions[term] ?? []);
  return Array.from(new Set([...baseTerms, ...expanded.map(normalise).filter(Boolean)]));
}

function scoreRecord(record: LawDatasetRecord, terms: string[]) {
  const title = normalise(record.title);
  const source = normalise(record.source);
  const place = normalise(record.place);
  const haystack = `${title} ${source} ${place}`;
  const matchedTerms: string[] = [];
  let score = 0;

  terms.forEach((term) => {
    if (!term) return;
    if (title.includes(term)) {
      score += term.includes(' ') ? 12 : 7;
      matchedTerms.push(term);
    } else if (haystack.includes(term)) {
      score += term.includes(' ') ? 5 : 2;
      matchedTerms.push(term);
    }
  });

  if (source.includes('union of india')) score += 1;
  if (/act|code|rules|regulation/.test(title)) score += 1;

  return { score, matchedTerms: Array.from(new Set(matchedTerms)) };
}

export function searchLawDataset(query: string, limit = 8): LawDatasetMatch[] {
  const terms = getTerms(query);
  if (terms.length === 0) return [];

  return allLawRecords
    .map((record) => {
      const { score, matchedTerms } = scoreRecord(record, terms);
      return { ...record, score, matchedTerms };
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
