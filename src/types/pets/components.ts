
import { Pet } from './interfaces';

export interface PetCardProps {
  pet: Pet;
  onSwipe: (direction: string, id: string) => void;
}

export interface PetImage {
  id: string;
  url: string;
  isPrimary: boolean;
}
