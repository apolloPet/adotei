
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-sonner";
import NutritionInfo from './simulator/NutritionInfo';
import HealthInfo from './simulator/HealthInfo';
import SpecialNeeds from './simulator/SpecialNeeds';
import ResultsDisplay from './simulator/ResultsDisplay';
import { AnimalCostFormData, CostResults } from './simulator/types';
import { calculateCosts, saveCostSimulation } from './simulator/costCalculations';
import { supabase } from '@/lib/supabase';

interface CostSimulatorProps {
  onSimulationComplete?: () => void;
  animalId?: string;
}

const CostSimulator = ({ onSimulationComplete, animalId }: CostSimulatorProps) => {
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState<AnimalCostFormData>({
    animalType: 'dog',
    animalSize: 'medium',
    ageYears: 2,
    ageMonths: 0,
    activityLevel: 'moderate',
    foodType: 'basic',
    foodQuantity: 10,
    groomingFrequency: 'monthly',
    healthConditions: [],
    specialCareNeeds: [],
    isSterilized: false,
    notes: ''
  });
  
  const [results, setResults] = useState<CostResults | null>(null);
  const [simulationDone, setSimulationDone] = useState(false);
  
  const handleSimulation = () => {
    const calculatedResults = calculateCosts(formData);
    setResults(calculatedResults);
    setSimulationDone(true);
    
    // Call onSimulationComplete if provided
    if (onSimulationComplete) {
      onSimulationComplete();
    }
    
    // If animalId is provided, save the simulation to the database
    if (animalId) {
      saveSimulation(calculatedResults);
    }
  };
  
  const saveSimulation = async (results: CostResults) => {
    try {
      // Prepare data for saving
      const simData = {
        ...formData,
        monthlyTotal: results.monthlyTotal,
        yearlyTotal: results.yearlyTotal,
        lifetimeTotal: results.lifetimeTotal,
        monthlyCosts: results.monthlyCosts,
        details: results.details
      };
      
      // Convert to a JSON-serializable object
      const serializableData = JSON.parse(JSON.stringify(simData));
      
      // Save to database
      const { data, error } = await supabase
        .from('cost_simulations')
        .insert({
          animal_type: formData.animalType,
          animal_size: formData.animalSize,
          age_months: formData.ageYears * 12 + formData.ageMonths,
          food_type: formData.foodType,
          health_conditions: formData.healthConditions,
          special_care_needs: formData.specialCareNeeds,
          estimated_monthly_cost: results.monthlyTotal,
          estimated_yearly_cost: results.yearlyTotal,
          estimated_lifetime_cost: results.lifetimeTotal,
          results_json: serializableData
        });
      
      if (error) {
        console.error('Error saving simulation:', error);
        toast.error('Erro ao salvar simulação');
      } else {
        toast.success('Simulação salva com sucesso!');
      }
    } catch (err) {
      console.error('Error saving simulation:', err);
      toast.error('Erro ao salvar simulação');
    }
  };
  
  return (
    <div className="space-y-6">
      {!simulationDone ? (
        <div className="space-y-6">
          {formStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas do Animal</CardTitle>
                <CardDescription>Forneça os detalhes básicos para a simulação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Animal</Label>
                    <Select 
                      value={formData.animalType} 
                      onValueChange={(value) => setFormData({...formData, animalType: value as 'dog' | 'cat' | 'other'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Cachorro</SelectItem>
                        <SelectItem value="cat">Gato</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Porte</Label>
                    <Select 
                      value={formData.animalSize} 
                      onValueChange={(value) => setFormData({...formData, animalSize: value as 'small' | 'medium' | 'large'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeno</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="large">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Idade (Anos)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={formData.ageYears}
                      onChange={(e) => setFormData({...formData, ageYears: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Idade (Meses)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="11"
                      value={formData.ageMonths}
                      onChange={(e) => setFormData({...formData, ageMonths: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nível de Atividade</Label>
                    <Select 
                      value={formData.activityLevel} 
                      onValueChange={(value) => setFormData({...formData, activityLevel: value as 'low' | 'moderate' | 'high'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixo</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Frequência de Banho/Tosa</Label>
                    <Select 
                      value={formData.groomingFrequency} 
                      onValueChange={(value) => setFormData({...formData, groomingFrequency: value as 'rarely' | 'monthly' | 'biweekly'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rarely">Raramente (a cada 3 meses)</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => setFormStep(2)}>
                  Próximo: Nutrição
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {formStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Alimentação</CardTitle>
                <CardDescription>Informe detalhes sobre a alimentação do animal</CardDescription>
              </CardHeader>
              <CardContent>
                <NutritionInfo 
                  foodType={formData.foodType}
                  foodQuantity={formData.foodQuantity}
                  onFoodTypeChange={(value) => setFormData({...formData, foodType: value as 'basic' | 'premium' | 'special'})}
                  onFoodQuantityChange={(values) => setFormData({...formData, foodQuantity: values[0]})}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setFormStep(1)}>
                  Voltar
                </Button>
                <Button onClick={() => setFormStep(3)}>
                  Próximo: Saúde
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {formStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Saúde</CardTitle>
                <CardDescription>Forneça informações sobre a saúde do animal</CardDescription>
              </CardHeader>
              <CardContent>
                <HealthInfo 
                  healthConditions={formData.healthConditions}
                  isSterilized={formData.isSterilized}
                  onConditionAdd={(condition) => 
                    setFormData({...formData, healthConditions: [...formData.healthConditions, condition]})}
                  onConditionRemove={(condition) => 
                    setFormData({...formData, healthConditions: formData.healthConditions.filter(c => c !== condition)})}
                  onSterilizedChange={(value) => setFormData({...formData, isSterilized: value})}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setFormStep(2)}>
                  Voltar
                </Button>
                <Button onClick={() => setFormStep(4)}>
                  Próximo: Necessidades Especiais
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {formStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Necessidades Especiais</CardTitle>
                <CardDescription>Adicione necessidades especiais ou observações</CardDescription>
              </CardHeader>
              <CardContent>
                <SpecialNeeds 
                  specialCareNeeds={formData.specialCareNeeds}
                  notes={formData.notes}
                  onSpecialNeedsAdd={(need) => 
                    setFormData({...formData, specialCareNeeds: [...formData.specialCareNeeds, need]})}
                  onSpecialNeedsRemove={(need) => 
                    setFormData({...formData, specialCareNeeds: formData.specialCareNeeds.filter(n => n !== need)})}
                  onNotesChange={(notes) => setFormData({...formData, notes})}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setFormStep(3)}>
                  Voltar
                </Button>
                <Button onClick={handleSimulation}>
                  Calcular Custos
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Simulação</CardTitle>
            <CardDescription>
              Custos estimados para {formData.animalType === 'dog' ? 'um cachorro' : 
                                     formData.animalType === 'cat' ? 'um gato' : 
                                     'um animal'} de porte {
                                       formData.animalSize === 'small' ? 'pequeno' : 
                                       formData.animalSize === 'medium' ? 'médio' : 
                                       'grande'
                                     }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results && <ResultsDisplay results={results} />}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setSimulationDone(false);
                setFormStep(1);
              }}
            >
              Nova Simulação
            </Button>
            
            {!animalId && (
              <Button 
                onClick={() => {
                  if (results) {
                    saveSimulation(results);
                  }
                }}
              >
                Salvar Simulação
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CostSimulator;
