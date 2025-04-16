
import { PetInfo } from './interfaces';

export interface PetCardProps {
  pet: PetInfo;
  onSwipe: (direction: string, id: string) => void;
}

export interface PetImage {
  id: string;
  url: string;
  isPrimary: boolean;
}
