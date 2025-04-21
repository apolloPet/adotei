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
          success: false,
          message: "Configuração do servidor incompleta. Verifique as variáveis de ambiente.",
          code: "ENV_VARS_MISSING"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Inicializar cliente Supabase com chave de serviço para acesso administrativo
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get JWT token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Token de autenticação ausente ou inválido:', authHeader);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Não autorizado. Autenticação é necessária para acessar este recurso.",
          code: "UNAUTHORIZED" 
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Extract the JWT
    const token = authHeader.substring(7);
    console.log('Token recebido (primeiros 10 caracteres):', token.substring(0, 10) + '...');
    
    // Verify the JWT and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      console.error('Erro na verificação do token:', authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Token inválido ou sessão expirada. Por favor, faça login novamente.",
          code: "INVALID_TOKEN",
          details: authError.message
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }
    
    if (!user) {
      console.error('Usuário não encontrado para o token fornecido');
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Usuário não encontrado. Por favor, faça login novamente.",
          code: "USER_NOT_FOUND" 
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    console.log('Usuário autenticado:', user.email);

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (roleError) {
      console.error('Erro ao verificar papel do usuário:', roleError);
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Erro ao verificar permissões de administrador.",
          code: "ROLE_CHECK_FAILED",
          details: roleError.message
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
      
    if (!roleData) {
      // Verificação alternativa por convenção de email
      const isAdminByEmail = 
        user.email.includes('@admin') || 
        user.email.includes('@ong') || 
        user.email === 'admin@petmatch.com';
        
      if (!isAdminByEmail) {
        console.error('Usuário não tem papel de administrador:', user.email);
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Acesso negado. Apenas administradores podem gerenciar outros administradores.",
            code: "ACCESS_DENIED" 
          }),
          {
            status: 403,
            headers: corsHeaders,
          }
        );
      }
      
      console.log('Usuário autorizado por convenção de email:', user.email);
    } else {
      console.log('Usuário tem papel de administrador com permissões:', roleData.permissions);
    
      // Check if user has permission to manage admins
      if (!roleData.permissions?.manageAdmins) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Acesso negado. Você não tem permissão para gerenciar administradores.",
            code: "INSUFFICIENT_PERMISSIONS" 
          }),
          {
            status: 403,
            headers: corsHeaders,
          }
        );
      }
    }

    // Determine the operation based on HTTP method
    if (req.method === "POST") {
      const requestData = await req.json();
      
      // Validate required fields
      if (!requestData.email || !requestData.password || !requestData.name) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Dados incompletos. Email, senha e nome são obrigatórios.",
            code: "MISSING_DATA" 
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
      
      // Validate permissions format
      if (!requestData.permissions || typeof requestData.permissions !== 'object') {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Formato inválido para permissões.",
            code: "INVALID_PERMISSIONS" 
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      console.log(`Criando administrador: ${requestData.email}, permissions:`, requestData.permissions);
      
      // Step 1: Create user in Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: requestData.email,
        password: requestData.password,
        email_confirm: true,
        user_metadata: { name: requestData.name, isAdmin: true }
      });
      
      if (userError) {
        console.error('Erro ao criar usuário:', userError);
        return new Response(
          JSON.stringify({ 
            success: false,
            message: userError.message,
            code: userError.code || "USER_CREATION_FAILED" 
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      if (!userData.user) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Erro ao criar usuário. Nenhum usuário retornado.",
            code: "USER_CREATION_FAILED" 
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      console.log(`Usuário criado com ID: ${userData.user.id}`);
      
      // Step 2: Assign admin role to user
      const roleInsertData = {
        user_id: userData.user.id,
        role: 'admin',
        permissions: requestData.permissions || {
          manageAnimals: true,
          approveAdoptions: true,
          manageSettings: false,
          manageAdmins: false
        }
      };
      
      console.log('Atribuindo papel de administrador com dados:', roleInsertData);
      
      const { error: roleInsertError } = await supabase
        .from('user_roles')
        .insert(roleInsertData);
      
      if (roleInsertError) {
        console.error('Erro ao atribuir papel de administrador:', roleInsertError);
        
        // Attempt to clean up the created user since role assignment failed
        try {
          await supabase.auth.admin.deleteUser(userData.user.id);
          console.log(`Usuário removido após falha na atribuição de papel: ${userData.user.id}`);
        } catch (cleanupError) {
          console.error('Erro ao remover usuário após falha:', cleanupError);
        }
        
        return new Response(
          JSON.stringify({ 
            success: false,
            message: roleInsertError.message,
            code: roleInsertError.code || "ROLE_ASSIGNMENT_FAILED" 
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      // Return successful response with created admin data
      return new Response(
        JSON.stringify({
          success: true,
          message: "Administrador criado com sucesso",
          data: {
            id: userData.user.id,
            email: userData.user.email,
            role: 'admin',
            created_at: userData.user.created_at,
            permissions: roleInsertData.permissions
          }
        }),
        {
          status: 201,
          headers: corsHeaders,
        }
      );
    } else if (req.method === "GET") {
      // Get admin users
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');
      
      if (roleError) {
        console.error('Erro ao buscar papéis de administrador:', roleError);
        return new Response(
          JSON.stringify({ 
            success: false,
            message: roleError.message,
            code: roleError.code || "FETCH_FAILED" 
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      // Get user details for each admin
      const adminUsers = await Promise.all(
        roleData.map(async (role) => {
          const { data: userData, error: userError } = await supabase.auth.admin.getUserById(role.user_id);
          
          if (userError || !userData.user) {
            console.error(`Erro ao buscar dados do usuário ${role.user_id}:`, userError);
            return null;
          }
          
          return {
            id: userData.user.id,
            email: userData.user.email,
            role: role.role,
            created_at: userData.user.created_at,
            permissions: role.permissions || {
              manageAnimals: true,
              approveAdoptions: true,
              manageSettings: false,
              manageAdmins: false
            }
          };
        })
      );
      
      // Filter out any null values from admins who couldn't be found
      const validAdmins = adminUsers.filter(Boolean);
      console.log('Administradores recuperados:', validAdmins);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Administradores recuperados com sucesso",
          data: validAdmins
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else if (req.method === "PUT") {
      const requestData = await req.json();
      
      if (!requestData.userId || !requestData.permissions) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Dados incompletos. ID do usuário e permissões são obrigatórios.",
            code: "MISSING_DATA" 
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
      
      // Prevent self-modification
      if (requestData.userId === user.id) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Não é possível modificar suas próprias permissões.",
            code: "SELF_MODIFICATION_DENIED" 
          }),
          {
            status: 403,
            headers: corsHeaders,
          }
        );
      }
      
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ permissions: requestData.permissions })
        .eq('user_id', requestData.userId)
        .eq('role', 'admin');
      
      if (updateError) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: updateError.message,
            code: updateError.code || "UPDATE_FAILED" 
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Permissões atualizadas com sucesso"
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else if (req.method === "DELETE") {
      const requestData = await req.json();
      
      if (!requestData.userId) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "ID do usuário não fornecido.",
            code: "MISSING_USER_ID" 
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
      
      // Prevent self-deletion
      if (requestData.userId === user.id) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: "Não é possível remover seu próprio acesso administrativo.",
            code: "SELF_REMOVAL_DENIED" 
          }),
          {
            status: 403,
            headers: corsHeaders,
          }
        );
      }
      
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', requestData.userId)
        .eq('role', 'admin');
      
      if (deleteError) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: deleteError.message,
            code: deleteError.code || "DELETE_FAILED" 
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Administrador removido com sucesso"
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Método não suportado",
          code: "INVALID_METHOD" 
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    console.error("Erro não tratado:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
        code: "SERVER_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
