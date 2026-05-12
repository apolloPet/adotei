import { MapPin, Sparkles, Clock, Syringe, Scissors, Heart, Star } from 'lucide-react';
import { Pet, PetInfo } from '@/types/pets';

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
  

  const seed = hash(pet.id || pet.name);
  const compatibility = 70 + (seed % 30); // 70-99
  const waitingDays = 30 + (seed % 300);
  const traits = (pet as Pet).traits || [];
  const personality = traits[0] || (seed % 2 === 0 ? 'Dócil' : 'Brincalhão');
  const isVaccinated = true;
  const isNeutered = seed % 3 !== 0;
  const isSpecial = (pet as Pet).specialNeeds || (pet as Pet).healthIssues;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-16 pb-16 text-white z-10">
      {/* Top row: compact compatibility + waiting */}
      <div className="flex items-center gap-2 mb-2 text-[11px]">
        <span className="inline-flex items-center gap-1 bg-primary/90 backdrop-blur-sm rounded-full px-2 py-0.5 font-semibold">
          <Sparkles className="h-3 w-3" />
          {compatibility}%
        </span>
        <span className="inline-flex items-center gap-1 text-white/75">
          <Clock className="h-3 w-3" />
          {waitingDays}d
        </span>
      </div>

      {/* Name + location */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-1.5 leading-tight">
          {pet.name}
          <span className="text-base">{petSpecies === 'dog' ? '🐶' : petSpecies === 'cat' ? '🐱' : '🐾'}</span>
        </h2>
        <div className="flex items-center gap-1 mt-0.5 text-xs text-white/80">
          <MapPin className="h-3 w-3" />
          <span>{pet.location}</span>
        </div>
      </div>

      {/* Single compact info row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
        <span className="bg-white/15 backdrop-blur-sm rounded-full px-2 py-0.5">
          {isPet ? (pet as Pet).age : `${(pet as PetInfo).age}a`}
        </span>
        <span className="bg-white/15 backdrop-blur-sm rounded-full px-2 py-0.5">
          {pet.gender === 'male' ? '♂' : '♀'}
        </span>
        <span className="bg-white/15 backdrop-blur-sm rounded-full px-2 py-0.5">
          {pet.size === 'small' ? 'P' : pet.size === 'medium' ? 'M' : 'G'}
        </span>
        <span className="bg-white/15 backdrop-blur-sm rounded-full px-2 py-0.5">
          {personality}
        </span>
        {isVaccinated && (
          <span className="inline-flex items-center gap-0.5 bg-primary/30 border border-primary/40 rounded-full px-1.5 py-0.5" title="Vacinado">
            <Syringe className="h-3 w-3" />
          </span>
        )}
        {isNeutered && (
          <span className="inline-flex items-center gap-0.5 bg-white/15 border border-white/20 rounded-full px-1.5 py-0.5" title="Castrado">
            <Scissors className="h-3 w-3" />
          </span>
        )}
        {isSpecial && (
          <span className="inline-flex items-center gap-0.5 bg-accent/30 border border-accent/40 rounded-full px-1.5 py-0.5" title="Especial">
            <Star className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );
};

export default PetInfoOverlay;
