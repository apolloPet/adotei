
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

// This interface was previously separate but was causing type conflicts
// Now Pet extends PetInfo to make them compatible
export interface Pet extends Omit<PetInfo, 'age' | 'type'> {
  age: string; // In Pet it's a string, in PetInfo it's a number
  species: 'dog' | 'cat' | 'other'; // This replaces 'type' in PetInfo
  shelter: string;
  traits: string[];
  weight: number; // Adding required properties to match error messages
  shelterTime: string; // Adding required properties to match error messages
}

// Helper function for pet colors
export const getPetColors = (species: 'dog' | 'cat' | 'other') => {
  return {
    icon: species === 'dog' ? 'text-amber-500' : species === 'cat' ? 'text-indigo-500' : 'text-emerald-500',
    badge: species === 'dog' ? 'bg-amber-500' : species === 'cat' ? 'bg-indigo-500' : 'bg-emerald-500',
    accent: species === 'dog' ? 'bg-amber-100' : species === 'cat' ? 'bg-indigo-100' : 'bg-emerald-100',
  };
};
