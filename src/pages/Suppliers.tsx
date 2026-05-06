
import { useEffect, useState } from 'react';
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Building, Building2, ExternalLink, Phone, Mail, Globe, MapPin, Search, Star, Truck } from 'lucide-react';
import { getSuppliers, Supplier, getAverageRating, rateSupplier } from '@/services/supplierService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const { isAuthenticated } = useAuth();
  
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        const supplierData = await getSuppliers();
        const safeData = Array.isArray(supplierData) ? supplierData : [];
        setSuppliers(safeData);
        setFilteredSuppliers(safeData);
      } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuppliers();
  }, []);
  
  useEffect(() => {
    // Filtrar fornecedores por termo de busca e tipo
    let filtered = suppliers;
    
    if (searchTerm) {
      filtered = filtered.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        supplier.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(supplier => supplier.type === selectedType);
    }
    
    setFilteredSuppliers(filtered);
  }, [searchTerm, selectedType, suppliers]);
  
  const handleOpenRatingDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setRatingDialogOpen(true);
    
    // Verificar se o usuário já avaliou este fornecedor e pré-popular campos
    const userRating = supplier.ratings?.find(r => true); // Na implementação real, usaríamos o ID do usuário atual
    if (userRating) {
      setRatingValue(userRating.rating);
      setRatingComment(userRating.comment || '');
    } else {
      setRatingValue(5);
      setRatingComment('');
    }
  };
  
  const handleSubmitRating = async () => {
    if (!selectedSupplier) return;
    
    setIsSubmittingRating(true);
    try {
      await rateSupplier(selectedSupplier.id, ratingValue, ratingComment);
      
      // Recarregar fornecedores para atualizar avaliações
      const updatedSuppliers = await getSuppliers();
      setSuppliers(updatedSuppliers);
      
      setRatingDialogOpen(false);
    } finally {
      setIsSubmittingRating(false);
    }
  };
  
  // Obter tipos únicos de fornecedores para filtro
  const supplierTypes = Array.from(new Set(suppliers.map(s => s.type)));
  
  if (!isAuthenticated) {
    return (
      <Container className="py-10">
        <div className="max-w-3xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="mb-6">Você precisa estar logado para acessar esta página.</p>
          <Button asChild>
            <Link to="/login">Fazer Login</Link>
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Fornecedores</h1>
            <p className="text-muted-foreground">
              Encontre fornecedores de produtos e serviços para pets.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Buscar fornecedores..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select 
                      value={selectedType} 
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        {supplierTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Tipos de Fornecedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {supplierTypes.map(type => (
                    <Badge 
                      key={type} 
                      variant={selectedType === type ? "default" : "outline"}
                      className="mr-2 mb-2 cursor-pointer"
                      onClick={() => setSelectedType(type === selectedType ? 'all' : type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            {isLoading ? (
              <Card className="w-full p-8">
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              </Card>
            ) : filteredSuppliers.length === 0 ? (
              <Card className="w-full p-8 text-center">
                <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground/60" />
                <h3 className="text-xl font-medium mb-2">Nenhum fornecedor encontrado</h3>
                <p className="text-muted-foreground">
                  Tente ajustar seus filtros ou volte mais tarde.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredSuppliers.map((supplier) => {
                  const averageRating = getAverageRating(supplier.ratings);
                  
                  return (
                    <Card key={supplier.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="outline" className="mb-2">{supplier.type}</Badge>
                            <CardTitle>{supplier.name}</CardTitle>
                          </div>
                          <div className="flex items-center">
                            <Star className={`h-5 w-5 ${averageRating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                            <span className="ml-1 font-medium">
                              {averageRating > 0 ? averageRating : '—'}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {supplier.description && (
                            <p className="text-sm text-muted-foreground">{supplier.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{supplier.phone}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{supplier.email}</span>
                            </div>
                            {supplier.website && (
                              <div className="flex items-center text-sm">
                                <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                  Website
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                              </div>
                            )}
                            {supplier.address && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>{supplier.address}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="pt-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenRatingDialog(supplier)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Avaliar Fornecedor
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Diálogo para avaliação */}
      <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Fornecedor</DialogTitle>
            <DialogDescription>
              Compartilhe sua experiência com {selectedSupplier?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Nota</Label>
              <Select value={ratingValue.toString()} onValueChange={(value) => setRatingValue(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Ruim</SelectItem>
                  <SelectItem value="2">2 - Regular</SelectItem>
                  <SelectItem value="3">3 - Bom</SelectItem>
                  <SelectItem value="4">4 - Muito Bom</SelectItem>
                  <SelectItem value="5">5 - Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Comentário (opcional)</Label>
              <Textarea
                id="comment"
                placeholder="Descreva sua experiência com o fornecedor..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRatingDialogOpen(false)}
              disabled={isSubmittingRating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitRating}
              disabled={isSubmittingRating}
            >
              {isSubmittingRating ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Suppliers;
