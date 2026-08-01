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
    stamp: string;
  }> = [
    {
      value: 'lawyer',
      title: t.lawyerTitle,
      description: t.lawyerBody,
      Icon: Scale,
      stamp: 'COUNSEL',
    },
    {
      value: 'common',
      title: t.commonTitle,
      description: t.commonBody,
      Icon: UserRound,
      stamp: 'PUBLIC',
    },
  ];

  return (
    <motion.main
      key="role-select"
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
        <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-stamp-red">{t.appName}</p>
        <h1 className="mt-3 font-ledger text-3xl font-black tracking-tight text-ink md:text-4xl">
          {t.roleHeading}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-ink-faded">{t.roleHelper}</p>
      </div>

      <div className="stagger grid gap-3">
        {roles.map(({ value, title, description, Icon, stamp }) => (
          <motion.button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="group relative min-h-40 overflow-hidden border border-ink/15 bg-paper p-5 text-left shadow-insetPaper transition hover:border-seal-gold focus:outline-none focus:ring-2 focus:ring-seal-gold"
          >
            <span className="absolute right-3 top-3 rotate-6 border-2 border-stamp-red px-2 py-1 font-mono text-[0.62rem] font-black uppercase tracking-widest text-stamp-red/70">
              {stamp}
            </span>
            <span className="flex h-14 w-14 items-center justify-center border border-ink bg-ink text-paper">
              <Icon className="h-7 w-7" />
            </span>
            <span className="mt-5 block font-ledger text-2xl font-black text-ink">{title}</span>
            <span className="mt-2 block text-sm leading-6 text-ink-faded">{description}</span>
          </motion.button>
        ))}
      </div>
    </motion.main>
  );
};

export default RoleSelection;
