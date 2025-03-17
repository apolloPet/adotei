
import { useState, useEffect } from 'react';
import { Pet } from "@/components/pet/types";
import { fetchPets, recordPetMatch } from '@/services/petService';
import { getCurrentUser } from '@/services/authService';

interface FilterOptions {
  species: string;
  gender: string;
  size: string;
  ageRange: number[];
}

export const usePetBrowse = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    species: 'all',
    gender: 'all',
    size: 'all',
    ageRange: [0, 15],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load pets on initial render
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    setIsLoading(true);
    
    try {
      const petsData = await fetchPets();
      setPets(petsData);
    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = async () => {
    setIsLoading(true);
    
    try {
      const filteredPets = await fetchPets(filters);
      setPets(filteredPets);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = async () => {
    setFilters({
      species: 'all',
      gender: 'all',
      size: 'all',
      ageRange: [0, 15],
    });
    
    loadPets();
  };

  const handleSwipe = async (direction: string, petId: string) => {
    console.log(`Swiped ${direction} on pet ${petId}`);
    
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        console.error('User not logged in');
        return;
      }
      
      await recordPetMatch(
        petId, 
        user.id, 
        direction === 'right' ? 'liked' : 'disliked'
      );
      
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  return {
    pets,
    filters,
    isLoading,
    handleFilterChange,
    applyFilters,
    resetFilters,
    handleSwipe
  };
};
