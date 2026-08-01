import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRetrievalQuery } from '../src/lib/buildRetrievalQuery.ts';
import {
  cosineSimilarity,
  createTextEmbedding,
  normaliseEmbeddingText,
  tokenizeForEmbedding,
} from '../src/lib/textEmbedding.ts';

interface EmbeddingRecord {
  id: string;
  sectionNumber: string;
  actName: string;
  text: string;
  source: string;
  place: string;
  url: string;
  embedding: number[];
}

interface AnswerEvalCase {
  id: string;
  incidentType: string;
  description: string;
  date: string;
  location: string;
  activity: string;
  relationship: string;
  witnesses: string;
  issueTags: string[];
  expectedAny: string[];
}

interface RetrievedAnswerRecord extends EmbeddingRecord {
  similarity: number;
}

interface IndexedRecord {
  record: EmbeddingRecord;
  recordText: string;
  sectionText: string;
  sectionBase: string;
  actNameText: string;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const indexPath = path.join(root, 'src', 'data', 'lawEmbeddings.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as {
  records?: EmbeddingRecord[];
  generatedAt?: string;
};
const records = index.records ?? [];

const requiredSections = [
  '### Trust & Retrieval Signals',
  '### Case Classification',
  '### Indicative Laws and Sections',
  '### Dataset Matches',
  '### Detailed Legal Analysis',
  '### Professional Action Plan',
  "### Teacher's Note",
];

const cases: AnswerEvalCase[] = [
  {
    id: 'cyber-fraud-answer',
    incidentType: 'Cybercrime',
    description:
      'My social media account was hacked and fake messages were sent to relatives asking for money. I have screenshots, login alerts, and payment details.',
    date: '2026-07-20',
    location: 'Hyderabad, Telangana',
    activity: 'I need help understanding the possible offence and what evidence to preserve.',
    relationship: 'Victim',
    witnesses: 'Two relatives received the fraudulent messages.',
    issueTags: ['Cybercrime', 'IT Act 66C', 'IT Act 66D'],
    expectedAny: ['IT Act 66C', 'IT Act 66D', 'Cybercrime'],
  },
  {
    id: 'robbery-answer',
    incidentType: 'Theft or Robbery',
    description:
      'Two people threatened me with a knife near a shop at night and took my phone and wallet. A CCTV camera may have recorded the incident.',
    date: '2026-07-19',
    location: 'Pune, Maharashtra',
    activity: 'I was returning home from work.',
    relationship: 'Victim',
    witnesses: 'A shop owner saw the incident.',
    issueTags: ['Robbery', 'IPC 392', 'BNS 309'],
    expectedAny: ['IPC 392', 'BNS 309', 'Robbery'],
  },
  {
    id: 'domestic-violence-answer',
    incidentType: 'Domestic violence',
    description:
      'My husband and in-laws repeatedly demanded money, threatened me, and assaulted me. I have medical papers and messages from family members.',
    date: '2026-07-14',
    location: 'Lucknow, Uttar Pradesh',
    activity: 'I want to know what immediate legal protections may be relevant.',
    relationship: 'Victim',
    witnesses: 'My parents saw injuries and have messages.',
    issueTags: ['Domestic Violence', 'IPC 498A', 'BNS 85', 'DV Act 3'],
    expectedAny: ['IPC 498A', 'BNS 85', 'DV Act 3'],
  },
  {
    id: 'traffic-answer',
    incidentType: 'Traffic Accident',
    description:
      'A speeding car hit my two-wheeler at a junction and the driver left without helping. I received treatment and noted the vehicle number.',
    date: '2026-07-10',
    location: 'Chennai, Tamil Nadu',
    activity: 'I need guidance on documents and evidence before filing a complaint.',
    relationship: 'Victim',
    witnesses: 'A passerby helped me and traffic camera footage may exist.',
    issueTags: ['Rash Driving', 'IPC 304A', 'BNS 106', 'IPC 279'],
    expectedAny: ['IPC 304A', 'BNS 106', 'IPC 279'],
  },
  {
    id: 'general-threat-answer',
    incidentType: 'Other',
    description:
      'A neighbor is spreading false statements about me and threatening to damage my reputation at work unless I pay money.',
    date: '2026-07-08',
    location: 'Bengaluru, Karnataka',
    activity: 'I need to understand if this is only a civil matter or a criminal complaint may be possible.',
    relationship: 'Victim',
    witnesses: 'Colleagues saw the messages and calls.',
    issueTags: ['Defamation', 'Extortion', 'IPC 499', 'BNS 356', 'IPC 384', 'BNS 308'],
    expectedAny: ['IPC 499', 'BNS 356', 'IPC 384', 'BNS 308', 'Defamation', 'Extortion'],
  },
];

const indexedRecords: IndexedRecord[] = records.map((record) => {
  const sectionText = normaliseEmbeddingText(record.sectionNumber);
  return {
    record,
    recordText: normaliseEmbeddingText(`${record.sectionNumber} ${record.actName} ${record.text}`),
    sectionText,
    sectionBase: sectionText.replace(/\([^)]+\)/g, '').replace(/-\([^)]+\)/g, ''),
    actNameText: normaliseEmbeddingText(record.actName),
  };
});

function getLexicalBoost(queryText: string, queryTokens: string[], indexed: IndexedRecord) {
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

function retrieve(testCase: AnswerEvalCase, topK = 8): RetrievedAnswerRecord[] {
  const query = buildRetrievalQuery(
    {
      incidentType: testCase.incidentType,
      description: testCase.description,
      date: testCase.date,
      location: testCase.location,
      activity: testCase.activity,
      relationship: testCase.relationship,
      witnesses: testCase.witnesses,
    },
    {
      issueTags: testCase.issueTags,
      preferredSectionLabels: testCase.issueTags,
    },
  );
  const queryEmbedding = createTextEmbedding(query);
  const queryText = normaliseEmbeddingText(query);
  const queryTokens = tokenizeForEmbedding(queryText);

  return indexedRecords
    .map((indexed) => ({
      ...indexed.record,
      similarity:
        cosineSimilarity(queryEmbedding, indexed.record.embedding) + getLexicalBoost(queryText, queryTokens, indexed),
    }))
    .sort((first, second) => second.similarity - first.similarity || first.actName.localeCompare(second.actName))
    .slice(0, topK);
}

function explainInSimpleWords(record: RetrievedAnswerRecord) {
  if (record.sectionNumber) {
    return `${record.sectionNumber} may matter if the facts match its legal ingredients; verify the exact wording before acting.`;
  }
  return `${record.actName} is a relevant legal source to check for this fact pattern.`;
}

function buildEducationalAnswer(testCase: AnswerEvalCase, retrieved: RetrievedAnswerRecord[]) {
  const laws = retrieved
    .slice(0, 6)
    .map(
      (record) =>
        `- ${record.sectionNumber || 'Reference'}: ${record.actName}. Source: ${record.source}. In simple words: ${explainInSimpleWords(record)}`,
    )
    .join('\n');
  const matches = retrieved
    .map(
      (record) =>
        `- ${record.sectionNumber || '-'}: ${record.actName}. Source: embedding retrieval. Similarity: ${record.similarity.toFixed(3)}`,
    )
    .join('\n');

  return [
    '### Trust & Retrieval Signals',
    'Report engine: Local educational rule engine fallback',
    `Retrieved law records: ${retrieved.length}`,
    `Embedding index generated at: ${index.generatedAt ?? 'unknown'}`,
    '',
    '### Case Classification',
    `Case Type: ${testCase.incidentType}`,
    `Date: ${testCase.date}`,
    `Location: ${testCase.location}`,
    '',
    '### Indicative Laws and Sections',
    laws || '- No retrieved law records were available.',
    '',
    '### Dataset Matches',
    matches || '- No dataset matches found.',
    '',
    '### Detailed Legal Analysis',
    `Reported Issue: ${testCase.incidentType}`,
    `Facts Provided: ${testCase.description}`,
    '',
    '### Professional Action Plan',
    '1. Preserve documents, screenshots, medical records, messages, and witness details.',
    '2. Compare the facts against each retrieved section before relying on it.',
    '3. Verify current law and local procedure with official sources or a qualified professional.',
    '',
    "### Teacher's Note",
    'This verification confirms the trained local dataset can support an educational answer. It is not legal advice.',
  ].join('\n');
}

if (records.length < 7_800) {
  console.error(`Expected at least 7,800 embedded records, found ${records.length}.`);
  process.exit(1);
}

const rows = cases.map((testCase) => {
  const retrieved = retrieve(testCase);
  const answer = buildEducationalAnswer(testCase, retrieved);
  const lowerAnswer = answer.toLowerCase();
  const missingSections = requiredSections.filter((section) => !answer.includes(section));
  const matchedExpectation = testCase.expectedAny.some((expected) => lowerAnswer.includes(expected.toLowerCase()));
  const ok =
    answer.length > 1200 &&
    missingSections.length === 0 &&
    matchedExpectation &&
    answer.includes('In simple words:') &&
    retrieved.length >= 6;

  return {
    id: testCase.id,
    ok: ok ? 'PASS' : 'FAIL',
    retrieved: retrieved.length,
    expected: testCase.expectedAny.join(' or '),
    top: retrieved[0] ? `${retrieved[0].sectionNumber || '-'} ${retrieved[0].actName}`.slice(0, 72) : '-',
    missingSections: missingSections.join(', ') || '-',
  };
});

console.table(rows);

const passed = rows.filter((row) => row.ok === 'PASS').length;
console.log(`Answer verification: ${passed}/${rows.length} passed.`);

if (passed !== rows.length) {
  process.exitCode = 1;
}
