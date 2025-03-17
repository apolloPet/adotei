
import { Heart, X, Info } from 'lucide-react';

interface ActionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  onInfo: () => void;
  isDetailsOpen?: boolean;
}

const ActionButtons = ({ onLike, onDislike, onInfo, isDetailsOpen = false }: ActionButtonsProps) => {
  if (isDetailsOpen) return null;
  
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4 z-20">
      <button
        className="w-14 h-14 rounded-full bg-white text-red-500 shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95"
        onClick={onDislike}
        aria-label="Passar"
      >
        <X className="h-7 w-7" />
      </button>
      
      <button
        className="w-14 h-14 rounded-full bg-white text-green-500 shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95"
        onClick={onLike}
        aria-label="Curtir"
      >
        <Heart className="h-7 w-7 fill-green-500" />
      </button>
      
      <button
        className="w-14 h-14 rounded-full bg-white text-blue-500 shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95"
        onClick={onInfo}
        aria-label="Informações"
      >
        <Info className="h-7 w-7" />
      </button>
    </div>
  );
};

export default ActionButtons;
