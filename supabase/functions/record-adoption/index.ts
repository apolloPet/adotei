
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

    // First, check which table the pet/animal is in
    const { data: petExists, error: petCheckError } = await supabase
      .from('pets')
      .select('id')
      .eq('id', petId)
      .maybeSingle();
    
    // If there was an error checking pets table other than "not found"
    if (petCheckError && petCheckError.code !== 'PGRST116') {
      console.error("Error checking if pet exists:", petCheckError);
      return new Response(
        JSON.stringify({ error: "Database error", details: petCheckError.message }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    // Check if the ID exists in animals table
    const { data: animalExists, error: animalCheckError } = await supabase
      .from('animals')
      .select('id, nome, tipo, porte, sexo, descricao, fotoprincipal')
      .eq('id', petId)
      .maybeSingle();
    
    if (animalCheckError && animalCheckError.code !== 'PGRST116') {
      console.error("Error checking if animal exists:", animalCheckError);
      return new Response(
        JSON.stringify({ error: "Database error", details: animalCheckError.message }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    // If it's neither in pets nor animals, return error
    if (!petExists && !animalExists) {
      return new Response(
        JSON.stringify({ error: "Pet not found", details: "The specified pet/animal ID does not exist" }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    // Record the match in pet_matches table
    if (petExists) {
      // For pets, we can record directly
      const { error: matchError } = await supabase
        .from('pet_matches')
        .insert({
          pet_id: petId,
          user_id: userId,
          match_type: matchType || 'liked'
        });
      
      if (matchError) {
        console.error("Error recording pet match:", matchError);
        // We'll continue anyway, the match is secondary to the adoption
      }
    }
    
    // Create adoption record if it's a like
    if (matchType === 'liked') {
      // Check if adoption already exists
      const checkQuery = petExists 
        ? supabase.from('adoptions').select('id').eq('pet_id', petId).eq('user_id', userId)
        : supabase.from('adoptions').select('id').eq('animal_id', petId).eq('user_id', userId);
      
      const { data: existingAdoption, error: checkError } = await checkQuery.maybeSingle();
      
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
      
      // Create new adoption based on what type of entry we're working with
      let adoption;
      
      if (petExists) {
        // Create adoption for an entry from the 'pets' table
        const { data, error: adoptionError } = await supabase
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
          console.error("Error creating adoption for pet:", adoptionError);
          return new Response(
            JSON.stringify({ error: "Failed to create adoption", details: adoptionError.message }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        adoption = data;
      } 
      else if (animalExists) {
        // For animals, use a placeholder value for pet_id since it's non-nullable
        // but set the actual animal ID in the animal_id column
        const { data, error: adoptionError } = await supabase
          .from('adoptions')
          .insert({
            pet_id: '00000000-0000-0000-0000-000000000000', // Use a placeholder UUID
            animal_id: petId, // Store the real animal ID here
            user_id: userId,
            current_stage: 'interested',
            notes: `Match automático via navegação de animais. Referência ao animal: ${animalExists.nome}`
          })
          .select()
          .single();
        
        if (adoptionError) {
          console.error("Error creating adoption for animal:", adoptionError);
          return new Response(
            JSON.stringify({ error: "Failed to create adoption", details: adoptionError.message }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        adoption = data;
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
