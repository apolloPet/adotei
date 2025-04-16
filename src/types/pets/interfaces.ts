
import { BasePetInfo, PetSpecies } from './base';

export interface PetInfo extends BasePetInfo {
  type: string;
  age: number;
  weight: number;
  shelterTime: string;
  images: string[];
  personality?: string[];
  specialNeeds?: boolean;
  healthIssues?: boolean;
  species?: PetSpecies;
  shelter?: string;
  traits?: string[];
}

export interface Pet extends Omit<BasePetInfo, 'type'> {
  species: PetSpecies;
  age: string;
  weight: number;
  shelterTime: string;
  medicalInfo: string;
  images: string[];
  primaryImage: string;
  specialNeeds?: boolean;
  healthIssues?: boolean;
  shelter: string;
  traits: string[];
}
