
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
  
  // Images
  images: File[];
  previewImages: string[];
  
  // Location and staff
  location: string;
  responsible: string;
  responsibleContact: string;
  
  // Requirements
  adoptionRequirements: string[];
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
}
