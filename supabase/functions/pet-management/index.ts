
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
          "X-Client-Info": "pet-management-edge-function",
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
        // Get query parameters
        const url = new URL(req.url);
        const species = url.searchParams.get('species');
        const gender = url.searchParams.get('gender');
        const size = url.searchParams.get('size');
        const searchTerm = url.searchParams.get('searchTerm');
        
        // Build query
        let query = supabase.from('pets').select('*, pet_images(*)');
        
        // Apply filters
        if (species && species !== 'all') {
          query = query.eq('species', species);
        }
        
        if (gender && gender !== 'all') {
          query = query.eq('gender', gender);
        }
        
        if (size && size !== 'all') {
          query = query.eq('size', size);
        }
        
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }
        
        // Execute query
        const { data, error } = await query;
        
        if (error) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar pets", 
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
        // Get pet details by ID
        const petId = urlParts[urlParts.length - 2];
        
        if (!petId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do pet não fornecido", 
              details: "É necessário fornecer um ID válido para obter os detalhes do pet.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Get pet data and related images
        const { data: pet, error: petError } = await supabase
          .from('pets')
          .select('*')
          .eq('id', petId)
          .single();
        
        if (petError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar detalhes do pet", 
              details: petError.message,
              code: petError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Get pet images
        const { data: images, error: imagesError } = await supabase
          .from('pet_images')
          .select('*')
          .eq('pet_id', petId);
        
        if (imagesError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao buscar imagens do pet", 
              details: imagesError.message,
              code: imagesError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Combine pet data with images
        const petWithImages = {
          ...pet,
          images: images || []
        };
        
        return new Response(
          JSON.stringify(petWithImages),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "POST") {
      // Handle POST operations
      if (operation === "create") {
        const petData = await req.json();
        
        // Validate required fields
        const requiredFields = ['name', 'species', 'breed', 'age', 'gender', 'size', 'description'];
        const missingFields = requiredFields.filter(field => !petData[field]);
        
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
        
        // Insert pet data
        const { data: newPet, error: petError } = await supabase
          .from('pets')
          .insert({
            name: petData.name,
            species: petData.species,
            breed: petData.breed,
            age: parseInt(petData.age),
            age_unit: petData.ageUnit || 'years',
            gender: petData.gender,
            size: petData.size,
            weight: petData.weight || 0,
            description: petData.description,
            location: petData.location || '',
            shelter_id: petData.shelterId || user.id, // Default to user ID if no shelter specified
            traits: petData.traits || [],
            special_needs: petData.specialNeeds || false,
            health_issues: petData.healthIssues || false,
            medical_info: petData.medicalInfo || ''
          })
          .select()
          .single();
        
        if (petError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao criar pet", 
              details: petError.message,
              code: petError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            ...newPet,
            message: "Pet cadastrado com sucesso!"
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "PUT" || method === "PATCH") {
      // Handle PUT/PATCH operations
      if (operation.includes('update')) {
        const petId = urlParts[urlParts.length - 2];
        const updates = await req.json();
        
        if (!petId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do pet não fornecido", 
              details: "É necessário fornecer um ID válido para atualizar o pet.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Build update object
        const updateData: any = {};
        
        // Only update fields that are provided
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.species !== undefined) updateData.species = updates.species;
        if (updates.breed !== undefined) updateData.breed = updates.breed;
        if (updates.age !== undefined) updateData.age = parseInt(updates.age);
        if (updates.ageUnit !== undefined) updateData.age_unit = updates.ageUnit;
        if (updates.gender !== undefined) updateData.gender = updates.gender;
        if (updates.size !== undefined) updateData.size = updates.size;
        if (updates.weight !== undefined) updateData.weight = updates.weight;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.location !== undefined) updateData.location = updates.location;
        if (updates.traits !== undefined) updateData.traits = updates.traits;
        if (updates.specialNeeds !== undefined) updateData.special_needs = updates.specialNeeds;
        if (updates.healthIssues !== undefined) updateData.health_issues = updates.healthIssues;
        if (updates.medicalInfo !== undefined) updateData.medical_info = updates.medicalInfo;
        
        // Update pet
        const { data: updatedPet, error: updateError } = await supabase
          .from('pets')
          .update(updateData)
          .eq('id', petId)
          .select()
          .single();
        
        if (updateError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao atualizar pet", 
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
            ...updatedPet,
            message: "Pet atualizado com sucesso!"
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "DELETE") {
      // Handle DELETE operations
      if (operation.includes('delete')) {
        const petId = urlParts[urlParts.length - 2];
        
        if (!petId) {
          return new Response(
            JSON.stringify({ 
              error: "ID do pet não fornecido", 
              details: "É necessário fornecer um ID válido para excluir o pet.",
              code: "MISSING_ID" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        // Delete pet images first
        const { error: imagesError } = await supabase
          .from('pet_images')
          .delete()
          .eq('pet_id', petId);
        
        if (imagesError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao excluir imagens do pet", 
              details: imagesError.message,
              code: imagesError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        // Now delete the pet
        const { error: petError } = await supabase
          .from('pets')
          .delete()
          .eq('id', petId);
        
        if (petError) {
          return new Response(
            JSON.stringify({ 
              error: "Erro ao excluir pet", 
              details: petError.message,
              code: petError.code 
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify({
            message: "Pet excluído com sucesso!"
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
