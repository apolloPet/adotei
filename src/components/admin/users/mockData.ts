
import { User } from './types';

// Enhanced mock data for users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@exemplo.com",
    phone: "(11) 99999-1234",
    registrationDate: "2023-09-15",
    address: {
      cep: "01234-567",
      street: "Rua das Flores",
      number: "123",
      neighborhood: "Jardim Primavera",
      city: "São Paulo"
    },
    housingType: "apartment",
    hasChildren: true,
    childrenAges: "5, 8 anos",
    hadPetsBefore: true,
    hasAllergies: false,
    workSchedule: "Home office"
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@exemplo.com",
    phone: "(11) 98765-4321",
    registrationDate: "2023-10-05",
    address: {
      cep: "02345-678",
      street: "Avenida Central",
      number: "456",
      neighborhood: "Centro",
      city: "São Paulo"
    },
    housingType: "house",
    hasChildren: false,
    hadPetsBefore: false,
    hasAllergies: true,
    allergiesDescription: "Alergia a pelos de gato",
    workSchedule: "8h-18h fora de casa"
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@exemplo.com",
    phone: "(21) 99876-5432",
    registrationDate: "2023-10-10",
    address: {
      cep: "03456-789",
      street: "Rua dos Pinheiros",
      number: "789",
      neighborhood: "Pinheiros",
      city: "Rio de Janeiro"
    },
    housingType: "house",
    hasChildren: true,
    childrenAges: "3, 7, 12 anos",
    hadPetsBefore: true,
    hasAllergies: false,
    workSchedule: "Trabalho remoto"
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@exemplo.com",
    phone: "(31) 97654-3210",
    registrationDate: "2023-11-20",
    address: {
      cep: "04567-890",
      street: "Alameda Santos",
      number: "101",
      neighborhood: "Jardim América",
      city: "Belo Horizonte"
    },
    housingType: "apartment",
    hasChildren: false,
    hadPetsBefore: true,
    hasAllergies: true,
    allergiesDescription: "Alergia leve a penas",
    workSchedule: "Meio período (14h-18h)"
  },
  {
    id: "5",
    name: "Carlos Souza",
    email: "carlos.souza@exemplo.com",
    phone: "(41) 96543-2109",
    registrationDate: "2023-12-01",
    address: {
      cep: "05678-901",
      street: "Rua Ipiranga",
      number: "202",
      neighborhood: "Ipiranga",
      city: "Curitiba"
    },
    housingType: "other",
    hasChildren: true,
    childrenAges: "1 ano",
    hadPetsBefore: false,
    hasAllergies: false,
    workSchedule: "Horário flexível"
  }
];
