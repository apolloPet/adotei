import { useState, useCallback } from 'react';
import { PetFilters } from '@/services/petService';
import { Pet } from '@/types/pets';

type Filters = {
  species: 'dog' | 'cat' | 'other' | 'all';
  size: 'small' | 'medium' | 'large' | 'all';
  gender: 'male' | 'female' | 'all';
  ageRange: [number, number];
};

export const usePetBrowse = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [displayedPets, setDisplayedPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    species: 'all',
    size: 'all',
    gender: 'all',
    ageRange: [0, 15],
  });

  const handleFilterChange = useCallback((name: string, value: unknown) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    // Filters will be applied at the API level in fetchPets function
    // This function is kept for UI state management
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      species: 'all',
      size: 'all',
      gender: 'all',
      ageRange: [0, 15],
    });
  }, []);

  const handleSwipe = useCallback((direction: string, id: string) => {
    setDisplayedPets(prev => prev.filter(pet => pet.id !== id));
  }, []);

  return {
    pets: displayedPets,
    filters,
    isLoading,
    handleFilterChange,
    applyFilters,
    resetFilters,
    handleSwipe,
    setPets: useCallback((newPets: Pet[]) => {
      setPets(newPets);
      setDisplayedPets(newPets);
    }, []),
    setIsLoading
  };
};
