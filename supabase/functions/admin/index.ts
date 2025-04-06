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

    // Inicializar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "admin-edge-function",
        },
      },
    });

    const { url, method } = req;
    console.log(`Recebida requisição ${method} para ${url}`);
    
    // Parse request body for endpoint information if provided
    let requestBody = {};
    let endpoint = '';
    
    if (req.method !== 'GET') {
      try {
        requestBody = await req.json();
        console.log("Request body:", requestBody);
        if (requestBody && requestBody.endpoint) {
          endpoint = requestBody.endpoint;
          console.log(`Endpoint extraído do body: ${endpoint}`);
        }
      } catch (error) {
        console.log("Nenhum body JSON válido na requisição ou requisição GET");
      }
    }

    // Determine operation from URL or body
    let operation = '';
    
    // Extract operation from URL path
    const urlParts = url.split('/');
    if (urlParts.length > 0) {
      operation = urlParts[urlParts.length - 1];
    }
    
    // If endpoint is specified in body, override operation
    if (endpoint === '/users') {
      operation = 'users';
      console.log("Operação definida para 'users' com base no endpoint do body");
    }
    
    console.log(`Operação determinada: ${operation}`);

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

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
      
    if (!roleData) {
      return new Response(
        JSON.stringify({ 
          error: "Acesso negado", 
          details: "Apenas administradores podem acessar este recurso.",
          code: "ACCESS_DENIED" 
        }),
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Process based on operation and method
    if (method === "GET" || (method === "POST" && operation === "users")) {
      // Handle GET operations
      if (operation === "users") {
        console.log("Processando solicitação para listar todos os usuários");
        // Get all users
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Erro ao buscar usuários:", error);
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar usuários", 
              details: error.message,
              code: error.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        console.log(`Retornando ${data?.length || 0} usuários`);
        return new Response(
          JSON.stringify(data || []),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "POST") {
      // Handle POST operations
      if (operation === "create-admin") {
        // Check if user has permission to manage admins
        if (!roleData.permissions?.manageAdmins) {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Você não tem permissão para gerenciar administradores.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        const adminData = await req.json();
        
        // Validate required fields
        if (!adminData.email || !adminData.password || !adminData.name) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "Email, senha e nome são obrigatórios para criar um administrador.",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Create user in auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: adminData.email,
          password: adminData.password,
          email_confirm: true,
          user_metadata: { name: adminData.name, isAdmin: true }
        });
        
        if (authError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao criar usuário", 
              details: authError.message,
              code: authError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Assign admin role
        const roleData = {
          user_id: authData.user.id,
          role: 'admin',
          permissions: adminData.permissions || {
            manageAnimals: true,
            approveAdoptions: true,
            manageSettings: false,
            manageAdmins: false
          }
        };
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert(roleData);
        
        if (roleError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atribuir função de administrador", 
              details: roleError.message,
              code: roleError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            id: authData.user.id,
            email: authData.user.email,
            role: 'admin',
            permissions: roleData.permissions,
            message: "Administrador criado com sucesso!"
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      } else if (operation === "create-system-parameter") {
        // Check if user has permission to manage settings
        if (!roleData.permissions?.manageSettings) {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Você não tem permissão para gerenciar configurações do sistema.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        const paramData = await req.json();
        
        // Validate required fields
        if (!paramData.category || !paramData.key || paramData.value === undefined) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "Categoria, chave e valor são obrigatórios para criar um parâmetro.",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Create parameter
        const { error } = await supabase
          .from('system_parameters')
          .insert({
            category: paramData.category,
            key: paramData.key,
            value: paramData.value,
            description: paramData.description || '',
            created_by: user.id
          });
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao criar parâmetro do sistema", 
              details: error.message,
              code: error.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            message: "Parâmetro do sistema criado com sucesso!"
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "PUT" || method === "PATCH") {
      // Handle PUT/PATCH operations
      if (operation === "update-admin-permissions") {
        // Check if user has permission to manage admins
        if (!roleData.permissions?.manageAdmins) {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Você não tem permissão para gerenciar administradores.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        const permissionData = await req.json();
        
        if (!permissionData.userId || !permissionData.permissions) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "ID do usuário e permissões são obrigatórios.",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Cannot change your own admin permissions
        if (permissionData.userId === user.id) {
          return new Response(
            JSON.stringify({ 
              error: "Operação não permitida", 
              details: "Você não pode modificar suas próprias permissões.",
              code: "SELF_MODIFICATION" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        // Update permissions
        const updateObj = { permissions: permissionData.permissions };
        
        const { error } = await supabase
          .from('user_roles')
          .update(updateObj)
          .eq('user_id', permissionData.userId)
          .eq('role', 'admin');
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atualizar permissões", 
              details: error.message,
              code: error.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            message: "Permissões atualizadas com sucesso!"
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else if (operation === "update-system-parameter") {
        // Check if user has permission to manage settings
        if (!roleData.permissions?.manageSettings) {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Você não tem permissão para gerenciar configurações do sistema.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        const paramData = await req.json();
        
        if (!paramData.id || paramData.value === undefined) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "ID do parâmetro e valor são obrigatórios.",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Build update object
        const updates: any = { value: paramData.value };
        
        if (paramData.description !== undefined) {
          updates.description = paramData.description;
        }
        
        // Update parameter
        const { error } = await supabase
          .from('system_parameters')
          .update(updates)
          .eq('id', paramData.id);
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atualizar parâmetro do sistema", 
              details: error.message,
              code: error.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            message: "Parâmetro do sistema atualizado com sucesso!"
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "DELETE") {
      // Handle DELETE operations
      if (operation === "remove-admin") {
        // Check if user has permission to manage admins
        if (!roleData.permissions?.manageAdmins) {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Você não tem permissão para gerenciar administradores.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        const userId = urlParts[urlParts.length - 2];
        
        if (!userId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do usuário não fornecido", 
              details: "É necessário fornecer um ID válido para remover um administrador.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Cannot remove yourself
        if (userId === user.id) {
          return new Response(
            JSON.stringify({ 
              error: "Operação não permitida", 
              details: "Você não pode remover seu próprio acesso administrativo.",
              code: "SELF_REMOVAL" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao remover função de administrador", 
              details: error.message,
              code: error.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            message: "Função de administrador removida com sucesso!"
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
        details: `A operação solicitada "${operation}" não é suportada por esta API.`,
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
