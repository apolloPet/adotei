
export interface AnimalFormData {
  // Basic info
  name: string;
  type: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  
  // Health info
  vaccinationStatus: string;
  veterinaryInfo: string;
  healthConditions: string;
  specialNeeds: boolean;
  specialNeedsDescription: string;
  tutorName: string;
  tutorContact: string;
  
  // Characteristics
  temperament: string[];
  goodWith: string[];
  energyLevel: string;
  trainability: string;
  characteristics: string[]; // Added this field
  
  // Images
  images: File[];
  previewImages: string[];
  
  // Location and staff
  location: string;
  responsible: string;
  responsibleContact: string;
  
  // Requirements
  adoptionRequirements: string[];
  requirements: string[]; // Added this field
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
}

// Common characteristics for animal selection
export const commonCharacteristics = [
  "Brincalhão",
  "Calmo",
  "Carinhoso",
  "Curioso",
  "Independente",
  "Sociável",
  "Protetor",
  "Tímido",
  "Ativo",
  "Dorminhoco",
  "Adaptável",
  "Territorial"
];

// Common requirements for adoption
export const commonRequirements = [
  "Visita prévia",
  "Termo de adoção assinado",
  "Casa telada",
  "Não ter crianças pequenas",
  "Avaliação financeira",
  "Transporte adequado",
  "Disponibilidade para acompanhamento",
  "Ambiente adequado"
];

// Staff members for selection
export const staffMembers = [
  { id: "1", name: "Ana Silva" },
  { id: "2", name: "Carlos Oliveira" },
  { id: "3", name: "Mariana Santos" },
  { id: "4", name: "Pedro Mendes" }
];
