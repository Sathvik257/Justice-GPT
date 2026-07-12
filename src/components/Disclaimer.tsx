import { AlertTriangle } from 'lucide-react';
import type { Translation } from '../lib/i18n';

export const Disclaimer = ({ t }: { t: Translation }) => {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 backdrop-blur">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm leading-6 text-amber-950">{t.disclaimer}</p>
      </div>
    </div>
  );
};
