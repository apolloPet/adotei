
// Mock data for the adoption details
export const mockAdoptions = [
  {
    id: "1",
    petName: "Luna",
    petImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1027&q=80",
    shelter: "ONG Amigos dos Animais",
    fee: 120,
    status: 'pending',
    userName: "Maria Silva"
  },
  {
    id: "2",
    petName: "Max",
    petImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    shelter: "ONG Patinhas Carentes",
    fee: 150,
    status: 'pending',
    userName: "João Pereira"
  },
];

// Mock admin settings
export const mockSettings = {
  adoptionFee: 120,
  ngoPercentage: 90,
  platformPercentage: 10,
  pixKey: "ong@example.com",
  contractText: "Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.",
  followUpPeriod: 90
};

// Function to get adoption by ID
export const getAdoptionById = (id: string) => {
  return mockAdoptions.find(adoption => adoption.id === id) || null;
};

// Function to get admin settings
export const getAdminSettings = () => {
  return mockSettings;
};

// In a real app, this would be an API call
export const processPayment = (adoptionId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 2000);
  });
};
