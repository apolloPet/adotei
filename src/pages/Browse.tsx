import FilterPanel from "@/components/browse/FilterPanel";
import PetBrowser from "@/components/browse/PetBrowser";
import { usePetBrowse } from "@/hooks/use-pet-browse";
import { useEffect, useMemo, useState } from "react";
import { generateMockPets } from "@/data/mockPets";
import { recordPetMatch } from "@/services/adoptionService";
import { toast } from "@/hooks/use-sonner";
import { useAuth } from "@/hooks/auth";
import { getProfile } from "@/services/auth";
import { UserProfile } from "@/types/user";
import { filterPetsForUser } from "@/utils/petMatchFilter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

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

  const { user, isAdmin } = useAuth();
  const userId = user?.id || (isAdmin ? "admin@petmatch.com" : null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<{ petId: string; message: string }[]>([]);

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
    const loadPets = async () => {
      setIsLoading(true);
      try {
        let petsData = generateMockPets(12);
        if (filters.species !== "all") petsData = petsData.filter((p) => p.species === filters.species);
        if (filters.size !== "all") petsData = petsData.filter((p) => p.size === filters.size);
        if (filters.gender !== "all") petsData = petsData.filter((p) => p.gender === filters.gender);
        petsData = petsData.filter((p) => {
          const age = parseInt(p.age) || 0;
          return age >= filters.ageRange[0] && age <= filters.ageRange[1];
        });

        const result = filterPetsForUser(petsData, profile);
        if (result.blocked) {
          setBlocked(result.blocked.reason);
          setPets([]);
        } else {
          setBlocked(null);
          setPets(result.pets);
          setWarnings(result.warnings);
        }
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

  const handlePetSwipe = async (direction: string, id: string) => {
    if (!userId) {
      toast.error("Você precisa estar logado para interagir com um animal");
      return;
    }

    try {
      if (direction === "right") {
        toast.loading("Processando seu interesse...", { id: "match-processing" });
        await recordPetMatch(id, userId, "liked");
        toast.dismiss("match-processing");
        toast.success("Você demonstrou interesse em adotar! 💖", {
          description: "A ONG será notificada do seu interesse.",
        });
      } else if (direction === "save") {
        await recordPetMatch(id, userId, "saved");
      } else if (direction === "left") {
        await recordPetMatch(id, userId, "disliked");
      }
      handleSwipe(direction, id);
    } catch (error) {
      console.error("Error handling pet swipe:", error);
      toast.error("Erro ao processar a interação com o animal");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold leading-tight">conheça seu novo amigo<br/><span className="text-muted-foreground font-semibold">com o Adotei</span></h1>
            <FilterPanel
              filters={filters}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
            />
          </div>

          {blocked ? (
            <Card className="border-destructive">
              <CardContent className="p-6 flex gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Adoção indisponível</h3>
                  <p className="text-sm text-muted-foreground">{blocked}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {pets[0] && warningMap.has(pets[0].id) && (
                <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-900 dark:text-amber-200 flex gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{warningMap.get(pets[0].id)}</span>
                </div>
              )}
              <PetBrowser pets={pets} onSwipe={handlePetSwipe} onReset={resetFilters} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Browse;
