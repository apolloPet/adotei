
import FilterPanel from "@/components/browse/FilterPanel";
import PetBrowser from "@/components/browse/PetBrowser";
import { usePetBrowse } from "@/hooks/use-pet-browse";
import { useEffect } from "react";
import { fetchPets } from "@/services/petService";
import { recordPetMatch } from "@/services/adoptionService";
import { toast } from "@/hooks/use-sonner";

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
    setIsLoading
  } = usePetBrowse();

  useEffect(() => {
    const loadPets = async () => {
      setIsLoading(true);
      try {
        const petsData = await fetchPets(filters);
        setPets(petsData);
      } catch (error) {
        console.error('Error fetching pets:', error);
        toast.error('Erro ao carregar os animais');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPets();
  }, [filters, setIsLoading, setPets]);

  const handlePetSwipe = async (direction: string, id: string) => {
    // Mock user ID for now - in a real app, this would come from auth
    const userId = "mock-user-id";
    
    if (direction === 'right') {
      try {
        await recordPetMatch(id, userId, 'liked');
        toast.success('Match registrado com sucesso!');
      } catch (error) {
        console.error('Error recording match:', error);
        toast.error('Erro ao registrar match');
      }
    } else if (direction === 'left') {
      try {
        await recordPetMatch(id, userId, 'disliked');
      } catch (error) {
        console.error('Error recording dislike:', error);
        toast.error('Erro ao registrar que não houve interesse');
      }
    }
    
    handleSwipe(direction, id);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Encontre seu Match</h1>
            
            <FilterPanel 
              filters={filters}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
            />
          </div>
          
          <PetBrowser 
            pets={pets} 
            onSwipe={handlePetSwipe}
            onReset={resetFilters}
          />
        </div>
      </main>
    </div>
  );
};

export default Browse;
