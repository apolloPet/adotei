
import { MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Pet, getPetColors } from './types';

interface PetInfoOverlayProps {
  pet: Pet;
  setShowDetails: (show: boolean) => void;
}

const PetInfoOverlay = ({ pet, setShowDetails }: PetInfoOverlayProps) => {
  const petColors = getPetColors(pet.species);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            {pet.name}
            <span className={`ml-2 h-5 w-5 ${petColors.icon}`}>🐾</span>
          </h2>
          <div className="flex items-center space-x-2 mt-1">
            <MapPin className="h-4 w-4 opacity-70" />
            <span className="text-sm opacity-90">{pet.location}</span>
          </div>
        </div>
        <Badge className={`${petColors.badge} text-white border-none px-3 py-1`}>
          {pet.species === 'dog' ? 'Cachorro' : 'Gato'}
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-3">
        <Badge variant="secondary" className={`${petColors.accent} border-none text-foreground font-medium`}>
          {pet.age}
        </Badge>
        <Badge variant="secondary" className={`${petColors.accent} border-none text-foreground font-medium`}>
          {pet.gender === 'male' ? 'Macho' : 'Fêmea'}
        </Badge>
        <Badge variant="secondary" className={`${petColors.accent} border-none text-foreground font-medium`}>
          {pet.size === 'small' ? 'Pequeno' : pet.size === 'medium' ? 'Médio' : 'Grande'}
        </Badge>
      </div>
    </div>
  );
};

export default PetInfoOverlay;
