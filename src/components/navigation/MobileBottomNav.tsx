/**
 * MobileBottomNav replaces desktop top navigation on small screens. It keeps
 * the core routes within thumb reach: Home, New Case, Law Library, and History.
 */
import { BookOpen, ClipboardList, History, Home } from 'lucide-react';

interface MobileBottomNavProps {
  activeItem: 'home' | 'case' | 'library';
  hasHistory: boolean;
  onHome: () => void;
  onCase: () => void;
  onLibrary: () => void;
  onHistory: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeItem,
  hasHistory,
  onHome,
  onCase,
  onLibrary,
  onHistory,
}) => {
  const items = [
    { id: 'home' as const, label: 'Home', Icon: Home, onClick: onHome, disabled: false },
    { id: 'case' as const, label: 'New Case', Icon: ClipboardList, onClick: onCase, disabled: false },
    { id: 'library' as const, label: 'Library', Icon: BookOpen, onClick: onLibrary, disabled: false },
    { id: 'history' as const, label: 'History', Icon: History, onClick: onHistory, disabled: !hasHistory },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/15 bg-paper/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-18px_35px_-26px_rgba(28,27,24,0.5)] backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ id, label, Icon, onClick, disabled }) => {
          const isActive = activeItem === id;
          return (
            <button
              key={id}
              type="button"
              onClick={onClick}
              disabled={disabled}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 border px-1 text-[0.68rem] font-black uppercase tracking-wide transition disabled:opacity-40 ${
                isActive
                  ? 'border-ink bg-ink text-paper'
                  : 'border-transparent bg-transparent text-ink-faded active:border-seal-gold active:bg-paper-dark'
              }`}
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
