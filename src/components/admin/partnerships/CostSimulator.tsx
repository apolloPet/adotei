
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calculator, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const CostSimulator = () => {
  const [animalType, setAnimalType] = useState('dog');
  const [ageMonths, setAgeMonths] = useState(12);
  const [weight, setWeight] = useState(15);
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false);
  const [isSterilized, setIsSterilized] = useState(false);
  const [vaccineCount, setVaccineCount] = useState(3);
  const [results, setResults] = useState<null | {
    foodCost: number;
    medicalCost: number;
    specialCost: number;
    totalMonthly: number;
    totalYearly: number;
  }>(null);

  // Get cost per kg of food by animal type
  const getFoodCostPerKg = () => {
    return animalType === 'dog' ? 20 : 40; // Cats typically have more expensive food per kg
  };

  // Calculate daily food consumption in grams
  const getDailyFoodConsumption = () => {
    // Simple formula: 
    // Dogs: ~20g per kg of weight
    // Cats: ~30g per kg of weight
    // Puppies and kittens (< 12 months) eat more (1.5x)
    const baseConsumption = animalType === 'dog' ? 20 : 30;
    const ageMultiplier = ageMonths < 12 ? 1.5 : 1;
    
    return (baseConsumption * weight * ageMultiplier);
  };

  // Calculate monthly medical costs
  const getMonthlyMedicalCost = () => {
    // Base costs
    let cost = animalType === 'dog' ? 50 : 30;
    
    // Age adjustments - older animals need more care
    if (ageMonths > 84) { // > 7 years
      cost *= 1.5;
    } else if (ageMonths > 36) { // > 3 years
      cost *= 1.2;
    }
    
    // Vaccine costs (amortized monthly)
    const yearlyVaccineCost = vaccineCount * (animalType === 'dog' ? 80 : 60);
    cost += yearlyVaccineCost / 12;
    
    // One-time sterilization cost (amortized over 2 years)
    if (!isSterilized) {
      const sterilizationCost = animalType === 'dog' ? 
        (weight > 10 ? 500 : 350) : 250;
      cost += sterilizationCost / 24;
    }
    
    return cost;
  };

  // Calculate special needs costs if applicable
  const getSpecialNeedsCost = () => {
    if (!hasSpecialNeeds) return 0;
    
    // Base special needs cost
    let cost = animalType === 'dog' ? 150 : 100;
    
    // Adjust for weight for dogs (bigger dogs = more expensive medication)
    if (animalType === 'dog' && weight > 20) {
      cost *= 1.5;
    }
    
    return cost;
  };

  const handleCalculate = () => {
    // Calculate food cost (monthly)
    const dailyFoodGrams = getDailyFoodConsumption();
    const dailyFoodKg = dailyFoodGrams / 1000;
    const dailyFoodCost = dailyFoodKg * getFoodCostPerKg();
    const monthlyFoodCost = dailyFoodCost * 30;
    
    // Calculate medical costs
    const monthlyMedicalCost = getMonthlyMedicalCost();
    
    // Calculate special needs costs
    const monthlySpecialCost = getSpecialNeedsCost();
    
    // Calculate totals
    const totalMonthly = monthlyFoodCost + monthlyMedicalCost + monthlySpecialCost;
    const totalYearly = totalMonthly * 12;
    
    setResults({
      foodCost: parseFloat(monthlyFoodCost.toFixed(2)),
      medicalCost: parseFloat(monthlyMedicalCost.toFixed(2)),
      specialCost: parseFloat(monthlySpecialCost.toFixed(2)),
      totalMonthly: parseFloat(totalMonthly.toFixed(2)),
      totalYearly: parseFloat(totalYearly.toFixed(2))
    });
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="animal-type">Tipo de Animal</Label>
              <Select value={animalType} onValueChange={setAnimalType}>
                <SelectTrigger id="animal-type">
                  <SelectValue placeholder="Selecione o tipo de animal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Cachorro</SelectItem>
                  <SelectItem value="cat">Gato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="age">Idade (meses)</Label>
                <span className="text-sm font-medium">{ageMonths} meses</span>
              </div>
              <Slider 
                id="age" 
                min={1} 
                max={180} 
                step={1} 
                value={[ageMonths]} 
                onValueChange={(vals) => setAgeMonths(vals[0])} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 mês</span>
                <span>15 anos</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="weight">Peso (kg)</Label>
                <span className="text-sm font-medium">{weight} kg</span>
              </div>
              <Slider 
                id="weight" 
                min={1} 
                max={animalType === 'dog' ? 60 : 15} 
                step={0.5} 
                value={[weight]} 
                onValueChange={(vals) => setWeight(vals[0])} 
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 kg</span>
                <span>{animalType === 'dog' ? '60 kg' : '15 kg'}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="special-needs">Necessidades Especiais</Label>
                  <p className="text-muted-foreground text-xs">Animal com condições crônicas ou especiais</p>
                </div>
                <Switch
                  checked={hasSpecialNeeds}
                  onCheckedChange={setHasSpecialNeeds}
                  id="special-needs"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sterilized">Já Castrado/Esterilizado</Label>
                  <p className="text-muted-foreground text-xs">Animal já passou por procedimento de castração</p>
                </div>
                <Switch
                  checked={isSterilized}
                  onCheckedChange={setIsSterilized}
                  id="sterilized"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="vaccines">Vacinas Necessárias (por ano)</Label>
                  <span className="text-sm font-medium">{vaccineCount}</span>
                </div>
                <Slider 
                  id="vaccines" 
                  min={0} 
                  max={8} 
                  step={1} 
                  value={[vaccineCount]} 
                  onValueChange={(vals) => setVaccineCount(vals[0])} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full flex justify-center mt-6">
          <Button onClick={handleCalculate} className="w-full max-w-xs">
            Calcular Custos
          </Button>
        </div>
        
        {results && (
          <div className="mt-6 border rounded-md p-4">
            <h3 className="font-semibold text-lg mb-2">Resultados</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Custo Mensal com Alimentação</Label>
                <p className="font-medium">R$ {results.foodCost.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Custo Mensal com Saúde</Label>
                <p className="font-medium">R$ {results.medicalCost.toFixed(2)}</p>
              </div>
              {results.specialCost > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">Custo com Necessidades Especiais</Label>
                  <p className="font-medium">R$ {results.specialCost.toFixed(2)}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground text-xs">Total Mensal</Label>
                <p className="font-medium text-primary">R$ {results.totalMonthly.toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground text-xs">Total Anual Estimado</Label>
                <p className="font-medium text-xl text-primary">R$ {results.totalYearly.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
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
