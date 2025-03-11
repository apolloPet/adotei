
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-sonner";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockUsers } from './mockData';
import { FilterType, User } from './types';
import UserFilterDropdown from './UserFilterDropdown';
import UserFilterBadges from './UserFilterBadges';
import UserSimpleView from './UserSimpleView';
import UserDetailedView from './UserDetailedView';

const UsersList = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterType>({
    housingType: [],
    hadPetsBefore: null,
    hasAllergies: null,
    hasChildren: null,
    city: [],
    neighborhood: []
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');

  // Unique values for select filters
  const cityOptions = Array.from(new Set(users.map(user => user.address.city)));
  const neighborhoodOptions = Array.from(new Set(users.map(user => user.address.neighborhood)));

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.housingType.length > 0) count++;
    if (filters.hadPetsBefore !== null) count++;
    if (filters.hasAllergies !== null) count++;
    if (filters.hasChildren !== null) count++;
    if (filters.city.length > 0) count++;
    if (filters.neighborhood.length > 0) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const filteredUsers = users.filter(user => {
    // Search term filter
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.address.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Housing type filter
    if (filters.housingType.length > 0 && !filters.housingType.includes(user.housingType)) {
      return false;
    }
    
    // Had pets before filter
    if (filters.hadPetsBefore !== null && user.hadPetsBefore !== filters.hadPetsBefore) {
      return false;
    }
    
    // Has allergies filter
    if (filters.hasAllergies !== null && user.hasAllergies !== filters.hasAllergies) {
      return false;
    }
    
    // Has children filter
    if (filters.hasChildren !== null && user.hasChildren !== filters.hasChildren) {
      return false;
    }
    
    // City filter
    if (filters.city.length > 0 && !filters.city.includes(user.address.city)) {
      return false;
    }
    
    // Neighborhood filter
    if (filters.neighborhood.length > 0 && !filters.neighborhood.includes(user.address.neighborhood)) {
      return false;
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const updateFilter = (
    key: keyof FilterType, 
    value: string[] | boolean | null
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key: keyof FilterType, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [key]: currentArray.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [key]: [...currentArray, value]
        };
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div>
            <CardTitle className="text-xl">Lista de Usuários Cadastrados</CardTitle>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Select
              value={viewMode}
              onValueChange={(value: 'simple' | 'detailed') => setViewMode(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Resumida</SelectItem>
                <SelectItem value="detailed">Detalhada</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <UserFilterDropdown 
              filters={filters}
              updateFilter={updateFilter}
              toggleArrayFilter={toggleArrayFilter}
              cityOptions={cityOptions}
              neighborhoodOptions={neighborhoodOptions}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>
        
        <UserFilterBadges filters={filters} updateFilter={updateFilter} />
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {viewMode === 'simple' ? (
              <UserSimpleView users={filteredUsers} formatDate={formatDate} />
            ) : (
              <UserDetailedView users={filteredUsers} formatDate={formatDate} />
            )}
            
            <p className="text-xs text-muted-foreground mt-4">
              Exibindo {filteredUsers.length} de {users.length} usuários cadastrados.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;
