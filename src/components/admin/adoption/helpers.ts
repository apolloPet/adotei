
import { AdoptionStage, adoptionStages } from '../../adoption/AdoptionStages';

export const getStageLabel = (stage: AdoptionStage) => {
  return adoptionStages.find(s => s.id === stage)?.label || stage;
};

export const getStageColor = (stage: AdoptionStage) => {
  switch (stage) {
    case "interested":
      return "bg-pink-100 text-pink-800";
    case "pending_approval":
      return "bg-orange-100 text-orange-800";
    case "approved":
      return "bg-green-100 text-green-800";
    case "visit_scheduled":
      return "bg-blue-100 text-blue-800";
    case "home_inspection":
      return "bg-indigo-100 text-indigo-800";
    case "completed":
      return "bg-primary-100 text-primary-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
