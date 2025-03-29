
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
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({
          error: "Server configuration incomplete",
          details: "Required environment variables are missing"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Initialize admin Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: { "X-Client-Info": "record-adoption-edge-function" },
      },
    });

    // Verify JWT from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: "Authentication required" }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Extract and verify token
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token", details: "Your session is invalid or expired" }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Parse request body
    const requestData = await req.json();
    const { petId, userId, matchType } = requestData;
    
    console.log("Received request to create adoption:", { petId, userId, matchType });

    if (!petId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields", details: "Both petId and userId are required" }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Record the match for audit purposes (this bypasses RLS with service role key)
    const { error: matchError } = await supabase
      .from('pet_matches')
      .insert({
        pet_id: petId,
        user_id: userId,
        match_type: matchType || 'liked'
      });
    
    if (matchError) {
      console.error("Error recording pet match:", matchError);
      // Continue anyway - the match recording is secondary to the adoption
    }

    // Create adoption record if it's a like (this bypasses RLS with service role key)
    if (matchType === 'liked') {
      // Check if adoption already exists
      const { data: existingAdoption, error: checkError } = await supabase
        .from('adoptions')
        .select('id')
        .eq('pet_id', petId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing adoption:", checkError);
        return new Response(
          JSON.stringify({ error: "Database error", details: checkError.message }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      if (existingAdoption) {
        console.log("Adoption already exists:", existingAdoption);
        return new Response(
          JSON.stringify({ 
            message: "Adoção já existe", 
            adoption: existingAdoption 
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
      
      // Create new adoption
      const { data: adoption, error: adoptionError } = await supabase
        .from('adoptions')
        .insert({
          pet_id: petId,
          user_id: userId,
          current_stage: 'interested',
          notes: 'Match automático via navegação de animais'
        })
        .select()
        .single();
      
      if (adoptionError) {
        console.error("Error creating adoption:", adoptionError);
        return new Response(
          JSON.stringify({ error: "Failed to create adoption", details: adoptionError.message }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }

      console.log("Successfully created adoption:", adoption);
      return new Response(
        JSON.stringify({
          message: "Adoção iniciada com sucesso",
          adoption: adoption
        }),
        {
          status: 201,
          headers: corsHeaders,
        }
      );
    }

    // For dislikes, just return success
    return new Response(
      JSON.stringify({ message: "Match registrado com sucesso" }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
