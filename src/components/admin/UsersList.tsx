
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-sonner";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  address: {
    cep: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
  };
  housingType: 'apartment' | 'house' | 'other';
  hasChildren: boolean;
  childrenAges?: string;
  hadPetsBefore: boolean;
  hasAllergies: boolean;
  allergiesDescription?: string;
  workSchedule: string;
}

// Enhanced mock data for users
const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@exemplo.com",
    phone: "(11) 99999-1234",
    registrationDate: "2023-09-15",
    address: {
      cep: "01234-567",
      street: "Rua das Flores",
      number: "123",
      neighborhood: "Jardim Primavera",
      city: "São Paulo"
    },
    housingType: "apartment",
    hasChildren: true,
    childrenAges: "5, 8 anos",
    hadPetsBefore: true,
    hasAllergies: false,
    workSchedule: "Home office"
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@exemplo.com",
    phone: "(11) 98765-4321",
    registrationDate: "2023-10-05",
    address: {
      cep: "02345-678",
      street: "Avenida Central",
      number: "456",
      neighborhood: "Centro",
      city: "São Paulo"
    },
    housingType: "house",
    hasChildren: false,
    hadPetsBefore: false,
    hasAllergies: true,
    allergiesDescription: "Alergia a pelos de gato",
    workSchedule: "8h-18h fora de casa"
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@exemplo.com",
    phone: "(21) 99876-5432",
    registrationDate: "2023-10-10",
    address: {
      cep: "03456-789",
      street: "Rua dos Pinheiros",
      number: "789",
      neighborhood: "Pinheiros",
      city: "Rio de Janeiro"
    },
    housingType: "house",
    hasChildren: true,
    childrenAges: "3, 7, 12 anos",
    hadPetsBefore: true,
    hasAllergies: false,
    workSchedule: "Trabalho remoto"
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@exemplo.com",
    phone: "(31) 97654-3210",
    registrationDate: "2023-11-20",
    address: {
      cep: "04567-890",
      street: "Alameda Santos",
      number: "101",
      neighborhood: "Jardim América",
      city: "Belo Horizonte"
    },
    housingType: "apartment",
    hasChildren: false,
    hadPetsBefore: true,
    hasAllergies: true,
    allergiesDescription: "Alergia leve a penas",
    workSchedule: "Meio período (14h-18h)"
  },
  {
    id: "5",
    name: "Carlos Souza",
    email: "carlos.souza@exemplo.com",
    phone: "(41) 96543-2109",
    registrationDate: "2023-12-01",
    address: {
      cep: "05678-901",
      street: "Rua Ipiranga",
      number: "202",
      neighborhood: "Ipiranga",
      city: "Curitiba"
    },
    housingType: "other",
    hasChildren: true,
    childrenAges: "1 ano",
    hadPetsBefore: false,
    hasAllergies: false,
    workSchedule: "Horário flexível"
  }
];

type FilterType = {
  housingType: string[];
  hadPetsBefore: boolean | null;
  hasAllergies: boolean | null;
  hasChildren: boolean | null;
  city: string[];
  neighborhood: string[];
};

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
    value: string | boolean | null | string[]
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

  const resetFilters = () => {
    setFilters({
      housingType: [],
      hadPetsBefore: null,
      hasAllergies: null,
      hasChildren: null,
      city: [],
      neighborhood: []
    });
    
    toast.success("Filtros removidos", {
      description: "Todos os filtros foram redefinidos."
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">Tipo de moradia</div>
                <DropdownMenuCheckboxItem
                  checked={filters.housingType.includes('apartment')}
                  onCheckedChange={() => toggleArrayFilter('housingType', 'apartment')}
                >
                  Apartamento
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.housingType.includes('house')}
                  onCheckedChange={() => toggleArrayFilter('housingType', 'house')}
                >
                  Casa
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.housingType.includes('other')}
                  onCheckedChange={() => toggleArrayFilter('housingType', 'other')}
                >
                  Outro
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                
                <div className="px-2 py-1.5 text-sm font-semibold">Experiência com animais</div>
                <DropdownMenuCheckboxItem
                  checked={filters.hadPetsBefore === true}
                  onCheckedChange={() => updateFilter('hadPetsBefore', filters.hadPetsBefore === true ? null : true)}
                >
                  Já teve animais
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.hadPetsBefore === false}
                  onCheckedChange={() => updateFilter('hadPetsBefore', filters.hadPetsBefore === false ? null : false)}
                >
                  Nunca teve animais
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                
                <div className="px-2 py-1.5 text-sm font-semibold">Alergias</div>
                <DropdownMenuCheckboxItem
                  checked={filters.hasAllergies === true}
                  onCheckedChange={() => updateFilter('hasAllergies', filters.hasAllergies === true ? null : true)}
                >
                  Possui alergias
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.hasAllergies === false}
                  onCheckedChange={() => updateFilter('hasAllergies', filters.hasAllergies === false ? null : false)}
                >
                  Não possui alergias
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                
                <div className="px-2 py-1.5 text-sm font-semibold">Crianças</div>
                <DropdownMenuCheckboxItem
                  checked={filters.hasChildren === true}
                  onCheckedChange={() => updateFilter('hasChildren', filters.hasChildren === true ? null : true)}
                >
                  Tem crianças
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.hasChildren === false}
                  onCheckedChange={() => updateFilter('hasChildren', filters.hasChildren === false ? null : false)}
                >
                  Não tem crianças
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                
                <div className="px-2 py-1.5 text-sm font-semibold">Cidade</div>
                {cityOptions.map(city => (
                  <DropdownMenuCheckboxItem
                    key={city}
                    checked={filters.city.includes(city)}
                    onCheckedChange={() => toggleArrayFilter('city', city)}
                  >
                    {city}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <div className="px-2 py-1.5 text-sm font-semibold">Bairro</div>
                {neighborhoodOptions.map(neighborhood => (
                  <DropdownMenuCheckboxItem
                    key={neighborhood}
                    checked={filters.neighborhood.includes(neighborhood)}
                    onCheckedChange={() => toggleArrayFilter('neighborhood', neighborhood)}
                  >
                    {neighborhood}
                  </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <div className="p-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={resetFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpar filtros
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {filters.housingType.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                Moradia: {filters.housingType.map(type => 
                  type === 'apartment' ? 'Apartamento' : 
                  type === 'house' ? 'Casa' : 'Outro'
                ).join(', ')}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('housingType', [])} 
                />
              </Badge>
            )}
            {filters.hadPetsBefore !== null && (
              <Badge variant="outline" className="flex items-center gap-1">
                {filters.hadPetsBefore ? 'Já teve animais' : 'Nunca teve animais'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('hadPetsBefore', null)} 
                />
              </Badge>
            )}
            {filters.hasAllergies !== null && (
              <Badge variant="outline" className="flex items-center gap-1">
                {filters.hasAllergies ? 'Possui alergias' : 'Não possui alergias'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('hasAllergies', null)} 
                />
              </Badge>
            )}
            {filters.hasChildren !== null && (
              <Badge variant="outline" className="flex items-center gap-1">
                {filters.hasChildren ? 'Tem crianças' : 'Não tem crianças'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('hasChildren', null)} 
                />
              </Badge>
            )}
            {filters.city.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                Cidade: {filters.city.join(', ')}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('city', [])} 
                />
              </Badge>
            )}
            {filters.neighborhood.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                Bairro: {filters.neighborhood.join(', ')}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('neighborhood', [])} 
                />
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado com os critérios de busca.
              </div>
            ) : viewMode === 'simple' ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cidade/Bairro</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.address.city}/{user.address.neighborhood}
                        </TableCell>
                        <TableCell>{formatDate(user.registrationDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <div className="p-4 bg-muted/30">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium">{user.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          Cadastro: {formatDate(user.registrationDate)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {user.email} • {user.phone}
                      </div>
                    </div>
                    <CardContent className="p-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Endereço</h4>
                          <p className="text-sm">
                            {user.address.street}, {user.address.number}<br />
                            {user.address.neighborhood}, {user.address.city}<br />
                            CEP: {user.address.cep}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Moradia</h4>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Tipo:</span> {
                              user.housingType === 'apartment' ? 'Apartamento' : 
                              user.housingType === 'house' ? 'Casa' : 'Outro'
                            }<br />
                            <span className="text-muted-foreground">Crianças:</span> {
                              user.hasChildren ? `Sim (${user.childrenAges})` : 'Não'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Experiência & Saúde</h4>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Já teve animais:</span> {
                              user.hadPetsBefore ? 'Sim' : 'Não'
                            }<br />
                            <span className="text-muted-foreground">Alergias:</span> {
                              user.hasAllergies ? `Sim (${user.allergiesDescription})` : 'Não'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Rotina</h4>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Trabalho:</span> {user.workSchedule}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
