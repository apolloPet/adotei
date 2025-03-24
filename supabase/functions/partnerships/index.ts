
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
          "X-Client-Info": "partnerships-edge-function",
        },
      },
    });

    const { url, method } = req;
    const urlParts = url.split('/');
    const operation = urlParts[urlParts.length - 1];

    // For public endpoints (partnership applications), skip auth check
    let isPublicEndpoint = false;
    if (operation === "apply") {
      isPublicEndpoint = true;
    }

    let user = null;
    
    // Only check auth for non-public endpoints
    if (!isPublicEndpoint) {
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
      const { data: userData, error: authError } = await supabase.auth.getUser(jwt);
      
      if (authError || !userData.user) {
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
      
      user = userData.user;
    }

    // Process based on operation and method
    if (method === "GET") {
      // Handle GET operations
      if (operation === "list") {
        // Check if user is admin
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
            
          if (!roleData) {
            return new Response(
              JSON.stringify({ 
                error: "Acesso negado", 
                details: "Apenas administradores podem acessar a lista de parcerias.",
                code: "ACCESS_DENIED" 
              }),
              {
                status: 403,
                headers: corsHeaders,
              }
            );
          }
        }
        
        // Get query parameters for filtering
        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const type = url.searchParams.get('type');
        
        // Build query
        let query = supabase.from('partnerships').select('*');
        
        if (status) {
          query = query.eq('status', status);
        }
        
        if (type) {
          query = query.eq('partnership_type', type);
        }
        
        const { data, error } = await query;
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar parcerias", 
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
        // Check if user is admin
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
            
          if (!roleData) {
            return new Response(
              JSON.stringify({ 
                error: "Acesso negado", 
                details: "Apenas administradores podem acessar detalhes de parcerias.",
                code: "ACCESS_DENIED" 
              }),
              {
                status: 403,
                headers: corsHeaders,
              }
            );
          }
        }
        
        const partnershipId = urlParts[urlParts.length - 2];
        
        if (!partnershipId) {
          return new Response(
            JSON.stringify({ 
              error: "ID da parceria não fornecido", 
              details: "É necessário fornecer um ID válido para obter os detalhes da parceria.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Get partnership details
        const { data, error } = await supabase
          .from('partnerships')
          .select('*')
          .eq('id', partnershipId)
          .single();
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar detalhes da parceria", 
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
      } else if (operation === "metrics") {
        // Check if user is admin
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
            
          if (!roleData) {
            return new Response(
              JSON.stringify({ 
                error: "Acesso negado", 
                details: "Apenas administradores podem acessar métricas de parcerias.",
                code: "ACCESS_DENIED" 
              }),
              {
                status: 403,
                headers: corsHeaders,
              }
            );
          }
        }
        
        const partnershipId = urlParts[urlParts.length - 2];
        
        if (!partnershipId) {
          return new Response(
            JSON.stringify({ 
              error: "ID da parceria não fornecido", 
              details: "É necessário fornecer um ID válido para obter as métricas da parceria.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Get partnership metrics
        const { data, error } = await supabase
          .from('partnership_metrics')
          .select('*')
          .eq('partnership_id', partnershipId);
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar métricas da parceria", 
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
      }
    } else if (method === "POST") {
      // Handle POST operations
      if (operation === "apply") {
        // This is a public endpoint for partnership applications
        const applicationData = await req.json();
        
        // Validate required fields
        const requiredFields = ['company_name', 'contact_name', 'email', 'phone', 'partnership_type'];
        const missingFields = requiredFields.filter(field => !applicationData[field]);
        
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
        
        // Create partnership application
        const { data: newPartnership, error: partnershipError } = await supabase
          .from('partnerships')
          .insert({
            company_name: applicationData.company_name,
            contact_name: applicationData.contact_name,
            email: applicationData.email,
            phone: applicationData.phone,
            company_size: applicationData.company_size || null,
            company_website: applicationData.company_website || null,
            partnership_type: applicationData.partnership_type,
            status: 'pending',
            notes: applicationData.notes || ''
          })
          .select()
          .single();
        
        if (partnershipError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao criar solicitação de parceria", 
              details: partnershipError.message,
              code: partnershipError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            id: newPartnership.id,
            message: "Solicitação de parceria enviada com sucesso! Entraremos em contato em breve."
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      } else if (operation === "add-metric") {
        // Check if user is admin
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
            
          if (!roleData) {
            return new Response(
              JSON.stringify({ 
                error: "Acesso negado", 
                details: "Apenas administradores podem adicionar métricas de parcerias.",
                code: "ACCESS_DENIED" 
              }),
              {
                status: 403,
                headers: corsHeaders,
              }
            );
          }
        }
        
        const metricData = await req.json();
        
        // Validate required fields
        const requiredFields = ['partnership_id', 'metric_type', 'value', 'period_start', 'period_end'];
        const missingFields = requiredFields.filter(field => !metricData[field]);
        
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
        
        // Add metric
        const { data: newMetric, error: metricError } = await supabase
          .from('partnership_metrics')
          .insert({
            partnership_id: metricData.partnership_id,
            metric_type: metricData.metric_type,
            value: metricData.value,
            period_start: metricData.period_start,
            period_end: metricData.period_end,
            is_active: metricData.is_active || false
          })
          .select()
          .single();
        
        if (metricError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao adicionar métrica", 
              details: metricError.message,
              code: metricError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            ...newMetric,
            message: "Métrica adicionada com sucesso!"
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "PUT" || method === "PATCH") {
      // Handle PUT/PATCH operations
      if (operation === "update-status") {
        // Check if user is admin
        if (user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();
            
          if (!roleData) {
            return new Response(
              JSON.stringify({ 
                error: "Acesso negado", 
                details: "Apenas administradores podem atualizar o status de parcerias.",
                code: "ACCESS_DENIED" 
              }),
              {
                status: 403,
                headers: corsHeaders,
              }
            );
          }
        }
        
        const updateData = await req.json();
        
        if (!updateData.id || !updateData.status) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "ID da parceria e novo status são obrigatórios.",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Build update object
        const updates: any = { 
          status: updateData.status,
          updated_at: new Date().toISOString()
        };
        
        // If approving, set approved_by and approved_at
        if (updateData.status === 'approved' && user) {
          updates.approved_by = user.id;
          updates.approved_at = new Date().toISOString();
          updates.is_active = true;
        }
        
        if (updateData.notes) {
          updates.notes = updateData.notes;
        }
        
        // Update partnership
        const { data: updatedPartnership, error: updateError } = await supabase
          .from('partnerships')
          .update(updates)
          .eq('id', updateData.id)
          .select()
          .single();
        
        if (updateError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atualizar status da parceria", 
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
            ...updatedPartnership,
            message: "Status da parceria atualizado com sucesso!"
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
