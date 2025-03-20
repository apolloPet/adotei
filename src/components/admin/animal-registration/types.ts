
export interface AnimalFormData {
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  description: string;
  location: string;
  characteristics: string[];
  requirements: string[];
  responsibleId: string;
  caretaker?: {
    name: string;
    role: string;
    phone: string;
    email: string;
    notes?: string;
  };
}

export const defaultFormData: AnimalFormData = {
  name: '',
  type: 'dog',
  breed: '',
  age: '',
  gender: 'male',
  size: 'medium',
  description: '',
  location: '',
  characteristics: [],
  requirements: [],
  responsibleId: '',
  caretaker: {
    name: '',
    role: '',
    phone: '',
    email: '',
    notes: ''
  }
};

// Mock staff members for the dropdown
export const staffMembers = [
  { id: "staff-1", name: "Mariana Silva" },
  { id: "staff-2", name: "Lucas Pereira" },
  { id: "staff-3", name: "Camila Santos" },
  { id: "staff-4", name: "Rafael Oliveira" },
  { id: "staff-5", name: "Juliana Costa" }
];

export const commonCharacteristics = ['Dócil', 'Vacinado', 'Sociável', 'Brincalhão', 'Calmo', 'Independente'];
export const commonRequirements = ['Tela nas janelas', 'Ambiente calmo', 'Passeios diários', 'Visitas de acompanhamento', 'Sem outros animais'];
