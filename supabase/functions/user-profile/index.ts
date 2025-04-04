
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

    // Inicializar cliente Supabase com SERVICE ROLE para bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey, {
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

    const { url, method } = req;
    
    // Ajuste para detectar a operação corretamente da URL ou query params
    // Suporta tanto o formato path/create-profile quanto ?operation=create-profile
    let operation = '';
    
    // Verificar primeiro se há um parâmetro de URL
    const urlObj = new URL(url);
    const operationParam = urlObj.searchParams.get('operation');
    
    if (operationParam) {
      // Se há um parâmetro operation na query string, usá-lo como operação
      operation = operationParam;
    } else {
      // Caso contrário, extrair da última parte do caminho
      const urlParts = url.split('/');
      operation = urlParts[urlParts.length - 1];
    }
    
    console.log(`Processando requisição: ${method} ${url} (operação: ${operation})`);

    // Get JWT token from request
    const authHeader = req.headers.get('Authorization');
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
    
    // Verify the JWT and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
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

    // Process based on operation and method
    if (method === "GET") {
      // Handle GET operations
      if (operation === "profile") {
        // Get user's extended profile from the users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();
        
        if (profileError) {
          // If profile doesn't exist yet, return basic user info
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
          
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar perfil do usuário", 
              details: profileError.message,
              code: profileError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify(userProfile),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else if (operation === "adoptions") {
        // Get user's adoptions
        const { data: adoptions, error: adoptionsError } = await supabase
          .from('adoptions')
          .select('*, pets!adoptions_pet_id_fkey(*, pet_images(*))')
          .eq('user_id', user.id);
        
        if (adoptionsError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar adoções do usuário", 
              details: adoptionsError.message,
              code: adoptionsError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify(adoptions),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else if (operation === "matches") {
        // Get user's pet matches
        const { data: matches, error: matchesError } = await supabase
          .from('pet_matches')
          .select('*, pets!pet_matches_pet_id_fkey(*, pet_images(*))')
          .eq('user_id', user.id);
        
        if (matchesError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar matches do usuário", 
              details: matchesError.message,
              code: matchesError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify(matches),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "POST") {
      // Handle POST operations
      if (operation === "create-profile") {
        const profileData = await req.json();
        
        // Validate required fields
        const requiredFields = ['name', 'phone', 'address', 'city', 'state', 'zip', 'housing_type', 'work_schedule'];
        const missingFields = requiredFields.filter(field => !profileData[field]);
        
        if (missingFields.length > 0) {
          return new Response(
            JSON.stringify({ 
              error: "Campos obrigatórios ausentes", 
              details: `Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`,
              missingFields,
              code: "MISSING_FIELDS" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();
        
        if (existingProfile) {
          return new Response(
            JSON.stringify({ 
              error: "Perfil já existe", 
              details: "Este usuário já possui um perfil. Use a operação de atualização para modificá-lo.",
              code: "PROFILE_EXISTS" 
            }),
            {
              status: 409,
              headers: corsHeaders,
            }
          );
        }
        
        // Insert user profile using service role to bypass RLS
        console.log('Criando perfil de usuário com auth_id:', user.id, 'email:', user.email);
        
        try {
          const { data: newProfile, error: profileError } = await supabase
            .from('users')
            .insert({
              auth_id: user.id,
              name: profileData.name,
              email: user.email,
              phone: profileData.phone || '',
              address: profileData.address || '',
              city: profileData.city || '',
              state: profileData.state || '',
              zip: profileData.zip || '',
              housing_type: profileData.housing_type || 'house',
              has_children: profileData.has_children || false,
              children_ages: profileData.children_ages || '',
              had_pets_before: profileData.had_pets_before || false,
              has_allergies: profileData.has_allergies || false,
              allergies_description: profileData.allergies_description || '',
              work_schedule: profileData.work_schedule || '',
              avatar_url: profileData.avatar_url || ''
            })
            .select()
            .single();
          
          if (profileError) {
            console.error('Error creating user profile:', profileError);
            return new Response(
              JSON.stringify({ 
                error: "Erro ao criar perfil", 
                details: profileError.message,
                code: profileError.code 
              }),
              {
                status: 500,
                headers: corsHeaders,
              }
            );
          }
          
          return new Response(
            JSON.stringify({
              ...newProfile,
              message: "Perfil criado com sucesso!"
            }),
            {
              status: 201,
              headers: corsHeaders,
            }
          );
        } catch (insertError) {
          console.error('Exception during profile creation:', insertError);
          return new Response(
            JSON.stringify({ 
              error: "Exceção ao criar perfil", 
              details: insertError.message || "Erro não especificado",
              code: "UNKNOWN_ERROR" 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
      }
    } else if (method === "PUT" || method === "PATCH") {
      // Handle PUT/PATCH operations
      if (operation === "update-profile") {
        const profileData = await req.json();
        
        // Get existing profile
        const { data: existingProfile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();
        
        if (profileError) {
          return new Response(
            JSON.stringify({ 
              error: "Perfil não encontrado", 
              details: "Não foi possível encontrar um perfil para este usuário. Crie um perfil primeiro.",
              code: "PROFILE_NOT_FOUND" 
            }),
            {
              status: 404,
              headers: corsHeaders,
            }
          );
        }
        
        // Build update object with only provided fields
        const updates: any = {};
        
        if (profileData.name) updates.name = profileData.name;
        if (profileData.phone) updates.phone = profileData.phone;
        if (profileData.address) updates.address = profileData.address;
        if (profileData.city) updates.city = profileData.city;
        if (profileData.state) updates.state = profileData.state;
        if (profileData.zip) updates.zip = profileData.zip;
        if (profileData.housing_type) updates.housing_type = profileData.housing_type;
        if (profileData.has_children !== undefined) updates.has_children = profileData.has_children;
        if (profileData.children_ages !== undefined) updates.children_ages = profileData.children_ages;
        if (profileData.had_pets_before !== undefined) updates.had_pets_before = profileData.had_pets_before;
        if (profileData.has_allergies !== undefined) updates.has_allergies = profileData.has_allergies;
        if (profileData.allergies_description !== undefined) updates.allergies_description = profileData.allergies_description;
        if (profileData.work_schedule) updates.work_schedule = profileData.work_schedule;
        if (profileData.avatar_url !== undefined) updates.avatar_url = profileData.avatar_url;
        
        // Update profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', existingProfile.id)
          .select()
          .single();
        
        if (updateError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atualizar perfil", 
              details: updateError.message,
              code: updateError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            ...updatedProfile,
            message: "Perfil atualizado com sucesso!"
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    }

    // If we get here, the operation was not recognized
    return new Response(
      JSON.stringify({ 
        error: "Operação não suportada", 
        details: "A operação solicitada não é suportada por esta API.",
        code: "UNSUPPORTED_OPERATION" 
      }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error("Erro não tratado:", error);
    
    // Extract error information
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const errorName = error instanceof Error ? error.name : "UnknownError";
    
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
