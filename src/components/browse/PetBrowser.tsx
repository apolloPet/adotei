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
  const [hasInteracted, setHasInteracted] = useState(false);
  const currentPet = pets[0];
  
  const handleSwipe = (direction: string, petId: string) => {
    onSwipe(direction as 'left' | 'right' | 'save', petId);
    setHasInteracted(true);
  };

  if (pets.length === 0) {
    return <NoResults type={hasInteracted ? "end" : "empty"} onReset={onReset} />;
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
