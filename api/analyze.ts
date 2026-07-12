// Vercel serverless function: /api/analyze
//
// Calls Google Gemini server-side so the API key (GEMINI_API_KEY) is never
// shipped to the browser. The frontend posts structured case fields plus the
// dataset matches it already computed locally; this function rebuilds the
// guarded prompt here so the guardrails cannot be tampered with from the
// client, then returns Markdown. If no key is configured or the call fails,
// it responds with 204 so the frontend transparently falls back to its local
// rule engine.

import { GoogleGenerativeAI } from '@google/generative-ai';

// Minimal request/response shapes so we don't need the @vercel/node types as a
// dependency. Vercel injects objects that satisfy these at runtime.
interface ApiRequest {
  method?: string;
  body: unknown;
}
interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: unknown): void;
  send(data?: unknown): void;
  setHeader(key: string, value: string): void;
}

interface DatasetMatch {
  title?: string;
  source?: string;
  place?: string;
  date?: string;
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

function clip(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function buildPrompt(caseInfo: CaseFields, matches: DatasetMatch[]): string {
  const datasetContext = matches.length
    ? matches
        .slice(0, 8)
        .map((m, i) => {
          const parts = [m.title, m.source, m.place, m.date, m.url]
            .map((p) => clip(p, 300))
            .filter(Boolean);
          return `${i + 1}. ${parts.join(' | ')}`;
        })
        .join('\n')
    : 'No close local dataset matches found.';

  return `
You are Justice GPT, an educational legal triage assistant for Indian law.

Important guardrails:
- Do not claim to be a lawyer.
- Do not give final legal advice.
- Mention that most BNS, BNSS, and BSA provisions came into force on 1 July 2024 and older IPC/CrPC references must be verified.
- In "Current Law Mapping", translate any IPC/CrPC/Evidence Act sections you cite into their current BNS/BNSS/BSA equivalents (for example IPC 302 maps to BNS 103, IPC 420 maps to BNS 318(4), CrPC 154 maps to BNSS 173). Note that the IT Act, POCSO, DV Act, and Consumer Protection Act were not replaced in 2024.
- Use cautious language and explain uncertainty.
- Return Markdown with exactly these headings:
${HEADINGS}

Case details:
Type: ${clip(caseInfo.incidentType, 400)}
Description: ${clip(caseInfo.description, 4000)}
Date: ${clip(caseInfo.date, 40)}
Location: ${clip(caseInfo.location, 200)}

Local dataset matches from the Kaggle Laws and Acts of India dataset:
${datasetContext}
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

  let payload: { caseInfo?: CaseFields; datasetMatches?: DatasetMatch[] };
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
  const matches = Array.isArray(payload?.datasetMatches) ? payload.datasetMatches : [];

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });
    const result = await model.generateContent(buildPrompt(caseInfo, matches));
    const text = result.response.text().trim();
    if (!text) {
      res.status(204).send();
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ markdown: text });
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    // Let the client fall back locally rather than surfacing a hard error.
    res.status(204).send();
  }
}
