
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-sonner";
import AnimalBasicInfo from "./simulator/AnimalBasicInfo";
import AnimalHealthOptions from "./simulator/AnimalHealthOptions";
import ResultsDisplay from "./simulator/ResultsDisplay";
import { 
  calculateMonthlyFoodCost, 
  calculateMedicalCost, 
  calculateGroomingCost,
  calculateTotalCosts
} from "./simulator/costCalculations";
import { AnimalCostFormData, CostResults } from "./simulator/types";

interface CostSimulatorProps {
  onSimulationComplete?: () => void;
}

const CostSimulator: React.FC<CostSimulatorProps> = ({ onSimulationComplete }) => {
  const [formData, setFormData] = useState<AnimalCostFormData>({
    animalType: 'dog',
    animalSize: 'medium',
    ageYears: 2,
    ageMonths: 0,
    activityLevel: 'moderate',
    foodType: 'premium',
    foodQuantity: 2,
    groomingFrequency: 'monthly',
    healthConditions: [],
    specialCareNeeds: [],
    isSterilized: false,
    notes: ''
  });
  
  const [results, setResults] = useState<CostResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgeYearsChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      ageYears: value[0]
    }));
  };

  const handleAgeMonthsChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      ageMonths: value[0]
    }));
  };

  const handleFoodQuantityChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      foodQuantity: value[0]
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleAddHealthCondition = (condition: string) => {
    if (!formData.healthConditions.includes(condition)) {
      setFormData(prev => ({
        ...prev,
        healthConditions: [...prev.healthConditions, condition]
      }));
    }
  };

  const handleRemoveHealthCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.filter(c => c !== condition)
    }));
  };

  const handleAddSpecialNeed = (need: string) => {
    if (!formData.specialCareNeeds.includes(need)) {
      setFormData(prev => ({
        ...prev,
        specialCareNeeds: [...prev.specialCareNeeds, need]
      }));
    }
  };

  const handleRemoveSpecialNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      specialCareNeeds: prev.specialCareNeeds.filter(n => n !== need)
    }));
  };

  const calculateResults = useCallback(() => {
    const totalAgeMonths = (formData.ageYears * 12) + formData.ageMonths;
    
    const monthlyCosts = {
      food: calculateMonthlyFoodCost(
        formData.animalType, 
        formData.animalSize, 
        formData.foodType, 
        formData.foodQuantity
      ),
      medical: calculateMedicalCost(
        formData.animalType, 
        totalAgeMonths, 
        formData.healthConditions, 
        formData.isSterilized
      ),
      grooming: calculateGroomingCost(
        formData.animalType, 
        formData.animalSize, 
        formData.groomingFrequency
      ),
      supplies: 0, // Calculado abaixo
      specialCare: 0 // Calculado abaixo
    };
    
    // Determine supplies cost based on animal type and size
    if (formData.animalType === 'dog') {
      monthlyCosts.supplies = formData.animalSize === 'small' ? 50 : 
                              formData.animalSize === 'medium' ? 75 : 100;
    } else {
      monthlyCosts.supplies = formData.animalSize === 'small' ? 40 : 
                              formData.animalSize === 'medium' ? 60 : 80;
    }
    
    // Add costs for special care needs
    monthlyCosts.specialCare = formData.specialCareNeeds.length * 50;
    
    // Calculate totals
    const { monthlyTotal, yearlyTotal, lifetimeTotal } = calculateTotalCosts(
      totalAgeMonths,
      monthlyCosts
    );
    
    // Save results
    setResults({
      monthlyCosts,
      monthlyTotal,
      yearlyTotal,
      lifetimeTotal,
      details: {
        monthlyBreakdown: {
          food: monthlyCosts.food,
          healthcare: monthlyCosts.medical,
          adjustments: {
            healthConditions: formData.healthConditions.length > 0 
              ? `+R$ ${(formData.healthConditions.length * 40).toFixed(2)}`
              : "Sem ajustes",
            specialNeeds: formData.specialCareNeeds.length > 0
              ? `+R$ ${monthlyCosts.specialCare.toFixed(2)}`
              : "Sem ajustes"
          }
        },
        initialCosts: {
          accessories: formData.animalType === 'dog' 
            ? (formData.animalSize === 'small' ? 300 : formData.animalSize === 'medium' ? 450 : 600)
            : 250,
          procedures: !formData.isSterilized 
            ? (formData.animalType === 'dog' ? 400 : 250)
            : 0
        }
      }
    });
    
    setShowResults(true);
    
    if (onSimulationComplete) {
      onSimulationComplete();
    }
  }, [formData, onSimulationComplete]);

  const handleSimulate = () => {
    calculateResults();
    toast.success("Simulação concluída com sucesso!");
  };

  const resetForm = () => {
    setFormData({
      animalType: 'dog',
      animalSize: 'medium',
      ageYears: 2,
      ageMonths: 0,
      activityLevel: 'moderate',
      foodType: 'premium',
      foodQuantity: 2,
      groomingFrequency: 'monthly',
      healthConditions: [],
      specialCareNeeds: [],
      isSterilized: false,
      notes: ''
    });
    setResults(null);
    setShowResults(false);
  };

  return (
    <div className="space-y-6">
      {!showResults ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Simulador de Custos de Pets</CardTitle>
              <CardDescription>
                Calcule os custos estimados de cuidar de um animal de estimação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimalBasicInfo
                animalType={formData.animalType}
                animalSize={formData.animalSize}
                ageYears={formData.ageYears}
                ageMonths={formData.ageMonths}
                activityLevel={formData.activityLevel}
                onTypeChange={(value) => handleRadioChange('animalType', value)}
                onSizeChange={(value) => handleRadioChange('animalSize', value)}
                onAgeYearsChange={handleAgeYearsChange}
                onAgeMonthsChange={handleAgeMonthsChange}
                onActivityLevelChange={(value) => handleRadioChange('activityLevel', value)}
              />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alimentação</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Alimentação</Label>
                    <RadioGroup 
                      value={formData.foodType} 
                      onValueChange={(value) => handleRadioChange('foodType', value)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="basic" id="food-basic" />
                        <Label htmlFor="food-basic">Básica (ração comum)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="premium" id="food-premium" />
                        <Label htmlFor="food-premium">Premium (ração de qualidade superior)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="special" id="food-special" />
                        <Label htmlFor="food-special">Especial (ração medicinal ou dietética)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="food-quantity">Quantidade Diária (kg)</Label>
                      <span className="text-sm text-muted-foreground">{formData.foodQuantity} kg</span>
                    </div>
                    <Slider
                      id="food-quantity"
                      min={0.5}
                      max={5}
                      step={0.5}
                      value={[formData.foodQuantity]}
                      onValueChange={handleFoodQuantityChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Higiene e Cuidados</h3>
                <div className="space-y-2">
                  <Label>Frequência de Banho e Tosa</Label>
                  <RadioGroup 
                    value={formData.groomingFrequency} 
                    onValueChange={(value) => handleRadioChange('groomingFrequency', value)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rarely" id="grooming-rarely" />
                      <Label htmlFor="grooming-rarely">Raramente (a cada 3 meses ou mais)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="grooming-monthly" />
                      <Label htmlFor="grooming-monthly">Mensal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="biweekly" id="grooming-biweekly" />
                      <Label htmlFor="grooming-biweekly">Quinzenal</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <AnimalHealthOptions
                  healthConditions={formData.healthConditions}
                  specialCareNeeds={formData.specialCareNeeds}
                  onAddHealthCondition={handleAddHealthCondition}
                  onRemoveHealthCondition={handleRemoveHealthCondition}
                  onAddSpecialNeed={handleAddSpecialNeed}
                  onRemoveSpecialNeed={handleRemoveSpecialNeed}
                  isSterilized={formData.isSterilized}
                  onSterilizedChange={(checked) => handleSwitchChange('isSterilized', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Adicionais</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Adicione qualquer informação relevante para os custos"
                  rows={3}
                />
              </div>
              
              <Button className="w-full" onClick={handleSimulate}>
                Calcular Custos
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <ResultsDisplay
          results={results}
          onNewSimulation={resetForm}
        />
      )}
    </div>
  );
};

export default CostSimulator;
