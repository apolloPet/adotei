import FilterPanel from "@/components/browse/FilterPanel";
import PetBrowser from "@/components/browse/PetBrowser";
import { usePetBrowse } from "@/hooks/use-pet-browse";
import { useEffect, useMemo, useState } from "react";
import { fetchPets } from "@/services/petService";
import { fetchMyAnimalIdsWithInterests, recordPetMatch } from "@/services/adoptionService";
import { toast } from "@/hooks/use-sonner";
import { useAuth } from "@/hooks/auth";
import { getProfile } from "@/services/auth";
import { UserProfile } from "@/types/user";
import { filterPetsForUser } from "@/utils/petMatchFilter";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  buildExtendedFromLegacyProfile,
  computeCompatibilityForPet,
  loadCompatibilityProfileWithCache,
} from "@/services/compatibilityService";
import { loadExtendedProfile } from "@/utils/adopterProfileStorage";

const Browse = () => {
  const {
    pets,
    filters,
    isLoading,
    handleFilterChange,
    applyFilters,
    resetFilters,
    handleSwipe,
    setPets,
    setIsLoading,
  } = usePetBrowse();

  const { user, isAdmin, isVolunteer } = useAuth();
  const navigate = useNavigate();
  const userId = !isAdmin && !isVolunteer ? (user?.id ?? null) : null;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [warnings, setWarnings] = useState<{ petId: string; message: string }[]>([]);
  const [interestedPetIds, setInterestedPetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isVolunteer) {
      toast.error("Voluntários de ONG não podem acessar Encontrar Pets.");
      navigate("/admin", { replace: true });
    }
  }, [isVolunteer, navigate]);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await getProfile();
        setProfile(p);
      } catch {
        setProfile(null);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user || isVolunteer || isAdmin) {
      setInterestedPetIds(new Set());
      return;
    }

    (async () => {
      try {
        const animalIds = await fetchMyAnimalIdsWithInterests();
        setInterestedPetIds(new Set(animalIds));
      } catch (error) {
        console.error("Error fetching my interests:", error);
      }
    })();
  }, [user, isVolunteer, isAdmin]);

  useEffect(() => {
    const loadPets = async () => {
      setIsLoading(true);
      try {
        let petsData = await fetchPets({
          species: filters.species,
          size: filters.size,
          gender: filters.gender,
        });
        petsData = petsData.filter((p) => {
          const age = parseInt(p.age) || 0;
          return age >= filters.ageRange[0] && age <= filters.ageRange[1];
        });

        const result = filterPetsForUser(petsData, profile);
        const authUserRaw = localStorage.getItem('authUser');
        const authUserId = authUserRaw ? (JSON.parse(authUserRaw) as { id?: string }).id : undefined;
        const localExtended = loadExtendedProfile(authUserId);
        const compatibilityProfile = await loadCompatibilityProfileWithCache(
          profile?.extended ?? localExtended ?? buildExtendedFromLegacyProfile(profile) ?? undefined,
          profile,
        );
        const petsWithCompatibility = await Promise.all(
          result.pets.map(async (pet) => {
            const compatibility = await computeCompatibilityForPet(pet, compatibilityProfile);
            return {
              ...pet,
              compatibilityScore: compatibility.scorePercent,
            };
          }),
        );
        setPets(petsWithCompatibility);
        setWarnings(result.warnings);
      } catch (error) {
        console.error("Error fetching pets:", error);
        toast.error("Erro ao carregar os animais");
      } finally {
        setIsLoading(false);
      }
    };

    loadPets();
  }, [filters, profile, setIsLoading, setPets]);

  const warningMap = useMemo(() => {
    const m = new Map<string, string>();
    warnings.forEach((w) => m.set(w.petId, w.message));
    return m;
  }, [warnings]);

  const petsWithInterestStatus = useMemo(
    () =>
      pets.map((pet) => ({
        ...pet,
        hasRegisteredInterest: interestedPetIds.has(pet.id),
      })),
    [pets, interestedPetIds],
  );

  const handlePetSwipe = async (direction: string, id: string) => {
    if (!userId) {
      toast.error("Você precisa estar logado para interagir com um animal");
      return;
    }

    try {
      if (direction === "right") {
        if (interestedPetIds.has(id)) {
          handleSwipe(direction, id);
          return;
        }
        await recordPetMatch(id, userId, "liked");
        setInterestedPetIds((prev) => new Set(prev).add(id));
      } else if (direction === "save") {
        await recordPetMatch(id, userId, "saved");
        setInterestedPetIds((prev) => new Set(prev).add(id));
      }
      handleSwipe(direction, id);
    } catch (error) {
      console.error("Error handling pet swipe:", error);
      toast.error("Erro ao processar a interação com o animal");
    }
  };

  return (
    <div className="fixed inset-x-0 top-14 sm:top-16 bottom-0 overflow-hidden bg-muted/30 md:bg-background">
      <main className="h-full w-full overflow-hidden">
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute top-2 right-2 z-30">
            <FilterPanel
              filters={filters}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
            />
          </div>

          <>
            {petsWithInterestStatus[0] && warningMap.has(petsWithInterestStatus[0].id) && (
              <div className="absolute top-2 left-4 right-20 z-20 rounded-md border border-amber-300 bg-amber-50/95 dark:bg-amber-950/80 p-2 text-xs text-amber-900 dark:text-amber-200 flex gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{warningMap.get(petsWithInterestStatus[0].id)}</span>
              </div>
            )}
            <PetBrowser pets={petsWithInterestStatus} onSwipe={handlePetSwipe} onReset={resetFilters} />
          </>
        </div>
      </main>
    </div>
  );
};

export default Browse;
