
import { Match } from './MatchCard';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Format date to Brazilian format
export const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    return dateString;
  }
};

// Mock data for matches
export const mockMatches: Match[] = [
  {
    id: "1",
    petName: "Luna",
    petImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1027&q=80",
    userName: "Carlos Silva",
    userEmail: "carlos.silva@example.com",
    userImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=774&q=80",
    userInfo: {
      phone: "+55 11 99999-9999",
      housingType: "apartment",
      hasChildren: false,
      hadPetsBefore: true,
      hasAllergies: false
    },
    matchDate: "2025-03-01T14:30:00.000Z",
    status: "pending",
  },
  {
    id: "2",
    petName: "Max",
    petImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    userName: "Ana Ferreira",
    userEmail: "ana.ferreira@example.com",
    userImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=774&q=80",
    userInfo: {
      phone: "+55 11 98888-8888",
      housingType: "house",
      hasChildren: true,
      hadPetsBefore: true,
      hasAllergies: false
    },
    matchDate: "2025-03-02T10:15:00.000Z",
    status: "approved",
    paymentStatus: "pending"
  },
  {
    id: "3",
    petName: "Toby",
    petImage: "https://images.unsplash.com/photo-1583511655826-05700442b0b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=776&q=80",
    userName: "Maria Oliveira",
    userEmail: "maria.oliveira@example.com",
    userInfo: {
      phone: "+55 11 97777-7777",
      housingType: "house",
      hasChildren: false,
      hadPetsBefore: true,
      hasAllergies: true
    },
    matchDate: "2025-03-03T09:45:00.000Z",
    status: "rejected",
  },
  {
    id: "4",
    petName: "Bella",
    petImage: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=774&q=80",
    userName: "João Santos",
    userEmail: "joao.santos@example.com",
    userImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=774&q=80",
    userInfo: {
      phone: "+55 11 96666-6666",
      housingType: "apartment",
      hasChildren: false,
      hadPetsBefore: true,
      hasAllergies: false
    },
    matchDate: "2025-03-04T16:20:00.000Z",
    status: "approved",
    paymentStatus: "completed"
  }
];
