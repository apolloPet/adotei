
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
          "X-Client-Info": "shelter-management-edge-function",
        },
      },
    });

    const { url, method } = req;
    const urlParts = url.split('/');
    const operation = urlParts[urlParts.length - 1];

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

    // Check if user is admin or shelter manager
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .in('role', ['admin', 'shelter_manager'])
      .single();
      
    if (!roleData) {
      return new Response(
        JSON.stringify({ 
          error: "Acesso negado", 
          details: "Você não tem permissão para gerenciar abrigos.",
          code: "ACCESS_DENIED" 
        }),
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Process based on operation and method
    if (method === "GET") {
      // Handle GET operations
      if (operation === "list") {
        // Get all shelters or user's assigned shelter
        let query = supabase.from('shelters').select('*');
        
        // If not admin, only show shelters user manages
        if (roleData.role !== 'admin') {
          const { data: staffData } = await supabase
            .from('staff')
            .select('shelter_id')
            .eq('email', user.email)
            .single();
            
          if (staffData) {
            query = query.eq('id', staffData.shelter_id);
          } else {
            return new Response(
              JSON.stringify([]), // Empty array if not assigned to any shelter
              {
                status: 200,
                headers: corsHeaders,
              }
            );
          }
        }
        
        const { data, error } = await query;
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar abrigos", 
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
          JSON.stringify(data),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else if (operation.includes('detail')) {
        const shelterId = urlParts[urlParts.length - 2];
        
        if (!shelterId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do abrigo não fornecido", 
              details: "É necessário fornecer um ID válido para obter os detalhes do abrigo.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Get shelter details
        const { data: shelter, error: shelterError } = await supabase
          .from('shelters')
          .select('*')
          .eq('id', shelterId)
          .single();
        
        if (shelterError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar detalhes do abrigo", 
              details: shelterError.message,
              code: shelterError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Get staff list
        const { data: staff, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('shelter_id', shelterId);
        
        if (staffError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar equipe do abrigo", 
              details: staffError.message,
              code: staffError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Get pets count
        const { count: petsCount, error: petsError } = await supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('shelter_id', shelterId);
        
        // Combine all data
        const shelterWithDetails = {
          ...shelter,
          staff: staff || [],
          petsCount: petsCount || 0
        };
        
        return new Response(
          JSON.stringify(shelterWithDetails),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else if (operation === "pets") {
        const shelterId = urlParts[urlParts.length - 2];
        
        if (!shelterId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do abrigo não fornecido", 
              details: "É necessário fornecer um ID válido para obter os pets do abrigo.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Get pets
        const { data: pets, error: petsError } = await supabase
          .from('pets')
          .select('*, pet_images(*)')
          .eq('shelter_id', shelterId);
        
        if (petsError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar pets do abrigo", 
              details: petsError.message,
              code: petsError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify(pets),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "POST") {
      // Handle POST operations
      if (operation === "create") {
        // Only admin can create shelters
        if (roleData.role !== 'admin') {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Apenas administradores podem criar novos abrigos.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        const shelterData = await req.json();
        
        // Validate required fields
        const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip'];
        const missingFields = requiredFields.filter(field => !shelterData[field]);
        
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
        
        // Create shelter
        const { data: newShelter, error: shelterError } = await supabase
          .from('shelters')
          .insert({
            name: shelterData.name,
            email: shelterData.email,
            phone: shelterData.phone,
            address: shelterData.address,
            city: shelterData.city,
            state: shelterData.state,
            zip: shelterData.zip,
            logo_url: shelterData.logoUrl || null,
            description: shelterData.description || null,
          })
          .select()
          .single();
        
        if (shelterError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao criar abrigo", 
              details: shelterError.message,
              code: shelterError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            ...newShelter,
            message: "Abrigo criado com sucesso!"
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      } else if (operation === "add-staff") {
        const staffData = await req.json();
        
        // Validate required fields
        const requiredFields = ['shelterId', 'name', 'email', 'phone', 'role'];
        const missingFields = requiredFields.filter(field => !staffData[field]);
        
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
        
        // Check if user can manage this shelter
        if (roleData.role !== 'admin') {
          const { data: staffCheck } = await supabase
            .from('staff')
            .select('shelter_id')
            .eq('email', user.email)
            .eq('shelter_id', staffData.shelterId)
            .single();
            
          if (!staffCheck) {
            return new Response(
              JSON.stringify({ 
                error: "Acesso negado", 
                details: "Você não tem permissão para gerenciar este abrigo.",
                code: "ACCESS_DENIED" 
              }),
              {
                status: 403,
                headers: corsHeaders,
              }
            );
          }
        }
        
        // Add staff member
        const { data: newStaff, error: staffError } = await supabase
          .from('staff')
          .insert({
            shelter_id: staffData.shelterId,
            name: staffData.name,
            email: staffData.email,
            phone: staffData.phone,
            role: staffData.role,
          })
          .select()
          .single();
        
        if (staffError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao adicionar membro da equipe", 
              details: staffError.message,
              code: staffError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            ...newStaff,
            message: "Membro da equipe adicionado com sucesso!"
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "PUT" || method === "PATCH") {
      // Handle PUT/PATCH operations
      if (operation === "update") {
        const updates = await req.json();
        
        if (!updates.id) {
          return new Response(
            JSON.stringify({ 
              error: "ID do abrigo não fornecido", 
              details: "É necessário fornecer um ID válido para atualizar o abrigo.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Check if user can manage this shelter
        if (roleData.role !== 'admin') {
          const { data: staffCheck } = await supabase
            .from('staff')
            .select('shelter_id')
            .eq('email', user.email)
            .eq('shelter_id', updates.id)
            .single();
            
          if (!staffCheck) {
            return new Response(
              JSON.stringify({ 
                error: "Acesso negado", 
                details: "Você não tem permissão para gerenciar este abrigo.",
                code: "ACCESS_DENIED" 
              }),
              {
                status: 403,
                headers: corsHeaders,
              }
            );
          }
        }
        
        // Build update object
        const updateData: any = {};
        
        if (updates.name) updateData.name = updates.name;
        if (updates.email) updateData.email = updates.email;
        if (updates.phone) updateData.phone = updates.phone;
        if (updates.address) updateData.address = updates.address;
        if (updates.city) updateData.city = updates.city;
        if (updates.state) updateData.state = updates.state;
        if (updates.zip) updateData.zip = updates.zip;
        if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl;
        if (updates.description !== undefined) updateData.description = updates.description;
        
        // Update shelter
        const { data: updatedShelter, error: updateError } = await supabase
          .from('shelters')
          .update(updateData)
          .eq('id', updates.id)
          .select()
          .single();
        
        if (updateError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atualizar abrigo", 
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
            ...updatedShelter,
            message: "Abrigo atualizado com sucesso!"
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "DELETE") {
      // Handle DELETE operations
      if (operation === "remove-staff") {
        const staffId = urlParts[urlParts.length - 2];
        
        if (!staffId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do membro não fornecido", 
              details: "É necessário fornecer um ID válido para remover um membro da equipe.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Check if staff member exists
        const { data: staffMember, error: staffError } = await supabase
          .from('staff')
          .select('shelter_id')
          .eq('id', staffId)
          .single();
        
        if (staffError) {
          return new Response(
            JSON.stringify({ 
              error: "Membro da equipe não encontrado", 
              details: "O membro da equipe solicitado não foi encontrado.",
              code: "STAFF_NOT_FOUND" 
            }),
            {
              status: 404,
              headers: corsHeaders,
            }
          );
        }
        
        // Check if user can manage this shelter
        if (roleData.role !== 'admin') {
          const { data: staffCheck } = await supabase
            .from('staff')
            .select('shelter_id')
            .eq('email', user.email)
            .eq('shelter_id', staffMember.shelter_id)
            .single();
            
          if (!staffCheck) {
            return new Response(
              JSON.stringify({ 
                error: "Acesso negado", 
                details: "Você não tem permissão para gerenciar este abrigo.",
                code: "ACCESS_DENIED" 
              }),
              {
                status: 403,
                headers: corsHeaders,
              }
            );
          }
        }
        
        // Remove staff member
        const { error: deleteError } = await supabase
          .from('staff')
          .delete()
          .eq('id', staffId);
        
        if (deleteError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao remover membro da equipe", 
              details: deleteError.message,
              code: deleteError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            message: "Membro da equipe removido com sucesso!"
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else if (operation === "delete") {
        // Only admin can delete shelters
        if (roleData.role !== 'admin') {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Apenas administradores podem excluir abrigos.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        const shelterId = urlParts[urlParts.length - 2];
        
        if (!shelterId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do abrigo não fornecido", 
              details: "É necessário fornecer um ID válido para excluir o abrigo.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Delete all staff first
        const { error: staffError } = await supabase
          .from('staff')
          .delete()
          .eq('shelter_id', shelterId);
        
        if (staffError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao remover equipe do abrigo", 
              details: staffError.message,
              code: staffError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Now delete the shelter
        const { error: shelterError } = await supabase
          .from('shelters')
          .delete()
          .eq('id', shelterId);
        
        if (shelterError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao excluir abrigo", 
              details: shelterError.message,
              code: shelterError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            message: "Abrigo excluído com sucesso!"
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
