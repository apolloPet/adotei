
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
import { calculateCosts } from './simulator/costCalculations';
import { AnimalCostFormData, CostResults } from './simulator/types';

interface CostSimulatorProps {
  onSimulationComplete?: (simulationData: any) => void;
  initialData?: Partial<AnimalCostFormData>;
  onBack?: () => void;
  onNext?: (data: AnimalCostFormData) => void;
}

const CostSimulator = ({ onSimulationComplete, initialData, onBack, onNext }: CostSimulatorProps) => {
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState('step1');
  const [formData, setFormData] = useState<AnimalCostFormData>({
    animalType: initialData?.animalType || 'dog',
    animalSize: initialData?.animalSize || 'medium',
    ageYears: initialData?.ageYears || 2,
    ageMonths: initialData?.ageMonths || 0,
    activityLevel: initialData?.activityLevel || 'moderate',
    foodType: initialData?.foodType || 'premium',
    foodQuantity: initialData?.foodQuantity || 0,
    groomingFrequency: initialData?.groomingFrequency || 'monthly',
    healthConditions: initialData?.healthConditions || [],
    specialCareNeeds: initialData?.specialCareNeeds || [],
    isSterilized: initialData?.isSterilized || false,
    notes: initialData?.notes || '',
  });
  
  const [results, setResults] = useState<CostResults>({
    monthlyCosts: {
      food: 0,
      medical: 0,
      grooming: 0,
      supplies: 0,
      specialCare: 0
    },
    monthlyTotal: 0,
    yearlyTotal: 0,
    lifetimeTotal: 0,
    details: {
      monthlyBreakdown: {
        food: 0,
        healthcare: 0,
        adjustments: {
          healthConditions: '',
          specialNeeds: ''
        }
      },
      initialCosts: {
        accessories: 0,
        procedures: 0
      }
    }
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
      const calculatedResults = calculateCosts(formData);
      
      // Ensure results has all required properties by adding default values for optional properties
      const completeResults: CostResults = {
        ...calculatedResults,
        details: calculatedResults.details || {
          monthlyBreakdown: {
            food: 0,
            healthcare: 0,
            adjustments: {
              healthConditions: '',
              specialNeeds: ''
            }
          },
          initialCosts: {
            accessories: 0,
            procedures: 0
          }
        }
      };
      
      setResults(completeResults);
      setSimulationCompleted(true);

      if (onSimulationComplete) {
        onSimulationComplete({
          ...formData,
          ...completeResults,
        });
      }

      return completeResults;
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
        
        // Call the onNext prop if provided and on the final step
        if (onNext && step === 4) {
          onNext(formData);
        }
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setActiveTab(`step${step - 1}`);
    } else if (onBack) {
      // Call the onBack prop if we're at step 1 and trying to go back
      onBack();
    }
  };

  const resetForm = () => {
    setFormData({
      animalType: 'dog',
      animalSize: 'medium',
      ageYears: 2,
      ageMonths: 0,
      activityLevel: 'moderate',
      foodType: 'premium',
      foodQuantity: 0,
      groomingFrequency: 'monthly',
      healthConditions: [],
      specialCareNeeds: [],
      isSterilized: false,
      notes: '',
    });
    setResults({
      monthlyCosts: {
        food: 0,
        medical: 0,
        grooming: 0,
        supplies: 0,
        specialCare: 0
      },
      monthlyTotal: 0,
      yearlyTotal: 0,
      lifetimeTotal: 0,
      details: {
        monthlyBreakdown: {
          food: 0,
          healthcare: 0,
          adjustments: {
            healthConditions: '',
            specialNeeds: ''
          }
        },
        initialCosts: {
          accessories: 0,
          procedures: 0
        }
      }
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
              onInputChange={handleInputChange}
            />
          </TabsContent>

          <TabsContent value="step2">
            <HealthInfo
              formData={formData}
              onToggleCondition={handleArrayToggle}
            />
          </TabsContent>

          <TabsContent value="step3">
            <NutritionInfo
              formData={formData}
              onInputChange={handleInputChange}
            />
          </TabsContent>

          <TabsContent value="step4">
            <SpecialNeeds
              formData={formData}
              onToggleNeed={handleArrayToggle}
            />
          </TabsContent>

          <TabsContent value="results">
            <ResultsDisplay results={results} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          {(step > 1 || onBack) && (
            <Button variant="outline" onClick={prevStep}>
              Anterior
            </Button>
          )}
          
          {step === 1 && !onBack && (
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
