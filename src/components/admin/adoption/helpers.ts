
import { AdoptionStage } from '../../adoption/AdoptionStages';

export const getStageLabel = (stage: AdoptionStage): string => {
  switch (stage) {
    case 'interested':
      return 'Interesse Demonstrado';
    case 'pending_approval':
      return 'Em Análise';
    case 'approved':
      return 'Aprovado';
    case 'visit_scheduled':
      return 'Visita Agendada';
    case 'home_inspection':
      return 'Inspeção Domiciliar';
    case 'completed':
      return 'Adoção Concluída';
    case 'rejected':
      return 'Adoção Rejeitada';
    default:
      return 'Status Desconhecido';
  }
};

export const getStageColor = (stage: AdoptionStage): string => {
  switch (stage) {
    case 'interested':
      return 'pink';
    case 'pending_approval':
      return 'orange';
    case 'approved':
      return 'green';
    case 'visit_scheduled':
      return 'blue';
    case 'home_inspection':
      return 'indigo';
    case 'completed':
      return 'emerald';
    case 'rejected':
      return 'red';
    default:
      return 'gray';
  }
};
