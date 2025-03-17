
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
  // Add more fields as needed
}

export interface PetCardProps {
  pet: PetInfo;
  onSwipe: (direction: string, id: string) => void;
}

// Added Pet interface that was missing
export interface Pet {
  id: string;
  name: string;
  images: string[];
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  breed: string;
  species: 'dog' | 'cat';
  description: string;
  location: string;
  shelter: string;
  traits: string[];
}

// Added getPetColors function
export const getPetColors = (species: 'dog' | 'cat') => {
  return {
    icon: species === 'dog' ? 'text-amber-500' : 'text-indigo-500',
    badge: species === 'dog' ? 'bg-amber-500' : 'bg-indigo-500',
    accent: species === 'dog' ? 'bg-amber-100' : 'bg-indigo-100',
  };
};
