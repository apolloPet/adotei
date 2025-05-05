
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
    
    // Verificar se o usuário é admin
    const { data: isAdminData } = await supabase.rpc('is_admin', { uid: user.id });
    const isAdmin = !!isAdminData;
    
    switch (method) {
      case "getSuppliers": {
        const { data, error } = await supabase
          .from("suppliers")
          .select(`
            *,
            supplier_ratings (
              id,
              rating,
              comment,
              user_id,
              created_at
            )
          `);
        
        if (error) throw error;
        result = data;
        break;
      }
      
      case "createSupplier": {
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Apenas administradores podem criar fornecedores" }),
            { 
              status: 403, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
        
        const { name, type, description, email, phone, website, address, contactPerson } = await req.json();
        
        const { data, error } = await supabase
          .from("suppliers")
          .insert({
            name,
            type,
            description,
            email,
            phone,
            website,
            address,
            contact_person: contactPerson,
            created_by: user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        break;
      }
      
      case "updateSupplier": {
        if (!isAdmin) {
          return new Response(
            JSON.stringify({ error: "Apenas administradores podem atualizar fornecedores" }),
            { 
              status: 403, 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
        
        const { id, name, type, description, email, phone, website, address, contactPerson } = await req.json();
        
        const { data, error } = await supabase
          .from("suppliers")
          .update({
            name,
            type,
            description,
            email,
            phone,
            website,
            address,
            contact_person: contactPerson
          })
          .eq("id", id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
        break;
      }
      
      case "rateSupplier": {
        const { supplierId, rating, comment } = await req.json();
        
        // Verificar se o usuário já avaliou este fornecedor
        const { data: existingRating, error: ratingCheckError } = await supabase
          .from("supplier_ratings")
          .select("*")
          .eq("supplier_id", supplierId)
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (ratingCheckError) throw ratingCheckError;
        
        let resultData;
        
        if (existingRating) {
          // Atualizar avaliação existente
          const { data, error } = await supabase
            .from("supplier_ratings")
            .update({
              rating,
              comment,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingRating.id)
            .select()
            .single();
          
          if (error) throw error;
          resultData = data;
        } else {
          // Criar nova avaliação
          const { data, error } = await supabase
            .from("supplier_ratings")
            .insert({
              supplier_id: supplierId,
              user_id: user.id,
              rating,
              comment
            })
            .select()
            .single();
          
          if (error) throw error;
          resultData = data;
        }
        
        result = { 
          success: true, 
          message: existingRating ? "Avaliação atualizada" : "Avaliação criada",
          rating: resultData
        };
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
    console.error("Erro na função de gerenciamento de fornecedores:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
