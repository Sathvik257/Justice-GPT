import { ArrowRight, FileSearch, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from '../lib/motion';
import type { Translation } from '../lib/i18n';

interface WelcomeScreenProps {
  onEnter: () => void;
  t: Translation;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, t }) => {
  const features = [
    { Icon: FileSearch, tint: 'from-teal-500 to-emerald-500', title: t.featureTriageTitle, body: t.featureTriageBody },
    { Icon: RefreshCw, tint: 'from-amber-500 to-orange-500', title: t.featureCurrentTitle, body: t.featureCurrentBody },
    { Icon: ShieldCheck, tint: 'from-sky-500 to-indigo-500', title: t.featureEduTitle, body: t.featureEduBody },
  ];

  return (
    <motion.main
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen overflow-hidden"
    >
      <span className="blob left-[-6rem] top-[-4rem] h-72 w-72 bg-teal-300" />
      <span className="blob right-[-4rem] top-24 h-64 w-64 bg-amber-300" style={{ animationDelay: '2s' }} />
      <span className="blob bottom-[-6rem] left-1/3 h-72 w-72 bg-emerald-200" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-4 py-1.5 text-sm font-semibold text-teal-800 shadow-sm backdrop-blur"
          >
            <Sparkles className="h-4 w-4" />
            {t.welcomeBadge}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="text-gradient">{t.appName}</span>
            <span className="ml-2">⚖️</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-5 max-w-2xl text-xl font-medium leading-8 text-stone-800"
          >
            {t.welcomeLead}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            className="mt-4 max-w-2xl text-base leading-7 text-stone-600"
          >
            {t.welcomeBody}
          </motion.p>

          <motion.button
            type="button"
            onClick={onEnter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.36 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary mt-9 inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            {t.enter}
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </section>

        <section className="stagger grid gap-4">
          {features.map(({ Icon, tint, title, body }) => (
            <div
              key={title}
              className="card-interactive rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md`}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-stone-950">{title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-stone-600">{body}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </motion.main>
  );
};

export default WelcomeScreen;
