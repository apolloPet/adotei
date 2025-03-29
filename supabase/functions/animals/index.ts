
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Variáveis de ambiente não configuradas: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({
          error: "Configuração do servidor incompleta.",
          details: "As variáveis de ambiente necessárias não foram configuradas. Entre em contato com o administrador do sistema.",
          code: "ENV_VARS_MISSING"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Inicializar cliente Supabase com bypass_rls para operações administrativas
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "animals-edge-function",
        },
      },
    });

    // Parse animal data
    let animalData;
    try {
      animalData = await req.json();
    } catch (error) {
      console.error("Erro ao processar JSON do request:", error);
      return new Response(
        JSON.stringify({ 
          error: "Formato de dados inválido", 
          details: "Os dados enviados não estão em formato JSON válido. Verifique o formato e tente novamente.",
          code: "INVALID_JSON" 
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validar dados do animal
    if (!animalData) {
      return new Response(
        JSON.stringify({ 
          error: "Dados ausentes", 
          details: "Nenhum dado foi enviado no corpo da requisição. Por favor, forneça os dados do animal.",
          code: "MISSING_DATA"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Log dos dados recebidos para depuração
    console.log("Dados do animal recebidos:", JSON.stringify(animalData, null, 2));

    // Verificar campos obrigatórios - removendo "breed" dos campos obrigatórios
    const requiredFields = ["nome", "idade", "tipo", "porte", "sexo"];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (animalData[field] === undefined || animalData[field] === null || 
         (typeof animalData[field] === 'string' && animalData[field].trim() === '')) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      const fieldsStr = missingFields.join(", ");
      return new Response(
        JSON.stringify({ 
          error: "Campos obrigatórios ausentes", 
          details: `Os seguintes campos são obrigatórios para o cadastro: ${fieldsStr}`,
          missingFields: missingFields,
          code: "MISSING_FIELDS"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    // Validações adicionais específicas
    if (typeof animalData.idade !== 'number' || animalData.idade < 0) {
      return new Response(
        JSON.stringify({ 
          error: "Idade inválida", 
          details: "A idade deve ser um número positivo.",
          code: "INVALID_AGE"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    if (!['cachorro', 'gato', 'outro'].includes(animalData.tipo)) {
      return new Response(
        JSON.stringify({ 
          error: "Tipo inválido", 
          details: "O tipo do animal deve ser 'cachorro', 'gato' ou 'outro'.",
          code: "INVALID_TYPE"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    if (!['pequeno', 'medio', 'grande'].includes(animalData.porte)) {
      return new Response(
        JSON.stringify({ 
          error: "Porte inválido", 
          details: "O porte do animal deve ser 'pequeno', 'medio' ou 'grande'.",
          code: "INVALID_SIZE"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    if (!['macho', 'femea'].includes(animalData.sexo)) {
      return new Response(
        JSON.stringify({ 
          error: "Sexo inválido", 
          details: "O sexo do animal deve ser 'macho' ou 'femea'.",
          code: "INVALID_GENDER"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Verifica a descrição para garantir uma descrição mínima adequada
    if (!animalData.descricao || animalData.descricao.trim().length < 20) {
      return new Response(
        JSON.stringify({ 
          error: "Descrição inválida", 
          details: "A descrição deve ter pelo menos 20 caracteres para fornecer informações suficientes sobre o animal.",
          code: "INVALID_DESCRIPTION"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Verifica se tem pelo menos uma foto
    if (!animalData.fotos || !Array.isArray(animalData.fotos) || animalData.fotos.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Fotos ausentes", 
          details: "É necessário fornecer pelo menos uma foto do animal.",
          code: "MISSING_PHOTOS"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Log dos dados recebidos
    console.log("Dados do animal validados e prontos para inserção:", animalData);

    // Adicionar data de cadastro atual se não fornecida
    if (!animalData.data_cadastro) {
      animalData.data_cadastro = new Date().toISOString();
    }

    // Garantir que vacinas e fotos sejam arrays ou objetos convertíveis para JSONB
    animalData.vacinas = animalData.vacinas || [];
    animalData.fotos = animalData.fotos || [];

    // Ajustar para campo fotoprincipal (minúsculo) conforme esperado no banco
    if (animalData.fotoPrincipal !== undefined) {
      animalData.fotoprincipal = animalData.fotoPrincipal;
      delete animalData.fotoPrincipal;
    } else if (animalData.fotos && animalData.fotos.length > 0) {
      // Se não tiver foto principal definida mas tiver fotos, usa a primeira como principal
      animalData.fotoprincipal = animalData.fotos[0];
    }

    // Remover o responsavel_id se for o placeholder 00000000-0000-0000-0000-000000000000
    if (animalData.responsavel_id === "00000000-0000-0000-0000-000000000000") {
      delete animalData.responsavel_id;
      console.log("Removendo responsavel_id placeholder para evitar erros de FK");
    }

    let animalForInsert = {...animalData};

    // Verifica se precisamos criar um usuário de sistema para ser o responsável
    if (!animalForInsert.responsavel_id) {
      try {
        // Verificar se já existe o usuário de sistema
        const { data: systemUser, error: findError } = await supabase
          .from("profiles")
          .select("id")
          .eq("first_name", "Sistema")
          .single();
        
        if (findError && findError.code !== "PGRST116") {
          console.error("Erro ao buscar usuário de sistema:", findError);
        }
        
        if (systemUser) {
          animalForInsert.responsavel_id = systemUser.id;
          console.log(`Usando usuário de sistema existente como responsável: ${systemUser.id}`);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário de sistema:", error);
      }
    }

    // Se depois de tudo isso ainda não temos um responsável, 
    // não incluiremos o campo, assumindo que a coluna tem default ou é nullable
    console.log("Animal preparado para inserção:", animalForInsert);

    // Inserir animal no banco de dados usando o cliente com bypass_rls
    const { data, error } = await supabase
      .from("animals")
      .insert(animalForInsert)
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir animal no banco:", error);
      
      // Mapear códigos de erro para mensagens amigáveis
      let statusCode = 500;
      let errorMessage = "Erro ao cadastrar animal";
      let details = error.message;
      let errorCode = error.code || "UNKNOWN_ERROR";
      
      switch (error.code) {
        case "23505":
          statusCode = 409;
          errorMessage = "Animal já cadastrado";
          details = "Já existe um animal com essas informações no sistema. Verifique os dados e tente novamente.";
          break;
        case "42501":
          statusCode = 403;
          errorMessage = "Permissão negada";
          details = "Você não tem permissão para cadastrar um animal. Entre em contato com um administrador.";
          break;
        case "23502":
          statusCode = 400;
          errorMessage = "Dados incompletos";
          details = "Campos obrigatórios não foram fornecidos. Verifique os dados e tente novamente.";
          break;
        case "22P02":
          statusCode = 400;
          errorMessage = "Formato de dados inválido";
          details = "Um ou mais campos contêm dados em formato inválido. Verifique os tipos de dados e tente novamente.";
          break;
        case "23503":
          statusCode = 400;
          errorMessage = "Referência inválida";
          details = "Uma referência a outro registro (como responsável) é inválida. Verifique os IDs fornecidos.";
          break;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          details: details,
          code: errorCode
        }),
        {
          status: statusCode,
          headers: corsHeaders,
        }
      );
    }

    if (!data) {
      console.error("Nenhum dado retornado após inserção bem-sucedida");
      return new Response(
        JSON.stringify({ 
          error: "Erro de processamento", 
          details: "O cadastro foi realizado, mas não foi possível recuperar os dados. Verifique na lista de animais.",
          code: "DATA_RETRIEVAL_ERROR"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    console.log("Animal cadastrado com sucesso:", data);

    // Retornar dados do animal cadastrado
    return new Response(
      JSON.stringify({
        ...data,
        message: "Animal cadastrado com sucesso!"
      }),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Erro não tratado:", error);
    
    // Extrair informações detalhadas do erro
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const errorName = error instanceof Error ? error.name : "UnknownError";
    const errorStack = error instanceof Error ? error.stack : null;
    
    return new Response(
      JSON.stringify({ 
        error: "Erro no servidor", 
        details: `Ocorreu um erro inesperado ao processar sua solicitação: ${errorMessage}`,
        errorType: errorName,
        code: "SERVER_ERROR"
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
