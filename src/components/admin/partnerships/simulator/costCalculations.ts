
import { AnimalCostFormData, CostResults, MonthlyCosts } from "./types";
import { supabase } from "@/lib/supabase";

export const calculateFoodCost = (formData: AnimalCostFormData): number => {
  // Base cost per kg based on food type
  let baseCostPerKg = 0;
  
  // Try to fetch cost from system parameters
  const foodCostKey = `food_${formData.animalType}_${formData.animalSize}_${formData.foodType}`;
  
  // Fallback values if not in database
  switch (formData.foodType) {
    case 'basic':
      baseCostPerKg = 15;
      break;
    case 'premium':
      baseCostPerKg = 35;
      break;
    case 'special':
      baseCostPerKg = 60;
      break;
  }
  
  // Quantity per month based on animal size (in kg)
  let monthlyQuantity = 0;
  switch (formData.animalSize) {
    case 'small':
      monthlyQuantity = formData.animalType === 'dog' ? 5 : 2;
      break;
    case 'medium':
      monthlyQuantity = formData.animalType === 'dog' ? 10 : 4;
      break;
    case 'large':
      monthlyQuantity = formData.animalType === 'dog' ? 15 : 6;
      break;
  }
  
  // Activity level adjustment
  switch (formData.activityLevel) {
    case 'low':
      monthlyQuantity *= 0.8;
      break;
    case 'high':
      monthlyQuantity *= 1.3;
      break;
  }
  
  return baseCostPerKg * monthlyQuantity;
};

export const calculateMedicalCost = (formData: AnimalCostFormData): number => {
  // Base monthly medical cost
  let baseCost = formData.animalType === 'dog' ? 50 : 40;
  
  // Adjust based on animal size
  switch (formData.animalSize) {
    case 'small':
      baseCost *= 0.8;
      break;
    case 'large':
      baseCost *= 1.5;
      break;
  }
  
  // Adjust based on age
  const ageInYears = formData.ageYears + formData.ageMonths / 12;
  if (ageInYears < 1) {
    baseCost *= 1.5; // Puppies/kittens need more care
  } else if (ageInYears > 8) {
    baseCost *= 2; // Senior pets need more care
  }
  
  // Add cost for each health condition
  const conditionCost = formData.healthConditions.length * 50;
  
  return baseCost + conditionCost;
};

export const calculateGroomingCost = (formData: AnimalCostFormData): number => {
  // Base cost for one grooming session
  let sessionCost = 0;
  
  if (formData.animalType === 'dog') {
    switch (formData.animalSize) {
      case 'small':
        sessionCost = 60;
        break;
      case 'medium':
        sessionCost = 90;
        break;
      case 'large':
        sessionCost = 120;
        break;
    }
  } else if (formData.animalType === 'cat') {
    sessionCost = 80; // Cats usually have fixed prices
  } else {
    sessionCost = 50; // Basic cost for other animals
  }
  
  // Monthly cost based on frequency
  let monthlyCost = 0;
  switch (formData.groomingFrequency) {
    case 'rarely':
      monthlyCost = sessionCost / 3; // Once every 3 months
      break;
    case 'monthly':
      monthlyCost = sessionCost; // Once a month
      break;
    case 'biweekly':
      monthlyCost = sessionCost * 2; // Twice a month
      break;
  }
  
  return monthlyCost;
};

export const calculateSuppliesCost = (formData: AnimalCostFormData): number => {
  // Base monthly supplies cost (toys, litter, accessories, etc.)
  let baseCost = formData.animalType === 'dog' ? 60 : 50;
  
  // Adjust based on animal size
  switch (formData.animalSize) {
    case 'small':
      baseCost *= 0.7;
      break;
    case 'large':
      baseCost *= 1.3;
      break;
  }
  
  return baseCost;
};

export const calculateSpecialCareCost = (formData: AnimalCostFormData): number => {
  // Base cost is zero
  let specialCareCost = 0;
  
  // Add cost for each special care need
  specialCareCost += formData.specialCareNeeds.length * 80;
  
  return specialCareCost;
};

export const calculateCosts = (formData: AnimalCostFormData): CostResults => {
  // Calculate each cost component
  const foodCost = calculateFoodCost(formData);
  const medicalCost = calculateMedicalCost(formData);
  const groomingCost = calculateGroomingCost(formData);
  const suppliesCost = calculateSuppliesCost(formData);
  const specialCareCost = calculateSpecialCareCost(formData);
  
  // Create monthly costs object
  const monthlyCosts: MonthlyCosts = {
    food: foodCost,
    medical: medicalCost,
    grooming: groomingCost,
    supplies: suppliesCost,
    specialCare: specialCareCost
  };
  
  // Calculate totals
  const monthlyTotal = Object.values(monthlyCosts).reduce((sum, cost) => sum + cost, 0);
  const yearlyTotal = monthlyTotal * 12;
  
  // Calculate estimated lifetime total
  let estimatedLifespan = 0;
  if (formData.animalType === 'dog') {
    estimatedLifespan = formData.animalSize === 'small' ? 15 : (formData.animalSize === 'medium' ? 12 : 10);
  } else if (formData.animalType === 'cat') {
    estimatedLifespan = 15;
  } else {
    estimatedLifespan = 10; // Default for other animals
  }
  
  // Adjust based on current age
  const remainingYears = Math.max(1, estimatedLifespan - formData.ageYears);
  const lifetimeTotal = yearlyTotal * remainingYears;
  
  // Create and return results
  return {
    monthlyCosts,
    monthlyTotal,
    yearlyTotal,
    lifetimeTotal,
    details: {
      monthlyBreakdown: {
        food: foodCost,
        healthcare: medicalCost + specialCareCost,
        adjustments: {
          healthConditions: formData.healthConditions.join(', '),
          specialNeeds: formData.specialCareNeeds.join(', ')
        }
      },
      initialCosts: {
        accessories: suppliesCost * 3,
        procedures: formData.isSterilized ? 0 : 500
      }
    }
  };
};

// Function to save the cost simulation to Supabase
export const saveCostSimulation = async (formData: AnimalCostFormData, results: CostResults) => {
  if (!supabase) return null;
  
  try {
    // Create a serializable version of the results for storage
    const resultsForStorage = {
      monthlyTotal: results.monthlyTotal,
      yearlyTotal: results.yearlyTotal,
      lifetimeTotal: results.lifetimeTotal,
      monthlyCosts: {
        food: results.monthlyCosts.food,
        medical: results.monthlyCosts.medical,
        grooming: results.monthlyCosts.grooming,
        supplies: results.monthlyCosts.supplies,
        specialCare: results.monthlyCosts.specialCare
      },
      details: {
        monthlyBreakdown: {
          food: results.details?.monthlyBreakdown.food,
          healthcare: results.details?.monthlyBreakdown.healthcare,
          adjustments: {
            healthConditions: results.details?.monthlyBreakdown.adjustments.healthConditions,
            specialNeeds: results.details?.monthlyBreakdown.adjustments.specialNeeds
          }
        },
        initialCosts: {
          accessories: results.details?.initialCosts.accessories,
          procedures: results.details?.initialCosts.procedures
        }
      }
    };
    
    const { data, error } = await supabase
      .from('cost_simulations')
      .insert({
        animal_type: formData.animalType,
        animal_size: formData.animalSize,
        age_months: formData.ageYears * 12 + formData.ageMonths,
        food_type: formData.foodType,
        health_conditions: formData.healthConditions,
        special_care_needs: formData.specialCareNeeds,
        estimated_monthly_cost: results.monthlyTotal,
        estimated_yearly_cost: results.yearlyTotal,
        estimated_lifetime_cost: results.lifetimeTotal,
        results_json: resultsForStorage
      })
      .select();
    
    if (error) {
      console.error('Error saving simulation:', error);
      return null;
    }
    
    return data ? data[0] : null;
  } catch (err) {
    console.error('Error saving simulation:', err);
    return null;
  }
};
