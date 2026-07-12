# Justice GPT

Justice GPT is a Vite + React legal education app for Indian-law case triage. It guides users through language selection, personal details, role selection, case facts, and a structured AI-assisted report.

The app uses two knowledge paths:

- Google Gemini, called through a serverless function (`/api/analyze`) so the API key stays on the server and is never shipped to the browser.
- A local searchable law dataset generated from Kaggle's Laws and Acts of India dataset, supplemented with current India Code anchors for BNS, BNSS, and BSA, plus a curated rule engine.

If no Gemini key is configured (or the serverless function is unavailable, e.g. during `vite dev`), the app transparently falls back to its local educational rule engine, so it is fully usable with zero secrets and zero external calls.

## Features

- Guided flow for lawyers and general users.
- Structured reports with case classification, indicative laws, procedure, precedents, action steps, and constitutional implications.
- Current Law Mapping that translates the older IPC/CrPC sections into their in-force BNS/BNSS/BSA equivalents (e.g. IPC 302 to BNS 103), shown in every report and requested from Gemini.
- Broad offence coverage in the local engine: theft, robbery, murder, assault, harassment, fraud, cybercrime, domestic violence, POCSO/child protection, sexual offences, kidnapping/abduction, extortion, stalking/voyeurism, dowry death, rash/negligent driving, defamation, and consumer/tenancy matters.
- Secure serverless AI proxy (`/api/analyze`) so the Gemini key is never exposed in the client bundle.
- Local report history in browser storage.
- Searchable Law Library with 7,658 cleaned law records and current-law anchors.
- Dataset matches are included in Gemini prompts and local fallback reports.
- Copy and print controls for generated reports.
- Safer legal disclaimers and reminders to verify current law.
- Responsive React + Tailwind UI.

## Legal Currency Note

Most provisions of India's BNS, BNSS, and BSA came into force on 1 July 2024, replacing or changing references to IPC, CrPC, and Evidence Act materials for many purposes. This project keeps older IPC-style references as educational starting points and asks users to verify the current law, incident date, and local jurisdiction before acting.

Official references:

- PIB: https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2082757
- India Code BNS page: https://www.indiacode.nic.in/handle/123456789/20062?view_type=browse

## Setup

```bash
npm install
npm run dev
```

`npm run dev` runs the Vite frontend on http://localhost:5173. In this mode the
serverless `/api/analyze` function is not running, so every report is produced
by the local rule engine — no key needed.

### Live AI locally (optional)

The Gemini key is **server-side only** and is never bundled into the frontend.
To exercise the serverless function locally, use the Vercel CLI:

```bash
npm i -g vercel
vercel dev            # serves the app + /api/analyze together
```

Create a `.env` (copy `.env.example`) with:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

## Deploy to Vercel

This repo is Vercel-ready (`vercel.json` + the `api/` function).

1. Push the repo to GitHub.
2. In Vercel, **New Project → Import** the repo. The build settings are picked
   up from `vercel.json` (`npm run build`, output `dist`, framework `vite`).
3. Under **Settings → Environment Variables**, add `GEMINI_API_KEY` (and
   optionally `GEMINI_MODEL`). These are only read by the serverless function.
4. Deploy. Client routes are rewritten to `index.html`, and `/api/analyze`
   runs as a serverless function.

If you skip the environment variable, the site still works fully on the local
rule engine — the AI proxy simply returns "no content" and the app falls back.

Any static host (Netlify, GitHub Pages, Cloudflare Pages) can serve the `dist/`
build too, but without a serverless function the live-AI path is disabled and
only the local engine runs.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run prepare:law-data
```

`npm run prepare:law-data` regenerates `src/data/lawsAndActs.ts` from:

```text
data/raw/laws-and-acts-of-india/indian_laws_and_acts_v2.csv
```

## Project Structure

```text
api/                Vercel serverless functions
  analyze.ts        Server-side Gemini proxy (keeps the API key secret)
scripts/            Dataset preparation scripts
src/
  components/       React UI components (incl. ErrorBoundary)
  data/             Local educational legal reference data
    currentLawMapping.ts   IPC/CrPC -> BNS/BNSS/BSA equivalents
  lib/              Case classification, report building, dataset search
  types/            Shared TypeScript types
  App.tsx           App flow and state
  main.tsx          React entry point
vercel.json         Hosting config (SPA rewrites, asset caching)
```

## Disclaimer

This project is for education and prototype triage only. It is not legal advice.
