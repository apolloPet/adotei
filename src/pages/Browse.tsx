
import FilterPanel from "@/components/browse/FilterPanel";
import PetBrowser from "@/components/browse/PetBrowser";
import { usePetBrowse } from "@/hooks/use-pet-browse";

const Browse = () => {
  const {
    pets,
    filters,
    isLoading,
    handleFilterChange,
    applyFilters,
    resetFilters,
    handleSwipe
  } = usePetBrowse();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 pt-32 pb-20">
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
            onSwipe={handleSwipe}
            onReset={resetFilters}
          />
        </div>
      </main>
    </div>
  );
};

export default Browse;
