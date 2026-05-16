
import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { toast } from "@/hooks/use-sonner";
import { PetCardProps } from '@/types/pets';
import PetImageCarousel from './pet/PetImageCarousel';
import PetInfoOverlay from './pet/PetInfoOverlay';
import PetDetailsView from './pet/PetDetailsView';
import ActionButtons from './pet/ActionButtons';

const PetCard = ({ pet, onSwipe }: PetCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle swipe gesture
  const handleDragStart = () => {
    // Reset drag start position
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const swipeDirection = info.offset.x > threshold ? 'right' : info.offset.x < -threshold ? 'left' : null;
    
    if (swipeDirection) {
      onSwipe(swipeDirection, pet.id);
      
      // Remover o toast daqui pois será tratado pelo serviço de adoção
    }
  };

  const handleLike = () => onSwipe('right', pet.id);
  const handleDislike = () => onSwipe('left', pet.id);
  const handleSave = () => onSwipe('save', pet.id);

  return (
    <div className="w-full h-full relative">
      <motion.div
        ref={cardRef}
        className="absolute inset-0 bg-white dark:bg-card rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50 will-change-transform"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        drag={!showDetails ? "x" : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.35}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.01 }}
      >
        <PetImageCarousel 
          images={pet.images} 
          petName={pet.name} 
          onShowDetails={() => setShowDetails(!showDetails)} 
        />
        
        <PetInfoOverlay 
          pet={pet} 
          setShowDetails={setShowDetails} 
        />
        
        {showDetails && (
          <PetDetailsView pet={pet} onClose={() => setShowDetails(false)} />
        )}
      </motion.div>
      
      <ActionButtons 
        onLike={handleLike} 
        onDislike={handleDislike} 
        onSave={handleSave}
        onInfo={() => setShowDetails(!showDetails)}
        isDetailsOpen={showDetails}
      />
    </div>
  );
};

export default PetCard;
