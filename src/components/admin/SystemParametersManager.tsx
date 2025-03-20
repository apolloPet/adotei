
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-sonner";
import { RefreshCw, Edit, Save, Dog, Cat, Utensils } from "lucide-react";
import { getSystemParameters, updateSystemParameter, createSystemParameter } from '@/services/adminService';
import { Textarea } from "@/components/ui/textarea";

// Parameter type
interface SystemParameter {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string | null;
}

const SystemParametersManager = () => {
  const [parameters, setParameters] = useState<SystemParameter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isFoodCostDialogOpen, setIsFoodCostDialogOpen] = useState(false);
  const [newFoodCost, setNewFoodCost] = useState({
    animalType: 'dog',
    animalSize: 'small',
    brandType: 'basic',
    costPerKg: '15'
  });
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<string, { value: string, description: string }>>({});

  // Fetch parameters on component mount
  useEffect(() => {
    fetchParameters();
  }, []);

  // Extract unique categories when parameters change
  useEffect(() => {
    if (parameters.length > 0) {
      const uniqueCategories = [...new Set(parameters.map(param => param.category))];
      setCategories(uniqueCategories);
      
      // Set active category if not already set
      if (!activeCategory && uniqueCategories.length > 0) {
        setActiveCategory(uniqueCategories[0]);
      }
    }
  }, [parameters, activeCategory]);

  const fetchParameters = async () => {
    try {
      setIsLoading(true);
      const params = await getSystemParameters();
      setParameters(params);
    } catch (error) {
      console.error('Error fetching system parameters:', error);
      toast.error('Erro ao carregar parâmetros do sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleFoodCostChange = (name: string, value: string) => {
    setNewFoodCost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFoodCost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      const costPerKg = parseFloat(newFoodCost.costPerKg);
      if (isNaN(costPerKg) || costPerKg <= 0) {
        toast.error('Custo por kg deve ser um número positivo');
        return;
      }

      // Create a structured key for food cost
      const key = `food_${newFoodCost.animalType}_${newFoodCost.animalSize}_${newFoodCost.brandType}`;
      
      // Create description
      const animalTypeDisplay = newFoodCost.animalType === 'dog' ? 'Cachorro' : 
                               newFoodCost.animalType === 'cat' ? 'Gato' : 'Outro';
      const animalSizeDisplay = newFoodCost.animalSize === 'small' ? 'Pequeno' : 
                               newFoodCost.animalSize === 'medium' ? 'Médio' : 'Grande';
      const brandTypeDisplay = newFoodCost.brandType === 'basic' ? 'Básica' : 
                              newFoodCost.brandType === 'premium' ? 'Premium' : 'Especial';
      
      const description = `Custo de ração ${brandTypeDisplay} para ${animalTypeDisplay} de porte ${animalSizeDisplay}`;

      await createSystemParameter(
        'food_costs',
        key,
        costPerKg,
        description
      );

      // Reset form and refresh parameters
      setNewFoodCost({
        animalType: 'dog',
        animalSize: 'small',
        brandType: 'basic',
        costPerKg: '15'
      });
      setIsFoodCostDialogOpen(false);
      fetchParameters();

      toast.success('Parâmetro de ração adicionado com sucesso');
    } catch (error) {
      console.error('Error adding food cost parameter:', error);
      toast.error('Erro ao adicionar parâmetro de ração');
    }
  };

  const toggleEditMode = (id: string, param: SystemParameter) => {
    setEditMode(prev => ({
      ...prev,
      [id]: !prev[id]
    }));

    // Initialize edit values
    if (!editValues[id]) {
      let valueString = typeof param.value === 'object' 
        ? JSON.stringify(param.value) 
        : String(param.value);
      
      setEditValues(prev => ({
        ...prev,
        [id]: {
          value: valueString,
          description: param.description || ''
        }
      }));
    }
  };

  const handleEditChange = (id: string, field: 'value' | 'description', value: string) => {
    setEditValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const saveParameterChanges = async (id: string) => {
    try {
      const { value: valueString, description } = editValues[id];
      
      // Try to parse as JSON if it looks like JSON
      let parsedValue: any = valueString;
      if (valueString.trim().startsWith('{') || valueString.trim().startsWith('[')) {
        try {
          parsedValue = JSON.parse(valueString);
        } catch (e) {
          toast.error('Valor JSON inválido');
          return;
        }
      }

      await updateSystemParameter(id, parsedValue, description);
      
      // Update local parameters and exit edit mode
      setParameters(prev => 
        prev.map(param => 
          param.id === id 
            ? { ...param, value: parsedValue, description } 
            : param
        )
      );
      
      setEditMode(prev => ({
        ...prev,
        [id]: false
      }));

      toast.success('Parâmetro atualizado com sucesso');
    } catch (error) {
      console.error('Error updating parameter:', error);
      toast.error('Erro ao atualizar parâmetro');
    }
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Get parameters for the active category
  const filteredParameters = activeCategory
    ? parameters.filter(param => param.category === activeCategory)
    : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Parâmetros do Sistema</CardTitle>
          <CardDescription>Gerencie os parâmetros e configurações do sistema</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchParameters}
            title="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Dialog open={isFoodCostDialogOpen} onOpenChange={setIsFoodCostDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Custos de Ração
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar Custo de Ração</DialogTitle>
                <DialogDescription>
                  Adicione parâmetros de custo de ração para diferentes tipos e tamanhos de animais.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddFoodCost} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="animalType">Tipo de Animal</Label>
                  <Select
                    value={newFoodCost.animalType}
                    onValueChange={(value) => handleFoodCostChange('animalType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de animal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Cachorro</SelectItem>
                      <SelectItem value="cat">Gato</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="animalSize">Porte do Animal</Label>
                  <Select
                    value={newFoodCost.animalSize}
                    onValueChange={(value) => handleFoodCostChange('animalSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o porte do animal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brandType">Tipo de Ração</Label>
                  <Select
                    value={newFoodCost.brandType}
                    onValueChange={(value) => handleFoodCostChange('brandType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de ração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básica</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="special">Especial (Medicinal)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="costPerKg">Custo por Kg (R$)</Label>
                  <Input
                    id="costPerKg"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newFoodCost.costPerKg}
                    onChange={(e) => handleFoodCostChange('costPerKg', e.target.value)}
                    placeholder="Custo por Kg"
                  />
                </div>
                
                <DialogFooter className="pt-4">
                  <Button type="submit">Adicionar Parâmetro de Ração</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : parameters.length > 0 ? (
          <>
            <Tabs 
              value={activeCategory || undefined} 
              onValueChange={handleCategoryChange}
              className="w-full"
            >
              <TabsList className="w-full mb-6 flex flex-wrap">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="capitalize">
                    {category === 'food_costs' ? (
                      <div className="flex items-center gap-1">
                        <Utensils className="h-4 w-4" />
                        <span>Custos de Ração</span>
                      </div>
                    ) : (
                      category
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map(category => (
                <TabsContent key={category} value={category}>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/4">Chave</TableHead>
                          <TableHead className="w-1/2">Valor</TableHead>
                          <TableHead className="w-1/4">Descrição</TableHead>
                          <TableHead className="w-24">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParameters.map((param) => (
                          <TableRow key={param.id}>
                            <TableCell className="font-medium">{param.key}</TableCell>
                            <TableCell>
                              {editMode[param.id] ? (
                                <Textarea 
                                  value={editValues[param.id]?.value || ''}
                                  onChange={(e) => handleEditChange(param.id, 'value', e.target.value)}
                                  rows={3}
                                  className="font-mono text-sm"
                                />
                              ) : (
                                <pre className="whitespace-pre-wrap font-mono text-sm">
                                  {formatValue(param.value)}
                                </pre>
                              )}
                            </TableCell>
                            <TableCell>
                              {editMode[param.id] ? (
                                <Textarea 
                                  value={editValues[param.id]?.description || ''}
                                  onChange={(e) => handleEditChange(param.id, 'description', e.target.value)}
                                  rows={2}
                                />
                              ) : (
                                param.description || <span className="text-muted-foreground italic">Sem descrição</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editMode[param.id] ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => saveParameterChanges(param.id)}
                                  className="text-green-600"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleEditMode(param.id, param)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum parâmetro configurado.</p>
            <p className="text-sm mt-1">Configure os parâmetros do sistema usando o botão "Custos de Ração".</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemParametersManager;
