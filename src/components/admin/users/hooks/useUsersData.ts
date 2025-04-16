
import { useState, useEffect } from 'react';
import { User, FilterType } from '../types';
import { mockUsers } from '../mockData';

const ITEMS_PER_PAGE = 10;

export const useUsersData = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterType>({
    housingType: [],
    hadPetsBefore: null,
    hasAllergies: null,
    hasChildren: null,
    city: [],
    neighborhood: []
  });
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.address?.neighborhood && user.address.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.address?.city && user.address.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filters.housingType.length > 0 && !filters.housingType.includes(user.housingType || '')) {
      return false;
    }
    
    if (filters.hadPetsBefore !== null && user.hadPetsBefore !== filters.hadPetsBefore) {
      return false;
    }
    
    if (filters.hasAllergies !== null && user.hasAllergies !== filters.hasAllergies) {
      return false;
    }
    
    if (filters.hasChildren !== null && user.hasChildren !== filters.hasChildren) {
      return false;
    }
    
    if (filters.city.length > 0 && (!user.address?.city || !filters.city.includes(user.address.city))) {
      return false;
    }
    
    if (filters.neighborhood.length > 0 && (!user.address?.neighborhood || !filters.neighborhood.includes(user.address.neighborhood))) {
      return false;
    }
    
    return true;
  });

  return {
    users,
    isLoading,
    error,
    filteredUsers,
    filters,
    searchTerm,
    viewMode,
    currentPage,
    setFilters,
    setSearchTerm,
    setViewMode,
    setCurrentPage,
  };
};
