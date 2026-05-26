
export interface AnimalFormData {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  vaccineIds: string[];
  specialNeeds: boolean;
  specialNeedsDescription: string;
  sterilized: boolean;
  additionalInfo: string;
  tutorName: string;
  tutorContact: string;
  personalityTemperament: string;
  goodWithChildren: boolean;
  goodWithOtherAnimals: boolean;
  goodWithSeniors: boolean;
  images: File[];
  previewImages: string[];
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
}

// Re-export Animal type from animalService to fix the import error
export type { Animal } from '@/services/animalService';
