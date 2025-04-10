
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Edit, Trash2, Eye } from 'lucide-react';
import { getAnimals, deleteAnimal, getAnimalById, updateAnimal, Animal } from '@/services/animalService';
import { toast } from '@/hooks/use-sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import AnimalDetailView from './AnimalDetailView';
import AnimalEditForm from './AnimalEditForm';

const AnimalList = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
  const [viewAnimal, setViewAnimal] = useState<{ open: boolean, animal: Animal | null }>({ open: false, animal: null });
  const [editAnimal, setEditAnimal] = useState<{ open: boolean, animal: Animal | null }>({ open: false, animal: null });
  
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AnimalList component mounted - fetching animals');
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const filters: { nome?: string; tipo?: string; porte?: string } = {};
      
      if (searchTerm) {
        filters.nome = searchTerm;
      }
      
      if (filterType !== 'all') {
        filters.tipo = filterType;
      }
      
      if (filterSize !== 'all') {
        filters.porte = filterSize;
      }
      
      console.log("Fetching animals with filters:", filters);
      const data = await getAnimals(filters);
      console.log("Animals fetched:", data);
      setAnimals(data);
    } catch (error) {
      console.error('Erro ao buscar animais:', error);
      toast.error('Não foi possível carregar a lista de animais.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnimal = async (id: string) => {
    try {
      await deleteAnimal(id);
      setAnimals(animals.filter(animal => animal.id !== id));
      toast.success('Animal removido com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir animal:', error);
      toast.error('Não foi possível excluir o animal.');
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  const handleViewAnimal = async (id: string) => {
    try {
      const animal = await getAnimalById(id);
      if (animal) {
        setViewAnimal({ open: true, animal });
      } else {
        toast.error('Animal não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do animal:', error);
      toast.error('Não foi possível carregar os detalhes do animal.');
    }
  };

  const handleEditAnimal = async (id: string) => {
    try {
      const animal = await getAnimalById(id);
      if (animal) {
        setEditAnimal({ open: true, animal });
      } else {
        toast.error('Animal não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do animal para edição:', error);
      toast.error('Não foi possível carregar os dados do animal para edição.');
    }
  };

  const handleSaveEdit = async (updatedAnimal: Animal) => {
    try {
      const result = await updateAnimal(updatedAnimal.id, updatedAnimal);
      if (result) {
        // Update the animals list with the updated animal
        setAnimals(animals.map(animal => 
          animal.id === updatedAnimal.id ? updatedAnimal : animal
        ));
        setEditAnimal({ open: false, animal: null });
        toast.success('Animal atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar animal:', error);
      toast.error('Não foi possível atualizar os dados do animal.');
    }
  };

  const handleSearch = () => {
    fetchAnimals();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterSize('all');
    fetchAnimals();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por nome"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} size="icon" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="cachorro">Cachorro</SelectItem>
                <SelectItem value="gato">Gato</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSize} onValueChange={setFilterSize}>
              <SelectTrigger>
                <SelectValue placeholder="Porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os portes</SelectItem>
                <SelectItem value="pequeno">Pequeno</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="grande">Grande</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={resetFilters} variant="outline">
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center p-4">Carregando animais...</div>
          ) : animals.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhum animal encontrado.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || filterType !== 'all' || filterSize !== 'all'
                  ? 'Tente limpar os filtros para ver mais resultados.'
                  : 'Cadastre um novo animal clicando na aba "Cadastrar Animal".'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Porte</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animals.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">{animal.nome}</TableCell>
                    <TableCell>
                      {animal.tipo === 'cachorro' ? 'Cachorro' : 
                       animal.tipo === 'gato' ? 'Gato' : 'Outro'}
                    </TableCell>
                    <TableCell>{animal.descricao || '-'}</TableCell>
                    <TableCell>{animal.idade} {animal.idade === 1 ? 'ano' : 'anos'}</TableCell>
                    <TableCell>
                      {animal.porte === 'pequeno' ? 'Pequeno' : 
                       animal.porte === 'medio' ? 'Médio' : 'Grande'}
                    </TableCell>
                    <TableCell>
                      {animal.sexo === 'macho' ? 'Macho' : 'Fêmea'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title="Ver detalhes"
                          onClick={() => handleViewAnimal(animal.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          title="Editar"
                          onClick={() => handleEditAnimal(animal.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          title="Excluir"
                          onClick={() => setConfirmDelete({ open: true, id: animal.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete.open} onOpenChange={(open) => setConfirmDelete({ ...confirmDelete, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir este animal? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete({ open: false, id: null })}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDelete.id && handleDeleteAnimal(confirmDelete.id)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Animal Details Dialog */}
      {viewAnimal.animal && (
        <Dialog open={viewAnimal.open} onOpenChange={(open) => setViewAnimal({ ...viewAnimal, open })}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Animal</DialogTitle>
            </DialogHeader>
            <AnimalDetailView 
              animal={viewAnimal.animal} 
              onClose={() => setViewAnimal({ open: false, animal: null })}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Animal Dialog */}
      {editAnimal.animal && (
        <Dialog open={editAnimal.open} onOpenChange={(open) => setEditAnimal({ ...editAnimal, open })}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Animal</DialogTitle>
            </DialogHeader>
            <AnimalEditForm 
              animal={editAnimal.animal}
              onSave={handleSaveEdit}
              onCancel={() => setEditAnimal({ open: false, animal: null })}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AnimalList;
