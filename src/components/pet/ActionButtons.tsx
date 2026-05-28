import { PawPrint, X, Info, Bookmark } from 'lucide-react';

interface ActionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  onInfo: () => void;
  onSave?: () => void;
  isDetailsOpen?: boolean;
}

const ActionButtons = ({ onLike, onDislike, onInfo, onSave, isDetailsOpen = false }: ActionButtonsProps) => {
  if (isDetailsOpen) return null;

  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-2 sm:gap-3 z-30 px-2">
      {onSave && (
        <button
          className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-amber-500 shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          onClick={onSave}
          aria-label="Salvar para acompanhar"
        >
          <Bookmark className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      )}

      <button
        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-red-500 shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        onClick={onDislike}
        aria-label="Não tenho interesse"
      >
        <X className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <button
        className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/40 ring-4 ring-primary/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        onClick={onLike}
        aria-label="Tenho interesse"
      >
        <PawPrint className="h-7 w-7 md:h-8 md:w-8 fill-current" />
      </button>

      <button
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
