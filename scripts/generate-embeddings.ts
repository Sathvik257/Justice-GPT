import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { officialCurrentLawAnchors } from '../src/data/currentLegalAnchors.ts';
import {
  CURRENT_LAW_MAPPING_LAST_VERIFIED_ON,
  currentLawEquivalents,
  getOfficialCitationForLegacyLabel,
} from '../src/data/currentLawMapping.ts';
import { constitutionalArticles } from '../src/data/constitutionalArticles.ts';
import { indianLawDataset, lawDatasetSource } from '../src/data/lawsAndActs.ts';
import { createTextEmbedding, TEXT_EMBEDDING_DIMENSIONS } from '../src/lib/textEmbedding.ts';

interface EmbeddingSourceRecord {
  id: string;
  sectionNumber: string;
  actName: string;
  text: string;
  source: string;
  place: string;
  url: string;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const outputPath = path.join(root, 'src', 'data', 'lawEmbeddings.json');

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getActName(sectionLabel: string) {
  if (sectionLabel.startsWith('BNS')) return 'The Bharatiya Nyaya Sanhita, 2023';
  if (sectionLabel.startsWith('BNSS')) return 'The Bharatiya Nagarik Suraksha Sanhita, 2023';
  if (sectionLabel.startsWith('BSA')) return 'The Bharatiya Sakshya Adhiniyam, 2023';
  if (sectionLabel.startsWith('IPC')) return 'Indian Penal Code, 1860';
  if (sectionLabel.startsWith('CrPC')) return 'Code of Criminal Procedure, 1973';
  return 'Indian legal reference';
}

function extractSectionNumber(title: string) {
  const sectionMatch = title.match(/\b(?:section|sec\.?)\s+([0-9][0-9A-Z]*(?:\([^)]+\))?)/i);
  if (sectionMatch) return sectionMatch[1];

  const labelledMatch = title.match(/\b(?:BNS|BNSS|BSA|IPC|CrPC|IT Act|POCSO)\s+[0-9A-Z]+(?:\([^)]+\))?/i);
  return labelledMatch ? labelledMatch[0].replace(/\s+/g, ' ') : '';
}

const officialActRecords: EmbeddingSourceRecord[] = officialCurrentLawAnchors.map((record) => ({
  id: `embedding-${record.id}`,
  sectionNumber: '',
  actName: record.title,
  text: `${record.title}. Official India Code act anchor. Published ${record.publishedDate}. Commenced ${record.commencementDate}.`,
  source: record.source,
  place: record.place,
  url: record.url,
}));

const mappingRecords: EmbeddingSourceRecord[] = Object.entries(currentLawEquivalents).map(([legacyLabel, equivalent]) => ({
  id: `mapping-${slug(legacyLabel)}-${slug(equivalent.current)}`,
  sectionNumber: equivalent.current,
  actName: getActName(equivalent.current),
  text: `${legacyLabel} maps to ${equivalent.current}. ${equivalent.subject}. Current criminal law mapping last verified on ${CURRENT_LAW_MAPPING_LAST_VERIFIED_ON}.`,
  source: 'currentLawMapping.ts',
  place: 'Union Of India',
  url: getOfficialCitationForLegacyLabel(legacyLabel) ?? '',
}));

const articleRecords: EmbeddingSourceRecord[] = constitutionalArticles.map((article) => ({
  id: `article-${slug(article.number)}-${slug(article.title)}`,
  sectionNumber: /^\d+$/.test(article.number) ? `Article ${article.number}` : article.number,
  actName: /^\d+$/.test(article.number) ? 'Constitution of India' : article.title,
  text: `${article.number}. ${article.title}. ${article.description}`,
  source: 'constitutionalArticles.ts',
  place: 'Union Of India',
  url: '',
}));

const datasetRecords: EmbeddingSourceRecord[] = indianLawDataset.map((record) => ({
  id: record.id,
  sectionNumber: extractSectionNumber(record.title),
  actName: record.title,
  text: [
    record.title,
    record.source,
    record.place,
    record.publishedDate ? `published ${record.publishedDate}` : '',
    record.commencementDate ? `commenced ${record.commencementDate}` : '',
  ]
    .filter(Boolean)
    .join('. '),
  source: record.source,
  place: record.place,
  url: record.url,
}));

const seen = new Set<string>();
const records = [...officialActRecords, ...mappingRecords, ...articleRecords, ...datasetRecords]
  .filter((record) => {
    const key = `${record.id}|${record.actName}|${record.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .map((record) => ({
    ...record,
    embedding: createTextEmbedding(`${record.sectionNumber} ${record.actName} ${record.text}`).map((value) =>
      Math.round(value * 127),
    ),
  }));

const index = {
  generatedAt: new Date().toISOString(),
  dimensions: TEXT_EMBEDDING_DIMENSIONS,
  quantization: 'int8-scale-127',
  sourceRecords: lawDatasetSource.records + officialCurrentLawAnchors.length + mappingRecords.length + articleRecords.length,
  currentLawMappingLastVerifiedOn: CURRENT_LAW_MAPPING_LAST_VERIFIED_ON,
  records,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(index)}\n`, 'utf8');

console.log(`Generated ${records.length} embedded law records at ${outputPath}`);
console.log(`Dimensions: ${TEXT_EMBEDDING_DIMENSIONS}`);
console.log(`Current-law mapping verified on: ${CURRENT_LAW_MAPPING_LAST_VERIFIED_ON}`);
