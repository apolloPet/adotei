
import { Check, Clock, Eye, Heart, Home, MapPin, ShieldCheck } from "lucide-react";

export type AdoptionStage = 
  | "interested" 
  | "pending_approval" 
  | "approved" 
  | "visit_scheduled" 
  | "home_inspection" 
  | "completed";

export type AdoptionStageInfo = {
  id: AdoptionStage;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

export const adoptionStages: AdoptionStageInfo[] = [
  {
    id: "interested",
    label: "Interesse Demonstrado",
    description: "Você demonstrou interesse em adotar este animal",
    icon: <Heart className="h-5 w-5" />,
    color: "text-pink-500"
  },
  {
    id: "pending_approval",
    label: "Em Análise",
    description: "A ONG está analisando seu perfil para adoção",
    icon: <Clock className="h-5 w-5" />,
    color: "text-orange-500"
  },
  {
    id: "approved",
    label: "Aprovado",
    description: "Seu perfil foi aprovado para prosseguir com a adoção",
    icon: <Check className="h-5 w-5" />,
    color: "text-green-500"
  },
  {
    id: "visit_scheduled",
    label: "Visita Agendada",
    description: "Agendamento para conhecer o animal pessoalmente",
    icon: <Eye className="h-5 w-5" />,
    color: "text-blue-500"
  },
  {
    id: "home_inspection",
    label: "Inspeção Domiciliar",
    description: "Visita da ONG ao seu lar para verificar adequação",
    icon: <MapPin className="h-5 w-5" />,
    color: "text-indigo-500"
  },
  {
    id: "completed",
    label: "Adoção Concluída",
    description: "Parabéns! A adoção foi concluída com sucesso",
    icon: <ShieldCheck className="h-5 w-5" />,
    color: "text-primary"
  }
];

interface AdoptionStagesProps {
  currentStage: AdoptionStage;
  className?: string;
}

const AdoptionStages = ({ currentStage, className = "" }: AdoptionStagesProps) => {
  // Find the index of the current stage
  const currentIndex = adoptionStages.findIndex(stage => stage.id === currentStage);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-muted">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ 
              width: `${Math.max(0, Math.min(100, (currentIndex / (adoptionStages.length - 1)) * 100))}%` 
            }}
          />
        </div>
        
        {/* Stages */}
        <div className="flex justify-between relative">
          {adoptionStages.map((stage, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;
            
            return (
              <div key={stage.id} className="flex flex-col items-center">
                <div 
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full 
                  ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                  ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                  transition-all duration-200`}
                >
                  {stage.icon}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-xs font-medium ${isActive ? stage.color : 'text-muted-foreground'}`}>
                    {stage.label}
                  </div>
                  <div className="hidden md:block text-xs text-muted-foreground mt-1 max-w-[120px]">
                    {stage.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdoptionStages;
