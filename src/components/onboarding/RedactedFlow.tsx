/**
 * RedactedFlow provides the classified-case-file onboarding shell. It keeps
 * the active form step and report preview together: mobile users switch between
 * Form and Preview tabs, while desktop users get a 40/60 split view.
 */
import { useMemo, useState } from 'react';
import { Eye, FileLock2, PenLine } from 'lucide-react';
import type { CaseSubmission, Language, PersonalDetails, UserRole } from '../../types';
import { RedactionBar } from './RedactionBar';

interface RedactedFlowProps {
  stepTitle: string;
  stepHint: string;
  completedSteps: number;
  language: Language | null;
  personalDetails: PersonalDetails | null;
  userRole: UserRole | null;
  caseInfo: CaseSubmission | null;
  isProcessing?: boolean;
  children: React.ReactNode;
}

type MobilePane = 'form' | 'preview';

function getLanguageLabel(language: Language | null) {
  if (language === 'hi') return 'Hindi selected for intake';
  if (language === 'te') return 'Telugu selected for intake';
  if (language === 'en') return 'English selected for intake';
  return 'Awaiting language selection';
}

function getRoleLabel(role: UserRole | null) {
  if (role === 'lawyer') return 'Professional posture: Lawyer / legal preparer';
  if (role === 'common') return 'Guidance posture: General user';
  return 'Role pending';
}

function getCasePreview(caseInfo: CaseSubmission | null) {
  if (!caseInfo) return 'Facts, date, location, and evidence are still under seal.';
  return `${caseInfo.incidentType || 'Incident'} in ${caseInfo.location || 'unconfirmed location'} on ${
    caseInfo.date || 'unconfirmed date'
  }`;
}

export const RedactedFlow: React.FC<RedactedFlowProps> = ({
  stepTitle,
  stepHint,
  completedSteps,
  language,
  personalDetails,
  userRole,
  caseInfo,
  isProcessing = false,
  children,
}) => {
  const [mobilePane, setMobilePane] = useState<MobilePane>('form');

  const bars = useMemo(
    () => [
      {
        label: 'Case file language',
        revealedAt: 1,
        preview: getLanguageLabel(language),
      },
      {
        label: 'Identity sheet',
        revealedAt: 2,
        preview: personalDetails
          ? `Prepared for ${personalDetails.name}, age ${personalDetails.age}. Contact verified locally.`
          : 'User identity and contact details are still redacted.',
      },
      {
        label: 'Case classification',
        revealedAt: 3,
        preview: getRoleLabel(userRole),
      },
      {
        label: 'Indicative laws',
        revealedAt: 4,
        preview: getCasePreview(caseInfo),
      },
      {
        label: 'Procedure map',
        revealedAt: 4,
        preview: isProcessing ? 'Matching facts to FIR, investigation, trial, and appeal pathways...' : getCasePreview(caseInfo),
      },
      {
        label: 'Action steps',
        revealedAt: 4,
        preview: isProcessing
          ? 'Evidence preservation, current-law citations, and next steps are being compiled.'
          : 'Final action plan unlocks after case facts are submitted.',
      },
    ],
    [caseInfo, isProcessing, language, personalDetails, userRole],
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-5 md:pb-10 lg:pt-8">
      <section className="mb-4 border border-ink/10 bg-paper-dark/70 p-3 shadow-insetPaper md:hidden">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Case intake view">
          {[
            { id: 'form' as const, label: 'Form', Icon: PenLine },
            { id: 'preview' as const, label: 'Preview', Icon: Eye },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobilePane(id)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 border px-3 text-sm font-black uppercase tracking-wide transition ${
                mobilePane === id
                  ? 'border-ink bg-ink text-paper'
                  : 'border-ink/15 bg-paper text-ink-faded'
              }`}
              aria-selected={mobilePane === id}
              role="tab"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-start">
        <div className={mobilePane === 'form' ? 'block' : 'hidden md:block'}>
          <div className="mb-4 border-l-4 border-stamp-red bg-paper-dark/70 px-4 py-3 shadow-insetPaper">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-stamp-red">Classified intake</p>
            <h1 className="mt-1 font-ledger text-2xl font-black text-ink md:text-3xl">{stepTitle}</h1>
            <p className="mt-2 text-sm leading-6 text-ink-faded">{stepHint}</p>
          </div>
          {children}
        </div>

        <aside className={mobilePane === 'preview' ? 'block' : 'hidden md:block'} aria-label="Redacted report preview">
          <div className="sticky top-24 border border-ink/15 bg-paper p-4 shadow-ledger">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-stamp-red">
                  Report skeleton
                </p>
                <h2 className="mt-1 font-ledger text-2xl font-black text-ink">Classified case file</h2>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-ink/20 bg-paper-dark text-ink">
                <FileLock2 className="h-5 w-5" />
              </span>
            </div>

            <div className={`grid gap-3 ${isProcessing ? 'redaction-processing' : ''}`}>
              {bars.map((bar, index) => (
                <RedactionBar
                  key={bar.label}
                  label={bar.label}
                  isRevealed={completedSteps >= bar.revealedAt}
                  previewContent={bar.preview}
                  revealDelayMs={index * 110}
                />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};
