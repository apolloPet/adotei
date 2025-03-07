
import { Match } from './MatchCard';

// Simulated data for demonstration
export const mockMatches: Match[] = [
  {
    id: "1",
    petName: "Luna",
    petImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1027&q=80",
    userName: "Maria Silva",
    userImage: "https://randomuser.me/api/portraits/women/44.jpg",
    userInfo: {
      phone: "(11) 98765-4321",
      housingType: "apartment",
      hasChildren: false,
      hadPetsBefore: true,
      hasAllergies: false
    },
    matchDate: "2023-05-15T14:30:00",
    status: 'pending'
  },
  {
    id: "2",
    petName: "Max",
    petImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    userName: "João Pereira",
    userImage: "https://randomuser.me/api/portraits/men/32.jpg",
    userInfo: {
      phone: "(21) 99876-5432",
      housingType: "house",
      hasChildren: true,
      hadPetsBefore: true,
      hasAllergies: false
    },
    matchDate: "2023-05-14T09:15:00",
    status: 'pending'
  },
  {
    id: "3",
    petName: "Bella",
    petImage: "https://images.unsplash.com/photo-1574144113084-b6f450cc5e0b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
    userName: "Ana Oliveira",
    userInfo: {
      phone: "(47) 98888-7777",
      housingType: "house",
      hasChildren: false,
      hadPetsBefore: true,
      hasAllergies: true
    },
    matchDate: "2023-05-13T16:45:00",
    status: 'approved'
  },
  {
    id: "4",
    petName: "Thor",
    petImage: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    userName: "Carlos Santos",
    userImage: "https://randomuser.me/api/portraits/men/67.jpg",
    userInfo: {
      phone: "(85) 99999-8888",
      housingType: "apartment",
      hasChildren: true,
      hadPetsBefore: false,
      hasAllergies: false
    },
    matchDate: "2023-05-12T11:20:00",
    status: 'rejected'
  },
];

// Helper function to format date
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
