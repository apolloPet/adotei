
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

  const actionProps = {
    onLike: handleLike,
    onDislike: handleDislike,
    onSave: handleSave,
    onInfo: () => setShowDetails(!showDetails),
    isDetailsOpen: showDetails,
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden pointer-events-none px-3 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:items-center md:justify-center md:p-0">
      <motion.div
        ref={cardRef}
        className="pointer-events-auto relative flex flex-col flex-1 min-h-0 w-full max-w-md mx-auto md:flex-none md:w-[450px] md:h-[800px] lg:w-[500px] lg:h-[889px] md:bg-white md:dark:bg-card md:rounded-3xl md:overflow-hidden md:shadow-2xl md:ring-1 md:ring-border/50"
        initial={{ scale: 0.97, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0, y: 12 }}
        transition={{ duration: 0.3 }}
        drag={!showDetails ? 'x' : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.35}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.01 }}
      >
        <div className="relative flex-1 min-h-0 rounded-3xl overflow-hidden shadow-xl bg-neutral-950 md:absolute md:inset-0 md:rounded-none md:shadow-none">
          <PetImageCarousel
            images={pet.images}
            petName={pet.name}
            onShowDetails={() => setShowDetails(!showDetails)}
            fillFrame
          />

          <PetInfoOverlay pet={pet} setShowDetails={setShowDetails} />

          <div className="hidden md:block">
            <ActionButtons {...actionProps} variant="overlay" />
          </div>

          {showDetails && (
            <PetDetailsView pet={pet} onClose={() => setShowDetails(false)} />
          )}
        </div>

        <div className="md:hidden shrink-0 pt-4 pb-1">
          <ActionButtons {...actionProps} variant="bar" />
        </div>
      </motion.div>
    </div>
  );
};

export default PetCard;
