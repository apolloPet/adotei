import { Home, Sparkles, Clock, Syringe, Scissors, Heart, Star } from 'lucide-react';
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
  // Compatibility is computed (no source of truth yet) — falls back to deterministic seed
  const compatibility = 70 + (seed % 30); // 70-99

  const petAsPet = pet as Pet;
  const waitingDays = typeof petAsPet.daysWaiting === 'number'
    ? petAsPet.daysWaiting
    : 30 + (seed % 300);
  const traits = petAsPet.traits || (pet as PetInfo).personality || [];
  const personality = traits[0];
  const isVaccinated = petAsPet.vaccinated ?? true;
  const isNeutered = petAsPet.neutered ?? (seed % 3 !== 0);
  const isSpecial = petAsPet.specialNeeds || petAsPet.healthIssues;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-20 pb-4 text-white z-10">
      {/* Top row: compact compatibility + waiting */}
      <div className="flex items-center gap-2 mb-2 text-sm">
        <span className="inline-flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm rounded-full px-2.5 py-1 font-semibold">
          <Sparkles className="h-4 w-4" />
          {compatibility}%
        </span>
        <span className="inline-flex items-center gap-1.5 text-white/85">
          <Clock className="h-4 w-4" />
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
          <Home className="h-3 w-3" />
          <span>{(pet as Pet).shelter || pet.location}</span>
        </div>
      </div>

      {/* Single compact info row */}
      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-sm">
        <span className="bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
          {isPet ? (pet as Pet).age : `${(pet as PetInfo).age}a`}
        </span>
        <span className="bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
          {pet.gender === 'male' ? '♂' : '♀'}
        </span>
        <span className="bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
          {pet.size === 'small' ? 'P' : pet.size === 'medium' ? 'M' : 'G'}
        </span>
        {personality && (
          <span className="bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 font-medium">
            {personality}
          </span>
        )}
        {isVaccinated && (
          <span className="inline-flex items-center gap-1 bg-primary/30 border border-primary/40 rounded-full px-2 py-1" title="Vacinado">
            <Syringe className="h-4 w-4" />
          </span>
        )}
        {isNeutered && (
          <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 rounded-full px-2 py-1" title="Castrado">
            <Scissors className="h-4 w-4" />
          </span>
        )}
        {isSpecial && (
          <span className="inline-flex items-center gap-1 bg-accent/30 border border-accent/40 rounded-full px-2 py-1" title="Especial">
            <Star className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
};

export default PetInfoOverlay;
