
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Info } from 'lucide-react';
import AnimalBasicInfo from './simulator/AnimalBasicInfo';
import AnimalHealthOptions from './simulator/AnimalHealthOptions';
import ResultsDisplay from './simulator/ResultsDisplay';
import { CostSimulatorFormData, CostResults } from './simulator/types';
import { calculateCosts } from './simulator/costCalculations';

const CostSimulator = () => {
  const [formData, setFormData] = useState<CostSimulatorFormData>({
    animalType: 'dog',
    ageYears: 1,
    weight: 15,
    hasSpecialNeeds: false,
    isSterilized: false,
    vaccineCount: 3
  });
  
  const [results, setResults] = useState<CostResults | null>(null);

  const handleAnimalTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, animalType: value }));
  };

  const handleAgeChange = (value: number) => {
    setFormData(prev => ({ ...prev, ageYears: value }));
  };

  const handleWeightChange = (value: number) => {
    setFormData(prev => ({ ...prev, weight: value }));
  };

  const handleSpecialNeedsChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, hasSpecialNeeds: value }));
  };

  const handleSterilizedChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, isSterilized: value }));
  };

  const handleVaccineCountChange = (value: number) => {
    setFormData(prev => ({ ...prev, vaccineCount: value }));
  };

  const handleCalculate = () => {
    const calculatedResults = calculateCosts(
      formData.animalType,
      formData.ageYears,
      formData.weight,
      formData.hasSpecialNeeds,
      formData.isSterilized,
      formData.vaccineCount
    );
    
    setResults(calculatedResults);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Calculator className="h-5 w-5 mr-2" />
          Simulador de Custos
        </CardTitle>
        <CardDescription>
          Calcule estimativas de custos mensais e anuais de acordo com as características do animal
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimalBasicInfo 
            formData={formData}
            onAnimalTypeChange={handleAnimalTypeChange}
            onAgeChange={handleAgeChange}
            onWeightChange={handleWeightChange}
          />
          
          <AnimalHealthOptions 
            formData={formData}
            onSpecialNeedsChange={handleSpecialNeedsChange}
            onSterilizedChange={handleSterilizedChange}
            onVaccineCountChange={handleVaccineCountChange}
          />
        </div>
        
        <div className="w-full flex justify-center mt-6">
          <Button onClick={handleCalculate} className="w-full max-w-xs">
            Calcular Custos
          </Button>
        </div>
        
        <ResultsDisplay results={results} />
      </CardContent>
      
      <CardFooter className="flex flex-col items-start pt-0">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Esta é apenas uma estimativa baseada em médias de mercado. 
            Os custos reais podem variar de acordo com a região, condições específicas do animal 
            e qualidade dos produtos/serviços contratados.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CostSimulator;
