
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// Interface for adoption response
interface AdoptionDetails {
  id: string;
  petName: string;
  petImage: string;
  status: string;
  fee: number;
  userName: string;
}

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
    // Verify environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Environment variables missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({
          error: "Server configuration incomplete.",
          details: "Required environment variables are not configured. Contact system administrator.",
          code: "ENV_VARS_MISSING"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "get-adoption-edge-function",
        },
      },
    });

    // Get adoption ID from URL or body
    let adoptionId: string;
    
    // Check if this is a GET request with URL parameters
    if (req.method === "GET") {
      const url = new URL(req.url);
      adoptionId = url.searchParams.get("id") || "";
    } else {
      // For POST requests, get ID from body
      const body = await req.json();
      adoptionId = body.id || "";
    }

    // Validate adoption ID
    if (!adoptionId) {
      return new Response(
        JSON.stringify({
          error: "Missing adoption ID",
          details: "An adoption ID is required to fetch adoption details.",
          code: "MISSING_ID"
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Verify authorization (JWT token)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: "Authentication is required to access this resource.",
          code: "UNAUTHORIZED"
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Extract the JWT token
    const jwt = authHeader.substring(7);
    
    // Verify the JWT and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Invalid token",
          details: "Your session is invalid or has expired. Please log in again.",
          code: "INVALID_TOKEN"
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Query the adoption details with proper type casting
    const { data: adoptionData, error: adoptionError } = await supabase
      .from("adoptions")
      .select(`
        id,
        current_stage,
        adoption_fee_paid,
        pets:pet_id (
          id,
          name,
          species
        ),
        users:user_id (
          id,
          name
        ),
        animals:animal_id (
          id,
          nome
        )
      `)
      .eq("id", adoptionId)
      .single();

    if (adoptionError) {
      console.error("Error fetching adoption:", adoptionError);
      return new Response(
        JSON.stringify({
          error: "Database error",
          details: "Error fetching adoption details from database.",
          code: adoptionError.code || "DB_ERROR"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    if (!adoptionData) {
      return new Response(
        JSON.stringify({
          error: "Adoption not found",
          details: "No adoption found with the provided ID.",
          code: "NOT_FOUND"
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    // Determine the pet name from either pets or animals table
    let petName = "Pet";
    let petId: string | null = null;
    
    if (adoptionData.pets && typeof adoptionData.pets === "object") {
      petName = (adoptionData.pets as { name: string }).name || "Pet";
      petId = (adoptionData.pets as { id: string }).id || null;
    } else if (adoptionData.animals && typeof adoptionData.animals === "object") {
      petName = (adoptionData.animals as { nome: string }).nome || "Pet";
      // Could use animal_id here if needed
    }

    // Initialize petImage with a default value
    let petImage = "";
    
    // Try to fetch pet image if we have a pet_id
    if (petId) {
      const { data: imageData, error: imageError } = await supabase
        .from("pet_images")
        .select("url")
        .eq("pet_id", petId)
        .eq("is_primary", true)
        .maybeSingle();
      
      if (!imageError && imageData && typeof imageData === "object" && "url" in imageData) {
        const url = imageData.url;
        if (typeof url === "string") {
          petImage = url;
        }
      }
    }

    // Get the adoption fee from system parameters
    let adoptionFee = 100; // Default value
    const { data: feeParam, error: feeError } = await supabase
      .from("system_parameters")
      .select("value")
      .eq("key", "adoption_fee")
      .eq("category", "payment")
      .maybeSingle();
    
    if (!feeError && feeParam && typeof feeParam === "object" && "value" in feeParam) {
      const value = feeParam.value;
      if (typeof value === "object" && value !== null && "amount" in value) {
        const amount = value.amount;
        if (typeof amount === "number") {
          adoptionFee = amount;
        }
      }
    }

    // Construct the final response
    const response: AdoptionDetails = {
      id: adoptionData.id as string,
      petName: petName,
      petImage: petImage,
      status: adoptionData.current_stage as string,
      fee: adoptionFee,
      userName: adoptionData.users && typeof adoptionData.users === "object" && "name" in adoptionData.users 
        ? adoptionData.users.name as string 
        : "Adotante"
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error("Unhandled error:", error);
    
    // Extract error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "UnknownError";
    
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: `An unexpected error occurred: ${errorMessage}`,
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
