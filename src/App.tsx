import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from './lib/AnimatePresence';
import { motion } from './lib/motion';
import { BookOpen, Check, ChevronLeft, ClipboardList, History, Landmark, RotateCcw, X } from 'lucide-react';
import { Disclaimer } from './components/Disclaimer';
import { AIAnalysis } from './components/AIAnalysis';
import { analyzeCaseWithAI } from './lib/gemini';
import type {
  AnalysisMetadata,
  AnalysisRecord,
  CaseSubmission,
  CommonPersonCaseInfo,
  Language,
  LawyerCaseInfo,
  PersonalDetails,
  UserRole,
} from './types';
import WelcomeScreen from './components/WelcomeScreen';
import LanguageSelection from './components/LanguageSelection';
import PersonalDetailsForm from './components/PersonalDetailsForm';
import RoleSelection from './components/RoleSelection';
import { LawyerCaseForm } from './components/LawyerCaseForm';
import { CommonPersonCaseForm } from './components/CommonPersonCaseForm';
import { LawLibrary } from './components/LawLibrary';
import { getTranslation, type Translation } from './lib/i18n';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { RedactedFlow } from './components/onboarding/RedactedFlow';

type ActiveView = 'case' | 'library';

const LANGUAGE_KEY = 'justice-gpt-language';
const HISTORY_KEY = 'justice-gpt-history';

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function loadLanguage(): Language | null {
  const stored = readStorage(LANGUAGE_KEY);
  return stored === 'en' || stored === 'hi' || stored === 'te' ? stored : null;
}

function getRecordId() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isAnalysisRecord(value: unknown): value is AnalysisRecord {
  if (!value || typeof value !== 'object') return false;

  const record = value as Partial<AnalysisRecord>;
  const caseInfo = record.caseInfo as Partial<CaseSubmission> | undefined;

  return (
    typeof record.id === 'string' &&
    typeof record.createdAt === 'string' &&
    (record.role === 'lawyer' || record.role === 'common') &&
    typeof record.analysis === 'string' &&
    Boolean(caseInfo) &&
    typeof caseInfo?.incidentType === 'string' &&
    typeof caseInfo?.description === 'string' &&
    typeof caseInfo?.location === 'string'
  );
}

function loadHistory() {
  try {
    const stored = readStorage(HISTORY_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isAnalysisRecord).slice(0, 20) : [];
  } catch {
    return [];
  }
}

function ProgressStepper({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <nav aria-label="Progress" className="w-full overflow-x-auto">
      <ol className="flex min-w-max items-center gap-2 px-2" role="list">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isComplete = currentStep > index;

          return (
            <li key={step} className="flex items-center gap-2">
              <span className="relative flex h-8 w-8 items-center justify-center">
                {isActive && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-teal-400/40" />
                )}
                <span
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'scale-110 border-teal-700 bg-teal-700 text-white shadow-md shadow-teal-600/30'
                      : isComplete
                        ? 'border-emerald-600 bg-emerald-500 text-white'
                        : 'border-stone-300 bg-white text-stone-500'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? <Check key="done" className="h-4 w-4 animate-[pop-in_0.35s_ease]" /> : index + 1}
                </span>
              </span>
              <span
                className={`text-sm font-semibold transition-colors ${
                  isActive ? 'text-stone-950' : isComplete ? 'text-emerald-700' : 'text-stone-500'
                }`}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={`h-0.5 w-6 rounded-full transition-colors duration-500 ${
                    isComplete ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function getFlowCopy(currentStep: number, t: Translation) {
  if (currentStep === 0) {
    return {
      title: t.selectLanguage,
      hint: 'Choose the intake language first. The case file preview will lift its first redaction as soon as this is set.',
    };
  }
  if (currentStep === 1) {
    return {
      title: t.detailsHeading,
      hint: 'Add the person using this report. These details remain local unless you clear saved reports.',
    };
  }
  if (currentStep === 2) {
    return {
      title: t.roleHeading,
      hint: 'Tell the app whether to frame questions for legal preparation or general guidance.',
    };
  }
  return {
    title: t.caseHeading,
    hint: 'Enter facts, date, location, evidence, and context. The final redactions lift while the report is generated.',
  };
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [language, setLanguage] = useState<Language | null>(loadLanguage);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [caseInfo, setCaseInfo] = useState<CaseSubmission | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<AnalysisMetadata | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [caseHistory, setCaseHistory] = useState<AnalysisRecord[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('case');

  useEffect(() => {
    writeStorage(HISTORY_KEY, JSON.stringify(caseHistory));
  }, [caseHistory]);

  const selectLanguage = (next: Language) => {
    setLanguage(next);
    writeStorage(LANGUAGE_KEY, next);
  };

  const t: Translation = getTranslation(language);
  const steps = [t.stepLanguage, t.stepDetails, t.stepRole, t.stepCase, t.stepReport];

  const currentStep = useMemo(() => {
    if (!language) return 0;
    if (!personalDetails) return 1;
    if (!userRole) return 2;
    if (!caseInfo || !showAnalysis) return 3;
    return 4;
  }, [caseInfo, language, personalDetails, showAnalysis, userRole]);
  const completedSteps = Number(Boolean(language)) + Number(Boolean(personalDetails)) + Number(Boolean(userRole)) + Number(Boolean(caseInfo));
  const flowCopy = getFlowCopy(currentStep, t);

  const resetCaseOnly = () => {
    setCaseInfo(null);
    setAnalysis(null);
    setAnalysisMetadata(null);
    setShowAnalysis(false);
    setError(null);
  };

  const startOver = () => {
    setShowWelcome(false);
    setActiveView('case');
    setLanguage(null);
    setPersonalDetails(null);
    setUserRole(null);
    resetCaseOnly();
  };

  const runAnalysis = async (info: CaseSubmission, role: UserRole) => {
    setCaseInfo(info);
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(true);
    setShowAnalysis(true);

    try {
      const aiAnalysis = await analyzeCaseWithAI(info);
      setAnalysis(aiAnalysis.markdown);
      setAnalysisMetadata(aiAnalysis.metadata);
      setCaseHistory((previous) =>
        [
          {
            id: getRecordId(),
            createdAt: new Date().toISOString(),
            role,
            caseInfo: info,
            analysis: aiAnalysis.markdown,
            metadata: aiAnalysis.metadata,
          },
          ...previous,
        ].slice(0, 20),
      );
    } catch {
      setError(t.analysisError);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const restoreHistory = (record: AnalysisRecord) => {
    setUserRole(record.role);
    setCaseInfo(record.caseInfo);
    setAnalysis(record.analysis);
    setAnalysisMetadata(record.metadata ?? null);
    setShowAnalysis(true);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen text-stone-950">
      {!showWelcome && (
        <header className="glass-header sticky top-0 z-40 hidden border-b border-stone-200/70 md:block">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white shadow-md">
                  <Landmark className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-bold leading-none">{t.appName}</p>
                  <p className="mt-1 text-xs text-stone-500">{t.tagline}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={startOver}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:hidden"
                aria-label={t.startOver}
                title={t.startOver}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 lg:max-w-2xl">
              {activeView === 'case' ? (
                <ProgressStepper currentStep={currentStep} steps={steps} />
              ) : (
                <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-900">
                  {t.datasetActive}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveView('case')}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  activeView === 'case'
                    ? 'bg-teal-700 text-white hover:bg-teal-800'
                    : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                }`}
                aria-label={t.caseIntake}
                title={t.caseIntake}
              >
                <ClipboardList className="h-4 w-4" />
                {t.caseIntake}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('library')}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  activeView === 'library'
                    ? 'bg-teal-700 text-white hover:bg-teal-800'
                    : 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                }`}
                aria-label={t.lawLibrary}
                title={t.lawLibrary}
              >
                <BookOpen className="h-4 w-4" />
                {t.lawLibrary}
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={caseHistory.length === 0}
                aria-label={t.history}
                title={t.history}
              >
                <History className="h-4 w-4" />
                {t.history}
              </button>
              <button
                type="button"
                onClick={startOver}
                className="hidden h-10 items-center gap-2 rounded-xl bg-stone-900 px-3 text-sm font-semibold text-white transition hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500 lg:inline-flex"
                aria-label={t.startOver}
                title={t.startOver}
              >
                <RotateCcw className="h-4 w-4" />
                {t.reset}
              </button>
            </div>
          </div>
        </header>
      )}

      {activeView === 'library' && !showWelcome ? (
        <LawLibrary onStartCase={() => setActiveView('case')} />
      ) : (
        <AnimatePresence mode="wait">
          {showWelcome && (
            <WelcomeScreen key="welcome" onEnter={() => setShowWelcome(false)} t={t} />
          )}

          {!showWelcome && !language && (
            <RedactedFlow
              key="language-flow"
              stepTitle={flowCopy.title}
              stepHint={flowCopy.hint}
              completedSteps={completedSteps}
              language={language}
              personalDetails={personalDetails}
              userRole={userRole}
              caseInfo={caseInfo}
              isProcessing={isAnalyzing}
            >
              <LanguageSelection
              key="language"
              onSelect={selectLanguage}
              onBack={() => setShowWelcome(true)}
              t={t}
              />
            </RedactedFlow>
          )}

          {!showWelcome && language && !personalDetails && (
            <RedactedFlow
              key="details-flow"
              stepTitle={flowCopy.title}
              stepHint={flowCopy.hint}
              completedSteps={completedSteps}
              language={language}
              personalDetails={personalDetails}
              userRole={userRole}
              caseInfo={caseInfo}
              isProcessing={isAnalyzing}
            >
              <PersonalDetailsForm onSubmit={setPersonalDetails} onBack={() => setLanguage(null)} t={t} />
            </RedactedFlow>
          )}

          {!showWelcome && language && personalDetails && !userRole && (
            <RedactedFlow
              key="role-flow"
              stepTitle={flowCopy.title}
              stepHint={flowCopy.hint}
              completedSteps={completedSteps}
              language={language}
              personalDetails={personalDetails}
              userRole={userRole}
              caseInfo={caseInfo}
              isProcessing={isAnalyzing}
            >
              <RoleSelection
              key="role"
              onSelect={setUserRole}
              onBack={() => setPersonalDetails(null)}
              t={t}
              />
            </RedactedFlow>
          )}

          {!showWelcome && language && personalDetails && userRole && (
            <RedactedFlow
              key="case-flow"
              stepTitle={flowCopy.title}
              stepHint={flowCopy.hint}
              completedSteps={completedSteps}
              language={language}
              personalDetails={personalDetails}
              userRole={userRole}
              caseInfo={caseInfo}
              isProcessing={isAnalyzing}
            >
              <div className="grid gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setUserRole(null);
                    resetCaseOnly();
                  }}
                  className="inline-flex min-h-11 w-fit items-center gap-2 border border-ink/15 bg-paper px-3 text-sm font-bold text-ink-faded transition hover:bg-paper-dark focus:outline-none focus:ring-2 focus:ring-seal-gold"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t.backToRole}
                </button>

                <div className="border border-seal-gold/40 bg-seal-gold/10 px-4 py-3 text-sm font-bold text-ink">
                  {t.roleLabel}: {userRole === 'lawyer' ? t.roleLawyer : t.roleCommon}
                </div>

                <Disclaimer t={t} />

                {userRole === 'lawyer' ? (
                  <LawyerCaseForm onSubmit={(info: LawyerCaseInfo) => runAnalysis(info, 'lawyer')} t={t} />
                ) : (
                  <CommonPersonCaseForm onSubmit={(info: CommonPersonCaseInfo) => runAnalysis(info, 'common')} t={t} />
                )}
              </div>
            </RedactedFlow>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {showAnalysis && (
          <motion.div
            key="analysis-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#f6f4ee]"
            role="dialog"
            aria-modal="true"
            aria-label="AI analysis report"
          >
            <div className="glass-header sticky top-0 z-10 border-b border-stone-200/70 px-4 py-3">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnalysis(false)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t.backToForm}
                </button>
                {error && <p className="text-sm font-medium text-red-700">{error}</p>}
              </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 py-8">
              <AIAnalysis analysis={analysis} metadata={analysisMetadata} isLoading={isAnalyzing} t={t} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={t.caseHistory}
          >
            <motion.div
              initial={{ scale: 0.96, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{t.savedReports}</p>
                  <h2 className="text-xl font-bold text-stone-950">{t.caseHistory}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-300 text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label={t.closeHistory}
                  title={t.closeHistory}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[66vh] overflow-y-auto p-5">
                {caseHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-500">
                    {t.noCases}
                  </div>
                ) : (
                  <ul className="grid gap-3">
                    {caseHistory.map((record) => (
                      <li key={record.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-stone-950">{record.caseInfo.incidentType}</p>
                            <p className="mt-1 text-xs text-stone-500">
                              {new Date(record.createdAt).toLocaleString()} - {record.caseInfo.location}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
                              {record.caseInfo.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => restoreHistory(record)}
                            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 px-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            {t.viewReport}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showWelcome && (
        <MobileBottomNav
          activeItem={activeView === 'library' ? 'library' : 'case'}
          hasHistory={caseHistory.length > 0}
          onHome={() => setShowWelcome(true)}
          onCase={() => {
            setActiveView('case');
            resetCaseOnly();
          }}
          onLibrary={() => setActiveView('library')}
          onHistory={() => setShowHistory(true)}
        />
      )}

      {!showWelcome && (
        <footer className="hidden border-t border-stone-200/70 bg-white/60 px-4 py-5 text-center text-sm text-stone-500 backdrop-blur md:block">
          &copy; {new Date().getFullYear()} {t.appName}. {t.copyright}
        </footer>
      )}
    </div>
  );
}

export default App;
