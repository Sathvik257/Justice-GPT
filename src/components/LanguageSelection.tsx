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
    codeLabel: string;
  }> = [
    { code: 'en', label: t.english, nativeLabel: 'English', helper: t.continueInEnglish, codeLabel: 'EN' },
    { code: 'hi', label: t.hindi, nativeLabel: 'Hindi', helper: t.continueInHindi, codeLabel: 'HI' },
    { code: 'te', label: t.telugu, nativeLabel: 'Telugu', helper: t.continueInTelugu, codeLabel: 'TE' },
  ];

  return (
    <motion.main
      key="lang-select"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex min-h-11 w-fit items-center gap-2 border border-ink/15 bg-paper px-3 text-sm font-bold text-ink-faded transition hover:bg-paper-dark focus:outline-none focus:ring-2 focus:ring-seal-gold"
      >
        <ChevronLeft className="h-4 w-4" />
        {t.back}
      </button>

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 border border-stamp-red/30 bg-stamp-red/10 px-3 py-1 font-mono text-xs font-black uppercase tracking-wide text-stamp-red">
          <Languages className="h-4 w-4" />
          {t.languageBadge}
        </div>
        <h1 className="mt-4 font-ledger text-3xl font-black tracking-tight text-ink md:text-4xl">
          {t.selectLanguage}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-faded">{t.languageHelper}</p>
      </div>

      <div className="stagger grid gap-3">
        {languageOptions.map((option) => (
          <motion.button
            key={option.code}
            type="button"
            onClick={() => onSelect(option.code)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group min-h-32 border border-ink/15 bg-paper p-4 text-left shadow-insetPaper transition hover:border-seal-gold focus:outline-none focus:ring-2 focus:ring-seal-gold"
          >
            <span className="flex h-12 w-12 items-center justify-center border border-ink bg-ink font-mono text-sm font-black text-paper">
              {option.codeLabel}
            </span>
            <span className="mt-4 block font-mono text-xs font-black uppercase tracking-wide text-stamp-red">
              {option.label}
            </span>
            <span className="mt-1 block font-ledger text-2xl font-black text-ink">{option.nativeLabel}</span>
            <span className="mt-2 block text-sm leading-6 text-ink-faded">{option.helper}</span>
          </motion.button>
        ))}
      </div>
    </motion.main>
  );
};

export default LanguageSelection;
