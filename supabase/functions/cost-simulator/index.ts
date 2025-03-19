
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CostSimulationRequest {
  animalType: 'dog' | 'cat' | 'other';
  animalSize: 'small' | 'medium' | 'large';
  ageMonths: number;
  healthConditions: string[];
  specialCareNeeds: string[];
  foodType: 'basic' | 'premium' | 'special';
  estimatedLifespan?: number; // em anos
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Obter o autor da simulação
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // Verificar permissões em caso de operações sensíveis
    if (req.method !== 'POST' && req.method !== 'GET') {
      // Verificar se é administrador para outras operações
      const { data: isAdmin } = await supabaseClient.rpc('is_admin', { uid: user?.id })
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Permissão negada. Apenas administradores podem executar esta operação.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }
    }

    const url = new URL(req.url)
    const simulationId = url.searchParams.get('id')

    // Carregar uma simulação existente
    if (req.method === 'GET' && simulationId) {
      console.log(`Carregando simulação: ${simulationId}`)
      const { data, error } = await supabaseClient
        .from('cost_simulations')
        .select('*')
        .eq('id', simulationId)
        .maybeSingle()

      if (error) throw error

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Realizar nova simulação
    if (req.method === 'POST') {
      const requestData: CostSimulationRequest = await req.json()

      console.log(`Iniciando simulação de custos para animal: ${requestData.animalType}, porte: ${requestData.animalSize}`)

      // Buscar parâmetros de custo do banco de dados
      const { data: costParams, error: costParamsError } = await supabaseClient
        .from('cost_parameters')
        .select('*')
        .eq('is_active', true)

      if (costParamsError) throw costParamsError

      // Converter array de parâmetros para um objeto para facilitar o acesso
      const params = costParams.reduce((acc, param) => {
        if (!acc[param.category]) {
          acc[param.category] = {}
        }
        acc[param.category][param.name] = param.value
        return acc
      }, {} as Record<string, Record<string, number>>)

      // Calcular custo mensal de alimentação
      let sizeKey = 'pequeno'
      if (requestData.animalSize === 'medium') sizeKey = 'médio'
      if (requestData.animalSize === 'large') sizeKey = 'grande'

      const foodTypePrefix = requestData.foodType === 'premium' ? 'ração_premium' : 
                             requestData.foodType === 'special' ? 'ração_especial' : 'ração_básica'
      
      // Valor padrão caso não exista o parâmetro específico
      let monthlyCost = params.alimentação?.[`${foodTypePrefix}_${sizeKey}`] || 0
      
      // Adicionar custos de saúde
      const annualHealthCare = (params.saúde?.vacinas_anuais || 0) + 
                              (params.saúde?.anti_pulgas || 0) * 12 +
                              (params.saúde?.consulta_veterinária || 0) * 2 // 2 consultas por ano

      // Custos mensais totais
      monthlyCost += annualHealthCare / 12

      // Adicionar custos especiais baseados nas condições de saúde
      for (const condition of requestData.healthConditions) {
        // Aumentar custos em 15% para cada condição de saúde
        monthlyCost *= 1.15
      }

      // Adicionar custos especiais baseados nas necessidades especiais
      for (const need of requestData.specialCareNeeds) {
        // Aumentar custos em 10% para cada necessidade especial
        monthlyCost *= 1.10
      }

      // Arredondar para 2 casas decimais
      monthlyCost = parseFloat(monthlyCost.toFixed(2))
      const yearlyCost = parseFloat((monthlyCost * 12).toFixed(2))

      // Calcular custo de vida estimado
      const estimatedLifespan = requestData.estimatedLifespan || 
                              (requestData.animalType === 'dog' ? 12 : 
                               requestData.animalType === 'cat' ? 15 : 10)
      
      const estimatedAgeInYears = requestData.ageMonths / 12
      const remainingYears = Math.max(0, estimatedLifespan - estimatedAgeInYears)
      const lifetimeCost = parseFloat((yearlyCost * remainingYears).toFixed(2))

      // Preparar resultado detalhado
      const resultsJson = {
        monthlyBreakdown: {
          food: params.alimentação?.[`${foodTypePrefix}_${sizeKey}`] || 0,
          healthcare: annualHealthCare / 12,
          adjustments: {
            healthConditions: requestData.healthConditions.length > 0 ? 
              `+${((1.15 ** requestData.healthConditions.length - 1) * 100).toFixed(0)}%` : '0%',
            specialNeeds: requestData.specialCareNeeds.length > 0 ?
              `+${((1.10 ** requestData.specialCareNeeds.length - 1) * 100).toFixed(0)}%` : '0%'
          }
        },
        initialCosts: {
          accessories: (params.acessórios?.cama || 0) + (params.acessórios?.coleira || 0),
          procedures: params.procedimentos?.[`castração_${sizeKey}`] || 0
        },
        inputParameters: requestData
      }

      // Salvar resultado no banco de dados
      const { data: savedSimulation, error: saveError } = await supabaseClient
        .from('cost_simulations')
        .insert({
          user_id: user?.id,
          animal_type: requestData.animalType,
          animal_size: requestData.animalSize,
          age_months: requestData.ageMonths,
          health_conditions: requestData.healthConditions,
          special_care_needs: requestData.specialCareNeeds,
          food_type: requestData.foodType,
          estimated_monthly_cost: monthlyCost,
          estimated_yearly_cost: yearlyCost,
          estimated_lifetime_cost: lifetimeCost,
          results_json: resultsJson
        })
        .select()
        .single()

      if (saveError) throw saveError

      console.log(`Simulação concluída. ID: ${savedSimulation.id}`)

      return new Response(
        JSON.stringify({
          id: savedSimulation.id,
          monthlyCost,
          yearlyCost,
          lifetimeCost,
          details: resultsJson
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Caso de método HTTP não suportado
    return new Response(
      JSON.stringify({ error: 'Método não suportado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  } catch (error) {
    console.error('Erro no simulador de custos:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
