/**
 * LawTransitionCard compares a legacy legal reference with its current-law
 * equivalent. It is tap/click reversible: users can inspect the old label, flip
 * to the BNS/BNSS/BSA provision, then flip back for comparison.
 */
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { LawTransitionDetails } from '../../types';

interface LawTransitionCardProps {
  oldLaw: LawTransitionDetails;
  newLaw: LawTransitionDetails;
  defaultRevealed?: boolean;
}

export const LawTransitionCard: React.FC<LawTransitionCardProps> = ({
  oldLaw,
  newLaw,
  defaultRevealed = false,
}) => {
  const [isRevealed, setIsRevealed] = useState(defaultRevealed);
  const visibleLaw = isRevealed ? newLaw : oldLaw;

  return (
    <article
      className={`law-transition-card border border-ink/15 bg-paper p-4 shadow-insetPaper ${
        isRevealed ? 'is-current' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => setIsRevealed((current) => !current)}
        className="group w-full text-left focus:outline-none focus:ring-2 focus:ring-seal-gold focus:ring-offset-2 focus:ring-offset-paper"
        aria-label={`Show ${isRevealed ? oldLaw.section : newLaw.section}`}
      >
        <div className="flex min-h-11 items-center justify-between gap-3">
          <span
            className={`inline-flex items-center border px-2.5 py-1 font-mono text-[0.66rem] font-black uppercase tracking-[0.18em] ${
              isRevealed
                ? 'border-seal-gold bg-seal-gold/20 text-ink'
                : 'border-ink/20 bg-ink/5 text-ink-faded'
            }`}
          >
            {isRevealed ? 'Current law' : 'Legacy law'}
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-ink/15 bg-paper-dark text-ink transition group-active:scale-95">
            <RefreshCw className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-3 min-h-[5.75rem]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-ink-faded">
            {visibleLaw.actName}
          </p>
          {visibleLaw.url && isRevealed ? (
            <a
              href={visibleLaw.url}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="mt-1 inline-flex break-words font-ledger text-2xl font-black text-ink underline decoration-seal-gold underline-offset-4"
            >
              {visibleLaw.section}
            </a>
          ) : (
            <p
              className={`mt-1 break-words font-ledger text-2xl font-black ${
                isRevealed ? 'text-ink' : 'law-old-text text-ink-faded'
              }`}
            >
              {visibleLaw.section}
            </p>
          )}
          <p className="mt-2 text-sm leading-6 text-ink-faded">{visibleLaw.text}</p>
        </div>
      </button>
    </article>
  );
};
