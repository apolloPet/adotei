
import { X, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Pet, getPetColors } from './types';

interface PetDetailsViewProps {
  pet: Pet;
  onClose: () => void;
}

const PetDetailsView = ({ pet, onClose }: PetDetailsViewProps) => {
  const petColors = getPetColors(pet.species);

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
      
      <div className="text-white h-full overflow-auto pt-8">
        <h2 className="text-2xl font-bold flex items-center">
          {pet.name}
          <span className={`ml-2 h-5 w-5 ${petColors.icon}`}>🐾</span>
        </h2>
        <p className="text-white/70 mt-1">{pet.breed}</p>
        
        <div className="mt-4 flex items-center space-x-2">
          <Calendar className={petColors.icon} />
          <span>{pet.age}</span>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Sobre</h3>
          <p className="text-white/80 leading-relaxed">{pet.description}</p>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Características</h3>
          <div className="flex flex-wrap gap-2">
            {pet.traits.map((trait, index) => (
              <Badge key={index} className={`${petColors.badge} text-white`}>
                {trait}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Abrigo</h3>
          <p className="text-white/80">{pet.shelter}</p>
        </div>
      </div>
    </div>
  );
};

export default PetDetailsView;
