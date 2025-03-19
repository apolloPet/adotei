
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CostSimulatorFormData, CostResults } from './simulator/types';
import { toast } from "@/hooks/use-sonner";
import { useAuth } from '@/hooks/auth';
import AnimalBasicInfo from './simulator/AnimalBasicInfo';
import AnimalHealthOptions from './simulator/AnimalHealthOptions';
import ResultsDisplay from './simulator/ResultsDisplay';

const CostSimulator: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CostSimulatorFormData>({
    animalType: 'dog',
    animalSize: 'medium',
    ageMonths: 12,
    healthConditions: [],
    specialCareNeeds: [],
    foodType: 'premium',
    isSterilized: false
  });
  const [results, setResults] = useState<CostResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnimalTypeChange = (value: 'dog' | 'cat' | 'other') => {
    setFormData(prev => ({ ...prev, animalType: value }));
  };

  const handleAnimalSizeChange = (value: 'small' | 'medium' | 'large') => {
    setFormData(prev => ({ ...prev, animalSize: value }));
  };

  const handleAgeChange = (value: number) => {
    setFormData(prev => ({ ...prev, ageMonths: value }));
  };

  const handleFoodTypeChange = (value: 'basic' | 'premium' | 'special') => {
    setFormData(prev => ({ ...prev, foodType: value }));
  };

  const handleSterilizedChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, isSterilized: value }));
  };

  const handleAddHealthCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: [...prev.healthConditions, condition]
    }));
  };

  const handleRemoveHealthCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.filter(c => c !== condition)
    }));
  };

  const handleAddSpecialNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      specialCareNeeds: [...prev.specialCareNeeds, need]
    }));
  };

  const handleRemoveSpecialNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      specialCareNeeds: prev.specialCareNeeds.filter(n => n !== need)
    }));
  };

  const handleSimulate = async () => {
    setIsLoading(true);
    
    try {
      // Chamar o Edge Function para calcular a simulação
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cost-simulator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar a simulação');
      }

      const data = await response.json();
      setResults(data);
      toast.success('Simulação realizada com sucesso!');
    } catch (error) {
      console.error('Erro na simulação:', error);
      toast.error('Erro ao calcular os custos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulador de Custos de Pet</CardTitle>
        <CardDescription>
          Calcule o custo estimado de manutenção mensal, anual e vitalício de um animal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form>
          <div className="space-y-6">
            <AnimalBasicInfo
              animalType={formData.animalType}
              animalSize={formData.animalSize}
              ageMonths={formData.ageMonths}
              foodType={formData.foodType}
              onAnimalTypeChange={handleAnimalTypeChange}
              onAnimalSizeChange={handleAnimalSizeChange}
              onAgeChange={handleAgeChange}
              onFoodTypeChange={handleFoodTypeChange}
            />
            
            <AnimalHealthOptions
              healthConditions={formData.healthConditions}
              specialCareNeeds={formData.specialCareNeeds}
              onAddHealthCondition={handleAddHealthCondition}
              onRemoveHealthCondition={handleRemoveHealthCondition}
              onAddSpecialNeed={handleAddSpecialNeed}
              onRemoveSpecialNeed={handleRemoveSpecialNeed}
              isSterilized={formData.isSterilized || false}
              onSterilizedChange={handleSterilizedChange}
            />
          </div>
        </Form>
        
        <ResultsDisplay results={results} isLoading={isLoading} />
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSimulate} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Calculando...' : 'Simular Custos'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CostSimulator;
