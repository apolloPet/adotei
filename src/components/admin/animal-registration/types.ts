
export interface AnimalFormData {
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  description: string;
  medicalInfo: string;
  location: string;
  characteristics: string[];
  requirements: string[];
  responsibleId: string;
}

export const defaultFormData: AnimalFormData = {
  name: '',
  type: 'dog',
  breed: '',
  age: '',
  gender: 'male',
  size: 'medium',
  description: '',
  medicalInfo: '',
  location: '',
  characteristics: [],
  requirements: [],
  responsibleId: ''
};

// Mock staff members for the dropdown
export const staffMembers = [
  { id: "staff-1", name: "Mariana Silva" },
  { id: "staff-2", name: "Lucas Pereira" },
  { id: "staff-3", name: "Camila Santos" },
  { id: "staff-4", name: "Rafael Oliveira" },
  { id: "staff-5", name: "Juliana Costa" }
];

export const commonCharacteristics = ['Dócil', 'Castrado', 'Vacinado', 'Sociável', 'Brincalhão', 'Calmo', 'Independente'];
export const commonRequirements = ['Tela nas janelas', 'Ambiente calmo', 'Passeios diários', 'Visitas de acompanhamento', 'Sem outros animais'];
