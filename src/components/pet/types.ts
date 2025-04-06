
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

// Image interface for the Pet type
export interface PetImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

// This interface was previously separate but was causing type conflicts
// Now Pet extends PetInfo to make them compatible
export interface Pet extends Omit<PetInfo, 'age' | 'type' | 'images'> {
  age: string; // In Pet it's a string, in PetInfo it's a number
  species: 'dog' | 'cat' | 'other'; // This replaces 'type' in PetInfo
  shelter: string;
  traits: string[];
  weight: number; // Adding required properties to match error messages
  shelterTime: string; // Adding required properties to match error messages
  medicalInfo: string; // Added this property that was missing
  images: PetImage[]; // Changed from string[] to PetImage[]
}

// Helper function for pet colors
export const getPetColors = (species: 'dog' | 'cat' | 'other') => {
  return {
    icon: species === 'dog' ? 'text-amber-500' : species === 'cat' ? 'text-indigo-500' : 'text-emerald-500',
    badge: species === 'dog' ? 'bg-amber-500' : species === 'cat' ? 'bg-indigo-500' : 'bg-emerald-500',
    accent: species === 'dog' ? 'bg-amber-100' : species === 'cat' ? 'bg-indigo-100' : 'bg-emerald-100',
  };
};
