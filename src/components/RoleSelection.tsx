import { ChevronLeft, Scale, UserRound } from 'lucide-react';
import { motion } from '../lib/motion';
import type { UserRole } from '../types';
import type { Translation } from '../lib/i18n';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
  onBack: () => void;
  t: Translation;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect, onBack, t }) => {
  const roles: Array<{
    value: UserRole;
    title: string;
    description: string;
    Icon: React.ElementType;
    emoji: string;
    tint: string;
  }> = [
    {
      value: 'lawyer',
      title: t.lawyerTitle,
      description: t.lawyerBody,
      Icon: Scale,
      emoji: '👩‍⚖️',
      tint: 'from-teal-500 to-emerald-500',
    },
    {
      value: 'common',
      title: t.commonTitle,
      description: t.commonBody,
      Icon: UserRound,
      emoji: '🧑',
      tint: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <motion.main
      key="role-select"
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
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">{t.appName}</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-950 md:text-4xl">
          {t.roleHeading}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-stone-600">{t.roleHelper}</p>
      </div>

      <div className="stagger grid gap-4 md:grid-cols-2">
        {roles.map(({ value, title, description, Icon, emoji, tint }) => (
          <motion.button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card-interactive group relative overflow-hidden rounded-2xl border border-white/70 bg-white/85 p-6 text-left shadow-sm backdrop-blur hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <span className="pointer-events-none absolute right-4 top-4 text-4xl opacity-80">{emoji}</span>
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md`}
            >
              <Icon className="h-7 w-7" />
            </span>
            <span className="mt-5 block text-2xl font-bold text-stone-950">{title}</span>
            <span className="mt-2 block text-sm leading-6 text-stone-600">{description}</span>
          </motion.button>
        ))}
      </div>
    </motion.main>
  );
};

export default RoleSelection;
