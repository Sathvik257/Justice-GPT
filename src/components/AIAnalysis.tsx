import React, { useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Clipboard,
  Check,
  Database,
  Download,
  FileText,
  Gavel,
  Lightbulb,
  Printer,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { motion } from '../lib/motion';
import type { Translation } from '../lib/i18n';
import { getCaseStrengthScores } from '../lib/caseStrength';
import { LawTransitionCard } from './law/LawTransitionCard';
import { CaseStrengthRadar } from './report/CaseStrengthRadar';
import { ProceduralSubwayMap } from './report/ProceduralSubwayMap';
import type { AnalysisMetadata, LawTransitionDetails, ProcedureStage } from '../types';

interface AIAnalysisProps {
  analysis: string | null;
  metadata?: AnalysisMetadata | null;
  isLoading: boolean;
  t: Translation;
}

interface Section {
  title: string;
  content: string;
}

interface LawTransitionItem {
  oldLaw: LawTransitionDetails;
  newLaw: LawTransitionDetails;
}

const sectionIcons: Record<string, React.ElementType> = {
  'Trust & Retrieval Signals': ShieldCheck,
  'Official Section Citations': BookOpen,
  'Case Classification': Scale,
  'Indicative Laws and Sections': Gavel,
  'Relevant IPC Sections': Gavel,
  'Current Law Mapping (BNS / BNSS / BSA)': RefreshCw,
  'Dataset Matches': BookOpen,
  'Detailed Legal Analysis': FileText,
  'Procedural Aspects': ShieldAlert,
  'Legal Precedents': BookOpen,
  'Professional Action Plan': Clipboard,
  'Constitutional Implications': Scale,
  "Teacher's Note": Lightbulb,
};

function renderInlineText(text: string) {
  const parts: React.ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }

    parts.push(
      <a
        key={`${match[1]}-${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-teal-800 underline decoration-teal-300 underline-offset-4 transition hover:text-teal-950"
      >
        {match[1]}
      </a>,
    );
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts.length > 0 ? parts : text;
}

function stripMarkdownForPdf(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/^###\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '');
}

function wrapPdfLine(line: string, maxChars: number) {
  const words = line.split(/\s+/).filter(Boolean);
  const wrapped: string[] = [];
  let current = '';

  words.forEach((word) => {
    if (word.length > maxChars) {
      if (current) {
        wrapped.push(current);
        current = '';
      }
      for (let index = 0; index < word.length; index += maxChars) {
        wrapped.push(word.slice(index, index + maxChars));
      }
      return;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      wrapped.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) wrapped.push(current);
  return wrapped.length > 0 ? wrapped : [''];
}

function escapePdfText(value: string) {
  return Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126) ? char : '?';
    })
    .join('')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildReportPdf(markdown: string) {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 48;
  const top = pageHeight - margin;
  const lineHeight = 13;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
  const maxChars = 88;
  const sourceLines = [
    'Justice GPT Legal Education Report',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    ...stripMarkdownForPdf(markdown).split('\n'),
  ];
  const lines = sourceLines.flatMap((line) => wrapPdfLine(line.trim(), maxChars));
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage));
  }

  if (pages.length === 0) pages.push(['No report content.']);

  const objects: Record<number, string> = {
    1: '<< /Type /Catalog /Pages 2 0 R >>',
    3: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  };

  const pageObjectIds: number[] = [];
  pages.forEach((page, index) => {
    const pageObjectId = 4 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const content = [
      'BT',
      '/F1 10 Tf',
      `${margin} ${top} Td`,
      `${lineHeight} TL`,
      ...page.map((line) => `(${escapePdfText(line)}) Tj\nT*`),
      'ET',
    ].join('\n');

    pageObjectIds.push(pageObjectId);
    objects[pageObjectId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });

  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;

  const maxObjectId = Math.max(...Object.keys(objects).map(Number));
  const offsets = [0];
  let pdf = '%PDF-1.4\n';

  for (let id = 1; id <= maxObjectId; id += 1) {
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${maxObjectId + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let id = 1; id <= maxObjectId; id += 1) {
    pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

function getCoverageBadgeClass(level: AnalysisMetadata['coverageLevel']) {
  if (level === 'strong') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (level === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-800';
  return 'border-red-200 bg-red-50 text-red-800';
}

function getRetrievalLabel(metadata: AnalysisMetadata) {
  if (metadata.retrievalStrategy === 'keyword-fallback') return 'Keyword fallback';
  if (metadata.retrievalStrategy === 'local-embedding-rag') return 'Embedding RAG';
  return metadata.source === 'gemini' ? 'Gemini + RAG' : 'Local fallback';
}

function parseSections(analysis: string): Section[] {
  return analysis
    .split(/^###\s+/m)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [titleLine = 'Analysis', ...contentLines] = chunk.split('\n');
      return {
        title: titleLine.trim(),
        content: contentLines.join('\n').trim(),
      };
    });
}

function getSectionId(title: string) {
  return `report-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
}

function getShortSectionTitle(title: string) {
  if (title.includes('Classification')) return 'Classification';
  if (title.includes('Laws') || title.includes('Citations')) return 'Laws';
  if (title.includes('Procedure')) return 'Procedure';
  if (title.includes('Precedents')) return 'Precedents';
  if (title.includes('Action')) return 'Actions';
  if (title.includes('Constitutional')) return 'Rights';
  return title.replace(/\s*\(.+\)/, '').slice(0, 16);
}

function getActName(section: string) {
  if (section.startsWith('BNS')) return 'Bharatiya Nyaya Sanhita, 2023';
  if (section.startsWith('BNSS')) return 'Bharatiya Nagarik Suraksha Sanhita, 2023';
  if (section.startsWith('BSA')) return 'Bharatiya Sakshya Adhiniyam, 2023';
  if (section.startsWith('IPC')) return 'Indian Penal Code, 1860';
  if (section.startsWith('CrPC')) return 'Code of Criminal Procedure, 1973';
  return 'Legal reference';
}

function cleanTransitionSubject(subject: string) {
  return subject
    .replace(/\.\s+Source:\s+.*$/i, '')
    .replace(/\.\s+In simple words:\s+.*$/i, '')
    .replace(/\s+Source:\s+.*$/i, '')
    .replace(/\s+In simple words:\s+.*$/i, '')
    .replace(/\.$/, '')
    .trim();
}

function parseLawTransitions(sections: Section[]): LawTransitionItem[] {
  const source =
    sections.find((section) => section.title === 'Official Section Citations')?.content ??
    sections.find((section) => section.title === 'Current Law Mapping (BNS / BNSS / BSA)')?.content ??
    '';

  return source
    .split('\n')
    .map((line): LawTransitionItem | null => {
      const markdownMatch = line.match(/-\s*(.+?)\s+maps to\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s+-\s+(.+?)\.?$/);
      if (markdownMatch) {
        return {
          oldLaw: {
            section: markdownMatch[1].trim(),
            actName: getActName(markdownMatch[1].trim()),
            text: 'Legacy label retained for comparison and historical incident-date analysis.',
          },
          newLaw: {
            section: markdownMatch[2].trim(),
            actName: getActName(markdownMatch[2].trim()),
            text: cleanTransitionSubject(markdownMatch[4]),
            url: markdownMatch[3].trim(),
          },
        };
      }

      const plainMatch = line.match(/-\s*(.+?)\s+maps to\s+([A-Z]+\s+\d+(?:\([^)]+\))?)\s+-\s+(.+?)\.?$/);
      if (!plainMatch) return null;

      return {
        oldLaw: {
          section: plainMatch[1].trim(),
          actName: getActName(plainMatch[1].trim()),
          text: 'Legacy label retained for comparison and historical incident-date analysis.',
        },
        newLaw: {
          section: plainMatch[2].trim(),
          actName: getActName(plainMatch[2].trim()),
          text: cleanTransitionSubject(plainMatch[3]),
        },
      };
    })
    .filter((item): item is LawTransitionItem => Boolean(item))
    .slice(0, 4);
}

function getProcedureStages(sections: Section[], citations: LawTransitionItem[]): { stages: ProcedureStage[]; currentStageIndex: number } {
  const procedure = sections.find((section) => section.title === 'Procedural Aspects')?.content.toLowerCase() ?? '';
  const actionPlan = sections.find((section) => section.title === 'Professional Action Plan')?.content.toLowerCase() ?? '';
  const content = `${procedure} ${actionPlan}`;
  const serious = /sessions|serious|cognizable|medical|survivor|scene evidence/.test(content);
  const digital = /digital|cyber|screenshots|urls|device|chain of custody/.test(content);
  const complaintRoute = /non-cognizable|civil|complaint|forum/.test(content) && !serious;
  const activeIndex = complaintRoute ? 1 : serious || digital ? 2 : 1;

  const stations = [
    {
      id: 'facts',
      label: 'Facts',
      description: 'Chronology, parties, place, documents, and proof are collected before selecting sections.',
      typicalDuration: 'Same day to 1 week',
    },
    {
      id: 'fir',
      label: complaintRoute ? 'Complaint' : 'FIR',
      description: complaintRoute
        ? 'Confirm whether the right path is police, Magistrate, tribunal, consumer forum, or civil court.'
        : 'For cognizable matters, the first formal station is information to police and immediate safeguards.',
      typicalDuration: 'Immediate to a few days',
      citations: citations.slice(0, 1),
    },
    {
      id: 'investigation',
      label: digital ? 'Evidence Chain' : 'Investigation',
      description: digital
        ? 'Preserve originals, metadata, devices, URLs, screenshots, and chain of custody before accounts or chats change.'
        : 'Statements, records, medical papers, scene proof, witness details, and police steps are gathered.',
      typicalDuration: 'Weeks to months',
      citations: citations.slice(1, 2),
    },
    {
      id: 'chargesheet',
      label: 'Chargesheet',
      description: 'Final sections, collected documents, and court forum are tested against the alleged ingredients.',
      typicalDuration: 'Often 60 to 90+ days',
    },
    {
      id: 'trial',
      label: 'Trial',
      description: 'Evidence, witnesses, bail, interim reliefs, and defences move through the court process.',
      typicalDuration: 'Months to years',
    },
    {
      id: 'appeal',
      label: 'Appeal',
      description: 'Review, revision, or appeal may follow after orders or judgment, depending on forum and limitation.',
      typicalDuration: 'Case-specific',
    },
  ] satisfies ProcedureStage[];

  return { stages: stations, currentStageIndex: activeIndex };
}

function LawTransitionPanel({ items }: { items: LawTransitionItem[] }) {
  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-lg border border-teal-200 bg-[#fbfffdf2] p-5 shadow-sm print:hidden"
      aria-labelledby="living-statute-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Living Statute</p>
          <h3 id="living-statute-title" className="mt-1 text-xl font-bold text-stone-950">
            Watch legacy sections resolve into current law
          </h3>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600">
          <RefreshCw className="h-3.5 w-3.5 text-teal-700" />
          IPC / CrPC to BNS / BNSS
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <LawTransitionCard
            key={`${item.oldLaw.section}-${item.newLaw.section}-${index}`}
            oldLaw={item.oldLaw}
            newLaw={item.newLaw}
            defaultRevealed={index === 0}
          />
        ))}
      </div>
    </motion.section>
  );
}

function formatContent(content: string) {
  return content
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const trimmed = line.trim();
      const isBullet = /^[-*]\s+/.test(trimmed);
      const numberedMatch = trimmed.match(/^(\d+)\.\s+/);

      if (isBullet || numberedMatch) {
        const marker = numberedMatch ? `${numberedMatch[1]}.` : '-';
        const body = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
        const [mainText, simpleText] = body.split(/\s+In simple words:\s+/);

        return (
          <p key={`${trimmed}-${index}`} className="flex gap-2 pl-4">
            <span className="shrink-0 font-semibold text-teal-700">{marker}</span>
            <span>
              {renderInlineText(mainText)}
              {simpleText && (
                <span className="mt-1 flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                  <span>
                    <span className="font-semibold">In simple words:</span> {renderInlineText(simpleText)}
                  </span>
                </span>
              )}
            </span>
          </p>
        );
      }

      if (/^[A-Za-z ]+:/.test(trimmed)) {
        const [label, ...rest] = trimmed.split(':');
        return (
          <p key={`${trimmed}-${index}`}>
            <span className="font-semibold text-stone-950">{label}:</span>
            {rest.length > 0 ? <> {renderInlineText(rest.join(':').trim())}</> : ''}
          </p>
        );
      }

      return <p key={`${trimmed}-${index}`}>{renderInlineText(trimmed)}</p>;
    });
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis, metadata, isLoading, t }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const sections = useMemo(() => (analysis ? parseSections(analysis) : []), [analysis]);
  const lawTransitions = useMemo(() => parseLawTransitions(sections), [sections]);
  const procedureData = useMemo(() => getProcedureStages(sections, lawTransitions), [lawTransitions, sections]);
  const caseStrengthScores = useMemo(
    () => (analysis ? getCaseStrengthScores(analysis, metadata) : []),
    [analysis, metadata],
  );

  const handlePrint = () => {
    if (printRef.current) window.print();
  };

  const handleCopy = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!analysis) return;
    const blob = buildReportPdf(analysis);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `justice-gpt-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.45 }}
      className="mx-auto w-full max-w-5xl rounded-lg border border-stone-200 bg-white shadow-sm print:border-none print:shadow-none"
    >
      <div className="flex flex-col gap-4 border-b border-stone-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{t.aiAnalysis}</p>
          <h2 className="mt-1 text-2xl font-bold text-stone-950">{t.reportTitle}</h2>
          {metadata && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-stone-700">
                <Database className="h-3.5 w-3.5" />
                {getRetrievalLabel(metadata)}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 ${getCoverageBadgeClass(metadata.coverageLevel)}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {metadata.coverageLevel} coverage
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-800">
                <BookOpen className="h-3.5 w-3.5" />
                {metadata.retrievalCount} retrieved records
              </span>
              {metadata.sectionConfidence && (
                <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-violet-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  laws {metadata.sectionConfidence['Indicative Laws and Sections'] ?? 'medium'} confidence
                </span>
              )}
            </div>
          )}
        </div>
        {!isLoading && analysis && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Copy analysis"
              title="Copy analysis"
            >
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copied ? t.copied : t.copy}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Download PDF report"
              title="Download PDF report"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Print analysis"
              title="Print analysis"
            >
              <Printer className="h-4 w-4" />
              {t.print}
            </button>
          </div>
        )}
      </div>

      <div ref={printRef} className="p-5 sm:p-8 print:p-0">
        {isLoading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-teal-200/60" />
              <span className="absolute inset-0 rounded-full border border-teal-200 bg-teal-50" />
              <Scale className="relative h-10 w-10 animate-pulse text-teal-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-stone-950">{t.analysingTitle}</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-600">{t.analysingBody}</p>
            </div>
            <div className="grid w-full max-w-xl gap-3">
              <div className="skeleton h-3 rounded" />
              <div className="skeleton h-3 rounded" />
              <div className="skeleton h-3 w-4/5 rounded" />
              <div className="skeleton h-3 w-3/5 rounded" />
            </div>
          </div>
        ) : sections.length > 0 ? (
          <div className="grid gap-5">
            <nav
              className="sticky top-0 z-10 -mx-5 border-y border-ink/10 bg-paper/95 px-5 py-2 backdrop-blur md:hidden print:hidden"
              aria-label="Report sections"
            >
              <div className="flex gap-2 overflow-x-auto">
                {sections
                  .filter((section) =>
                    /Classification|Laws|Citations|Procedure|Precedents|Action|Constitutional/.test(section.title),
                  )
                  .map((section) => (
                    <button
                      key={section.title}
                      type="button"
                      onClick={() => document.getElementById(getSectionId(section.title))?.scrollIntoView({ block: 'start' })}
                      className="min-h-11 shrink-0 border border-ink/15 bg-paper-dark px-3 font-mono text-xs font-black uppercase tracking-wide text-ink-faded"
                    >
                      {getShortSectionTitle(section.title)}
                    </button>
                  ))}
              </div>
            </nav>

            <div className="grid gap-5">
              <LawTransitionPanel items={lawTransitions} />
              <ProceduralSubwayMap
                stages={procedureData.stages}
                currentStageIndex={procedureData.currentStageIndex}
              />
              <CaseStrengthRadar scores={caseStrengthScores} />
            </div>

            {sections.map((section, index) => {
              const Icon = sectionIcons[section.title] ?? FileText;
              const isTeacherNote = section.title.toLowerCase().includes('teacher');

              return (
                <motion.article
                  key={section.title}
                  id={getSectionId(section.title)}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5) }}
                  className={`group rounded-xl border p-5 transition-shadow hover:shadow-md ${
                    isTeacherNote
                      ? 'border-amber-200 bg-amber-50 text-amber-950'
                      : 'border-stone-200 bg-stone-50 text-stone-800'
                  } print:border-stone-200 print:bg-white print:shadow-none`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 print:shadow-none">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-bold text-stone-950">{section.title}</h3>
                  </div>
                  <div className="space-y-2 text-sm leading-6 sm:text-base">
                    {formatContent(section.content)}
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-stone-500">
            {t.noAnalysis}
          </div>
        )}
      </div>
    </motion.section>
  );
};
