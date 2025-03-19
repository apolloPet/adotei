
export interface AnimalCostFormData {
  animalType: 'dog' | 'cat' | 'other';
  animalSize: 'small' | 'medium' | 'large';
  ageYears: number;
  ageMonths: number;
  activityLevel: 'low' | 'moderate' | 'high';
  foodType: 'basic' | 'premium' | 'special';
  foodQuantity: number;
  groomingFrequency: 'rarely' | 'monthly' | 'biweekly';
  healthConditions: string[];
  specialCareNeeds: string[];
  isSterilized: boolean;
  notes: string;
}

export interface MonthlyCosts {
  food: number;
  medical: number;
  grooming: number;
  supplies: number;
  specialCare: number;
}

export interface CostResults {
  monthlyCosts: MonthlyCosts;
  monthlyTotal: number;
  yearlyTotal: number;
  lifetimeTotal: number;
}
