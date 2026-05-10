import { MapPin, Sparkles, Clock, Syringe, Scissors, Heart, Star } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Pet, PetInfo, getPetColors } from '@/types/pets';

interface PetInfoOverlayProps {
  pet: Pet | PetInfo;
  setShowDetails: (show: boolean) => void;
}

// Deterministic pseudo-random from id so values stay stable per pet
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const PetInfoOverlay = ({ pet }: PetInfoOverlayProps) => {
  const isPet = 'species' in pet;
  const petSpecies = isPet ? (pet as Pet).species : (pet as PetInfo).type === 'dog' ? 'dog' : 'cat';
  const petColors = getPetColors(petSpecies as 'dog' | 'cat');

  const seed = hash(pet.id || pet.name);
  const compatibility = 70 + (seed % 30); // 70-99
  const waitingDays = 30 + (seed % 300);
  const traits = (pet as Pet).traits || [];
  const personality = traits[0] || (seed % 2 === 0 ? 'Dócil' : 'Brincalhão');
  const isVaccinated = true;
  const isNeutered = seed % 3 !== 0;
  const isSpecial = (pet as Pet).specialNeeds || (pet as Pet).healthIssues;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 text-white z-10 pb-20">
      {/* Compatibility chip */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5 bg-primary/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-bold">{compatibility}% compatível</span>
        </div>
        <div className="inline-flex items-center gap-1 text-xs text-white/80 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
          <Clock className="h-3 w-3" />
          <span>{waitingDays} dias esperando</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2 leading-tight">
            {pet.name}
            <span className="text-xl">{petSpecies === 'dog' ? '🐶' : petSpecies === 'cat' ? '🐱' : '🐾'}</span>
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-sm opacity-90">
            <MapPin className="h-3.5 w-3.5 opacity-70" />
            <span>{pet.location}</span>
          </div>
        </div>
      </div>

      {/* Quick info pills */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <Badge variant="secondary" className={`${petColors.accent} border-none text-foreground font-medium text-xs`}>
          {isPet ? (pet as Pet).age : `${(pet as PetInfo).age}a`}
        </Badge>
        <Badge variant="secondary" className={`${petColors.accent} border-none text-foreground font-medium text-xs`}>
          {pet.gender === 'male' ? '♂ Macho' : '♀ Fêmea'}
        </Badge>
        <Badge variant="secondary" className={`${petColors.accent} border-none text-foreground font-medium text-xs`}>
          {pet.size === 'small' ? 'Pequeno' : pet.size === 'medium' ? 'Médio' : 'Grande'}
        </Badge>
        <Badge variant="secondary" className="bg-white/15 backdrop-blur-sm border-none text-white font-medium text-xs">
          {personality}
        </Badge>
      </div>

      {/* Trust seals */}
      <div className="flex flex-wrap gap-1.5 mt-2">
        {isVaccinated && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-primary/20 text-primary-foreground border border-primary/40 rounded-full px-2 py-0.5">
            <Syringe className="h-3 w-3" /> Vacinado
          </span>
        )}
        {isNeutered && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-white/15 border border-white/20 rounded-full px-2 py-0.5">
            <Scissors className="h-3 w-3" /> Castrado
          </span>
        )}
        {personality.toLowerCase().includes('dóc') || personality.toLowerCase().includes('carinh') ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-white/15 border border-white/20 rounded-full px-2 py-0.5">
            <Heart className="h-3 w-3 fill-current" /> Dócil
          </span>
        ) : null}
        {isSpecial && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-accent/30 border border-accent/40 rounded-full px-2 py-0.5">
            <Star className="h-3 w-3" /> Especial
          </span>
        )}
      </div>
    </div>
  );
};

export default PetInfoOverlay;
