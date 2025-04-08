
export interface PetInfo {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  size: 'small' | 'medium' | 'large';
  weight: number;
  gender: 'male' | 'female';
  description: string;
  location: string;
  shelterTime: string;
  images: string[];
  personality?: string[];
  specialNeeds?: boolean;
  healthIssues?: boolean;
  // Added Pet interface fields
  species?: 'dog' | 'cat' | 'other';
  shelter?: string;
  traits?: string[];
}

export interface PetCardProps {
  pet: PetInfo;
  onSwipe: (direction: string, id: string) => void;
}

// This interface is now just for compatibility and not used directly
export interface PetImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

// Updated Pet interface to match dbPetToPet return type
export interface Pet extends Omit<PetInfo, 'age' | 'type' | 'images'> {
  age: string; // In Pet it's a string, in PetInfo it's a number
  species: 'dog' | 'cat' | 'other'; // This replaces 'type' in PetInfo
  shelter: string; // This is required in the Pet interface
  traits: string[];
  weight: number; 
  shelterTime: string;
  medicalInfo: string;
  images: string[]; // Now expecting string[] to match what dbPetToPet returns
  primaryImage: string; // Added to match what dbPetToPet returns
}

// Helper function for pet colors
export const getPetColors = (species: 'dog' | 'cat' | 'other') => {
  return {
    icon: species === 'dog' ? 'text-amber-500' : species === 'cat' ? 'text-indigo-500' : 'text-emerald-500',
    badge: species === 'dog' ? 'bg-amber-500' : species === 'cat' ? 'bg-indigo-500' : 'bg-emerald-500',
    accent: species === 'dog' ? 'bg-amber-100' : species === 'cat' ? 'bg-indigo-100' : 'bg-emerald-100',
  };
};
