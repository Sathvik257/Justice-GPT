/**
 * RedactionBar renders one classified-file preview line. It starts as a dark
 * redacted strip and reveals a short preview snippet with a scanner wipe when
 * `isRevealed` becomes true. The interaction is visual only; parent flow state
 * decides when each bar should lift.
 */
import { useEffect, useState } from 'react';
import { Check, LockKeyhole } from 'lucide-react';

interface RedactionBarProps {
  label: string;
  isRevealed: boolean;
  previewContent: string;
  revealDelayMs?: number;
}

export const RedactionBar: React.FC<RedactionBarProps> = ({
  label,
  isRevealed,
  previewContent,
  revealDelayMs = 0,
}) => {
  const [delayedReveal, setDelayedReveal] = useState(isRevealed && revealDelayMs === 0);

  useEffect(() => {
    if (!isRevealed) {
      setDelayedReveal(false);
      return;
    }

    const timeout = window.setTimeout(() => setDelayedReveal(true), revealDelayMs);
    return () => window.clearTimeout(timeout);
  }, [isRevealed, revealDelayMs]);

  return (
    <section
      className={`redaction-bar relative overflow-hidden border border-ink/15 bg-ink px-4 py-3 shadow-insetPaper transition-colors duration-300 ${
        delayedReveal ? 'is-revealed bg-paper-dark' : ''
      }`}
      aria-label={`${label}: ${delayedReveal ? previewContent : 'redacted'}`}
    >
      <div className="flex min-h-12 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center border text-paper transition-colors ${
            delayedReveal ? 'border-seal-gold bg-seal-gold text-ink' : 'border-paper/30 bg-paper/10'
          }`}
          aria-hidden="true"
        >
          {delayedReveal ? <Check className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-[0.68rem] font-black uppercase tracking-[0.22em] ${
              delayedReveal ? 'text-stamp-red' : 'text-paper/55'
            }`}
          >
            {label} {delayedReveal ? '— revealed' : '— redacted'}
          </p>
          <p
            className={`mt-1 min-h-5 break-words font-ledger text-sm leading-6 transition-opacity ${
              delayedReveal ? 'text-ink opacity-100' : 'text-paper/0 opacity-0'
            }`}
          >
            {previewContent}
          </p>
        </div>
      </div>
    </section>
  );
};
