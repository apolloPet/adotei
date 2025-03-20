
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimalBasicInfo from './simulator/AnimalBasicInfo';
import HealthInfo from './simulator/HealthInfo';
import NutritionInfo from './simulator/NutritionInfo';
import SpecialNeeds from './simulator/SpecialNeeds';
import ResultsDisplay from './simulator/ResultsDisplay';
import { toast } from '@/hooks/use-sonner';
import { calculateTotalCosts } from './simulator/costCalculations';

interface CostSimulatorProps {
  onSimulationComplete?: (simulationData: any) => void;
}

const CostSimulator = ({ onSimulationComplete }: CostSimulatorProps) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('step1');
  const [formData, setFormData] = useState({
    animalType: 'dog',
    animalSize: 'medium',
    animalAge: 2,
    healthConditions: [] as string[],
    foodType: 'premium',
    specialNeeds: [] as string[],
  });
  const [results, setResults] = useState({
    monthlyTotal: 0,
    yearlyTotal: 0,
    lifetimeTotal: 0,
    breakdown: {} as Record<string, number>,
  });
  const [simulationCompleted, setSimulationCompleted] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setFormData(prev => {
      const arr = prev[field as keyof typeof prev] as string[];
      if (Array.isArray(arr)) {
        const exists = arr.includes(value);
        return {
          ...prev,
          [field]: exists
            ? arr.filter(item => item !== value)
            : [...arr, value],
        };
      }
      return prev;
    });
  };

  const calculateResults = () => {
    try {
      const totals = calculateTotalCosts(formData);
      setResults(totals);
      setSimulationCompleted(true);

      if (onSimulationComplete) {
        onSimulationComplete({
          ...formData,
          ...totals,
        });
      }

      return totals;
    } catch (error) {
      toast.error("Erro ao calcular custos");
      console.error("Error calculating costs:", error);
      return null;
    }
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
      setActiveTab(`step${step + 1}`);
    } else {
      const results = calculateResults();
      if (results) {
        setStep(5);
        setActiveTab('results');
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setActiveTab(`step${step - 1}`);
    }
  };

  const resetForm = () => {
    setFormData({
      animalType: 'dog',
      animalSize: 'medium',
      animalAge: 2,
      healthConditions: [],
      foodType: 'premium',
      specialNeeds: [],
    });
    setResults({
      monthlyTotal: 0,
      yearlyTotal: 0,
      lifetimeTotal: 0,
      breakdown: {},
    });
    setStep(1);
    setActiveTab('step1');
    setSimulationCompleted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Simulador de Custos de Adoção</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="step1" onClick={() => setStep(1)}>
              Animal
            </TabsTrigger>
            <TabsTrigger value="step2" onClick={() => setStep(2)}>
              Saúde
            </TabsTrigger>
            <TabsTrigger value="step3" onClick={() => setStep(3)}>
              Alimentação
            </TabsTrigger>
            <TabsTrigger value="step4" onClick={() => setStep(4)}>
              Cuidados Especiais
            </TabsTrigger>
            <TabsTrigger value="results" onClick={() => setStep(5)} disabled={!simulationCompleted}>
              Resultados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step1">
            <AnimalBasicInfo
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </TabsContent>

          <TabsContent value="step2">
            <HealthInfo
              formData={formData}
              handleArrayToggle={handleArrayToggle}
            />
          </TabsContent>

          <TabsContent value="step3">
            <NutritionInfo
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </TabsContent>

          <TabsContent value="step4">
            <SpecialNeeds
              formData={formData}
              handleArrayToggle={handleArrayToggle}
            />
          </TabsContent>

          <TabsContent value="results">
            <ResultsDisplay results={results} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          {step > 1 && step < 5 && (
            <Button variant="outline" onClick={prevStep}>
              Anterior
            </Button>
          )}
          
          {step === 1 && (
            <div className="flex-1"></div>
          )}
          
          {step < 5 && (
            <Button onClick={nextStep}>
              {step === 4 ? 'Calcular' : 'Próximo'}
            </Button>
          )}
          
          {step === 5 && (
            <Button variant="outline" onClick={resetForm}>
              Nova Simulação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CostSimulator;
