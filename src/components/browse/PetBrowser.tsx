
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PetCard from "@/components/PetCard";
import NoResults from "@/components/browse/NoResults";
import { Pet } from "@/components/pet/types";

interface PetBrowserProps {
  pets: Pet[];
  onSwipe: (direction: 'left' | 'right', petId: string) => void;
  onReset: () => void;
}

const PetBrowser = ({ pets, onSwipe, onReset }: PetBrowserProps) => {
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const currentPet = pets[currentPetIndex];
  
  const handleSwipe = (direction: 'left' | 'right', petId: string) => {
    // Forward the swipe to the parent component
    onSwipe(direction, petId);
    
    // Move to the next pet
    if (currentPetIndex < pets.length - 1) {
      setTimeout(() => {
        setCurrentPetIndex(currentPetIndex + 1);
      }, 300);
    }
  };

  if (pets.length === 0) {
    return <NoResults type="empty" onReset={onReset} />;
  }
  
  if (currentPetIndex >= pets.length) {
    return <NoResults type="end" onReset={onReset} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPet.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PetCard pet={currentPet} onSwipe={handleSwipe} />
      </motion.div>
    </AnimatePresence>
  );
};

export default PetBrowser;
