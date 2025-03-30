
import FilterPanel from "@/components/browse/FilterPanel";
import PetBrowser from "@/components/browse/PetBrowser";
import { usePetBrowse } from "@/hooks/use-pet-browse";
import { useEffect, useState } from "react";
import { fetchAnimalsForBrowse } from "@/services/animalBrowseService";
import { recordPetMatch } from "@/services/adoptionService";
import { toast } from "@/hooks/use-sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/auth";

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
  
  const [userId, setUserId] = useState<string | null>(null);
  const { user, isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    // Obter o usuário atual
    const getCurrentUser = async () => {
      // Tente obter o ID do usuário do contexto de autenticação
      if (user?.id) {
        setUserId(user.id);
        console.log('ID do usuário atual (contexto):', user.id);
        return;
      }
      
      // Fallback para Supabase API
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      setUserId(supabaseUser?.id || null);
      console.log('ID do usuário atual (supabase):', supabaseUser?.id || 'não autenticado');
      
      // Segundo fallback para localStorage (para usuários de demo)
      if (!supabaseUser?.id) {
        const localEmail = localStorage.getItem("userEmail");
        if (localEmail) {
          setUserId(localEmail);
          console.log('Usando email do localStorage como ID:', localEmail);
        }
      }
    };
    
    getCurrentUser();
  }, [user]);

  useEffect(() => {
    const loadPets = async () => {
      setIsLoading(true);
      try {
        // Usar o novo serviço para buscar animais 
        const petsData = await fetchAnimalsForBrowse(filters);
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
    // Verificar se temos um ID de usuário válido
    const effectiveUserId = userId || (isAdmin ? "admin@petmatch.com" : null);
    
    if (!effectiveUserId) {
      toast.error('Você precisa estar logado para mostrar interesse em um animal');
      return;
    }

    try {
      if (direction === 'right') {
        console.log('Enviando match de pet com ID:', id, 'ID do usuário:', effectiveUserId);
        
        // Mostrar toast de carregamento enquanto processa o match
        toast.loading('Processando seu interesse...', { id: 'match-processing' });
        
        const result = await recordPetMatch(id, effectiveUserId, 'liked');
        
        // Remover toast de carregamento
        toast.dismiss('match-processing');
        
        if (result) {
          toast.success(`Você demonstrou interesse em adotar! 💖`, {
            description: "A ONG será notificada do seu interesse."
          });
        }
      } else if (direction === 'left') {
        await recordPetMatch(id, effectiveUserId, 'disliked');
      }
      
      handleSwipe(direction, id);
    } catch (error) {
      console.error('Error handling pet swipe:', error);
      toast.error('Erro ao processar a interação com o animal');
    }
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
