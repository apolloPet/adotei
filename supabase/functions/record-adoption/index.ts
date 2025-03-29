
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

    // Verificar se o usuário existe na tabela users
    const { data: userExists, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', userId)
      .maybeSingle();
    
    // Se o usuário não existe na tabela users, precisamos criá-lo
    let userIdToUse = userId;
    
    if (!userExists && !userCheckError) {
      console.log("User does not exist in users table. Creating profile record...");
      
      // Obter detalhes do usuário do auth
      const { data: { user: authUser }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
      
      if (getUserError || !authUser) {
        console.error("Error getting auth user details:", getUserError);
        return new Response(
          JSON.stringify({ error: "User validation failed", details: "Could not verify user identity" }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      // Criar um registro de usuário básico
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert({
          auth_id: userId,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || "User",
          email: authUser.email || "",
          phone: authUser.phone || "",
          address: "",
          city: "",
          state: "",
          zip: "",
          housing_type: "apartment",
          has_children: false,
          had_pets_before: false,
          has_allergies: false,
          work_schedule: "regular"
        })
        .select()
        .single();
      
      if (createUserError) {
        console.error("Error creating user profile:", createUserError);
        return new Response(
          JSON.stringify({ error: "Failed to create user profile", details: createUserError.message }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
      
      console.log("Created new user profile:", newUser.id);
      userIdToUse = newUser.id;
    } else if (userExists) {
      userIdToUse = userExists.id;
      console.log("Using existing user profile:", userIdToUse);
    } else if (userCheckError) {
      console.error("Error checking if user exists:", userCheckError);
      return new Response(
        JSON.stringify({ error: "Database error", details: userCheckError.message }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Check which table the pet/animal is in
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
      try {
        const { error: matchError } = await supabase
          .from('pet_matches')
          .insert({
            pet_id: petId,
            user_id: userIdToUse,
            match_type: matchType || 'liked'
          });
        
        if (matchError) {
          console.error("Error recording pet match:", matchError);
          // We'll continue anyway, the match is secondary to the adoption
        }
      } catch (matchInsertError) {
        console.error("Exception recording pet match:", matchInsertError);
        // Continue with adoption despite match error
      }
    }
    
    // Create adoption record if it's a like
    if (matchType === 'liked') {
      // First, we need to ensure we have a valid pet_id that exists in the pets table
      let validPetId = null;
      
      // Check if we need to create a dummy pet for the animal
      if (!petExists && animalExists) {
        // Check if we already have a mapping pet for this animal
        const { data: existingMappingPet, error: mappingError } = await supabase
          .from('pets')
          .select('id')
          .eq('name', `Animal_${petId}`)
          .maybeSingle();
          
        if (mappingError && mappingError.code !== 'PGRST116') {
          console.error("Error checking mapping pet:", mappingError);
          return new Response(
            JSON.stringify({ error: "Database error", details: mappingError.message }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        if (existingMappingPet) {
          // Use the existing mapping pet
          validPetId = existingMappingPet.id;
          console.log("Using existing mapping pet:", validPetId);
        } else {
          // Create a new mapping pet entry in the pets table
          const animalName = animalExists.nome || 'Unknown';
          const animalSpecies = animalExists.tipo === 'cachorro' ? 'dog' : 
                             animalExists.tipo === 'gato' ? 'cat' : 'other';
          const animalGender = animalExists.sexo === 'macho' ? 'male' : 'female';
          const animalSize = animalExists.porte === 'pequeno' ? 'small' : 
                           animalExists.porte === 'medio' ? 'medium' : 'large';
                           
          const { data: newPet, error: petCreateError } = await supabase
            .from('pets')
            .insert({
              name: `Animal_${petId}`,
              species: animalSpecies,
              breed: "Mixed",
              age: 1,
              age_unit: "years",
              gender: animalGender,
              size: animalSize,
              weight: 0,
              description: animalExists.descricao || 'Animal imported from animals table',
              location: "Unknown",
              shelter_id: "00000000-0000-0000-0000-000000000000" // Using a placeholder
            })
            .select()
            .single();
            
          if (petCreateError) {
            console.error("Error creating mapping pet:", petCreateError);
            return new Response(
              JSON.stringify({ error: "Failed to create mapping pet", details: petCreateError.message }),
              {
                status: 500,
                headers: corsHeaders,
              }
            );
          }
          
          validPetId = newPet.id;
          console.log("Created new mapping pet:", validPetId);
        }
      } else if (petExists) {
        // This is a regular pet, use its ID directly
        validPetId = petId;
      }
      
      // Now check if adoption already exists
      const { data: existingAdoption, error: checkError } = await supabase
        .from('adoptions')
        .select('id')
        .eq('pet_id', validPetId)
        .eq('user_id', userIdToUse)
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
      
      // Create new adoption with the valid pet_id
      const adoptionData = {
        pet_id: validPetId,
        user_id: userIdToUse,
        current_stage: 'interested',
        notes: 'Match automático via navegação de animais',
        animal_id: animalExists ? petId : null
      };
      
      console.log("Creating adoption with data:", adoptionData);
      
      const { data: adoption, error: adoptionError } = await supabase
        .from('adoptions')
        .insert(adoptionData)
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
