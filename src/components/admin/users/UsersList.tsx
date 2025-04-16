
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, ShieldAlert, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterType } from './types';
import UserFilterDropdown from './UserFilterDropdown';
import UserFilterBadges from './UserFilterBadges';
import UserSimpleView from './UserSimpleView';
import UserDetailedView from './UserDetailedView';
import UserSearchBar from './UserSearchBar';
import UserViewToggle from './UserViewToggle';
import UserPagination from './UserPagination';
import { queryUsers } from '@/services/userQueryService';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-sonner";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
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
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const checkPermissionsAndLoadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setError('Você precisa estar autenticado para acessar esta página.');
          setShowPermissionDialog(true);
          return;
        }

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .single();

        // Verificação por email (método principal)
        const isMainAdmin = session.user.email === 'admin@petmatch.com';
        const isAdminEmail = isMainAdmin || 
                            (session.user.email || '').includes('@admin') || 
                            (session.user.email || '').includes('@ong');
        
        // Fix the type issue here by properly handling the permissions object
        let hasAdminPermission = isAdminEmail;
        
        // Make sure roleData exists and has permissions before accessing manageAdmins
        if (roleData && roleData.permissions) {
          // Check if permissions is a string (JSON string) and parse it if needed
          const permissions = typeof roleData.permissions === 'string' 
            ? JSON.parse(roleData.permissions) 
            : roleData.permissions;
            
          // Now safely access the manageAdmins property
          hasAdminPermission = hasAdminPermission || permissions?.manageAdmins === true;
        }
        
        console.log('UsersList: Verificação de permissões', { 
          isAdminEmail,
          hasPermission: hasAdminPermission,
          roleData: roleData ? 'encontrado' : 'não encontrado'
        });

        setHasPermission(hasAdminPermission);

        if (!hasAdminPermission) {
          setError('Você não possui permissão para visualizar usuários. Entre em contato com um administrador.');
          setShowPermissionDialog(true);
          
          // Se for admin por email, mas não tem permissão específica, vamos atualizar
          if (isAdminEmail) {
            try {
              if (roleError && roleError.code === 'PGRST116') {
                // Não encontrou registro, vamos criar
                await supabase
                  .from('user_roles')
                  .insert({
                    user_id: session.user.id,
                    role: 'admin',
                    permissions: {
                      manageAnimals: true,
                      approveAdoptions: true,
                      manageSettings: true,
                      manageAdmins: true
                    }
                  });
                
                console.log('UsersList: Registro de admin criado na tabela user_roles');
                toast.success("Permissões de administração atualizadas! Recarregando...");
                
                // Recarregar a página após uma pequena pausa
                setTimeout(() => {
                  window.location.reload();
                }, 1500);
              }
            } catch (e) {
              console.error('Erro ao atualizar permissões:', e);
            }
          }
          
          return;
        }

        const data = await queryUsers();
        if (data) {
          setUsers(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Erro ao carregar usuários. Por favor, tente novamente mais tarde.');
        setShowPermissionDialog(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissionsAndLoadUsers();
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
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
            <div>
              <CardTitle className="text-xl">Lista de Usuários Cadastrados</CardTitle>
              <CardDescription>Gerencie e visualize os usuários cadastrados no sistema</CardDescription>
            </div>
            
            {hasPermission && (
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                <UserViewToggle 
                  viewMode={viewMode} 
                  setViewMode={setViewMode}
                />
                
                <UserSearchBar 
                  searchTerm={searchTerm}
                  handleSearch={handleSearch}
                />
                
                <UserFilterDropdown 
                  filters={filters}
                  updateFilter={updateFilter}
                  toggleArrayFilter={toggleArrayFilter}
                  cityOptions={cityOptions}
                  neighborhoodOptions={neighborhoodOptions}
                  activeFiltersCount={activeFiltersCount}
                />
              </div>
            )}
          </div>
          
          {hasPermission && (
            <UserFilterBadges filters={filters} updateFilter={updateFilter} />
          )}
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
              {!hasPermission && (
                <div className="mt-4 flex items-center gap-2 text-primary">
                  <ShieldAlert className="h-5 w-5" />
                  <span>Acesso restrito a administradores</span>
                </div>
              )}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum usuário encontrado no banco de dados.</p>
              <p className="text-sm mt-2">Verifique se existem usuários cadastrados.</p>
            </div>
          ) : (
            hasPermission && (
              <>
                {viewMode === 'simple' ? (
                  <UserSimpleView users={paginatedUsers} formatDate={formatDate} />
                ) : (
                  <UserDetailedView users={paginatedUsers} formatDate={formatDate} />
                )}
                
                {totalPages > 1 && (
                  <UserPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                  />
                )}
                
                <p className="text-xs text-muted-foreground mt-4">
                  Exibindo {paginatedUsers.length} de {filteredUsers.length} usuários cadastrados 
                  {users.length > filteredUsers.length ? ` (total: ${users.length})` : ''}.
                </p>
              </>
            )
          )}
        </CardContent>
      </Card>

      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Acesso Restrito
            </DialogTitle>
            <DialogDescription>
              {error || "Verificando suas permissões..."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <UserCog className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center mb-4">
              Para acessar a lista de usuários, você precisa ter permissões de administrador com acesso ao gerenciamento de usuários.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="default" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersList;
