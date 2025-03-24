
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
          "X-Client-Info": "adoptions-edge-function",
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

    // Process based on operation and method
    if (method === "GET") {
      // Handle GET operations
      if (operation === "list") {
        // Get user role to determine what adoptions to show
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        let query = supabase.from('adoptions').select('*, users!adoptions_user_id_fkey(*), pets!adoptions_pet_id_fkey(*, pet_images(*))');
        
        // If not admin, only show user's adoptions
        if (!roleData || roleData.role !== 'admin') {
          query = query.eq('user_id', user.id);
        }
        
        // Get query parameters for filtering
        const url = new URL(req.url);
        const stage = url.searchParams.get('stage');
        
        if (stage && stage !== 'all') {
          query = query.eq('current_stage', stage);
        }
        
        const { data, error } = await query;
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar adoções", 
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
        const adoptionId = urlParts[urlParts.length - 2];
        
        if (!adoptionId) {
          return new Response(
            JSON.stringify({ 
              error: "ID da adoção não fornecido", 
              details: "É necessário fornecer um ID válido para obter os detalhes da adoção.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Get adoption details
        const { data, error } = await supabase
          .from('adoptions')
          .select('*, users!adoptions_user_id_fkey(*), pets!adoptions_pet_id_fkey(*, pet_images(*))')
          .eq('id', adoptionId)
          .single();
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar detalhes da adoção", 
              details: error.message,
              code: error.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Check if user has permission to view this adoption
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if ((!roleData || roleData.role !== 'admin') && data.user_id !== user.id) {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Você não tem permissão para acessar esta adoção.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
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
      } else if (operation === "pending-follow-ups") {
        // Check if user is admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!roleData || roleData.role !== 'admin') {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Apenas administradores podem acessar acompanhamentos pendentes.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        // Get pending follow-ups
        const { data, error } = await supabase
          .from('adoptions')
          .select('*, users!adoptions_user_id_fkey(*), pets!adoptions_pet_id_fkey(*)')
          .eq('follow_up_status', 'pending')
          .lte('next_follow_up_date', today)
          .eq('current_stage', 'completed');
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar acompanhamentos pendentes", 
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
      if (operation === "create") {
        const adoptionData = await req.json();
        
        // Validate required fields
        if (!adoptionData.petId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do pet não fornecido", 
              details: "É necessário fornecer um ID de pet válido para criar uma adoção.",
              code: "MISSING_PET_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Create adoption
        const { data: newAdoption, error: adoptionError } = await supabase
          .from('adoptions')
          .insert({
            pet_id: adoptionData.petId,
            user_id: adoptionData.userId || user.id,
            current_stage: adoptionData.stage || 'interested',
            notes: adoptionData.notes || ''
          })
          .select()
          .single();
        
        if (adoptionError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao criar adoção", 
              details: adoptionError.message,
              code: adoptionError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            ...newAdoption,
            message: "Adoção iniciada com sucesso!"
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      } else if (operation === "record-match") {
        const matchData = await req.json();
        
        // Validate required fields
        if (!matchData.petId || !matchData.matchType) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "É necessário fornecer o ID do pet e o tipo de match (liked/disliked).",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Record match
        const { error: matchError } = await supabase
          .from('pet_matches')
          .insert({
            pet_id: matchData.petId,
            user_id: user.id,
            match_type: matchData.matchType
          });
        
        if (matchError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao registrar match", 
              details: matchError.message,
              code: matchError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // If liked, create adoption
        if (matchData.matchType === 'liked') {
          const { data: newAdoption, error: adoptionError } = await supabase
            .from('adoptions')
            .insert({
              pet_id: matchData.petId,
              user_id: user.id,
              current_stage: 'interested',
              notes: 'Iniciado via match no aplicativo'
            })
            .select()
            .single();
          
          if (adoptionError) {
            return new Response(
              JSON.stringify({ 
                error: "Match registrado, mas erro ao criar adoção", 
                details: adoptionError.message,
                code: adoptionError.code 
              }),
              {
                status: 500,
                headers: corsHeaders,
              }
            );
          }
          
          return new Response(
            JSON.stringify({
              match: { petId: matchData.petId, userId: user.id, matchType: matchData.matchType },
              adoption: newAdoption,
              message: "Match registrado e processo de adoção iniciado!"
            }),
            {
              status: 201,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            match: { petId: matchData.petId, userId: user.id, matchType: matchData.matchType },
            message: "Match registrado com sucesso!"
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "PUT" || method === "PATCH") {
      // Handle PUT/PATCH operations
      if (operation === "update-stage") {
        const updateData = await req.json();
        
        if (!updateData.id || !updateData.stage) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "É necessário fornecer o ID da adoção e o novo estágio.",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Check if user has permission
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        const { data: adoptionData, error: adoptionError } = await supabase
          .from('adoptions')
          .select('*')
          .eq('id', updateData.id)
          .single();
          
        if (adoptionError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar adoção", 
              details: adoptionError.message,
              code: adoptionError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Only admin or the adoption owner can update
        if ((!roleData || roleData.role !== 'admin') && adoptionData.user_id !== user.id) {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Você não tem permissão para atualizar esta adoção.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        // Prepare updates
        const updates: any = {
          current_stage: updateData.stage,
          updated_at: new Date().toISOString()
        };
        
        if (updateData.notes) updates.notes = updateData.notes;
        if (updateData.visitDate) updates.scheduled_visit_date = updateData.visitDate;
        if (updateData.inspectionDate) updates.home_inspection_date = updateData.inspectionDate;
        if (updateData.contractSigned !== undefined) updates.contract_signed = updateData.contractSigned;
        if (updateData.paymentComplete !== undefined) updates.adoption_fee_paid = updateData.paymentComplete;
        
        // Handle approval
        if (updateData.stage === 'approved') {
          updates.approved_by = user.id;
        }
        
        // Handle rejection
        if (updateData.stage === 'rejected' && updateData.rejectionReason) {
          updates.rejection_reason = updateData.rejectionReason;
        }
        
        // Update adoption
        const { data: updatedAdoption, error: updateError } = await supabase
          .from('adoptions')
          .update(updates)
          .eq('id', updateData.id)
          .select()
          .single();
        
        if (updateError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atualizar adoção", 
              details: updateError.message,
              code: updateError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Set up follow-up dates for completed adoptions
        if (updateData.stage === 'completed') {
          const nextFollowUpDate = new Date();
          nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 14); // First follow-up after 14 days
          
          await supabase
            .from('adoptions')
            .update({
              next_follow_up_date: nextFollowUpDate.toISOString().split('T')[0],
              follow_up_status: 'pending'
            })
            .eq('id', updateData.id);
        }
        
        return new Response(
          JSON.stringify({
            ...updatedAdoption,
            message: "Estágio da adoção atualizado com sucesso!"
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else if (operation === "assign-responsible") {
        const assignmentData = await req.json();
        
        if (!assignmentData.adoptionId || !assignmentData.responsibleId) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "É necessário fornecer o ID da adoção e o ID do responsável.",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!roleData || roleData.role !== 'admin') {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Apenas administradores podem atribuir responsáveis.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        // Update responsible
        const { error } = await supabase
          .from('adoptions')
          .update({ responsible_id: assignmentData.responsibleId })
          .eq('id', assignmentData.adoptionId);
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atribuir responsável", 
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
            message: "Responsável atribuído com sucesso!"
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } else if (operation === "update-follow-up") {
        const followUpData = await req.json();
        
        if (!followUpData.adoptionId || !followUpData.status || !followUpData.notes) {
          return new Response(
            JSON.stringify({ 
              error: "Dados incompletos", 
              details: "É necessário fornecer o ID da adoção, status e notas do acompanhamento.",
              code: "MISSING_DATA" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!roleData || roleData.role !== 'admin') {
          return new Response(
            JSON.stringify({ 
              error: "Acesso negado", 
              details: "Apenas administradores podem atualizar acompanhamentos.",
              code: "ACCESS_DENIED" 
            }),
            {
              status: 403,
              headers: corsHeaders,
            }
          );
        }
        
        // Create follow-up record
        const today = new Date().toISOString().split('T')[0];
        const { error: followUpError } = await supabase
          .from('adoption_follow_ups')
          .insert({
            adoption_id: followUpData.adoptionId,
            status: followUpData.status,
            notes: followUpData.notes,
            follow_up_date: today,
            created_by: user.id
          });
        
        if (followUpError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao criar registro de acompanhamento", 
              details: followUpError.message,
              code: followUpError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Update adoption with new follow-up date and status
        const nextFollowUpDate = new Date();
        nextFollowUpDate.setDate(nextFollowUpDate.getDate() + 30); // Next follow-up in 30 days
        
        const { error: updateError } = await supabase
          .from('adoptions')
          .update({
            follow_up_status: 'completed',
            last_follow_up_date: today,
            next_follow_up_date: nextFollowUpDate.toISOString().split('T')[0]
          })
          .eq('id', followUpData.adoptionId);
        
        if (updateError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atualizar datas de acompanhamento", 
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
            message: "Acompanhamento registrado com sucesso!"
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
