
import { X, Calendar, Heart, User } from 'lucide-react';
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
      </div>
    </div>
  );
};

export default PetDetailsView;
