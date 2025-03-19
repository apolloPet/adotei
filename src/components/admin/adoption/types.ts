
import { AdoptionStage } from '../../adoption/AdoptionStages';

export interface MatchPoint {
  icon: string;
  description: string;
  strength: 'high' | 'medium' | 'low';
}

export interface AdoptionMatch {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  currentStage: AdoptionStage;
  createdAt: string;
  updatedAt: string;
  notes: string;
  responsibleId?: string;
  responsibleName?: string;
  matchPoints?: MatchPoint[];
  followUpStatus?: string;
  lastFollowUpDate?: string | null;
  nextFollowUpDate?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string;
}

export interface MatchCardProps {
  match: AdoptionMatch;
  onStageChange: (matchId: string, stage: AdoptionStage) => void;
  onScheduleVisit: (match: AdoptionMatch, date: Date, time: string, notes: string) => void;
  onScheduleHomeInspection: (match: AdoptionMatch, date: Date, time: string, notes: string) => void;
  onCompleteAdoption: (matchId: string) => void;
  onRejectAdoption?: (matchId: string, reason: string) => void;
  onScheduleFollowUp?: (match: AdoptionMatch, date: Date, notes: string) => void;
  getStageLabel: (stage: AdoptionStage) => string;
  getStageColor: (stage: AdoptionStage) => string;
  formatDate: (dateString: string) => string;
}

export const mockAdoptionMatches: AdoptionMatch[] = [
  {
    id: "match-1",
    petId: "pet-1",
    petName: "Luna",
    petImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=60",
    userId: "user-1",
    userName: "Carlos Oliveira",
    userEmail: "carlos@example.com",
    userPhone: "(11) 98765-4321",
    currentStage: "interested",
    createdAt: "2023-11-15T10:30:00Z",
    updatedAt: "2023-11-15T10:30:00Z",
    notes: "Usuário tem experiência com cães de porte médio.",
    responsibleId: "admin-1",
    responsibleName: "Mariana Silva",
    matchPoints: [
      { icon: "🏠", description: "Mora em casa com quintal", strength: "high" },
      { icon: "⏰", description: "Disponibilidade de tempo", strength: "medium" },
      { icon: "🐕", description: "Experiência com cães", strength: "high" }
    ]
  },
  {
    id: "match-2",
    petId: "pet-2",
    petName: "Max",
    petImage: "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?w=500&auto=format&fit=crop&q=60",
    userId: "user-2",
    userName: "Ana Ferreira",
    userEmail: "ana@example.com",
    userPhone: "(11) 91234-5678",
    currentStage: "pending_approval",
    createdAt: "2023-11-10T14:20:00Z",
    updatedAt: "2023-11-12T09:15:00Z",
    notes: "Mora em apartamento, precisa verificar se é adequado para o pet.",
    responsibleId: "admin-1",
    responsibleName: "Mariana Silva",
    matchPoints: [
      { icon: "🏢", description: "Mora em apartamento", strength: "medium" },
      { icon: "❤️", description: "Primeira adoção", strength: "low" },
      { icon: "🐈", description: "Experiência apenas com gatos", strength: "low" }
    ]
  },
  {
    id: "match-3",
    petId: "pet-3",
    petName: "Nina",
    petImage: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&auto=format&fit=crop&q=60",
    userId: "user-3",
    userName: "Roberto Santos",
    userEmail: "roberto@example.com",
    userPhone: "(11) 97890-1234",
    currentStage: "approved",
    createdAt: "2023-11-05T11:45:00Z",
    updatedAt: "2023-11-13T16:30:00Z",
    notes: "Família grande com crianças. Perfil aprovado.",
    responsibleId: "admin-2",
    responsibleName: "Lucas Pereira"
  },
  {
    id: "match-4",
    petId: "pet-4",
    petName: "Thor",
    petImage: "https://images.unsplash.com/photo-1583512603806-077998240c7a?w=500&auto=format&fit=crop&q=60",
    userId: "user-4",
    userName: "Fernanda Lima",
    userEmail: "fernanda@example.com",
    userPhone: "(11) 96543-2109",
    currentStage: "visit_scheduled",
    createdAt: "2023-10-28T09:10:00Z",
    updatedAt: "2023-11-14T10:00:00Z",
    notes: "Visita agendada para 18/11 às 14h.",
    responsibleId: "admin-1",
    responsibleName: "Mariana Silva"
  },
  {
    id: "match-5",
    petId: "pet-5",
    petName: "Bella",
    petImage: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?w=500&auto=format&fit=crop&q=60",
    userId: "user-5",
    userName: "Pedro Costa",
    userEmail: "pedro@example.com",
    userPhone: "(11) 95678-9012",
    currentStage: "home_inspection",
    createdAt: "2023-10-20T15:30:00Z",
    updatedAt: "2023-11-15T11:45:00Z",
    notes: "Inspeção domiciliar marcada para 20/11 às 10h.",
    responsibleId: "admin-2",
    responsibleName: "Lucas Pereira"
  },
  {
    id: "match-6",
    petId: "pet-6",
    petName: "Rex",
    petImage: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?w=500&auto=format&fit=crop&q=60",
    userId: "user-6",
    userName: "Julia Mendes",
    userEmail: "julia@example.com",
    userPhone: "(11) 94321-8765",
    currentStage: "completed",
    createdAt: "2023-10-15T10:20:00Z",
    updatedAt: "2023-11-10T14:30:00Z",
    notes: "Adoção concluída com sucesso. Acompanhamento pós-adoção em 30 dias.",
    responsibleId: "admin-1",
    responsibleName: "Mariana Silva"
  }
];

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
