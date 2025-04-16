
import type { Json } from '@/lib/database.types';

export type PetSize = 'small' | 'medium' | 'large';
export type PetGender = 'male' | 'female';
export type PetSpecies = 'dog' | 'cat' | 'other';

export interface BasePetInfo {
  id: string;
  name: string;
  breed: string;
  gender: PetGender;
  size: PetSize;
  description: string;
  location: string;
  created_at?: string;
  updated_at?: string;
}
