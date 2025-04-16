
import type { Json } from '@/lib/database.types';

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
  species?: 'dog' | 'cat' | 'other';
  shelter?: string;
  traits?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface PetCardProps {
  pet: PetInfo;
  onSwipe: (direction: string, id: string) => void;
}

export interface PetImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Pet extends Omit<PetInfo, 'age' | 'type' | 'images'> {
  age: string;
  species: 'dog' | 'cat' | 'other';
  shelter: string;
  traits: string[];
  weight: number; 
  shelterTime: string;
  medicalInfo: string;
  images: string[]; 
  primaryImage: string;
  
  created_at?: string;
  updated_at?: string;
}

export const getPetColors = (species: 'dog' | 'cat' | 'other') => {
  return {
    icon: species === 'dog' ? 'text-amber-500' : species === 'cat' ? 'text-indigo-500' : 'text-emerald-500',
    badge: species === 'dog' ? 'bg-amber-500' : species === 'cat' ? 'bg-indigo-500' : 'bg-emerald-500',
    accent: species === 'dog' ? 'bg-amber-100' : species === 'cat' ? 'bg-indigo-100' : 'bg-emerald-100',
  };
};
