import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Filter, Landmark, Search, Sparkles } from 'lucide-react';
import { officialCurrentLawAnchors } from '../data/currentLegalAnchors';
import {
  CURRENT_LAW_MAPPING_LAST_VERIFIED_ON,
  currentLawEquivalents,
  getOfficialCitationForLegacyLabel,
} from '../data/currentLawMapping';
import {
  getLawDatasetPlaces,
  getLawDatasetSources,
  getLawDatasetStats,
  searchLawDataset,
  type LawDatasetMatch,
} from '../lib/lawDataset';
import { LawTransitionCard } from './law/LawTransitionCard';

interface LawLibraryProps {
  onStartCase: () => void;
}

const quickSearches = [
  'criminal law penal code',
  'information technology cyber digital',
  'consumer protection complaint',
  'domestic violence women protection',
  'property rent tenancy land',
  'labour employment wages',
  'motor vehicles accident compensation',
  'tax goods services gst',
];

const comparisonSamples = ['IPC 302', 'IPC 420', 'CrPC 154'] as const;

const officialLawStatus = officialCurrentLawAnchors.map((anchor) => {
  const actNumberById: Record<string, string> = {
    'official-bns-2023': 'Act 45 of 2023',
    'official-bnss-2023': 'Act 46 of 2023',
    'official-bsa-2023': 'Act 47 of 2023',
  };

  return {
    ...anchor,
    actNumber: actNumberById[anchor.id] ?? 'Central Act',
  };
});

function defaultRecords(): LawDatasetMatch[] {
  const seen = new Set<string>();
  return quickSearches
    .flatMap((query) => searchLawDataset(query, 4))
    .filter((record) => {
      if (seen.has(record.id)) return false;
      seen.add(record.id);
      return true;
    })
    .slice(0, 18);
}

export const LawLibrary: React.FC<LawLibraryProps> = ({ onStartCase }) => {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('All sources');
  const [place, setPlace] = useState('All places');
  const stats = useMemo(() => getLawDatasetStats(), []);
  const sources = useMemo(() => getLawDatasetSources(), []);
  const places = useMemo(() => getLawDatasetPlaces(), []);

  const results = useMemo(() => {
    const base = query.trim() ? searchLawDataset(query, 80) : defaultRecords();
    return base
      .filter((record) => source === 'All sources' || record.source === source)
      .filter((record) => place === 'All places' || record.place === place)
      .slice(0, 24);
  }, [place, query, source]);

  const totalSourceCount = stats.totalRecords;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <button
        type="button"
        onClick={onStartCase}
        className="mb-6 inline-flex h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to case intake
      </button>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
            <BookOpen className="h-4 w-4" />
            Dataset powered
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-stone-950 md:text-5xl">
            Indian Laws and Acts Library
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600">
            Search thousands of law and act records from the local index. Case reports use the strongest retrieved
            matches as grounding context for server-side Gemini when configured and for the local fallback engine.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-2xl font-bold text-stone-950">{stats.totalRecords.toLocaleString()}</p>
              <p className="mt-1 text-sm text-stone-600">cleaned records</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-2xl font-bold text-stone-950">{stats.places.toLocaleString()}</p>
              <p className="mt-1 text-sm text-stone-600">places covered</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <p className="text-2xl font-bold text-stone-950">{stats.unionRecords.toLocaleString()}</p>
              <p className="mt-1 text-sm text-stone-600">Union records</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-teal-200 bg-teal-50 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-teal-700 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-stone-950">How it improves reports</h2>
          <p className="mt-3 text-sm leading-6 text-teal-950">
            When a user submits facts, Justice GPT builds a privacy-conscious retrieval query, searches the local
            embedding index, and shows the retrieved references and confidence signals inside the report.
          </p>
          <div className="mt-5 rounded-md bg-white/75 p-4 text-sm leading-6 text-stone-700">
            Dataset records are metadata references, not final legal authority. Users still need to verify current law,
            amendments, and jurisdiction.
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Official current-law sources</p>
            <h2 className="mt-1 text-2xl font-bold text-stone-950">BNS, BNSS, and BSA status</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-emerald-950">
            Mapping table checked on {CURRENT_LAW_MAPPING_LAST_VERIFIED_ON}. Users should still verify incident-date
            applicability, amendments, and jurisdiction before relying on any provision.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {officialLawStatus.map((sourceRecord) => (
            <article key={sourceRecord.id} className="rounded-lg border border-emerald-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{sourceRecord.actNumber}</p>
              <h3 className="mt-2 text-base font-bold leading-6 text-stone-950">{sourceRecord.title}</h3>
              <dl className="mt-3 grid gap-2 text-sm text-stone-700">
                <div>
                  <dt className="font-semibold text-stone-900">Published</dt>
                  <dd>{sourceRecord.publishedDate}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-stone-900">Enforced</dt>
                  <dd>{sourceRecord.commencementDate}</dd>
                </div>
              </dl>
              <a
                href={sourceRecord.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Open India Code
                <ExternalLink className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 border border-ink/15 bg-paper p-5 shadow-insetPaper">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-stamp-red">
              Compare IPC vs BNS
            </p>
            <h2 className="mt-1 font-ledger text-2xl font-black text-ink">Living statute reference cards</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink-faded">
            Tap any card to flip between the legacy label and the current provision.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {comparisonSamples.map((legacyLabel) => {
            const equivalent = currentLawEquivalents[legacyLabel];
            return (
              <LawTransitionCard
                key={legacyLabel}
                oldLaw={{
                  section: legacyLabel,
                  actName: legacyLabel.startsWith('CrPC') ? 'Code of Criminal Procedure, 1973' : 'Indian Penal Code, 1860',
                  text: 'Legacy reference shown for comparison with current criminal law.',
                }}
                newLaw={{
                  section: equivalent.current,
                  actName: equivalent.current.startsWith('BNSS')
                    ? 'Bharatiya Nagarik Suraksha Sanhita, 2023'
                    : 'Bharatiya Nyaya Sanhita, 2023',
                  text: equivalent.subject,
                  url: getOfficialCitationForLegacyLabel(legacyLabel) ?? undefined,
                }}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-800">
              <Search className="h-4 w-4 text-teal-700" />
              Search laws, acts, rules, topics, or states
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-base text-stone-950 shadow-sm transition placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Try cyber fraud, consumer protection, domestic violence, tenancy..."
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-800">
              <Filter className="h-4 w-4 text-teal-700" />
              Source
            </span>
            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-base text-stone-950 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option>All sources</option>
              {sources.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-800">
              <Landmark className="h-4 w-4 text-teal-700" />
              Place
            </span>
            <select
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              className="w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-base text-stone-950 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option>All places</option>
              {places.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickSearches.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {item.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Results</p>
            <h2 className="text-2xl font-bold text-stone-950">
              {results.length} shown from {totalSourceCount.toLocaleString()} dataset records
            </h2>
          </div>
          <p className="text-sm text-stone-500">Best matches are ranked by title/topic relevance.</p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
            No records matched those filters. Try broader keywords.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((record) => (
              <article key={record.id} className="flex min-h-64 flex-col rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{record.place}</p>
                  <h3 className="mt-2 text-lg font-bold leading-6 text-stone-950">{record.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{record.source}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="font-semibold text-stone-800">Published</dt>
                      <dd className="mt-1 text-stone-600">{record.publishedDate || 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-stone-800">Commenced</dt>
                      <dd className="mt-1 text-stone-600">{record.commencementDate || 'Unknown'}</dd>
                    </div>
                  </dl>
                </div>
                {record.url && (
                  <a
                    href={record.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    Open reference
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
