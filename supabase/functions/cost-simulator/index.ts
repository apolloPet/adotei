
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CostSimulatorFormData = {
  animalType: 'dog' | 'cat' | 'other';
  animalSize: 'small' | 'medium' | 'large';
  ageMonths: number;
  healthConditions: string[];
  specialCareNeeds: string[];
  foodType: 'basic' | 'premium' | 'special';
  isSterilized?: boolean;
};

type CostResults = {
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
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Create Supabase client using auth from request
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Parse request body
    const requestData: CostSimulatorFormData = await req.json();
    
    // Get cost parameters from database
    const { data: costParams, error: paramsError } = await supabaseClient
      .from('cost_parameters')
      .select('*')
      .eq('is_active', true);
    
    if (paramsError) {
      console.error("Error fetching cost parameters:", paramsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch cost parameters" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate costs based on parameters and input
    const {
      animalType,
      animalSize,
      ageMonths,
      healthConditions,
      specialCareNeeds,
      foodType,
      isSterilized,
    } = requestData;

    // Define base costs (these would ideally come from costParams)
    const getParamValue = (category: string, name: string, defaultValue: number) => {
      const param = costParams?.find(p => p.category === category && p.name === name);
      return param ? Number(param.value) : defaultValue;
    };

    // Food costs per month
    const baseFoodCostSmall = getParamValue('food', 'small_base', 50);
    const baseFoodCostMedium = getParamValue('food', 'medium_base', 100);
    const baseFoodCostLarge = getParamValue('food', 'large_base', 150);
    
    // Multipliers for food type
    const basicFoodMultiplier = getParamValue('food', 'basic_multiplier', 0.8);
    const premiumFoodMultiplier = getParamValue('food', 'premium_multiplier', 1.0);
    const specialFoodMultiplier = getParamValue('food', 'special_multiplier', 1.5);
    
    // Healthcare costs per month
    const baseHealthcareCost = getParamValue('healthcare', 'base', 30);
    const healthConditionCost = getParamValue('healthcare', 'condition_cost', 20);
    const specialCareNeedCost = getParamValue('healthcare', 'special_need_cost', 25);
    
    // Initial costs
    const accessoriesCostSmall = getParamValue('initial', 'accessories_small', 100);
    const accessoriesCostMedium = getParamValue('initial', 'accessories_medium', 150);
    const accessoriesCostLarge = getParamValue('initial', 'accessories_large', 200);
    const sterilizationCost = getParamValue('initial', 'sterilization', 150);
    
    // Life expectancy in years
    const lifeExpectancyDog = getParamValue('life', 'dog', 12);
    const lifeExpectancyDogSmall = getParamValue('life', 'dog_small', 14);
    const lifeExpectancyCat = getParamValue('life', 'cat', 15);
    const lifeExpectancyOther = getParamValue('life', 'other', 8);
    
    // Calculate food cost based on size
    let monthlyFoodCost = 0;
    switch (animalSize) {
      case 'small':
        monthlyFoodCost = baseFoodCostSmall;
        break;
      case 'medium':
        monthlyFoodCost = baseFoodCostMedium;
        break;
      case 'large':
        monthlyFoodCost = baseFoodCostLarge;
        break;
    }
    
    // Apply food type multiplier
    switch (foodType) {
      case 'basic':
        monthlyFoodCost *= basicFoodMultiplier;
        break;
      case 'premium':
        monthlyFoodCost *= premiumFoodMultiplier;
        break;
      case 'special':
        monthlyFoodCost *= specialFoodMultiplier;
        break;
    }
    
    // Calculate healthcare costs
    let monthlyHealthcareCost = baseHealthcareCost;
    const healthConditionAdjustment = healthConditions.length * healthConditionCost;
    const specialNeedsAdjustment = specialCareNeeds.length * specialCareNeedCost;
    monthlyHealthcareCost += healthConditionAdjustment + specialNeedsAdjustment;
    
    // Calculate initial costs
    let accessoriesCost = 0;
    switch (animalSize) {
      case 'small':
        accessoriesCost = accessoriesCostSmall;
        break;
      case 'medium':
        accessoriesCost = accessoriesCostMedium;
        break;
      case 'large':
        accessoriesCost = accessoriesCostLarge;
        break;
    }
    
    // Calculate sterilization cost if not already sterilized
    const proceduresCost = isSterilized ? 0 : sterilizationCost;
    
    // Total monthly cost
    const monthlyCost = monthlyFoodCost + monthlyHealthcareCost;
    
    // Calculate yearly cost
    const yearlyCost = monthlyCost * 12;
    
    // Estimate remaining lifetime based on animal type, size, and current age
    let lifeExpectancyYears = 0;
    switch (animalType) {
      case 'dog':
        lifeExpectancyYears = animalSize === 'small' ? lifeExpectancyDogSmall : lifeExpectancyDog;
        break;
      case 'cat':
        lifeExpectancyYears = lifeExpectancyCat;
        break;
      case 'other':
        lifeExpectancyYears = lifeExpectancyOther;
        break;
    }
    
    // Convert current age from months to years and subtract from life expectancy
    const currentAgeYears = ageMonths / 12;
    const remainingLifeYears = Math.max(0, lifeExpectancyYears - currentAgeYears);
    
    // Calculate lifetime cost
    const lifetimeCost = yearlyCost * remainingLifeYears + accessoriesCost + proceduresCost;
    
    // Format results
    const results: CostResults = {
      monthlyCost: Math.round(monthlyCost),
      yearlyCost: Math.round(yearlyCost),
      lifetimeCost: Math.round(lifetimeCost),
      details: {
        monthlyBreakdown: {
          food: Math.round(monthlyFoodCost),
          healthcare: Math.round(monthlyHealthcareCost),
          adjustments: {
            healthConditions: healthConditions.length > 0 ? `+${healthConditionAdjustment}` : "N/A",
            specialNeeds: specialCareNeeds.length > 0 ? `+${specialNeedsAdjustment}` : "N/A"
          }
        },
        initialCosts: {
          accessories: accessoriesCost,
          procedures: proceduresCost
        },
        inputParameters: requestData
      }
    };
    
    // Save simulation results to database
    const { data: savedSimulation, error: saveError } = await supabaseClient
      .from('cost_simulations')
      .insert({
        animal_type: animalType,
        animal_size: animalSize,
        age_months: ageMonths,
        food_type: foodType,
        health_conditions: healthConditions,
        special_care_needs: specialCareNeeds,
        estimated_monthly_cost: results.monthlyCost,
        estimated_yearly_cost: results.yearlyCost,
        estimated_lifetime_cost: results.lifetimeCost,
        results_json: results
      })
      .select()
      .single();
    
    if (saveError) {
      console.error("Error saving simulation results:", saveError);
      // Continue anyway, just log the error
    } else {
      // Add the ID from the saved record to the results
      results.id = savedSimulation.id;
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
