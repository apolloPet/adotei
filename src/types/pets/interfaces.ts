
import { BasePetInfo, PetSpecies } from './base';

export interface PetAdopterProfile {
  suitableHousing?: string[];
  requiresYard?: boolean;
  requiresWalledYard?: boolean;
  requiresWindowScreens?: boolean;
  allowsRented?: boolean;
  suitableForChildren?: boolean;
  suitableForFirstTimers?: boolean;
  maxHoursAloneDaily?: number;
  estimatedMonthlyCost?: string;
  requiresEmergencyBudget?: boolean;
}

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
  adopterProfile?: PetAdopterProfile;
  compatibilityScore?: number;
  hasRegisteredInterest?: boolean;
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
  vaccinated?: boolean;
  neutered?: boolean;
  daysWaiting?: number;
  adopterProfile?: PetAdopterProfile;
  compatibilityScore?: number;
  hasRegisteredInterest?: boolean;
}
