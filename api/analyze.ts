// Vercel serverless function: /api/analyze
//
// Calls Google Gemini server-side so the API key (GEMINI_API_KEY) is never
// shipped to the browser. The frontend posts structured case fields; this
// function rebuilds retrieval context server-side so guardrails cannot be
// tampered with from the client, then returns Markdown. If no key is
// configured or the call fails, it responds with 204 so the frontend
// transparently falls back to its local rule engine.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CURRENT_LAW_MAPPING_LAST_VERIFIED_ON } from '../src/data/currentLawMapping';
import { buildRetrievalQuery } from '../src/lib/buildRetrievalQuery';
import {
  appendCitationValidationNotice,
  getAllowedCitationLabelsFromRetrieval,
  getStaticAllowedCitationLabels,
  validateCitations,
} from '../src/lib/citationValidation';
import { formatRetrievedLawsForPrompt, retrieveRelevantLaws, type RetrievedLaw } from '../src/lib/retrieval';

// Minimal request/response shapes so we don't need the @vercel/node types as a
// dependency. Vercel injects objects that satisfy these at runtime.
interface ApiRequest {
  method?: string;
  body: unknown;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
}
interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: unknown): void;
  send(data?: unknown): void;
  setHeader(key: string, value: string): void;
}

interface OfficialCitation {
  legacyLabel?: string;
  currentLabel?: string;
  subject?: string;
  url?: string;
}

interface CaseFields {
  incidentType?: string;
  description?: string;
  date?: string;
  location?: string;
}

const HEADINGS = [
  '### Case Classification',
  '### Indicative Laws and Sections',
  '### Current Law Mapping (BNS / BNSS / BSA)',
  '### Dataset Matches',
  '### Detailed Legal Analysis',
  '### Procedural Aspects',
  '### Legal Precedents',
  '### Professional Action Plan',
  '### Constitutional Implications',
  "### Teacher's Note",
].join('\n');

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const ANALYSIS_CACHE_MS = 10 * 60_000;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const analysisCache = new Map<string, { markdown: string; expiresAt: number }>();

function clip(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function getHeader(req: ApiRequest, name: string): string {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function getClientKey(req: ApiRequest): string {
  const forwardedFor = getHeader(req, 'x-forwarded-for');
  return forwardedFor.split(',')[0]?.trim() || req.socket?.remoteAddress || 'anonymous';
}

function isRateLimited(clientKey: string) {
  const now = Date.now();
  const existing = requestBuckets.get(clientKey);

  if (!existing || existing.resetAt <= now) {
    requestBuckets.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > RATE_LIMIT_MAX_REQUESTS;
}

function normalizeCaseFields(caseInfo: CaseFields) {
  return {
    incidentType: clip(caseInfo.incidentType, 400),
    description: clip(caseInfo.description, 5000),
    date: clip(caseInfo.date, 40),
    location: clip(caseInfo.location, 200),
  };
}

function getCacheKey(caseInfo: ReturnType<typeof normalizeCaseFields>, officialCitations: OfficialCitation[]) {
  const retrievalQuery = buildRetrievalQuery(caseInfo, {
    preferredSectionLabels: officialCitations.flatMap((citation) => [
      clip(citation.legacyLabel, 80),
      clip(citation.currentLabel, 80),
    ]),
  });

  return `${retrievalQuery}|official:${officialCitations
    .map((citation) => `${clip(citation.legacyLabel, 80)}>${clip(citation.currentLabel, 80)}`)
    .join(',')}`;
}

function getCachedAnalysis(key: string) {
  const cached = analysisCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    analysisCache.delete(key);
    return null;
  }
  return cached.markdown;
}

function putCachedAnalysis(key: string, markdown: string) {
  if (analysisCache.size > 60) {
    const firstKey = analysisCache.keys().next().value as string | undefined;
    if (firstKey) analysisCache.delete(firstKey);
  }
  analysisCache.set(key, { markdown, expiresAt: Date.now() + ANALYSIS_CACHE_MS });
}

function retrieveServerLaws(caseInfo: ReturnType<typeof normalizeCaseFields>, officialCitations: OfficialCitation[]) {
  const retrievalQuery = buildRetrievalQuery(caseInfo, {
    issueTags: [caseInfo.incidentType].filter(Boolean),
    preferredSectionLabels: officialCitations.flatMap((citation) => [
      clip(citation.legacyLabel, 80),
      clip(citation.currentLabel, 80),
    ]),
  });

  return retrieveRelevantLaws(retrievalQuery, 8);
}

function buildPrompt(
  caseInfo: ReturnType<typeof normalizeCaseFields>,
  retrievedLaws: RetrievedLaw[],
  officialCitations: OfficialCitation[],
): string {
  const datasetContext = formatRetrievedLawsForPrompt(retrievedLaws, 8);
  const citationContext = officialCitations.length
    ? officialCitations
        .slice(0, 10)
        .map((citation, i) => {
          const parts = [citation.legacyLabel, citation.currentLabel, citation.subject, citation.url]
            .map((p) => clip(p, 400))
            .filter(Boolean);
          return `${i + 1}. ${parts.join(' | ')}`;
        })
        .join('\n')
    : 'No official section citation was supplied by the local mapping.';

  return `
You are Justice GPT, an educational legal triage assistant for Indian law.

Important guardrails:
- Do not claim to be a lawyer.
- Do not give final legal advice.
- Mention that most BNS, BNSS, and BSA provisions came into force on 1 July 2024 and older IPC/CrPC references must be verified.
- Mention that the local current-law mapping table was last verified on ${CURRENT_LAW_MAPPING_LAST_VERIFIED_ON}.
- Cite section labels and act names exactly as they appear in RELEVANT LAW RECORDS or OFFICIAL CURRENT-LAW MAPPINGS below. Do not invent section numbers.
- In "Current Law Mapping", translate IPC/CrPC/Evidence Act sections only when OFFICIAL CURRENT-LAW MAPPINGS below provide the mapping. Note that the IT Act, POCSO, DV Act, and Consumer Protection Act were not replaced in 2024.
- If a provided official India Code citation matches a current section you cite, format the current section label as a Markdown link to that URL. Do not invent India Code URLs.
- In "Indicative Laws and Sections", every law bullet must include one sentence starting exactly "In simple words:" that explains the section to a non-lawyer in everyday language.
- In "Current Law Mapping", every mapped law bullet must also include "In simple words:" so users understand what the old/current section is about.
- In "Dataset Matches", clearly label whether each cited item came from retrieval context or fallback mapping.
- Use cautious language and explain uncertainty.
- Return Markdown with exactly these headings:
${HEADINGS}

Case details:
Type: ${caseInfo.incidentType}
Description: ${clip(caseInfo.description, 4000)}
Date: ${caseInfo.date}
Location: ${caseInfo.location}

RELEVANT LAW RECORDS selected server-side by local embedding retrieval:
${datasetContext}

OFFICIAL CURRENT-LAW MAPPINGS from the local current-law mapping table:
${citationContext}
`.trim();
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    // No key configured: signal the client to use its local fallback.
    res.status(204).send();
    return;
  }

  const clientKey = getClientKey(req);
  if (isRateLimited(clientKey)) {
    res.setHeader('Retry-After', '60');
    res.status(429).json({ error: 'Too many analysis requests. Please wait a minute and try again.' });
    return;
  }

  let payload: { caseInfo?: CaseFields; officialCitations?: OfficialCitation[] };
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as typeof payload);
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const caseInfo = payload?.caseInfo;
  if (!caseInfo || (!caseInfo.description && !caseInfo.incidentType)) {
    res.status(400).json({ error: 'Missing case details' });
    return;
  }
  if (clip(caseInfo.description, 5001).length > 5000) {
    res.status(413).json({ error: 'Case description is too long. Please shorten it and try again.' });
    return;
  }
  const normalizedCaseInfo = normalizeCaseFields(caseInfo);
  if (!normalizedCaseInfo.description && !normalizedCaseInfo.incidentType) {
    res.status(400).json({ error: 'Missing case details' });
    return;
  }
  const officialCitations = Array.isArray(payload?.officialCitations) ? payload.officialCitations : [];
  const cacheKey = getCacheKey(normalizedCaseInfo, officialCitations);
  const cachedMarkdown = getCachedAnalysis(cacheKey);

  if (cachedMarkdown) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ markdown: cachedMarkdown, cached: true });
    return;
  }

  try {
    const retrievedLaws = retrieveServerLaws(normalizedCaseInfo, officialCitations);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });
    const result = await model.generateContent(buildPrompt(normalizedCaseInfo, retrievedLaws, officialCitations));
    const text = result.response.text().trim();
    if (!text) {
      res.status(204).send();
      return;
    }
    const validation = validateCitations(text, [
      ...getStaticAllowedCitationLabels(),
      ...getAllowedCitationLabelsFromRetrieval(retrievedLaws),
      ...officialCitations.flatMap((citation) => [clip(citation.legacyLabel, 80), clip(citation.currentLabel, 80)]),
    ]);
    const markdown = appendCitationValidationNotice(text, validation);
    putCachedAnalysis(cacheKey, markdown);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ markdown, retrievedCount: retrievedLaws.length, citationValidation: validation });
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    // Let the client fall back locally rather than surfacing a hard error.
    res.status(204).send();
  }
}
