
// Cost calculator utilities

export const getFoodCostPerKg = (animalType: string): number => {
  return animalType === 'dog' ? 20 : 40; // Cats typically have more expensive food per kg
};

// Calculate daily food consumption in grams
export const getDailyFoodConsumption = (animalType: string, weight: number, ageMonths: number): number => {
  // Simple formula: 
  // Dogs: ~20g per kg of weight
  // Cats: ~30g per kg of weight
  // Puppies and kittens (< 12 months) eat more (1.5x)
  const baseConsumption = animalType === 'dog' ? 20 : 30;
  const ageMultiplier = ageMonths < 12 ? 1.5 : 1;
  
  return (baseConsumption * weight * ageMultiplier);
};

// Calculate monthly medical costs
export const getMonthlyMedicalCost = (animalType: string, ageMonths: number, vaccineCount: number, isSterilized: boolean, weight: number): number => {
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

// Calculate all costs and return results
export const calculateCosts = (
  animalType: string,
  ageMonths: number,
  weight: number,
  hasSpecialNeeds: boolean,
  isSterilized: boolean,
  vaccineCount: number
) => {
  // Calculate food cost (monthly)
  const dailyFoodGrams = getDailyFoodConsumption(animalType, weight, ageMonths);
  const dailyFoodKg = dailyFoodGrams / 1000;
  const dailyFoodCost = dailyFoodKg * getFoodCostPerKg(animalType);
  const monthlyFoodCost = dailyFoodCost * 30;
  
  // Calculate medical costs
  const monthlyMedicalCost = getMonthlyMedicalCost(animalType, ageMonths, vaccineCount, isSterilized, weight);
  
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
