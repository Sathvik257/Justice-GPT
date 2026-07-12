import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from './lib/motion';
import { BookOpen, Check, ChevronLeft, ClipboardList, History, Landmark, RotateCcw, X } from 'lucide-react';
import { Disclaimer } from './components/Disclaimer';
import { AIAnalysis } from './components/AIAnalysis';
import { analyzeCaseWithAI } from './lib/gemini';
import type {
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

type ActiveView = 'case' | 'library';

const LANGUAGE_KEY = 'justice-gpt-language';

function loadLanguage(): Language | null {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored === 'en' || stored === 'hi' || stored === 'te' ? stored : null;
}

function getRecordId() {
  if ('crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadHistory() {
  try {
    const stored = localStorage.getItem('justice-gpt-history');
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as AnalysisRecord[]) : [];
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

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [language, setLanguage] = useState<Language | null>(loadLanguage);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [caseInfo, setCaseInfo] = useState<CaseSubmission | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [caseHistory, setCaseHistory] = useState<AnalysisRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('case');

  useEffect(() => {
    setCaseHistory(loadHistory());
  }, []);

  useEffect(() => {
    localStorage.setItem('justice-gpt-history', JSON.stringify(caseHistory));
  }, [caseHistory]);

  const selectLanguage = (next: Language) => {
    setLanguage(next);
    localStorage.setItem(LANGUAGE_KEY, next);
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

  const resetCaseOnly = () => {
    setCaseInfo(null);
    setAnalysis(null);
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
      setAnalysis(aiAnalysis);
      setCaseHistory((previous) =>
        [
          {
            id: getRecordId(),
            createdAt: new Date().toISOString(),
            role,
            caseInfo: info,
            analysis: aiAnalysis,
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
    setShowAnalysis(true);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen text-stone-950">
      {!showWelcome && (
        <header className="glass-header sticky top-0 z-40 border-b border-stone-200/70">
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
            <LanguageSelection
              key="language"
              onSelect={selectLanguage}
              onBack={() => setShowWelcome(true)}
              t={t}
            />
          )}

          {!showWelcome && language && !personalDetails && (
            <motion.main
              key="details"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-7xl items-center justify-center px-4 py-10"
            >
              <PersonalDetailsForm onSubmit={setPersonalDetails} onBack={() => setLanguage(null)} t={t} />
            </motion.main>
          )}

          {!showWelcome && language && personalDetails && !userRole && (
            <RoleSelection
              key="role"
              onSelect={setUserRole}
              onBack={() => setPersonalDetails(null)}
              t={t}
            />
          )}

          {!showWelcome && language && personalDetails && userRole && (
            <motion.main
              key="case"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto w-full max-w-7xl px-4 py-8"
            >
              <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserRole(null);
                      resetCaseOnly();
                    }}
                    className="mb-4 inline-flex h-10 items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t.backToRole}
                  </button>
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{t.caseInfo}</p>
                  <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-stone-950 md:text-4xl">
                    {t.caseHeading}
                  </h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-stone-600">{t.caseIntro}</p>
                </div>
                <div className="rounded-xl border border-teal-200 bg-teal-50/80 px-4 py-3 text-sm font-medium text-teal-900 backdrop-blur">
                  {t.roleLabel}: {userRole === 'lawyer' ? t.roleLawyer : t.roleCommon}
                </div>
              </div>

              <Disclaimer t={t} />

              <section className="mt-6">
                {userRole === 'lawyer' ? (
                  <LawyerCaseForm onSubmit={(info: LawyerCaseInfo) => runAnalysis(info, 'lawyer')} t={t} />
                ) : (
                  <CommonPersonCaseForm onSubmit={(info: CommonPersonCaseInfo) => runAnalysis(info, 'common')} t={t} />
                )}
              </section>
            </motion.main>
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
              <AIAnalysis analysis={analysis} isLoading={isAnalyzing} t={t} />
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
        <footer className="border-t border-stone-200/70 bg-white/60 px-4 py-5 text-center text-sm text-stone-500 backdrop-blur">
          © {new Date().getFullYear()} {t.appName}. {t.copyright}
        </footer>
      )}
    </div>
  );
}

export default App;
