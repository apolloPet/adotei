
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Check if user has admin role
async function isUserAdmin(supabase, userId) {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
    
    return !!data;
  } catch (e) {
    console.error("Error in admin check:", e);
    return false;
  }
}

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
      console.error("Environment variables not configured");
      return new Response(
        JSON.stringify({
          error: "Server configuration incomplete",
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
          "X-Client-Info": "admin-users-edge-function",
        },
      },
    });

    // Check authentication from auth header
    const authHeader = req.headers.get('Authorization');
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

    // Extract the JWT and verify user
    const jwt = authHeader.substring(7);
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
          error: "Unauthorized", 
          details: "Invalid or expired authentication token.",
          code: "INVALID_TOKEN" 
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const userId = user.id;
    console.log("Request from user:", userId);
    
    // Check if user is admin except for self-profile request
    const url = new URL(req.url);
    const isAdminRequired = !url.pathname.includes(`/users/${userId}`);
    
    if (isAdminRequired) {
      const isAdmin = await isUserAdmin(supabaseAdmin, userId);
      if (!isAdmin) {
        console.log("Non-admin user attempted to access admin endpoint:", userId);
        return new Response(
          JSON.stringify({ 
            error: "Forbidden", 
            details: "You do not have permission to access this resource.",
            code: "FORBIDDEN" 
          }),
          {
            status: 403,
            headers: corsHeaders,
          }
        );
      }
    }

    // Parse request body for POST/PUT/DELETE requests
    let requestBody = {};
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      try {
        requestBody = await req.json();
        console.log("Request body:", requestBody);
      } catch (e) {
        // Empty body or not JSON
      }
    }

    // Process based on the path and method
    const { pathname } = url;

    // List all users
    if (pathname.endsWith("/users") && req.method === "GET") {
      try {
        const { data: users, error: usersError } = await supabaseAdmin
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (usersError) {
          console.error("Error fetching users:", usersError);
          throw usersError;
        }
        
        return new Response(
          JSON.stringify(users || []),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error("Error processing users request:", error);
        return new Response(
          JSON.stringify({ 
            error: "Error fetching users",
            details: error.message,
            code: error.code || "FETCH_ERROR"
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }

    // Get specific user
    const userIdMatch = pathname.match(/\/users\/([^\/]+)$/);
    if (userIdMatch && req.method === "GET") {
      const userId = userIdMatch[1];
      try {
        const { data: user, error: userError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (userError) {
          throw userError;
        }
        
        // Get user roles
        const { data: roles, error: rolesError } = await supabaseAdmin
          .from('user_roles')
          .select('*')
          .eq('user_id', userId);
          
        if (rolesError) {
          console.warn("Error fetching user roles:", rolesError);
        }
        
        return new Response(
          JSON.stringify({ ...user, roles: roles || [] }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return new Response(
          JSON.stringify({ 
            error: "Error fetching user",
            details: error.message,
            code: error.code || "FETCH_ERROR"
          }),
          {
            status: error.code === "PGRST116" ? 404 : 500,
            headers: corsHeaders,
          }
        );
      }
    }

    // Update user
    if (userIdMatch && req.method === "PATCH") {
      const userId = userIdMatch[1];
      try {
        // Remove any fields that shouldn't be updated
        const { id, created_at, auth_id, roles, ...updateData } = requestBody;
        
        const { data: updated, error: updateError } = await supabaseAdmin
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();
          
        if (updateError) {
          throw updateError;
        }
        
        return new Response(
          JSON.stringify({ 
            message: "User updated successfully",
            user: updated
          }),
          {
            status: 200,
            headers: corsHeaders,
          }
        );
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        return new Response(
          JSON.stringify({ 
            error: "Error updating user",
            details: error.message,
            code: error.code || "UPDATE_ERROR"
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }

    // Manage roles
    if (pathname.endsWith("/roles") && req.method === "POST") {
      try {
        const { userId, role, action } = requestBody;
        
        if (!userId || !role || !action) {
          return new Response(
            JSON.stringify({ 
              error: "Invalid request", 
              details: "userId, role, and action are required fields.",
              code: "INVALID_REQUEST" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        if (action === "add") {
          // Check if role already exists
          const { data: existingRole } = await supabaseAdmin
            .from('user_roles')
            .select('id')
            .eq('user_id', userId)
            .eq('role', role)
            .maybeSingle();
            
          if (!existingRole) {
            // Add role
            const { data, error } = await supabaseAdmin
              .from('user_roles')
              .insert({
                user_id: userId,
                role,
                permissions: requestBody.permissions || {}
              })
              .select()
              .single();
              
            if (error) {
              throw error;
            }
            
            return new Response(
              JSON.stringify({ 
                message: "Role added successfully",
                role: data
              }),
              {
                status: 200,
                headers: corsHeaders,
              }
            );
          } else {
            return new Response(
              JSON.stringify({ 
                message: "Role already exists"
              }),
              {
                status: 200,
                headers: corsHeaders,
              }
            );
          }
        } else if (action === "remove") {
          // Remove role
          const { error } = await supabaseAdmin
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', role);
            
          if (error) {
            throw error;
          }
          
          return new Response(
            JSON.stringify({ 
              message: "Role removed successfully"
            }),
            {
              status: 200,
              headers: corsHeaders,
            }
          );
        } else {
          return new Response(
            JSON.stringify({ 
              error: "Invalid action", 
              details: "Action must be 'add' or 'remove'.",
              code: "INVALID_ACTION" 
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
      } catch (error) {
        console.error("Error managing roles:", error);
        return new Response(
          JSON.stringify({ 
            error: "Error managing roles",
            details: error.message,
            code: error.code || "ROLE_ERROR"
          }),
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }

    // Handle unsupported routes
    return new Response(
      JSON.stringify({ 
        error: "Not found", 
        details: "The requested endpoint does not exist.",
        code: "NOT_FOUND" 
      }),
      {
        status: 404,
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
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
