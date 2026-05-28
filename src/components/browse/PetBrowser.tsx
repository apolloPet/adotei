import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PetCard from "@/components/PetCard";
import NoResults from "@/components/browse/NoResults";
import { Pet } from "@/types/pets";

interface PetBrowserProps {
  pets: Pet[];
  onSwipe: (direction: 'left' | 'right' | 'save', petId: string) => void;
  onReset: () => void;
}

const PetBrowser = ({ pets, onSwipe, onReset }: PetBrowserProps) => {
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const currentPet = pets[currentPetIndex];
  
  const handleSwipe = (direction: string, petId: string) => {
    onSwipe(direction as 'left' | 'right' | 'save', petId);
    if (currentPetIndex < pets.length - 1) {
      setTimeout(() => setCurrentPetIndex(currentPetIndex + 1), 300);
    } else {
      setCurrentPetIndex(currentPetIndex + 1);
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
        className="absolute inset-0"
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
