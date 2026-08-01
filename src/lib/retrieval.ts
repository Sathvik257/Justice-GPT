import lawEmbeddings from '../data/lawEmbeddings.json';
import { searchLawDataset, type LawDatasetMatch } from './lawDataset';
import { cosineSimilarity, createTextEmbedding, normaliseEmbeddingText, tokenizeForEmbedding } from './textEmbedding';

export interface LawEmbeddingRecord {
  id: string;
  sectionNumber: string;
  actName: string;
  text: string;
  source: string;
  place: string;
  url: string;
  embedding: number[];
}

export interface LawEmbeddingIndex {
  generatedAt: string;
  dimensions: number;
  quantization?: string;
  sourceRecords: number;
  records: LawEmbeddingRecord[];
}

export interface RetrievedLaw {
  id: string;
  sectionNumber: string;
  actName: string;
  text: string;
  source: string;
  place: string;
  url: string;
  similarity: number;
  retrievalSource: 'embedding' | 'keyword-fallback';
}

export interface RetrievalOptions {
  minSimilarityThreshold?: number;
  preferredIds?: string[];
}

const MIN_SIMILARITY_THRESHOLD = 0.12;
const MAX_CACHE_ENTRIES = 80;

const embeddingIndex = lawEmbeddings as LawEmbeddingRecord[] | LawEmbeddingIndex;
const embeddingRecords = Array.isArray(embeddingIndex) ? embeddingIndex : embeddingIndex.records;
const retrievalCache = new Map<string, RetrievedLaw[]>();

interface IndexedEmbeddingRecord {
  record: LawEmbeddingRecord;
  recordText: string;
  sectionText: string;
  sectionBase: string;
  actNameText: string;
}

const indexedEmbeddingRecords: IndexedEmbeddingRecord[] = embeddingRecords.map((record) => {
  const sectionText = normaliseEmbeddingText(record.sectionNumber);
  return {
    record,
    recordText: normaliseEmbeddingText(`${record.sectionNumber} ${record.actName} ${record.text}`),
    sectionText,
    sectionBase: sectionText.replace(/\([^)]+\)/g, '').replace(/-\([^)]+\)/g, ''),
    actNameText: normaliseEmbeddingText(record.actName),
  };
});

function cacheKey(query: string, topK: number, options: RetrievalOptions) {
  return JSON.stringify({
    query: normaliseEmbeddingText(query),
    topK,
    minSimilarityThreshold: options.minSimilarityThreshold ?? MIN_SIMILARITY_THRESHOLD,
    preferredIds: options.preferredIds ?? [],
  });
}

function putCache(key: string, value: RetrievedLaw[]) {
  if (retrievalCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = retrievalCache.keys().next().value as string | undefined;
    if (firstKey) retrievalCache.delete(firstKey);
  }
  retrievalCache.set(key, value);
}

function extractSectionNumber(title: string) {
  const sectionMatch = title.match(/\b(?:section|sec\.?)\s+([0-9][0-9A-Z]*(?:\([^)]+\))?)/i);
  if (sectionMatch) return sectionMatch[1];

  const leadingCodeMatch = title.match(/\b(?:BNS|BNSS|BSA|IPC|CrPC|IT Act|POCSO)\s+([0-9A-Z]+(?:\([^)]+\))?)/i);
  return leadingCodeMatch ? leadingCodeMatch[0].replace(/\s+/g, ' ') : '';
}

function keywordMatchToRetrievedLaw(match: LawDatasetMatch): RetrievedLaw {
  return {
    id: match.id,
    sectionNumber: extractSectionNumber(match.title),
    actName: match.title,
    text: [
      match.title,
      match.source,
      match.place,
      match.commencementDate || match.publishedDate ? `date ${match.commencementDate || match.publishedDate}` : '',
    ]
      .filter(Boolean)
      .join(' | '),
    source: match.source,
    place: match.place,
    url: match.url,
    similarity: Number((match.score / Math.max(match.score + 20, 1)).toFixed(4)),
    retrievalSource: 'keyword-fallback',
  };
}

function embeddingMatchToRetrievedLaw(record: LawEmbeddingRecord, similarity: number): RetrievedLaw {
  return {
    id: record.id,
    sectionNumber: record.sectionNumber,
    actName: record.actName,
    text: record.text,
    source: record.source,
    place: record.place,
    url: record.url,
    similarity: Number(similarity.toFixed(4)),
    retrievalSource: 'embedding',
  };
}

function getLexicalBoost(queryText: string, queryTokens: string[], indexed: IndexedEmbeddingRecord) {
  if (queryTokens.length === 0) return 0;

  const exactLabelBoost =
    indexed.record.sectionNumber &&
    (queryText.includes(indexed.sectionText) || (indexed.sectionBase && queryText.includes(indexed.sectionBase)))
      ? 0.62
      : 0;
  const titleBoost =
    indexed.record.actName && queryText.includes(indexed.actNameText)
      ? 0.28
      : 0;
  const overlap = queryTokens.filter((token) => indexed.recordText.includes(token)).length / queryTokens.length;
  const mappingBoost = indexed.record.source === 'currentLawMapping.ts' && exactLabelBoost > 0 ? 0.22 : 0;

  return Math.min(0.95, exactLabelBoost + titleBoost + overlap * 0.42 + mappingBoost);
}

function mergeRetrievedLaws(primary: RetrievedLaw[], fallback: RetrievedLaw[], topK: number) {
  const merged = new Map<string, RetrievedLaw>();

  [...primary, ...fallback].forEach((law) => {
    const existing = merged.get(law.id);
    if (!existing || law.similarity > existing.similarity) {
      merged.set(law.id, law);
    }
  });

  return Array.from(merged.values())
    .sort((first, second) => {
      const sourceBoost = Number(second.retrievalSource === 'embedding') - Number(first.retrievalSource === 'embedding');
      if (sourceBoost !== 0 && Math.abs(second.similarity - first.similarity) < 0.08) return sourceBoost;
      return second.similarity - first.similarity || first.actName.localeCompare(second.actName);
    })
    .slice(0, topK);
}

export function retrieveRelevantLaws(query: string, topK = 8, options: RetrievalOptions = {}): RetrievedLaw[] {
  const normalisedQuery = normaliseEmbeddingText(query);
  if (!normalisedQuery) return [];

  const key = cacheKey(normalisedQuery, topK, options);
  const cached = retrievalCache.get(key);
  if (cached) return cached;

  try {
    if (!Array.isArray(embeddingRecords) || embeddingRecords.length === 0) {
      throw new Error('lawEmbeddings.json is empty');
    }

    const preferredIds = new Set(options.preferredIds ?? []);
    const queryEmbedding = createTextEmbedding(normalisedQuery);
    const queryTokens = tokenizeForEmbedding(normalisedQuery);
    const threshold = options.minSimilarityThreshold ?? MIN_SIMILARITY_THRESHOLD;

    const embeddingMatches = indexedEmbeddingRecords
      .map((indexed) => {
        const record = indexed.record;
        const similarity = cosineSimilarity(queryEmbedding, record.embedding);
        const preferredBoost = preferredIds.has(record.id) ? 0.04 : 0;
        const lexicalBoost = getLexicalBoost(normalisedQuery, queryTokens, indexed);
        return embeddingMatchToRetrievedLaw(record, similarity + lexicalBoost + preferredBoost);
      })
      .filter((law) => law.similarity >= threshold)
      .sort((first, second) => second.similarity - first.similarity || first.actName.localeCompare(second.actName))
      .slice(0, Math.max(topK * 2, 12));

    const keywordMatches = searchLawDataset(normalisedQuery, Math.max(topK, 8)).map(keywordMatchToRetrievedLaw);
    const results = mergeRetrievedLaws(embeddingMatches, keywordMatches, topK);
    putCache(key, results);
    return results;
  } catch (error) {
    console.warn('Embedding retrieval unavailable; using keyword law search fallback.', error);
    const fallback = searchLawDataset(normalisedQuery, topK).map(keywordMatchToRetrievedLaw);
    putCache(key, fallback);
    return fallback;
  }
}

export function formatRetrievedLawsForPrompt(laws: RetrievedLaw[], limit = 8) {
  if (laws.length === 0) return 'No close local law records were retrieved.';

  return laws
    .slice(0, limit)
    .map((law, index) => {
      const parts = [
        law.sectionNumber ? `section ${law.sectionNumber}` : '',
        law.actName,
        law.text,
        law.source,
        law.place,
        law.url,
        `similarity ${law.similarity.toFixed(3)}`,
        `source ${law.retrievalSource}`,
      ].filter(Boolean);
      return `${index + 1}. ${parts.join(' | ')}`;
    })
    .join('\n');
}
