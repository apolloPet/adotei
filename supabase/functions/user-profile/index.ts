
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variáveis de ambiente não configuradas: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({
          error: "Configuração do servidor incompleta.",
          details: "As variáveis de ambiente necessárias não foram configuradas.",
          code: "ENV_VARS_MISSING"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Inicializar cliente Supabase com SERVICE ROLE para bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "user-profile-edge-function",
        },
      },
    });

    const { method, headers } = req;
    
    // Get JWT token from request
    const authHeader = headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          error: "Não autorizado", 
          details: "Autenticação é necessária para acessar este recurso.",
          code: "UNAUTHORIZED" 
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Extract the JWT
    const jwt = authHeader.substring(7);
    
    // Verify the JWT and get user information - using standard client
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          error: "Token inválido", 
          details: "Sua sessão é inválida ou expirou. Por favor, faça login novamente.",
          code: "INVALID_TOKEN" 
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Parse the request body
    let requestBody = {};
    try {
      if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
        requestBody = await req.json();
      }
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ 
          error: "Formato de requisição inválido", 
          details: "O corpo da requisição não está em um formato JSON válido.",
          code: "INVALID_REQUEST_FORMAT" 
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Determine the operation based on the method and path
    if (method === "POST" && requestBody.operation === "create-profile") {
      // Creating a new user profile
      console.log("Creating user profile for:", user.id);
      
      try {
        // Check if profile already exists
        const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();
          
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error("Error checking for existing profile:", profileCheckError);
          throw profileCheckError;
        }
        
        if (existingProfile) {
          console.log("Profile already exists for user:", user.id);
          // Update existing profile instead
          const { data: updatedProfile, error: updateError } = await supabaseAdmin
            .from('users')
            .update({
              name: requestBody.name || user.user_metadata?.name || '',
              email: user.email,
              phone: requestBody.phone || '',
              address: requestBody.address || '',
              city: requestBody.city || '',
              state: requestBody.state || '',
              zip: requestBody.zip || '',
              housing_type: requestBody.housing_type || 'house',
              has_children: requestBody.has_children || false,
              children_ages: requestBody.children_ages || '',
              had_pets_before: requestBody.had_pets_before || false,
              has_allergies: requestBody.has_allergies || false,
              allergies_description: requestBody.allergies_description || '',
              work_schedule: requestBody.work_schedule || '',
              updated_at: new Date()
            })
            .eq('auth_id', user.id)
            .select()
            .single();
            
          if (updateError) {
            console.error("Error updating user profile:", updateError);
            throw updateError;
          }
          
          return new Response(
            JSON.stringify({ 
              message: "Perfil atualizado com sucesso",
              profile: updatedProfile,
              updated: true
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
        }
        
        // Create a new profile using the admin client that bypasses RLS
        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            auth_id: user.id,
            email: user.email,
            name: requestBody.name || user.user_metadata?.name || '',
            phone: requestBody.phone || '',
            address: requestBody.address || '',
            city: requestBody.city || '',
            state: requestBody.state || '',
            zip: requestBody.zip || '',
            housing_type: requestBody.housing_type || 'house',
            has_children: requestBody.has_children || false,
            children_ages: requestBody.children_ages || '',
            had_pets_before: requestBody.had_pets_before || false,
            has_allergies: requestBody.has_allergies || false,
            allergies_description: requestBody.allergies_description || '',
            work_schedule: requestBody.work_schedule || ''
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          throw insertError;
        }
        
        return new Response(
          JSON.stringify({ 
            message: "Perfil criado com sucesso",
            profile: newProfile,
            created: true
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error("Error in create-profile operation:", error);
        return new Response(
          JSON.stringify({ 
            error: "Erro ao criar perfil",
            details: error.message || "Ocorreu um erro ao processar a requisição",
            code: error.code || "INTERNAL_SERVER_ERROR"
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "GET") {
      // Fetch user profile
      try {
        const { data: userProfile, error: profileError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();
          
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || '',
                message: "Perfil completo ainda não criado"
              }),
              {
                status: 200,
                headers: corsHeaders,
              }
            );
          }
          
          throw profileError;
        }
        
        return new Response(
          JSON.stringify(userProfile),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return new Response(
          JSON.stringify({ 
            error: "Erro ao buscar perfil",
            details: error.message || "Ocorreu um erro ao processar a requisição",
            code: error.code || "INTERNAL_SERVER_ERROR"
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Operação não suportada", 
        details: "A operação requisitada não é suportada por esta função.",
        code: "UNSUPPORTED_OPERATION" 
      }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno", 
        details: "Ocorreu um erro inesperado ao processar a requisição.",
        code: "INTERNAL_SERVER_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
