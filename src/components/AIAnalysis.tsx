import React, { useMemo, useRef, useState } from 'react';
import { BookOpen, Clipboard, Check, FileText, Gavel, Lightbulb, Printer, RefreshCw, Scale, ShieldAlert } from 'lucide-react';
import { motion } from '../lib/motion';
import type { Translation } from '../lib/i18n';

interface AIAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  t: Translation;
}

interface Section {
  title: string;
  content: string;
}

const sectionIcons: Record<string, React.ElementType> = {
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
        return (
          <p key={`${trimmed}-${index}`} className="flex gap-2 pl-4">
            <span className="shrink-0 font-semibold text-teal-700">{marker}</span>
            <span>{trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '')}</span>
          </p>
        );
      }

      if (/^[A-Za-z ]+:/.test(trimmed)) {
        const [label, ...rest] = trimmed.split(':');
        return (
          <p key={`${trimmed}-${index}`}>
            <span className="font-semibold text-stone-950">{label}:</span>
            {rest.length > 0 ? ` ${rest.join(':').trim()}` : ''}
          </p>
        );
      }

      return <p key={`${trimmed}-${index}`}>{trimmed}</p>;
    });
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis, isLoading, t }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const sections = useMemo(() => (analysis ? parseSections(analysis) : []), [analysis]);

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
        </div>
        {!isLoading && analysis && (
          <div className="flex gap-2">
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
            {sections.map((section, index) => {
              const Icon = sectionIcons[section.title] ?? FileText;
              const isTeacherNote = section.title.toLowerCase().includes('teacher');

              return (
                <motion.article
                  key={section.title}
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
