
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

export interface PetCardProps {
  pet: Pet;
  onSwipe: (direction: 'left' | 'right', petId: string) => void;
}

export const getPetColors = (species: 'dog' | 'cat') => ({
  badge: species === 'dog' ? 'bg-[#9b87f5]' : 'bg-[#D946EF]',
  icon: species === 'dog' ? 'text-[#9b87f5]' : 'text-[#D946EF]',
  accent: species === 'dog' ? 'bg-[#9b87f5]/10' : 'bg-[#D946EF]/10',
});
