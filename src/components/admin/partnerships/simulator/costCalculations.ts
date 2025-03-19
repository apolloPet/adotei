
// Cost calculator utilities

// Food cost calculation
export const getFoodCostPerKg = (animalType: string): number => {
  return animalType === 'dog' ? 20 : 40; // Cats typically have more expensive food per kg
};

// Calculate daily food consumption in grams
export const getDailyFoodConsumption = (animalType: string, weight: number, ageYears: number): number => {
  // Simple formula: 
  // Dogs: ~20g per kg of weight
  // Cats: ~30g per kg of weight
  // Puppies and kittens (< 1 year) eat more (1.5x)
  const baseConsumption = animalType === 'dog' ? 20 : 30;
  const ageMultiplier = ageYears < 1 ? 1.5 : 1;
  
  return (baseConsumption * weight * ageMultiplier);
};

// Calculate monthly food costs based on animal type, size, food type, and quantity
export const calculateMonthlyFoodCost = (
  animalType: string, 
  animalSize: string, 
  foodType: string, 
  foodQuantityKg: number
): number => {
  // Base food cost per kg
  let costPerKg = 0;
  
  if (animalType === 'dog') {
    if (foodType === 'basic') costPerKg = 15;
    else if (foodType === 'premium') costPerKg = 25;
    else if (foodType === 'special') costPerKg = 40; // Special diet food
  } else { // Cat
    if (foodType === 'basic') costPerKg = 20;
    else if (foodType === 'premium') costPerKg = 35;
    else if (foodType === 'special') costPerKg = 50;
  }
  
  // Monthly food cost (30 days)
  return foodQuantityKg * costPerKg * 30;
};

// Calculate monthly medical costs
export const calculateMedicalCost = (
  animalType: string, 
  ageInMonths: number, 
  healthConditions: string[], 
  isSterilized: boolean
): number => {
  // Base costs
  let cost = animalType === 'dog' ? 50 : 30;
  
  // Age adjustments - older animals need more care
  if (ageInMonths > 84) { // Senior (7+ years)
    cost *= 1.5;
  } else if (ageInMonths > 36) { // Adult (3+ years)
    cost *= 1.2;
  }
  
  // Add costs for health conditions (each condition adds some cost)
  cost += healthConditions.length * 40;
  
  // One-time sterilization cost (amortized over 2 years) if not already sterilized
  if (!isSterilized) {
    const sterilizationCost = animalType === 'dog' ? 400 : 250;
    cost += sterilizationCost / 24; // Divided by 24 months
  }
  
  return cost;
};

// Calculate grooming costs
export const calculateGroomingCost = (
  animalType: string, 
  animalSize: string, 
  groomingFrequency: string
): number => {
  let baseCost = 0;
  
  // Base cost for dogs depends on size
  if (animalType === 'dog') {
    if (animalSize === 'small') baseCost = 50;
    else if (animalSize === 'medium') baseCost = 70;
    else baseCost = 90; // large
  } else { // Cats have fixed grooming cost
    baseCost = 60;
  }
  
  // Frequency multiplier
  let frequencyMultiplier = 0;
  if (groomingFrequency === 'rarely') frequencyMultiplier = 0.33; // Once every 3 months
  else if (groomingFrequency === 'monthly') frequencyMultiplier = 1; // Once a month
  else frequencyMultiplier = 2; // Biweekly
  
  return baseCost * frequencyMultiplier;
};

// Calculate special needs costs if applicable
export const getSpecialNeedsCost = (hasSpecialNeeds: boolean, animalType: string, weight: number): number => {
  if (!hasSpecialNeeds) return 0;
  
  // Base special needs cost
  let cost = animalType === 'dog' ? 150 : 100;
  
  // Adjust for weight for dogs (bigger dogs = more expensive medication)
  if (animalType === 'dog' && weight > 20) {
    cost *= 1.5;
  }
  
  return cost;
};

// Calculate total costs (monthly, yearly, and lifetime)
export const calculateTotalCosts = (
  ageInMonths: number,
  monthlyCosts: {
    food: number;
    medical: number;
    grooming: number;
    supplies: number;
    specialCare: number;
  }
) => {
  // Calculate monthly total
  const monthlyTotal = Object.values(monthlyCosts).reduce((total, cost) => total + cost, 0);
  
  // Calculate yearly total
  const yearlyTotal = monthlyTotal * 12;
  
  // Estimate remaining lifespan in months (15 years max lifespan - current age)
  const estimatedRemainingMonths = Math.max(180 - ageInMonths, 12); // Minimum 1 year remaining
  
  // Calculate lifetime cost
  const lifetimeTotal = monthlyTotal * estimatedRemainingMonths;
  
  return {
    monthlyTotal,
    yearlyTotal,
    lifetimeTotal
  };
};

// All-in-one cost calculation function (legacy support)
export const calculateCosts = (
  animalType: string,
  ageYears: number,
  weight: number,
  hasSpecialNeeds: boolean,
  isSterilized: boolean,
  vaccineCount: number
) => {
  // Calculate food cost (monthly)
  const dailyFoodGrams = getDailyFoodConsumption(animalType, weight, ageYears);
  const dailyFoodKg = dailyFoodGrams / 1000;
  const dailyFoodCost = dailyFoodKg * getFoodCostPerKg(animalType);
  const monthlyFoodCost = dailyFoodCost * 30;
  
  // Calculate medical costs
  const monthlyMedicalCost = getMonthlyMedicalCost(animalType, ageYears, vaccineCount, isSterilized, weight);
  
  // Calculate special needs costs
  const monthlySpecialCost = getSpecialNeedsCost(hasSpecialNeeds, animalType, weight);
  
  // Calculate totals
  const totalMonthly = monthlyFoodCost + monthlyMedicalCost + monthlySpecialCost;
  const totalYearly = totalMonthly * 12;
  
  return {
    foodCost: parseFloat(monthlyFoodCost.toFixed(2)),
    medicalCost: parseFloat(monthlyMedicalCost.toFixed(2)),
    specialCost: parseFloat(monthlySpecialCost.toFixed(2)),
    totalMonthly: parseFloat(totalMonthly.toFixed(2)),
    totalYearly: parseFloat(totalYearly.toFixed(2))
  };
};

// Legacy support function
export const getMonthlyMedicalCost = (animalType: string, ageYears: number, vaccineCount: number, isSterilized: boolean, weight: number): number => {
  // Base costs
  let cost = animalType === 'dog' ? 50 : 30;
  
  // Age adjustments - older animals need more care
  if (ageYears > 7) { // Senior
    cost *= 1.5;
  } else if (ageYears > 3) { // Adult
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
