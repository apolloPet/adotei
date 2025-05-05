
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Configure Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { method } = await req.json();
    let result = null;
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Verify JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    switch (method) {
      case "processPayment": {
        const { adoptionId, amount, paymentMethod, paymentDetails } = await req.json();
        
        // Registrar o pagamento
        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .insert({
            user_id: user.id,
            adoption_id: adoptionId,
            amount,
            payment_method: paymentMethod,
            payment_status: "completed", // Simular pagamento bem-sucedido
            payment_date: new Date().toISOString(),
            transaction_id: `tx_${Math.random().toString(36).substring(2, 15)}`,
            payment_details: paymentDetails || {}
          })
          .select()
          .single();
        
        if (paymentError) throw paymentError;
        
        // Atualizar o status da adoção
        const { data: adoptionData, error: adoptionError } = await supabase
          .from("adoptions")
          .update({ 
            adoption_fee_paid: true,
            updated_at: new Date().toISOString()
          })
          .eq("id", adoptionId)
          .eq("user_id", user.id);
        
        if (adoptionError) throw adoptionError;
        
        result = { 
          success: true, 
          message: "Pagamento processado com sucesso",
          payment: paymentData 
        };
        break;
      }
      
      case "getPaymentHistory": {
        // Buscar histórico de pagamentos do usuário
        const { data, error } = await supabase
          .from("payments")
          .select(`
            *,
            adoptions (
              pet_id,
              current_stage
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        result = data;
        break;
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Método não suportado" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Erro na função de pagamento:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
