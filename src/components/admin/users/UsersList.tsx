import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { FilterType, User } from './types';
import UserFilterDropdown from './UserFilterDropdown';
import UserFilterBadges from './UserFilterBadges';
import UserSimpleView from './UserSimpleView';
import UserDetailedView from './UserDetailedView';
import { queryUsers } from '@/services/userQueryService';

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
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
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Iniciando busca de usuários com a função dedicada...');
        const data = await queryUsers();
        console.log('Usuários retornados:', data);
        if (data && data.length > 0) {
          setUsers(data);
          console.log('Detalhes do primeiro usuário:', data[0]);
        } else {
          console.warn('Nenhum usuário encontrado ou array vazio retornado');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Erro ao carregar usuários. Por favor, tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    let count = 0;
    if (filters.housingType.length > 0) count++;
    if (filters.hadPetsBefore !== null) count++;
    if (filters.hasAllergies !== null) count++;
    if (filters.hasChildren !== null) count++;
    if (filters.city.length > 0) count++;
    if (filters.neighborhood.length > 0) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const cityOptions = Array.from(new Set(users
    .map(user => user.address?.city || '')
    .filter(Boolean)));
  
  const neighborhoodOptions = Array.from(new Set(users
    .map(user => user.address?.neighborhood || '')
    .filter(Boolean)));

  console.log('Opções de cidades disponíveis:', cityOptions);
  console.log('Opções de bairros disponíveis:', neighborhoodOptions);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.address?.neighborhood && user.address.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.address?.city && user.address.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.address?.state && user.address.state.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filters.housingType.length > 0 && !filters.housingType.includes(user.housingType)) {
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  const updateFilter = (
    key: keyof FilterType, 
    value: string[] | boolean | null
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div>
            <CardTitle className="text-xl">Lista de Usuários Cadastrados</CardTitle>
            <CardDescription>Gerencie e visualize os usuários cadastrados no sistema</CardDescription>
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
                onChange={(e) => handleSearch(e.target.value)}
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
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 mb-2 text-red-500" />
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum usuário encontrado no banco de dados.</p>
            <p className="text-sm mt-2">Verifique se existem usuários cadastrados ou se você tem permissão para visualizá-los.</p>
          </div>
        ) : (
          <>
            {viewMode === 'simple' ? (
              <UserSimpleView users={paginatedUsers} formatDate={formatDate} />
            ) : (
              <UserDetailedView users={paginatedUsers} formatDate={formatDate} />
            )}
            
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-4">
              Exibindo {paginatedUsers.length} de {filteredUsers.length} usuários cadastrados 
              {users.length > filteredUsers.length ? ` (total: ${users.length})` : ''}.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;
