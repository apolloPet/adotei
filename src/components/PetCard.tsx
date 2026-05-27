
import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { PetCardProps } from '@/types/pets';
import PetImageCarousel from './pet/PetImageCarousel';
import PetInfoOverlay from './pet/PetInfoOverlay';
import PetDetailsView from './pet/PetDetailsView';
import ActionButtons from './pet/ActionButtons';

const PetCard = ({ pet, onSwipe }: PetCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const swipeDirection = info.offset.x > threshold ? 'right' : info.offset.x < -threshold ? 'left' : null;

    if (swipeDirection) {
      onSwipe(swipeDirection, pet.id);
    }
  };

  const handleLike = () => onSwipe('right', pet.id);
  const handleDislike = () => onSwipe('left', pet.id);
  const handleSave = () => onSwipe('save', pet.id);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <motion.div
        ref={cardRef}
        className="pointer-events-auto relative shrink-0 grow-0 w-[360px] h-[640px] md:w-[450px] md:h-[800px] lg:w-[500px] lg:h-[889px] bg-white dark:bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        drag={!showDetails ? 'x' : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.35}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.01 }}
      >
        <div className="absolute inset-0 bg-neutral-950">
          <PetImageCarousel
            images={pet.images}
            petName={pet.name}
            onShowDetails={() => setShowDetails(!showDetails)}
          />
        </div>

        <PetInfoOverlay pet={pet} setShowDetails={setShowDetails} />

        <ActionButtons
          onLike={handleLike}
          onDislike={handleDislike}
          onSave={handleSave}
          onInfo={() => setShowDetails(!showDetails)}
          isDetailsOpen={showDetails}
        />

        {showDetails && (
          <PetDetailsView pet={pet} onClose={() => setShowDetails(false)} />
        )}
      </motion.div>
    </div>
  );
};

export default PetCard;
