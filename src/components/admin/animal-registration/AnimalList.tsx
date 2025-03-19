
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  RefreshCw  
} from "lucide-react";
import { toast } from "@/hooks/use-sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimalFormData } from "./types";

type Animal = {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  gender: 'male' | 'female';
  size: 'small' | 'medium' | 'large';
  status: 'disponível' | 'adotado' | 'em tratamento';
  imageUrl?: string;
  responsibleName?: string;
};

const AnimalList = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    // Simular chamada de API
    setLoading(true);
    setTimeout(() => {
      // Dados de exemplo
      const mockAnimals: Animal[] = [
        { 
          id: '1', 
          name: 'Rex', 
          type: 'dog', 
          breed: 'Labrador', 
          age: '3 anos', 
          gender: 'male', 
          size: 'large', 
          status: 'disponível',
          imageUrl: 'https://placedog.net/200/200',
          responsibleName: 'Maria Silva'
        },
        { 
          id: '2', 
          name: 'Luna', 
          type: 'cat', 
          breed: 'Siamês', 
          age: '2 anos', 
          gender: 'female', 
          size: 'small', 
          status: 'disponível',
          imageUrl: 'https://placekitten.com/200/200',
          responsibleName: 'João Oliveira'
        },
        { 
          id: '3', 
          name: 'Max', 
          type: 'dog', 
          breed: 'Vira-lata', 
          age: '5 anos', 
          gender: 'male', 
          size: 'medium', 
          status: 'adotado',
          imageUrl: 'https://placedog.net/201/201',
          responsibleName: 'Ana Santos'
        },
        { 
          id: '4', 
          name: 'Nina', 
          type: 'cat', 
          breed: 'Persa', 
          age: '1 ano', 
          gender: 'female', 
          size: 'small', 
          status: 'em tratamento',
          imageUrl: 'https://placekitten.com/201/201',
          responsibleName: 'Maria Silva'
        },
        { 
          id: '5', 
          name: 'Thor', 
          type: 'dog', 
          breed: 'Pastor Alemão', 
          age: '4 anos', 
          gender: 'male', 
          size: 'large', 
          status: 'disponível',
          imageUrl: 'https://placedog.net/202/202',
          responsibleName: 'João Oliveira'
        }
      ];
      
      setAnimals(mockAnimals);
      setLoading(false);
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este animal?")) {
      setAnimals(animals.filter(animal => animal.id !== id));
      toast.success("Animal removido com sucesso!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponível':
        return 'bg-green-100 text-green-800';
      case 'adotado':
        return 'bg-blue-100 text-blue-800';
      case 'em tratamento':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeTranslation = (type: string) => {
    switch (type) {
      case 'dog':
        return 'Cachorro';
      case 'cat':
        return 'Gato';
      case 'other':
        return 'Outro';
      default:
        return type;
    }
  };

  const getGenderTranslation = (gender: string) => {
    return gender === 'male' ? 'Macho' : 'Fêmea';
  };

  const getSizeTranslation = (size: string) => {
    switch (size) {
      case 'small':
        return 'Pequeno';
      case 'medium':
        return 'Médio';
      case 'large':
        return 'Grande';
      default:
        return size;
    }
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (animal.responsibleName && animal.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || animal.type === filterType;
    const matchesStatus = filterStatus === 'all' || animal.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Animais Cadastrados</CardTitle>
        <Button size="sm" onClick={() => window.location.href = '#register-animal'}>
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Animal
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <div className="flex-1 flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, raça ou responsável..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="dog">Cachorro</SelectItem>
                <SelectItem value="cat">Gato</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="disponível">Disponível</SelectItem>
                <SelectItem value="adotado">Adotado</SelectItem>
                <SelectItem value="em tratamento">Em tratamento</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={fetchAnimals}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Raça</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Gênero</TableHead>
                <TableHead>Porte</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="flex justify-center">
                      <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Carregando animais...</p>
                  </TableCell>
                </TableRow>
              ) : filteredAnimals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <p className="text-muted-foreground">Nenhum animal encontrado.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnimals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {animal.imageUrl && (
                          <img
                            src={animal.imageUrl}
                            alt={animal.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        {animal.name}
                      </div>
                    </TableCell>
                    <TableCell>{getTypeTranslation(animal.type)}</TableCell>
                    <TableCell>{animal.breed}</TableCell>
                    <TableCell>{animal.age}</TableCell>
                    <TableCell>{getGenderTranslation(animal.gender)}</TableCell>
                    <TableCell>{getSizeTranslation(animal.size)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(animal.status)}>
                        {animal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{animal.responsibleName || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Animal</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              {animal.imageUrl && (
                                <div className="flex justify-center">
                                  <img
                                    src={animal.imageUrl}
                                    alt={animal.name}
                                    className="rounded-md w-40 h-40 object-cover"
                                  />
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium">Nome</h4>
                                  <p>{animal.name}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Tipo</h4>
                                  <p>{getTypeTranslation(animal.type)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Raça</h4>
                                  <p>{animal.breed}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Idade</h4>
                                  <p>{animal.age}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Gênero</h4>
                                  <p>{getGenderTranslation(animal.gender)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Porte</h4>
                                  <p>{getSizeTranslation(animal.size)}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Status</h4>
                                  <Badge variant="outline" className={getStatusColor(animal.status)}>
                                    {animal.status}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">Responsável</h4>
                                  <p>{animal.responsibleName || '-'}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(animal.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalList;
