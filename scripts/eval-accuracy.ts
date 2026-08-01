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

interface EvalCase {
  id: string;
  incidentType: string;
  description: string;
  issueTags: string[];
  expectedAny: string[];
}

interface RetrievedEvalRecord extends EmbeddingRecord {
  similarity: number;
}

interface IndexedEvalRecord {
  record: EmbeddingRecord;
  recordText: string;
  sectionText: string;
  sectionBase: string;
  actNameText: string;
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const indexPath = path.join(root, 'src', 'data', 'lawEmbeddings.json');
const index = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as { records?: EmbeddingRecord[] };
const records = index.records ?? [];
const MAX_CASE_LATENCY_MS = 750;
const indexedRecords: IndexedEvalRecord[] = records.map((record) => {
  const sectionText = normaliseEmbeddingText(record.sectionNumber);
  return {
    record,
    recordText: normaliseEmbeddingText(`${record.sectionNumber} ${record.actName} ${record.text}`),
    sectionText,
    sectionBase: sectionText.replace(/\([^)]+\)/g, '').replace(/-\([^)]+\)/g, ''),
    actNameText: normaliseEmbeddingText(record.actName),
  };
});

function makeCase(
  id: string,
  incidentType: string,
  description: string,
  issueTags: string[],
  expectedAny: string[],
): EvalCase {
  return { id, incidentType, description, issueTags, expectedAny };
}

const cases: EvalCase[] = [
  makeCase('murder', 'Murder', 'A person was stabbed with a knife and died at the scene.', ['Murder', 'IPC 302', 'BNS 103'], ['IPC 302', 'BNS 103']),
  makeCase('attempt-murder', 'Attempt to murder', 'The accused shot at the victim but the victim survived.', ['Attempt to Murder', 'IPC 307', 'BNS 109'], ['IPC 307', 'BNS 109']),
  makeCase('robbery', 'Robbery', 'Two people robbed a shopkeeper at knifepoint and took cash.', ['Robbery', 'IPC 392', 'BNS 309'], ['IPC 392', 'BNS 309']),
  makeCase('theft', 'Theft', 'Gold jewellery was stolen from a locked cupboard in a dwelling house.', ['Theft', 'IPC 379', 'BNS 303'], ['IPC 379', 'BNS 303']),
  makeCase('fraud', 'Fraud', 'An online seller used fake documents and cheated the buyer into paying money.', ['Fraud', 'IPC 420', 'BNS 318'], ['IPC 420', 'BNS 318']),
  makeCase('assault', 'Assault', 'The accused hit the complainant and caused visible injuries.', ['Assault', 'IPC 323', 'BNS 115'], ['IPC 323', 'BNS 115']),
  makeCase('harassment', 'Harassment', 'A coworker repeatedly made lewd comments and sexually harassed a woman.', ['Harassment', 'IPC 354A', 'BNS 75'], ['IPC 354A', 'BNS 75']),
  makeCase('intimidation', 'Criminal intimidation', 'Anonymous messages threatened to kill the complainant unless they withdrew a complaint.', ['Criminal Intimidation', 'IPC 506', 'BNS 351'], ['IPC 506', 'BNS 351']),
  makeCase('cyber', 'Cybercrime', 'The victim was hacked and their identity credentials were used for an online fraud.', ['Cybercrime', 'IT Act 66C'], ['IT Act 66C']),
  makeCase('domestic-violence', 'Domestic violence', 'The husband and in-laws demanded dowry and subjected the wife to cruelty.', ['Domestic Violence', 'IPC 498A', 'BNS 85'], ['IPC 498A', 'BNS 85']),
  makeCase('child-protection', 'Child abuse', 'A minor student was sexually abused by a teacher at school.', ['Child Protection', 'POCSO 7'], ['POCSO 7']),
  makeCase('sexual-offence', 'Sexual offence', 'The survivor describes rape and sexual assault without consent.', ['Sexual Offense', 'IPC 376', 'BNS 64'], ['IPC 376', 'BNS 64']),
  makeCase('kidnapping', 'Kidnapping for ransom', 'A child was abducted and the family received a ransom demand.', ['Kidnapping', 'IPC 364A', 'BNS 140'], ['IPC 364A', 'BNS 140']),
  makeCase('extortion', 'Extortion', 'The accused demanded protection money and threatened serious harm.', ['Extortion', 'IPC 384', 'BNS 308'], ['IPC 384', 'BNS 308']),
  makeCase('stalking', 'Stalking', 'The accused kept following and monitoring a woman online despite refusal.', ['Stalking', 'IPC 354D', 'BNS 78'], ['IPC 354D', 'BNS 78']),
  makeCase('dowry-death', 'Dowry death', 'A bride died unnaturally within seven years of marriage after dowry harassment.', ['Dowry Death', 'IPC 304B', 'BNS 80'], ['IPC 304B', 'BNS 80']),
  makeCase('negligent-driving', 'Rash driving', 'A reckless driver caused a road accident and death.', ['Rash Driving', 'IPC 304A', 'BNS 106'], ['IPC 304A', 'BNS 106']),
  makeCase('defamation', 'Defamation', 'False public rumours damaged the complainant reputation.', ['Defamation', 'IPC 499', 'BNS 356'], ['IPC 499', 'BNS 356']),
];

function retrieve(evalCase: EvalCase, topK = 8): RetrievedEvalRecord[] {
  const query = buildRetrievalQuery(
    {
      incidentType: evalCase.incidentType,
      description: evalCase.description,
      date: '2026-07-20',
      location: 'Hyderabad, Telangana',
      activity: 'reporting an incident',
      relationship: 'affected person',
      witnesses: 'documents and witness details available',
    },
    {
      issueTags: evalCase.issueTags,
      preferredSectionLabels: evalCase.issueTags,
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

function getLexicalBoost(queryText: string, queryTokens: string[], indexed: IndexedEvalRecord) {
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

function buildEvalReport(evalCase: EvalCase, retrieved: RetrievedEvalRecord[]) {
  return [
    '### Case Classification',
    `Case Type: ${evalCase.incidentType}`,
    '### Dataset Matches',
    ...retrieved.map((record) => `- ${record.sectionNumber}: ${record.actName}. Source: ${record.source}. Similarity: ${record.similarity.toFixed(3)}`),
  ].join('\n');
}

const started = performance.now();
let passed = 0;
const rows = cases.map((evalCase) => {
  const caseStart = performance.now();
  const retrieved = retrieve(evalCase);
  const latencyMs = Math.round(performance.now() - caseStart);
  const report = buildEvalReport(evalCase, retrieved).toLowerCase();
  const matchedExpectation = evalCase.expectedAny.some((expected) => report.includes(expected.toLowerCase()));
  const noUnsupported = retrieved.every((record) => Boolean(record.source) && Boolean(record.actName));
  const hasRetrieval = retrieved.length > 0;
  const ok = matchedExpectation && noUnsupported && hasRetrieval && latencyMs < MAX_CASE_LATENCY_MS;
  if (ok) passed += 1;

  return {
    id: evalCase.id,
    ok: ok ? 'PASS' : 'FAIL',
    expected: evalCase.expectedAny.join(' or '),
    top: retrieved[0] ? `${retrieved[0].sectionNumber || '-'} ${retrieved[0].actName}`.slice(0, 72) : '-',
    latencyMs,
  };
});

const totalMs = Math.round(performance.now() - started);
const passRate = Math.round((passed / cases.length) * 100);

console.table(rows);
console.log(`Accuracy eval: ${passed}/${cases.length} passed (${passRate}%)`);
console.log(`Total local eval time: ${totalMs}ms`);

if (passed !== cases.length) {
  process.exitCode = 1;
}
