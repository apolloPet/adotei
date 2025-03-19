
export interface CostSimulatorFormData {
  animalType: 'dog' | 'cat' | 'other';
  animalSize: 'small' | 'medium' | 'large';
  ageMonths: number;
  healthConditions: string[];
  specialCareNeeds: string[];
  foodType: 'basic' | 'premium' | 'special';
  isSterilized?: boolean;
}

export interface CostResults {
  id?: string;
  monthlyCost: number;
  yearlyCost: number;
  lifetimeCost: number;
  details: {
    monthlyBreakdown: {
      food: number;
      healthcare: number;
      adjustments: {
        healthConditions: string;
        specialNeeds: string;
      }
    };
    initialCosts: {
      accessories: number;
      procedures: number;
    };
    inputParameters: CostSimulatorFormData;
  };
}
