
import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Search, Edit, Trash2, Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getAnimals, deleteAnimal, getAnimalById, updateAnimal, updateAnimalStatus, Animal, AnimalStatus } from '@/services/animalService';
import { fetchAnimalIdsWithInterests } from '@/services/adoptionService';
import { toast } from '@/hooks/use-sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import AnimalDetailView from './AnimalDetailView';
import AnimalEditForm from './AnimalEditForm';
import { useAuth } from '@/hooks/auth';
import AnimalInterestedDialog from './AnimalInterestedDialog';
import AuthedImage from '@/components/ui/authed-image';

type PageSizeOption = '10' | '20' | 'all';
const FALLBACK_STATUS: AnimalStatus = 'DISPONIVEL';

const statusLabel: Record<AnimalStatus, string> = {
  DISPONIVEL: 'Disponível',
  OCULTO: 'Oculto',
  ADOTADO: 'Adotado',
};

const statusBadgeClass: Record<AnimalStatus, string> = {
  DISPONIVEL: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  OCULTO: 'bg-slate-100 text-slate-800 border-slate-200',
  ADOTADO: 'bg-blue-100 text-blue-800 border-blue-200',
};

const AnimalList = () => {
  const { isVolunteer, isAdmin } = useAuth();
  const showInterestedAction = isVolunteer && !isAdmin;
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [onlyWithInterests, setOnlyWithInterests] = useState(false);
  const [pageSize, setPageSize] = useState<PageSizeOption>('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
  const [viewAnimal, setViewAnimal] = useState<{ open: boolean, animal: Animal | null }>({ open: false, animal: null });
  const [editAnimal, setEditAnimal] = useState<{ open: boolean, animal: Animal | null }>({ open: false, animal: null });
  const [interestedAnimal, setInterestedAnimal] = useState<{ open: boolean, animal: Animal | null }>({
    open: false,
    animal: null,
  });
  
  const navigate = useNavigate();

  const { paginatedAnimals, totalPages, effectivePage, rangeStart, rangeEnd } = useMemo(() => {
    const total = animals.length;
    const perPage = pageSize === 'all' ? total || 1 : Number(pageSize);
    const pages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(currentPage, pages);
    const start = pageSize === 'all' ? 0 : (page - 1) * perPage;
    const end = pageSize === 'all' ? total : Math.min(start + perPage, total);

    return {
      paginatedAnimals: animals.slice(start, end),
      totalPages: pages,
      effectivePage: page,
      rangeStart: total === 0 ? 0 : start + 1,
      rangeEnd: end,
    };
  }, [animals, pageSize, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    console.log('AnimalList component mounted - fetching animals');
    fetchAnimals();
  }, []);

  const fetchAnimals = async (interestFilter = onlyWithInterests) => {
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
      let data = await getAnimals(filters);

      if (interestFilter) {
        const animalIdsWithInterests = new Set(await fetchAnimalIdsWithInterests());
        data = data.filter((animal) => animalIdsWithInterests.has(animal.id));
      }

      console.log("Animals fetched:", data);
      setAnimals(data);
      setCurrentPage(1);
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
      const remaining = animals.filter((animal) => animal.id !== id);
      setAnimals(remaining);
      const perPage = pageSize === 'all' ? remaining.length || 1 : Number(pageSize);
      const pages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(remaining.length / perPage));
      if (currentPage > pages) {
        setCurrentPage(pages);
      }
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

  const handleSaveEdit = async (updatedAnimal: Animal): Promise<Animal | null> => {
    try {
      const result = await updateAnimal(updatedAnimal.id, updatedAnimal);
      if (result) {
        setAnimals((current) =>
          current.map((animal) => (animal.id === updatedAnimal.id ? result : animal)),
        );
        return result;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar animal:', error);
      toast.error('Não foi possível atualizar os dados do animal.');
      throw error;
    }
  };

  const handleEditComplete = (updatedAnimal: Animal) => {
    setAnimals((current) => current.map((animal) => (animal.id === updatedAnimal.id ? updatedAnimal : animal)));
    setEditAnimal({ open: false, animal: null });
    toast.success('Animal atualizado com sucesso!');
  };

  const handleStatusChange = async (id: string, status: AnimalStatus) => {
    try {
      const updated = await updateAnimalStatus(id, status);
      if (!updated) return;
      setAnimals((current) => current.map((animal) => (animal.id === id ? updated : animal)));
      toast.success(`Status atualizado para ${statusLabel[status].toLowerCase()}.`);
    } catch (error) {
      console.error('Erro ao atualizar status do animal:', error);
      toast.error('Não foi possível atualizar o status.');
    }
  };

  const handleSearch = () => {
    fetchAnimals();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterSize('all');
    setOnlyWithInterests(false);
    setPageSize('10');
    setCurrentPage(1);
    fetchAnimals(false);
  };

  const handlePageSizeChange = (value: PageSizeOption) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 min-w-0">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
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
            
            <div className="flex items-center gap-2 rounded-md border px-3 py-2">
              <Checkbox
                id="only-with-interests"
                checked={onlyWithInterests}
                onCheckedChange={(checked) => {
                  const value = checked === true;
                  setOnlyWithInterests(value);
                  void fetchAnimals(value);
                }}
              />
              <Label htmlFor="only-with-interests" className="text-sm font-normal cursor-pointer leading-snug">
                Apenas animais com interesses
              </Label>
            </div>

            <Button onClick={resetFilters} variant="outline">
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-3 sm:p-6 pt-4 sm:pt-6">
          {loading ? (
            <div className="flex justify-center p-4">Carregando animais...</div>
          ) : animals.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhum animal encontrado.</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || filterType !== 'all' || filterSize !== 'all' || onlyWithInterests
                  ? 'Tente limpar os filtros para ver mais resultados.'
                  : 'Cadastre um novo animal clicando na aba "Cadastrar Animal".'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="md:hidden space-y-3">
                {paginatedAnimals.map((animal) => (
                  <div key={animal.id} className="border rounded-lg p-3 bg-card">
                    <div className="flex gap-3">
                      {animal.fotoPrincipal && (
                        <AuthedImage
                          src={animal.fotoPrincipal}
                          alt={animal.nome}
                          className="w-16 h-16 rounded-md object-cover border shrink-0"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{animal.nome}</p>
                        <Badge className={`mt-1 ${statusBadgeClass[(animal.status ?? FALLBACK_STATUS)]}`}>
                          {statusLabel[(animal.status ?? FALLBACK_STATUS)]}
                        </Badge>
                        <p className="text-xs text-muted-foreground capitalize">
                          {animal.tipo === 'cachorro' ? 'Cachorro' : animal.tipo === 'gato' ? 'Gato' : 'Outro'}
                          {' · '}
                          {animal.porte === 'pequeno' ? 'Pequeno' : animal.porte === 'medio' ? 'Médio' : 'Grande'}
                          {' · '}
                          {animal.sexo === 'macho' ? 'Macho' : 'Fêmea'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {animal.idade} {animal.idade === 1 ? 'ano' : 'anos'}
                        </p>
                      </div>
                    </div>
                    {animal.descricao && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{animal.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Select
                        value={animal.status ?? FALLBACK_STATUS}
                        onValueChange={(value) => void handleStatusChange(animal.id, value as AnimalStatus)}
                      >
                        <SelectTrigger className="h-9 min-w-[9rem]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                          <SelectItem value="OCULTO">Oculto</SelectItem>
                          <SelectItem value="ADOTADO">Adotado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="flex-1 min-w-[5rem]" onClick={() => handleViewAnimal(animal.id)}>
                        <Eye className="h-4 w-4 mr-1" /> Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 min-w-[5rem]" onClick={() => handleEditAnimal(animal.id)}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      {showInterestedAction && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 min-w-[5rem]"
                          onClick={() => setInterestedAnimal({ open: true, animal })}
                        >
                          <Users className="h-4 w-4 mr-1" /> Interessados
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => setConfirmDelete({ open: true, id: animal.id })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Porte</TableHead>
                      <TableHead>Sexo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAnimals.map((animal) => (
                      <TableRow key={animal.id}>
                        <TableCell className="font-medium">{animal.nome}</TableCell>
                        <TableCell>
                          {animal.tipo === 'cachorro' ? 'Cachorro' : 
                           animal.tipo === 'gato' ? 'Gato' : 'Outro'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{animal.descricao || '-'}</TableCell>
                        <TableCell>{animal.idade} {animal.idade === 1 ? 'ano' : 'anos'}</TableCell>
                        <TableCell>
                          {animal.porte === 'pequeno' ? 'Pequeno' : 
                           animal.porte === 'medio' ? 'Médio' : 'Grande'}
                        </TableCell>
                        <TableCell>
                          {animal.sexo === 'macho' ? 'Macho' : 'Fêmea'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={statusBadgeClass[(animal.status ?? FALLBACK_STATUS)]}>
                              {statusLabel[(animal.status ?? FALLBACK_STATUS)]}
                            </Badge>
                            <Select
                              value={animal.status ?? FALLBACK_STATUS}
                              onValueChange={(value) => void handleStatusChange(animal.id, value as AnimalStatus)}
                            >
                              <SelectTrigger className="h-8 w-[9rem]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                                <SelectItem value="OCULTO">Oculto</SelectItem>
                                <SelectItem value="ADOTADO">Adotado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" title="Ver detalhes" onClick={() => handleViewAnimal(animal.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" title="Editar" onClick={() => handleEditAnimal(animal.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {showInterestedAction && (
                              <Button
                                variant="secondary"
                                size="icon"
                                title="Ver interessados"
                                onClick={() => setInterestedAnimal({ open: true, animal })}
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="destructive" size="icon" title="Excluir" onClick={() => setConfirmDelete({ open: true, id: animal.id })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Exibindo {rangeStart}–{rangeEnd} de {animals.length}{' '}
                  {animals.length === 1 ? 'animal' : 'animais'}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="page-size" className="text-sm text-muted-foreground whitespace-nowrap">
                      Itens por página
                    </Label>
                    <Select value={pageSize} onValueChange={(v) => handlePageSizeChange(v as PageSizeOption)}>
                      <SelectTrigger id="page-size" className="w-[7.5rem]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="all">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={effectivePage <= 1 || pageSize === 'all'}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[7rem] text-center">
                      Página {effectivePage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={effectivePage >= totalPages || pageSize === 'all'}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete.open} onOpenChange={(open) => setConfirmDelete({ ...confirmDelete, open })}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg">
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-3 sm:p-6">
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

      <AnimalInterestedDialog
        open={interestedAnimal.open}
        animal={interestedAnimal.animal}
        onOpenChange={(open) => setInterestedAnimal((current) => ({ ...current, open }))}
      />

      {/* Edit Animal Dialog */}
      {editAnimal.animal && (
        <Dialog open={editAnimal.open} onOpenChange={(open) => setEditAnimal({ ...editAnimal, open })}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-3 sm:p-6">
            <DialogHeader>
              <DialogTitle>Editar Animal</DialogTitle>
            </DialogHeader>
            <AnimalEditForm 
              animal={editAnimal.animal}
              onSave={handleSaveEdit}
              onComplete={handleEditComplete}
              onCancel={() => setEditAnimal({ open: false, animal: null })}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AnimalList;
