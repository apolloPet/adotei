
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnimalCostFormData, CostResults } from "./simulator/types";
import AnimalBasicInfo from "./simulator/AnimalBasicInfo";
import NutritionInfo from "./simulator/NutritionInfo";
import HealthInfo from "./simulator/HealthInfo";
import SpecialNeeds from "./simulator/SpecialNeeds";
import ResultsDisplay from "./simulator/ResultsDisplay";
import { calculateCosts } from "./simulator/costCalculations";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-sonner";
import { supabase } from "@/lib/supabase";

const CostSimulator = () => {
  const [step, setStep] = useState<"basic" | "nutrition" | "health" | "special" | "results">("basic");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AnimalCostFormData>({
    animalType: "dog",
    animalSize: "medium",
    ageYears: 2,
    ageMonths: 0,
    activityLevel: "moderate",
    foodType: "basic",
    foodQuantity: 30,
    groomingFrequency: "monthly",
    healthConditions: [],
    specialCareNeeds: [],
    isSterilized: false,
    notes: ""
  });
  const [results, setResults] = useState<CostResults | null>(null);

  const updateFormData = (key: keyof AnimalCostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSimulate = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate costs
      const costs = calculateCosts(formData);
      setResults(costs);
      
      // Save the simulation to Supabase
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('cost_simulations')
            .insert({
              animal_type: formData.animalType,
              animal_size: formData.animalSize,
              age_months: formData.ageYears * 12 + formData.ageMonths,
              food_type: formData.foodType,
              health_conditions: formData.healthConditions,
              special_care_needs: formData.specialCareNeeds,
              estimated_monthly_cost: costs.monthlyTotal,
              estimated_yearly_cost: costs.yearlyTotal,
              estimated_lifetime_cost: costs.lifetimeTotal,
              results_json: costs
            })
            .select();
          
          if (error) {
            console.error('Error saving simulation:', error);
          } else if (data && data[0]) {
            // Update results with ID for future reference
            setResults({
              ...costs,
              id: data[0].id
            });
          }
        } catch (err) {
          console.error('Error saving simulation to Supabase:', err);
        }
      }
      
      // Move to results step
      setStep("results");
    } catch (error) {
      console.error('Error calculating costs:', error);
      toast.error("Erro ao calcular custos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSimulation = () => {
    setStep("basic");
    setResults(null);
  };

  const handleNext = () => {
    switch (step) {
      case "basic":
        setStep("nutrition");
        break;
      case "nutrition":
        setStep("health");
        break;
      case "health":
        setStep("special");
        break;
      case "special":
        handleSimulate();
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case "nutrition":
        setStep("basic");
        break;
      case "health":
        setStep("nutrition");
        break;
      case "special":
        setStep("health");
        break;
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case "basic":
        return (
          <AnimalBasicInfo 
            animalType={formData.animalType}
            animalSize={formData.animalSize}
            age={formData.ageYears}
            activityLevel={formData.activityLevel}
            onTypeChange={(value) => updateFormData("animalType", value)}
            onSizeChange={(value) => updateFormData("animalSize", value)}
            onAgeChange={(value) => updateFormData("ageYears", value[0])}
            onActivityLevelChange={(value) => updateFormData("activityLevel", value)}
          />
        );
      case "nutrition":
        return (
          <NutritionInfo
            foodType={formData.foodType}
            foodQuantity={formData.foodQuantity}
            onFoodTypeChange={(value) => updateFormData("foodType", value)}
            onFoodQuantityChange={(value) => updateFormData("foodQuantity", value[0])}
          />
        );
      case "health":
        return (
          <HealthInfo
            healthConditions={formData.healthConditions}
            groomingFrequency={formData.groomingFrequency}
            isSterilized={formData.isSterilized}
            onHealthConditionsChange={(value) => updateFormData("healthConditions", value)}
            onGroomingFrequencyChange={(value) => updateFormData("groomingFrequency", value)}
            onIsSterilizedChange={(value) => updateFormData("isSterilized", value)}
          />
        );
      case "special":
        return (
          <SpecialNeeds
            specialCareNeeds={formData.specialCareNeeds}
            notes={formData.notes}
            onSpecialCareNeedsChange={(value) => updateFormData("specialCareNeeds", value)}
            onNotesChange={(value) => updateFormData("notes", value)}
          />
        );
      case "results":
        if (results) {
          return (
            <ResultsDisplay
              results={results}
              onNewSimulation={handleNewSimulation}
            />
          );
        }
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Simulador de Custos</CardTitle>
        <CardDescription>
          Calcule os custos estimados para cuidar de um animal de estimação
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step !== "results" && (
          <Tabs value={step} className="mb-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic" disabled>
                Informações Básicas
              </TabsTrigger>
              <TabsTrigger value="nutrition" disabled>
                Nutrição
              </TabsTrigger>
              <TabsTrigger value="health" disabled>
                Saúde
              </TabsTrigger>
              <TabsTrigger value="special" disabled>
                Necessidades Especiais
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        <div>
          {renderStepContent()}
        </div>
        
        {step !== "results" && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === "basic" || loading}
            >
              Voltar
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : step === "special" ? (
                "Simular"
              ) : (
                "Próximo"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CostSimulator;
