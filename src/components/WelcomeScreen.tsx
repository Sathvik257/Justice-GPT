import { ArrowRight, FileSearch, RefreshCw, ShieldCheck, Stamp } from 'lucide-react';
import { motion } from '../lib/motion';
import type { Translation } from '../lib/i18n';

interface WelcomeScreenProps {
  onEnter: () => void;
  t: Translation;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, t }) => {
  const features = [
    { Icon: FileSearch, title: t.featureTriageTitle, body: t.featureTriageBody, stamp: 'INTAKE' },
    { Icon: RefreshCw, title: t.featureCurrentTitle, body: t.featureCurrentBody, stamp: 'BNS' },
    { Icon: ShieldCheck, title: t.featureEduTitle, body: t.featureEduBody, stamp: 'VERIFY' },
  ];

  return (
    <motion.main
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 py-8 md:py-12"
    >
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
        <section className="border border-ink/15 bg-paper p-5 shadow-ledger sm:p-8">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-2 border border-stamp-red/30 bg-stamp-red/10 px-3 py-1.5 font-mono text-xs font-black uppercase tracking-[0.24em] text-stamp-red"
          >
            <Stamp className="h-4 w-4" />
            {t.welcomeBadge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-6 font-ledger text-5xl font-black tracking-tight text-ink sm:text-6xl lg:text-7xl"
          >
            {t.appName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-5 max-w-2xl font-ledger text-2xl font-semibold leading-9 text-ink"
          >
            {t.welcomeLead}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="mt-4 max-w-2xl text-base leading-7 text-ink-faded"
          >
            {t.welcomeBody}
          </motion.p>

          <motion.button
            type="button"
            onClick={onEnter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.36 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary mt-8 inline-flex min-h-12 items-center gap-3 px-5 text-base font-black text-paper focus:outline-none focus:ring-2 focus:ring-seal-gold focus:ring-offset-2"
          >
            <span className="relative z-10">{t.enter}</span>
            <ArrowRight className="relative z-10 h-5 w-5" />
          </motion.button>
        </section>

        <section className="grid gap-3">
          {features.map(({ Icon, title, body, stamp }) => (
            <article key={title} className="relative border border-ink/15 bg-paper-dark/80 p-5 shadow-insetPaper">
              <span className="absolute right-3 top-3 rotate-3 border-2 border-stamp-red px-2 py-1 font-mono text-[0.62rem] font-black uppercase tracking-widest text-stamp-red/70">
                {stamp}
              </span>
              <div className="flex items-start gap-4 pr-16">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-ink bg-ink text-paper">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-ledger text-xl font-black text-ink">{title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-ink-faded">{body}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </motion.main>
  );
};

export default WelcomeScreen;
