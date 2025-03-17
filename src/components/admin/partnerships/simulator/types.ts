
export interface CostSimulatorFormData {
  animalType: string;
  ageYears: number;
  weight: number;
  hasSpecialNeeds: boolean;
  isSterilized: boolean;
  vaccineCount: number;
}

export interface CostResults {
  foodCost: number;
  medicalCost: number;
  specialCost: number;
  totalMonthly: number;
  totalYearly: number;
}
