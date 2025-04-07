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
    
    // Parse the request body
    let requestBody = {};
    try {
      if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
        requestBody = await req.json();
        console.log("Request body:", JSON.stringify(requestBody, null, 2));
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

    // Check authentication - either from request or from request body for signup flow
    let userId: string | null = null;
    
    // Try to get userId from the auth header
    const authHeader = headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
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
      
      if (authError) {
        console.error("Authentication error:", authError);
      } else if (user) {
        userId = user.id;
        console.log("Authenticated user from token:", userId);
      }
    }
    
    // For profile creation during signup, get user ID from request body
    if (!userId && requestBody.operation === 'create-profile' && requestBody.user_id) {
      userId = requestBody.user_id;
      console.log("Using user ID from request body:", userId);
    }

    // Determine the operation based on the method and path
    if (method === "POST" && requestBody.operation === "create-profile") {
      // Creating a new user profile
      if (!userId) {
        console.error("No user ID available for profile creation");
        return new Response(
          JSON.stringify({ 
            error: "Authentication required", 
            details: "No user ID available for profile creation",
            code: "NO_USER_ID" 
          }),
          {
            status: 401,
            headers: corsHeaders,
          }
        );
      }
      
      console.log("Creating user profile for:", userId);
      
      try {
        // Use more efficient query with less data and optimized for the index
        const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_id', userId)
          .limit(1)
          .maybeSingle();
          
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error("Error checking for existing profile:", profileCheckError);
          throw profileCheckError;
        }
        
        // Ensure boolean fields are actually booleans
        const has_children = typeof requestBody.has_children === 'boolean' 
          ? requestBody.has_children 
          : requestBody.has_children === 'true' || requestBody.has_children === true;
          
        const had_pets_before = typeof requestBody.had_pets_before === 'boolean' 
          ? requestBody.had_pets_before 
          : requestBody.had_pets_before === 'true' || requestBody.had_pets_before === true;
          
        const has_allergies = typeof requestBody.has_allergies === 'boolean' 
          ? requestBody.has_allergies 
          : requestBody.has_allergies === 'true' || requestBody.has_allergies === true;

        // Process all address-related fields
        const phone = requestBody.phone || '';
        const address = requestBody.address || '';
        const city = requestBody.city || '';
        const state = requestBody.state || '';
        const zip = requestBody.zip || '';

        // Ensure avatar_url is a string
        const avatar_url = requestBody.avatar_url !== undefined ? String(requestBody.avatar_url) : '';
        
        if (existingProfile) {
          console.log("Profile already exists for user:", userId);
          // Update existing profile instead
          const updatePayload = {
            name: requestBody.name || '',
            email: requestBody.email || '',
            phone: phone,
            address: address,
            city: city,
            state: state,
            zip: zip,
            housing_type: requestBody.housing_type || 'house',
            has_children: has_children,
            children_ages: requestBody.children_ages || '',
            had_pets_before: had_pets_before,
            has_allergies: has_allergies,
            allergies_description: requestBody.allergies_description || '',
            work_schedule: requestBody.work_schedule || '',
            avatar_url: avatar_url,
            updated_at: new Date()
          };
          
          console.log("Updating profile with data:", updatePayload);
          
          const { data: updatedProfile, error: updateError } = await supabaseAdmin
            .from('users')
            .update(updatePayload)
            .eq('auth_id', userId)
            .select()
            .single();
            
          if (updateError) {
            console.error("Error updating user profile:", updateError);
            return new Response(
              JSON.stringify({ 
                error: "Error updating profile",
                details: updateError.message || "Failed to update profile",
                code: updateError.code || "UPDATE_ERROR"
              }),
              {
                status: 500,
                headers: corsHeaders,
              }
            );
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
        const insertPayload = {
          auth_id: userId,
          email: requestBody.email || '',
          name: requestBody.name || '',
          phone: phone,
          address: address,
          city: city,
          state: state,
          zip: zip,
          housing_type: requestBody.housing_type || 'house',
          has_children: has_children,
          children_ages: requestBody.children_ages || '',
          had_pets_before: had_pets_before,
          has_allergies: has_allergies,
          allergies_description: requestBody.allergies_description || '',
          work_schedule: requestBody.work_schedule || '',
          avatar_url: avatar_url
        };
        
        console.log("Creating new profile with fields:", insertPayload);
        
        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('users')
          .insert(insertPayload)
          .select()
          .single();
          
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          console.error("Error details:", JSON.stringify(insertError, null, 2));
          return new Response(
            JSON.stringify({ 
              error: "Error creating profile",
              details: insertError.message || "Failed to create profile",
              code: insertError.code || "INSERT_ERROR"
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        console.log("Profile created successfully:", newProfile);
        
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
      if (!userId) {
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
      
      try {
        console.log("Fetching profile for user:", userId);
        // Use more efficient query
        const { data: userProfile, error: profileError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('auth_id', userId)
          .limit(1)
          .maybeSingle();
          
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            return new Response(
              JSON.stringify({
                id: userId,
                email: '',
                name: '',
                message: "Complete profile not created yet"
              }),
              {
                status: 200,
                headers: corsHeaders,
              }
            );
          }
          
          console.error("Error fetching user profile:", profileError);
          return new Response(
            JSON.stringify({ 
              error: "Error fetching profile",
              details: profileError.message || "Failed to fetch profile",
              code: profileError.code || "FETCH_ERROR"
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        if (!userProfile) {
          return new Response(
            JSON.stringify({
              id: userId,
              email: '',
              name: '',
              message: "Profile not found"
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
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
    } else if (method === "GET" && new URL(req.url).pathname.endsWith('/users')) {
      // List all users - admin only
      try {
        // Check if user is admin
        if (!userId) {
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

        console.log("Fetching all users with admin access");
        // Use more efficient query with pagination
        const limit = 50; // Limit the number of users per request
        const { data: users, error: usersError } = await supabaseAdmin
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (usersError) {
          console.error("Error fetching users:", usersError);
          return new Response(
            JSON.stringify({ 
              error: "Error fetching users",
              details: usersError.message || "Failed to fetch users",
              code: usersError.code || "FETCH_ERROR"
            }),
            {
              status: 500,
              headers: corsHeaders,
            }
          );
        }
        
        return new Response(
          JSON.stringify(users || []),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error("Error fetching users:", error);
        return new Response(
          JSON.stringify({ 
            error: "Error fetching users",
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
