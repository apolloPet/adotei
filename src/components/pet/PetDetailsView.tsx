
import { X, Calendar, Heart, Check, AlertCircle, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-sonner";
import { Pet, getPetColors } from './types';

interface PetDetailsViewProps {
  pet: Pet;
  onClose: () => void;
}

const PetDetailsView = ({ pet, onClose }: PetDetailsViewProps) => {
  const petColors = getPetColors(pet.species);
  
  // Mock compatibility data - in a real app, this would come from comparing user profile and pet requirements
  const compatibility = {
    overall: 85, // percentage
    matches: ["Ambiente tranquilo", "Espaço adequado", "Experiência prévia"],
    concerns: ["Precisa de tempo para passeios", "Requer treinamento"],
  };
  
  const handleScheduleVisit = () => {
    toast.success("Visita agendada com sucesso!", {
      description: "A ONG entrará em contato para confirmar a data e horário."
    });
  };

  return (
    <div 
      className="absolute inset-0 bg-black/80 backdrop-blur-sm p-6 overflow-auto animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        className="absolute top-4 right-4 text-white/80 hover:text-white"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>
      
      <div className="text-white h-full overflow-auto pt-8 pb-24">
        <h2 className="text-2xl font-bold flex items-center">
          {pet.name}
          <Badge className={`ml-3 ${petColors.badge} border-none`}>
            {pet.species === 'dog' ? 'Cachorro' : 'Gato'}
          </Badge>
        </h2>
        <p className="text-white/70 mt-1">{pet.breed}</p>
        
        <div className="mt-6 flex items-center space-x-6">
          <div className="flex items-center">
            <Calendar className={`mr-2 ${petColors.icon}`} />
            <span>{pet.age}</span>
          </div>
          <div className="flex items-center">
            <User className={`mr-2 ${petColors.icon}`} />
            <span>{pet.gender === 'male' ? 'Macho' : 'Fêmea'}</span>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Sobre</h3>
          <p className="text-white/90 leading-relaxed">{pet.description}</p>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Características</h3>
          <div className="flex flex-wrap gap-2">
            {pet.traits.map((trait, index) => (
              <Badge key={index} className={`${petColors.badge} text-white border-none`}>
                {trait}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">
            Compatibilidade
            <span className="ml-2 text-base bg-pet-primary text-pet-secondary py-1 px-3 rounded-full">
              {compatibility.overall}%
            </span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-lg flex items-center text-pet-primary">
                <Check className="h-5 w-5 mr-2" /> Pontos positivos
              </h4>
              <ul className="mt-2 pl-7 space-y-1 list-disc">
                {compatibility.matches.map((match, index) => (
                  <li key={index}>{match}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg flex items-center text-amber-400">
                <AlertCircle className="h-5 w-5 mr-2" /> Pontos de atenção
              </h4>
              <ul className="mt-2 pl-7 space-y-1 list-disc">
                {compatibility.concerns.map((concern, index) => (
                  <li key={index}>{concern}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Abrigo</h3>
          <p className="text-white/90">{pet.shelter}</p>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="container mx-auto flex justify-center gap-3">
            <Button 
              className="bg-pet-primary hover:bg-pet-primary-dark text-pet-secondary font-medium"
              onClick={handleScheduleVisit}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Agendar Visita
            </Button>
            
            <Button 
              className="bg-[#D946EF] hover:bg-[#C935DE] text-white"
              onClick={() => toast.success("Interesse registrado!")}
            >
              <Heart className="h-5 w-5 mr-2" />
              Tenho Interesse
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetailsView;
