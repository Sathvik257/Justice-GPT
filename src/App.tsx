import React, { useState, useEffect } from 'react';
import { Scale, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseForm } from './components/CaseForm';
import { Disclaimer } from './components/Disclaimer';
import { RelatedArticles } from './components/RelatedArticles';
import { AIAnalysis } from './components/AIAnalysis';
import { analyzeCaseWithAI } from './lib/gemini';
import type { CaseInfo } from './types';

const translations = {
  en: {
    appName: 'Justice GPT',
    subtitle: 'Your AI-powered Legal Education Portal',
    enter: 'Enter',
    selectLanguage: 'Which language do you prefer?',
    english: 'English',
    hindi: 'हिंदी',
    telugu: 'తెలుగు',
    caseInfo: 'Case Information',
    analyzeCase: 'Analyze Case',
    aiAnalysis: 'AI Analysis',
    caseSummary: 'Case Summary',
    type: 'Type',
    description: 'Description',
    date: 'Date',
    location: 'Location',
    noAnalysis: 'No analysis yet.',
    analyzing: 'Analyzing case with AI...',
    copyright: 'For educational purposes only.',
    personalDetails: 'Personal Details',
    name: 'Name',
    contact: 'Contact',
    age: 'Age',
    continue: 'Continue'
  }, hi: {
    appName: 'जस्टिस GPT',
    subtitle: 'आपका एआई-संचालित कानूनी शिक्षा पोर्टल',
    enter: 'प्रवेश करें',
    selectLanguage: 'आप किस भाषा को पसंद करते हैं?',
    english: 'English',
    hindi: 'हिंदी',
    telugu: 'తెలుగు',
    caseInfo: 'मामले की जानकारी',
    analyzeCase: 'मामले का विश्लेषण करें',
    aiAnalysis: 'एआई विश्लेषण',
    caseSummary: 'मामले का सारांश',
    type: 'प्रकार',
    description: 'विवरण',
    date: 'तारीख',
    location: 'स्थान',
    noAnalysis: 'अभी तक कोई विश्लेषण नहीं।',
    analyzing: 'एआई के साथ मामले का विश्लेषण किया जा रहा है...',
    copyright: 'केवल शैक्षिक उद्देश्यों के लिए।',
    personalDetails: 'व्यक्तिगत विवरण',
    name: 'नाम',
    contact: 'संपर्क',
    age: 'आयु',
    continue: 'जारी रखें'
  },
  te: {
    appName: 'జస్టిస్ GPT',
    subtitle: 'మీ AI ఆధారిత న్యాయ విద్యా పోర్టల్',
    enter: 'ప్రవేశించండి',
    selectLanguage: 'మీరు ఏ భాషను ఇష్టపడుతున్నారు?',
    english: 'ఇంగ్లీష్',
    hindi: 'హిందీ',
    telugu: 'తెలుగు',
    caseInfo: 'కేసు సమాచారం',
    analyzeCase: 'కేసును విశ్లేషించండి',
    aiAnalysis: 'AI విశ్లేషణ',
    caseSummary: 'కేసు సారాంశం',
    type: 'రకం',
    description: 'వివరణ',
    date: 'తేదీ',
    location: 'స్థానం',
    noAnalysis: 'ఇంకా విశ్లేషణ లేదు.',
    analyzing: 'AI తో కేసును విశ్లేషిస్తున్నారు...',
    copyright: 'విద్యా ప్రయోజనాల కోసం మాత్రమే.',
    personalDetails: 'వ్యక్తిగత వివరాలు',
    name: 'పేరు',
    contact: 'సంప్రదింపు',
    age: 'వయస్సు',
    continue: 'కొనసాగించండి'
  }
};

// Dramatic animation variants
const slideUp = {
  hidden: { opacity: 0, y: 100 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, type: 'spring' } },
};
const scaleFade = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, type: 'spring' } },
};
const staggerContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18,
    },
  },
};
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

// Personal Details Form Component
function PersonalDetailsForm({ onSubmit, t }: { onSubmit: (details: any) => void, t: Record<string, string> }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  function validateEmail(email: string) {
    // Simple email regex
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError("Please include an '@' in the email address. Email is missing an '@'.");
      return;
    }
    onSubmit({ name, age, email, contact });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white/90 p-8 rounded-2xl shadow-xl flex flex-col gap-6 mx-auto"
    >
      <h2 className="text-2xl font-bold text-indigo-700 mb-2 text-center">{t.personalDetails}</h2>
      <div>
        <label className="block text-sm font-medium text-indigo-700 mb-1">{t.name}</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
          placeholder={t.name}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-indigo-700 mb-1">Email</label>
        <input
          // type="email" // Remove browser validation
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
          placeholder="Email"
        />
        {error && (
          <div className="text-red-600 text-sm mt-1">{error}</div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-indigo-700 mb-1">Contact</label>
        <input
          type="text"
          value={contact}
          onChange={e => setContact(e.target.value)}
          required
          className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
          placeholder="Contact"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-indigo-700 mb-1">{t.age}</label>
        <input
          type="number"
          value={age}
          onChange={e => setAge(e.target.value)}
          required
          min="1"
          className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm"
          placeholder={t.age}
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-indigo-700 text-white font-bold rounded-lg shadow-lg text-lg transition-all duration-300 hover:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
      >
        {t.continue}
      </button>
    </form>
  );
}

// Placeholder for sending email notification to owner
function sendOwnerNotification(details: any, caseInfo: CaseInfo | null) {
  // TODO: Implement backend or email service integration
  // Example: fetch('/api/send-notification', { method: 'POST', body: JSON.stringify({ ...details, ...caseInfo }) })
  console.log('Owner notification (would be sent for):', { ...details, ...caseInfo });
}

// Progress stepper component
const steps = [
  'Welcome',
  'Personal Details',
  'Case Info',
  'Analysis',
];

function ProgressStepper({ currentStep }: { currentStep: number }) {
  return (
    <nav
      aria-label="Progress"
      className="flex items-center justify-center gap-4 md:gap-8 w-full"
    >
      <ol className="flex items-center justify-center gap-4 md:gap-8 w-full" role="list">
        {steps.map((step, idx) => (
          <li key={step} className="flex items-center gap-2 relative">
            <motion.button
              layout
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: currentStep === idx ? 1.22 : 1, opacity: 1, boxShadow: currentStep === idx ? '0 0 24px 8px rgba(236,72,153,0.25)' : 'none' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className={`rounded-full w-12 h-12 flex items-center justify-center font-extrabold text-xl border-2 focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300
                ${currentStep === idx ? 'bg-pink-600 text-white border-pink-600 shadow-2xl' :
                  currentStep > idx ? 'bg-green-500 text-white border-green-500' :
                  'bg-white/80 text-indigo-700 border-indigo-200 hover:bg-indigo-100/80'}
              `}
              aria-current={currentStep === idx ? 'step' : undefined}
              aria-label={`Step ${idx + 1}: ${step}`}
              tabIndex={0}
              style={currentStep === idx ? { filter: 'drop-shadow(0 0 12px #ec4899cc)' } : {}}
            >
              {idx + 1}
            </motion.button>
            <motion.span
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.08 * idx }}
              className={`text-lg md:text-xl font-bold select-none transition-colors duration-300
                ${currentStep === idx ? 'text-pink-700' : 'text-indigo-700/80'}`}
            >
              {step.replace('Personal Details', 'Details').replace('Case Info', 'Info')}
            </motion.span>
            {idx < steps.length - 1 && (
              <motion.div
                layout
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.05 * idx }}
                className="w-10 h-1 bg-gradient-to-r from-indigo-200/60 via-pink-200/60 to-green-200/60 rounded-full mx-1 md:mx-2 transition-all duration-300 origin-left" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [language, setLanguage] = useState<'en' | 'hi' | 'te' | null>(null);
  const [personalDetails, setPersonalDetails] = useState<any | null>(null);
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [caseHistory, setCaseHistory] = useState<{ caseInfo: CaseInfo; analysis: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Add personal details form state here
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('caseHistory');
    if (stored) setCaseHistory(JSON.parse(stored));
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('caseHistory', JSON.stringify(caseHistory));
  }, [caseHistory]);

  // Default to English for welcome page
  const t = language ? translations[language] : translations.en;

  // Determine current step for progress stepper
  let currentStep = 0;
  if (!showWelcome && !personalDetails) currentStep = 1;
  if (!showWelcome && personalDetails && !caseInfo) currentStep = 2;
  if (!showWelcome && personalDetails && caseInfo) currentStep = 3;

  const handlePersonalDetailsSubmit = (details: any) => {
    setPersonalDetails(details);
    // Optionally notify owner here if you want
  };

  const handleSubmit = async (info: CaseInfo) => {
    setCaseInfo(info);
    setIsAnalyzing(true);
    setShowAnalysis(false);
    setShowSuccess(false);
    try {
      const aiAnalysis = await analyzeCaseWithAI(info);
      setAnalysis(aiAnalysis);
      setIsAnalyzing(false);
      setShowSuccess(true);
      // Save to history
      setCaseHistory(prev => [{ caseInfo: info, analysis: aiAnalysis }, ...prev].slice(0, 20));
      if (personalDetails) {
        sendOwnerNotification(personalDetails, info);
      }
      // Show success animation for 2 seconds, then show analysis
      setTimeout(() => {
        setShowSuccess(false);
        setShowAnalysis(true);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setAnalysis('Failed to analyze case. Please try again.');
      setShowAnalysis(true);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col">
      {/* Sticky Header with Stepper and Actions */}
      {!showWelcome && currentStep !== 2 && (
        <header className="sticky top-0 z-50 w-full flex items-center justify-between px-0 py-0 bg-white/70 backdrop-blur-2xl bg-gradient-to-r from-white/80 via-purple-100/60 to-pink-100/60 shadow-2xl rounded-b-2xl" style={{marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0}}>
          <div className="flex items-center h-20 pl-6">
            {language && personalDetails && (
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 bg-white/90 text-indigo-700 font-bold px-5 py-2 rounded-xl shadow-md hover:bg-pink-200 hover:text-indigo-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300 transition-all duration-200 text-lg"
                aria-label="Open case history"
                style={{boxShadow: '0 2px 12px 0 rgba(80,0,120,0.10)'}}
              >
                <span className="text-xl">🕑</span> <span>Case History</span>
              </button>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <ProgressStepper currentStep={currentStep} />
        </div>
          <div className="w-32" />
      </header>
      )}
      {/* Case History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-label="Case History Modal">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setShowHistory(false)}
              className="absolute top-4 right-4 text-xl font-bold text-pink-700 hover:text-pink-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
              aria-label="Close case history"
              tabIndex={0}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Case History</h2>
            {caseHistory.length === 0 ? (
              <div className="text-gray-500">No previous cases found.</div>
            ) : (
              <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
                {caseHistory.map((entry, idx) => (
                  <li key={idx} className="bg-indigo-50 rounded-lg p-4 shadow flex flex-col gap-2">
                    <div className="text-sm text-gray-700 font-semibold">{entry.caseInfo.incidentType} — {entry.caseInfo.date} — {entry.caseInfo.location}</div>
                    <div className="text-xs text-gray-500 truncate">{entry.caseInfo.description}</div>
                    <button
                      onClick={() => {
                        setCaseInfo(entry.caseInfo);
                        setAnalysis(entry.analysis);
                        setShowAnalysis(true);
                        setShowHistory(false);
                      }}
                      className="mt-2 px-4 py-1 bg-pink-600 text-white rounded shadow hover:bg-pink-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-300"
                      aria-label={`View analysis for case ${entry.caseInfo.incidentType} on ${entry.caseInfo.date}`}
                      tabIndex={0}
                    >
                      View Analysis
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Main content below */}
      {/* Welcome Page - always first */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600"
          >
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
              className="flex flex-col items-center w-full px-4"
            >
              <Scale className="h-24 w-24 md:h-32 md:w-32 text-white drop-shadow-2xl mb-8 animate-bounce" />
              <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
                className="text-6xl md:text-8xl font-extrabold text-white drop-shadow-2xl mb-6 tracking-tight text-center max-w-5xl w-full"
              >
                {translations.en.appName}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl md:text-3xl text-pink-200 font-semibold mb-4 text-center max-w-3xl w-full"
              >
                Where everyone will receive justice and legal guidance.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-2xl md:text-3xl text-pink-100 font-medium mb-12 text-center max-w-4xl w-full"
              >
                {translations.en.subtitle}
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowWelcome(false)}
                className="px-10 py-4 bg-white text-indigo-700 font-bold rounded-full shadow-lg text-2xl transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900 focus:outline-none focus:ring-4 focus:ring-pink-300"
              >
                {translations.en.enter}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Selection Page - after welcome */}
      <AnimatePresence>
        {!showWelcome && !language && (
          <motion.div
            key="lang-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600"
          >
            <motion.h2
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
            >
              {translations.en.selectLanguage}
            </motion.h2>
            <div className="flex gap-6 mb-8">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage('en')}
                className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-lg text-xl transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900"
              >
                {translations.en.english}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage('hi')}
                className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-lg text-xl transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900"
              >
                {translations.en.hindi}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage('te')}
                className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-lg text-xl transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900"
              >
                {translations.en.telugu}
              </motion.button>
                </div>
            {/* Back button to welcome page */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowWelcome(true)}
              className="mt-2 px-6 py-2 bg-white text-indigo-700 font-semibold rounded-full shadow transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900"
            >
              ← Back
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal Details Form - after language selection */}
      <AnimatePresence>
        {!showWelcome && language && !personalDetails && (
          <div className="flex-grow flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600">
            <motion.form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                setError('');
                if (!/^([^@\s]+)@([^@\s]+)\.([^@\s]+)$/.test(email)) {
                  setError("Please include an '@' in the email address. Email is missing an '@'.");
                  return;
                }
                handlePersonalDetailsSubmit({ name, age, email, contact });
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.7, type: 'spring' }}
              className="w-full max-w-md bg-white/70 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl flex flex-col gap-6 mx-auto border border-white/40 mt-4"
              style={{ boxShadow: '0 8px 40px 0 rgba(80,0,120,0.10), 0 1.5px 16px 0 rgba(236,72,153,0.10)' }}
            >
              <h2 className="text-2xl font-extrabold text-indigo-800 mb-4 text-center tracking-tight drop-shadow-sm">
                {t.personalDetails}
              </h2>
              <div>
                <label className="block text-lg font-semibold text-indigo-700 mb-2">{t.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-5 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm text-lg bg-white/80"
                  placeholder={t.name}
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-indigo-700 mb-2">Email</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-5 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm text-lg bg-white/80"
                  placeholder="Email"
                />
                {error && (
                  <div className="text-red-600 text-sm mt-1">{error}</div>
                )}
              </div>
              <div>
                <label className="block text-lg font-semibold text-indigo-700 mb-2">{t.contact}</label>
                <input
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  required
                  className="w-full px-5 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm text-lg bg-white/80"
                  placeholder={t.contact}
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-indigo-700 mb-2">{t.age}</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  required
                  min="1"
                  className="w-full px-5 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-sm text-lg bg-white/80"
                  placeholder={t.age}
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03, backgroundColor: '#a21caf' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg text-2xl transition-all duration-300 hover:bg-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-300 mt-2"
              >
                {t.continue}
              </motion.button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Main App Content */}
      <AnimatePresence>
        {!showWelcome && language && personalDetails && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="flex-1 flex flex-col"
          >
            {/* Animated Header */}
            <motion.header 
              initial={{ y: -80, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.8, type: 'spring' }}
              className="bg-indigo-700 text-white py-8 shadow-lg z-10"
            >
              <div className="container mx-auto px-4 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
                  className="flex items-center mb-2"
                >
                  <Scale className="h-10 w-10 mr-3 text-pink-200 drop-shadow-lg" />
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg">{t.appName}</h1>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.6 }}
                  className="text-lg md:text-xl text-pink-100 font-medium"
                >
                  {t.subtitle}
                </motion.p>
              </div>
            </motion.header>

            {/* Back button to language selection */}
            <div className="container mx-auto px-4 mt-4 mb-2 flex justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setLanguage(null)}
                className="px-5 py-2 bg-white text-indigo-700 font-semibold rounded-full shadow transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900"
              >
                ← Back
              </motion.button>
            </div>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col justify-center items-center py-10 md:py-16">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-16 mb-8"
              >
                <Disclaimer />
                <div className="flex flex-col md:flex-row gap-16 mt-6 justify-center items-start w-full">
                  <motion.div
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.7 }}
                    className="flex-1 bg-white/90 p-8 rounded-2xl shadow-md border border-indigo-100 max-w-2xl mx-auto"
                  >
                    <h2 className="text-2xl font-bold mb-6 text-indigo-700">{t.caseInfo}</h2>
                    <CaseForm onSubmit={handleSubmit} t={t} />
                  </motion.div>
                  {/* Remove inline AIAnalysis and RelatedArticles, show only in overlay */}
        </div>
              </motion.div>
      </main>

            {/* Animated Footer */}
            <motion.footer
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.7 }}
              className="bg-gray-900 text-white py-5 mt-8 shadow-inner"
            >
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
                  © {new Date().getFullYear()} {t.appName}. {t.copyright}
          </p>
        </div>
            </motion.footer>

            {/* AI Analysis Full-Page Overlay */}
            <AnimatePresence>
              {showAnalysis && (
                <motion.div
                  key="ai-analysis-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-white via-indigo-100 to-pink-100 overflow-y-auto"
                  role="dialog"
                  aria-modal="true"
                  aria-label="AI Analysis Overlay"
                >
                  {/* Back button to return to main app (case form) */}
                  <div className="w-full flex items-start sticky top-0 z-10 bg-gradient-to-br from-white via-indigo-100 to-pink-100 bg-opacity-80 p-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowAnalysis(false)}
                      className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow transition-all duration-300 hover:bg-pink-200 hover:text-indigo-900 text-lg"
                    >
                      ← Back
                    </motion.button>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center w-full px-4 pb-12">
                    <div className="w-full max-w-5xl p-0 md:p-12">
                      <AIAnalysis analysis={analysis} isLoading={isAnalyzing} t={t} />
                      <RelatedArticles />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Animation Overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-pink-100 to-indigo-100"
                  aria-live="polite"
                  role="alertdialog"
                  aria-modal="true"
                  aria-label="Analysis Loading Animation"
                >
                  <div className="w-full max-w-5xl p-0 md:p-12 flex flex-col items-center justify-center">
                    <AIAnalysis analysis={null} isLoading={true} t={t} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;