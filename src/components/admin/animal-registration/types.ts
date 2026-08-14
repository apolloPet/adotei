
export type PendingPersonalityDraft = {
  name: string;
  description: string;
};

/** ID local para personalidade criada no formulário, ainda não persistida na API. */
export const DRAFT_PERSONALITY_ID = '__draft_personality__';

export interface AnimalFormData {
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  personalityId: string;
  /** Data de entrada no abrigo (YYYY-MM-DD); vazio usa a data de cadastro. */
  shelterEntryDate: string;
  personalityDescription?: string;
  /** Rascunho de personalidade/temperamento; só é enviado à API no submit do animal. */
  pendingPersonality?: PendingPersonalityDraft | null;
  vaccineIds: string[];
  specialNeeds: boolean;
  specialNeedsDescription: string;
  sterilized: boolean;
  additionalInfo: string;
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
