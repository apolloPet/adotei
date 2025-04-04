
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
    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Environment variables not configured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({
          error: "Server configuration incomplete.",
          details: "Required environment variables are not configured.",
          code: "ENV_VARS_MISSING"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Initialize Supabase client with SERVICE ROLE to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "user-profile-edge-function",
        },
      },
    });

    const { method, headers } = req;
    
    // Get JWT token from request
    const authHeader = headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    // Extract the JWT
    const jwt = authHeader.substring(7);
    
    // Verify the JWT and get user information - using standard client
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid token", 
          details: "Your session is invalid or expired. Please log in again.",
          code: "INVALID_TOKEN" 
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    console.log("Authenticated user:", user.id);

    // Parse the request body
    let requestBody = {};
    try {
      if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
        requestBody = await req.json();
      }
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format", 
          details: "The request body is not in a valid JSON format.",
          code: "INVALID_REQUEST_FORMAT" 
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Determine the operation based on the method and path
    if (method === "POST" && requestBody.operation === "create-profile") {
      // Creating a new user profile
      console.log("Creating user profile for:", user.id);
      
      try {
        // Check if profile already exists
        const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();
          
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error("Error checking for existing profile:", profileCheckError);
          throw profileCheckError;
        }
        
        if (existingProfile) {
          console.log("Profile already exists for user:", user.id);
          // Update existing profile instead
          const { data: updatedProfile, error: updateError } = await supabaseAdmin
            .from('users')
            .update({
              name: requestBody.name || user.user_metadata?.name || '',
              email: user.email,
              phone: requestBody.phone || '',
              address: requestBody.address || '',
              city: requestBody.city || '',
              state: requestBody.state || '',
              zip: requestBody.zip || '',
              housing_type: requestBody.housing_type || 'house',
              has_children: requestBody.has_children || false,
              children_ages: requestBody.children_ages || '',
              had_pets_before: requestBody.had_pets_before || false,
              has_allergies: requestBody.has_allergies || false,
              allergies_description: requestBody.allergies_description || '',
              work_schedule: requestBody.work_schedule || '',
              updated_at: new Date()
            })
            .eq('auth_id', user.id)
            .select()
            .single();
            
          if (updateError) {
            console.error("Error updating user profile:", updateError);
            throw updateError;
          }
          
          return new Response(
            JSON.stringify({ 
              message: "Profile updated successfully",
              profile: updatedProfile,
              updated: true
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
        }
        
        // Create a new profile using the admin client that bypasses RLS
        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('users')
          .insert({
            auth_id: user.id,
            email: user.email,
            name: requestBody.name || user.user_metadata?.name || '',
            phone: requestBody.phone || '',
            address: requestBody.address || '',
            city: requestBody.city || '',
            state: requestBody.state || '',
            zip: requestBody.zip || '',
            housing_type: requestBody.housing_type || 'house',
            has_children: requestBody.has_children || false,
            children_ages: requestBody.children_ages || '',
            had_pets_before: requestBody.had_pets_before || false,
            has_allergies: requestBody.has_allergies || false,
            allergies_description: requestBody.allergies_description || '',
            work_schedule: requestBody.work_schedule || ''
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          throw insertError;
        }
        
        return new Response(
          JSON.stringify({ 
            message: "Profile created successfully",
            profile: newProfile,
            created: true
          }),
          {
            status: 201,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error("Error in create-profile operation:", error);
        return new Response(
          JSON.stringify({ 
            error: "Error creating profile",
            details: error.message || "An error occurred while processing the request",
            code: error.code || "INTERNAL_SERVER_ERROR"
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    } else if (method === "GET") {
      // Fetch user profile
      try {
        console.log("Fetching profile for user:", user.id);
        const { data: userProfile, error: profileError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();
          
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || '',
                message: "Complete profile not created yet"
              }),
              {
                status: 200,
                headers: corsHeaders,
              }
            );
          }
          
          console.error("Error fetching user profile:", profileError);
          throw profileError;
        }
        
        return new Response(
          JSON.stringify(userProfile),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return new Response(
          JSON.stringify({ 
            error: "Error fetching profile",
            details: error.message || "An error occurred while processing the request",
            code: error.code || "INTERNAL_SERVER_ERROR"
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Unsupported operation", 
        details: "The requested operation is not supported by this function.",
        code: "UNSUPPORTED_OPERATION" 
      }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal error", 
        details: "An unexpected error occurred while processing the request.",
        code: "INTERNAL_SERVER_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
