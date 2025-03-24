
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
          error: "Configuração do servidor incompleta. Contate o administrador do sistema.",
          details: "Variáveis de ambiente necessárias não foram configuradas."
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
          error: "Erro ao processar dados do animal", 
          details: "Os dados enviados não estão em formato JSON válido." 
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
          error: "Dados do animal não fornecidos", 
          details: "O corpo da requisição está vazio ou inválido."
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Verificar campos obrigatórios
    const requiredFields = ["nome", "idade", "tipo", "porte", "sexo"];
    for (const field of requiredFields) {
      if (animalData[field] === undefined || animalData[field] === null) {
        return new Response(
          JSON.stringify({ 
            error: `Campo obrigatório não fornecido: ${field}`, 
            details: `O campo '${field}' é obrigatório para o cadastro de um animal.`
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
    }

    // Log dos dados recebidos
    console.log("Dados do animal recebidos:", animalData);

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
    }

    // Inserir animal no banco de dados usando o cliente com bypass_rls
    const { data, error } = await supabase
      .from("animals")
      .insert(animalData)
      .select()
      .single();

    if (error) {
      console.error("Erro ao inserir animal no banco:", error);
      
      // Mapear códigos de erro para mensagens amigáveis
      let statusCode = 500;
      let errorMessage = "Erro interno ao cadastrar animal";
      let details = error.message;
      
      switch (error.code) {
        case "23505":
          statusCode = 409;
          errorMessage = "Este animal já existe no sistema";
          details = "Violação de restrição única no banco de dados";
          break;
        case "42501":
          statusCode = 403;
          errorMessage = "Sem permissão para cadastrar animal";
          details = "Operação negada devido a políticas de segurança";
          break;
        case "23502":
          statusCode = 400;
          errorMessage = "Dados incompletos para cadastro";
          details = "Um campo obrigatório não foi fornecido";
          break;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage, 
          details: details,
          code: error.code 
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
          error: "Erro ao recuperar dados do animal cadastrado", 
          details: "A inserção foi bem-sucedida, mas não foi possível recuperar os dados inseridos."
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
      JSON.stringify(data),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Erro não tratado:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro inesperado ao processar solicitação", 
        details: error instanceof Error ? error.message : "Erro desconhecido"
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
