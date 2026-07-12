import { ChevronLeft, Languages } from 'lucide-react';
import { motion } from '../lib/motion';
import type { Language } from '../types';
import type { Translation } from '../lib/i18n';

interface LanguageSelectionProps {
  onSelect: (lang: Language) => void;
  onBack: () => void;
  t: Translation;
}

const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onSelect, onBack, t }) => {
  const languageOptions: Array<{
    code: Language;
    label: string;
    nativeLabel: string;
    helper: string;
    emoji: string;
    tint: string;
  }> = [
    { code: 'en', label: t.english, nativeLabel: 'English', helper: t.continueInEnglish, emoji: '🇬🇧', tint: 'from-sky-500 to-indigo-500' },
    { code: 'hi', label: t.hindi, nativeLabel: 'हिंदी', helper: t.continueInHindi, emoji: '🇮🇳', tint: 'from-amber-500 to-orange-500' },
    { code: 'te', label: t.telugu, nativeLabel: 'తెలుగు', helper: t.continueInTelugu, emoji: '🪷', tint: 'from-teal-500 to-emerald-500' },
  ];

  return (
    <motion.main
      key="lang-select"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-5xl flex-col justify-center px-4 py-10"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-8 inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-stone-300 bg-white/80 px-3 text-sm font-semibold text-stone-700 backdrop-blur transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <ChevronLeft className="h-4 w-4" />
        {t.back}
      </button>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-3 py-1 text-sm font-semibold text-teal-800 backdrop-blur">
          <Languages className="h-4 w-4" />
          {t.languageBadge}
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-950 md:text-4xl">
          {t.selectLanguage}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">{t.languageHelper}</p>
      </div>

      <div className="stagger grid gap-4 sm:grid-cols-3">
        {languageOptions.map((option) => (
          <motion.button
            key={option.code}
            type="button"
            onClick={() => onSelect(option.code)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="card-interactive group min-h-40 rounded-2xl border border-white/70 bg-white/85 p-5 text-left shadow-sm backdrop-blur hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${option.tint} text-2xl shadow-md`}
            >
              {option.emoji}
            </span>
            <span className="mt-4 block text-xs font-semibold uppercase tracking-wide text-teal-700">
              {option.label}
            </span>
            <span className="mt-1 block text-3xl font-bold text-stone-950">{option.nativeLabel}</span>
            <span className="mt-2 block text-sm leading-6 text-stone-600">{option.helper}</span>
          </motion.button>
        ))}
      </div>
    </motion.main>
  );
};

export default LanguageSelection;
