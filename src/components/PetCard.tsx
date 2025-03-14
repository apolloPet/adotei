
import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Heart, X, Info, MapPin, Calendar, Paw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-sonner";

export interface Pet {
  id: string;
  name: string;
  images: string[];
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  breed: string;
  species: 'dog' | 'cat';
  description: string;
  location: string;
  shelter: string;
  traits: string[];
}

interface PetCardProps {
  pet: Pet;
  onSwipe: (direction: 'left' | 'right', petId: string) => void;
}

const PetCard = ({ pet, onSwipe }: PetCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle image cycling
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % pet.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + pet.images.length) % pet.images.length);
  };

  // Handle swipe gesture
  const handleDragStart = () => {
    // Reset drag start position
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const swipeDirection = info.offset.x > threshold ? 'right' : info.offset.x < -threshold ? 'left' : null;
    
    if (swipeDirection) {
      onSwipe(swipeDirection, pet.id);
      
      if (swipeDirection === 'right') {
        toast(`Você deu match com ${pet.name}! 💖`, {
          description: "A ONG será notificada do seu interesse.",
        });
      }
    }
  };

  // Handle manual like/dislike
  const handleLike = () => {
    onSwipe('right', pet.id);
    toast(`Você deu match com ${pet.name}! 💖`, {
      description: "A ONG será notificada do seu interesse.",
    });
  };

  const handleDislike = () => {
    onSwipe('left', pet.id);
  };

  // Colors based on the Tech Animal palette
  const petColors = {
    badge: pet.species === 'dog' ? 'bg-[#9b87f5]' : 'bg-[#D946EF]',
    icon: pet.species === 'dog' ? 'text-[#9b87f5]' : 'text-[#D946EF]',
    accent: pet.species === 'dog' ? 'bg-[#9b87f5]/10' : 'bg-[#D946EF]/10',
  };

  return (
    <div className="w-full max-w-md mx-auto h-[28rem] relative">
      <motion.div
        ref={cardRef}
        className="absolute inset-0 bg-white dark:bg-card rounded-3xl overflow-hidden shadow-xl will-change-transform"
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02 }}
      >
        {/* Image carousel */}
        <div className="relative w-full h-full">
          <img 
            src={pet.images[currentImageIndex]} 
            alt={pet.name}
            className="w-full h-full object-cover"
          />
          
          {/* Image navigation dots */}
          {pet.images.length > 1 && (
            <div className="absolute top-4 left-0 right-0 flex justify-center space-x-1">
              {pet.images.map((_, index) => (
                <div 
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          )}
          
          {/* Image navigation areas */}
          <div className="absolute inset-y-0 left-0 w-1/3" onClick={(e) => { e.stopPropagation(); prevImage(); }} />
          <div className="absolute inset-y-0 right-0 w-1/3" onClick={(e) => { e.stopPropagation(); nextImage(); }} />
          
          {/* Pet info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  {pet.name}
                  <Paw className={`ml-2 h-5 w-5 ${petColors.icon}`} />
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
            
            <button 
              className="mt-3 text-sm underline underline-offset-2 opacity-90 hover:opacity-100 transition-opacity flex items-center"
              onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
            >
              {showDetails ? 'Ocultar detalhes' : 'Ver mais detalhes'}
            </button>
          </div>
          
          {/* Expanded details */}
          {showDetails && (
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm p-6 overflow-auto animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 text-white/80 hover:text-white"
                onClick={() => setShowDetails(false)}
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-white h-full overflow-auto pt-8">
                <h2 className="text-2xl font-bold flex items-center">
                  {pet.name}
                  <Paw className={`ml-2 h-5 w-5 ${petColors.icon}`} />
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
          )}
        </div>
      </motion.div>
      
      {/* Action buttons */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
        <button
          className="w-14 h-14 rounded-full bg-white text-red-500 shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95"
          onClick={handleDislike}
          aria-label="Passar"
        >
          <X className="h-7 w-7" />
        </button>
        
        <button
          className="w-14 h-14 rounded-full bg-white text-[#D946EF] shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95"
          onClick={handleLike}
          aria-label="Curtir"
        >
          <Heart className="h-7 w-7 fill-[#D946EF]" />
        </button>
        
        <button
          className="w-14 h-14 rounded-full bg-white text-[#9b87f5] shadow-lg flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95"
          onClick={() => setShowDetails(!showDetails)}
          aria-label="Informações"
        >
          <Info className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
};

export default PetCard;
