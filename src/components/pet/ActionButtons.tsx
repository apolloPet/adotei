import { PawPrint, X, Info, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  onInfo: () => void;
  onSave?: () => void;
  isDetailsOpen?: boolean;
  variant?: 'overlay' | 'bar';
}

const ActionButtons = ({
  onLike,
  onDislike,
  onInfo,
  onSave,
  isDetailsOpen = false,
  variant = 'overlay',
}: ActionButtonsProps) => {
  if (isDetailsOpen) return null;

  if (variant === 'bar') {
    return (
      <div className="flex justify-center items-end gap-4 sm:gap-5 px-2">
        {onSave && (
          <button
            type="button"
            className="w-12 h-12 rounded-full bg-white dark:bg-card text-amber-500 shadow-[0_4px_14px_rgba(0,0,0,0.12)] border border-amber-200/80 flex items-center justify-center transition-transform active:scale-95"
            onClick={onSave}
            aria-label="Salvar para acompanhar"
          >
            <Bookmark className="h-5 w-5" />
          </button>
        )}

        <button
          type="button"
          className="w-14 h-14 rounded-full bg-white dark:bg-card text-red-500 shadow-[0_4px_14px_rgba(0,0,0,0.12)] border border-red-100 flex items-center justify-center transition-transform active:scale-95 -mb-0.5"
          onClick={onDislike}
          aria-label="Não tenho interesse"
        >
          <X className="h-7 w-7 stroke-[2.5]" />
        </button>

        <button
          type="button"
          className="w-[4.5rem] h-[4.5rem] rounded-full bg-white dark:bg-card text-emerald-500 shadow-[0_6px_20px_rgba(16,185,129,0.25)] border-2 border-emerald-100 flex items-center justify-center transition-transform active:scale-95"
          onClick={onLike}
          aria-label="Tenho interesse"
        >
          <PawPrint className="h-9 w-9 fill-current" />
        </button>

        <button
          type="button"
          className="w-12 h-12 rounded-full bg-white dark:bg-card text-sky-500 shadow-[0_4px_14px_rgba(0,0,0,0.12)] border border-sky-100 flex items-center justify-center transition-transform active:scale-95"
          onClick={onInfo}
          aria-label="Informações"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-2 sm:gap-3 z-30 px-2">
      {onSave && (
        <button
          type="button"
          className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-amber-500 shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          onClick={onSave}
          aria-label="Salvar para acompanhar"
        >
          <Bookmark className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      )}

      <button
        type="button"
        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-red-500 shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        onClick={onDislike}
        aria-label="Não tenho interesse"
      >
        <X className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <button
        type="button"
        className={cn(
          'rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/40 ring-4 ring-primary/20',
          'flex items-center justify-center transition-transform hover:scale-110 active:scale-95',
          'w-14 h-14 md:w-16 md:h-16',
        )}
        onClick={onLike}
        aria-label="Tenho interesse"
      >
        <PawPrint className="h-7 w-7 md:h-8 md:w-8 fill-current" />
      </button>

      <button
        type="button"
        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-blue-500 shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        onClick={onInfo}
        aria-label="Informações"
      >
        <Info className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    </div>
  );
};

export default ActionButtons;
