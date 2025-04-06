
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
      console.error("Environment variables not configured");
      return new Response(
        JSON.stringify({
          error: "Server configuration incomplete",
          details: "Required environment variables are not configured",
          code: "ENV_VARS_MISSING"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Initialize Supabase admin client (with SERVICE ROLE to bypass RLS)
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

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          error: "Unauthorized", 
          details: "Valid authentication token is required",
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
    
    // Initialize regular Supabase client with the provided JWT
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
    
    // Verify the JWT and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ 
          error: "Authentication failed", 
          details: "Invalid authentication token",
          code: "AUTH_ERROR" 
        }),
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Verify the user is an admin
    const isAdmin = await verifyAdmin(supabaseAdmin, user.id);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ 
          error: "Forbidden", 
          details: "You don't have permission to access this resource",
          code: "FORBIDDEN" 
        }),
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Handle different endpoints based on URL path
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const method = req.method;

    // Parse request body if needed
    let requestBody = {};
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        requestBody = await req.json();
        console.log("Request body:", JSON.stringify(requestBody, null, 2));
      } catch (e) {
        console.error("Error parsing request body:", e);
        return new Response(
          JSON.stringify({ 
            error: "Invalid request format", 
            details: "The request body is not in a valid JSON format",
            code: "INVALID_REQUEST_FORMAT" 
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
    }

    // Admin user management endpoints
    switch (true) {
      // GET /admin-users (list all users)
      case method === "GET" && !path:
        return await handleListUsers(supabaseAdmin, corsHeaders);
      
      // GET /admin-users/{id} (get user by ID)
      case method === "GET" && !!path && path !== "users":
        return await handleGetUser(supabaseAdmin, path, corsHeaders);
      
      // POST /admin-users (create user)
      case method === "POST" && !path:
        return await handleCreateUser(supabaseAdmin, requestBody, corsHeaders);
      
      // PUT /admin-users/{id} (update user)
      case method === "PUT" && !!path:
        return await handleUpdateUser(supabaseAdmin, path, requestBody, corsHeaders);
      
      // DELETE /admin-users/{id} (delete user)
      case method === "DELETE" && !!path:
        return await handleDeleteUser(supabaseAdmin, path, corsHeaders);
      
      // Roles management
      case path === "roles" && method === "GET":
        return await handleGetRoles(supabaseAdmin, corsHeaders);
      
      case path === "roles" && method === "POST":
        return await handleAssignRole(supabaseAdmin, requestBody, corsHeaders);
      
      case path === "roles" && method === "DELETE":
        return await handleRemoveRole(supabaseAdmin, requestBody, corsHeaders);
      
      default:
        return new Response(
          JSON.stringify({ 
            error: "Endpoint not found", 
            details: "The requested endpoint does not exist",
            code: "NOT_FOUND" 
          }),
          {
            status: 404,
            headers: corsHeaders,
          }
        );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message || "An unexpected error occurred while processing the request",
        code: "INTERNAL_SERVER_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});

// Helper function to verify if user is admin
async function verifyAdmin(supabaseAdmin, userId) {
  try {
    // Check if user has admin role in user_roles table
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error("Error checking admin role:", roleError);
      return false;
    }

    if (roleData) {
      return true;
    }

    // Fallback: check if user's email follows admin pattern
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('auth_id', userId)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return false;
    }

    const email = userData.email || '';
    return email.includes('@admin') || 
           email.includes('@ong') || 
           email === 'admin@petmatch.com';
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    return false;
  }
}

// Handler function implementations
async function handleListUsers(supabaseAdmin, corsHeaders) {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }

    return new Response(
      JSON.stringify(users || []),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error in handleListUsers:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error fetching users", 
        details: error.message || "Failed to retrieve users",
        code: "FETCH_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

async function handleGetUser(supabaseAdmin, userId, corsHeaders) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ 
            error: "User not found", 
            details: `No user with ID ${userId} exists`,
            code: "NOT_FOUND" 
          }),
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }
      console.error("Error fetching user:", error);
      throw error;
    }

    // Also get user roles if any
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
    }

    return new Response(
      JSON.stringify({ 
        ...user, 
        roles: roles || []
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error in handleGetUser:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error fetching user", 
        details: error.message || "Failed to retrieve user details",
        code: "FETCH_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

async function handleCreateUser(supabaseAdmin, requestBody, corsHeaders) {
  try {
    const { name, email, phone, address, city, state, zip, auth_id, ...additionalFields } = requestBody;
    
    if (!name || !email) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          details: "Name and email are required",
          code: "VALIDATION_ERROR" 
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        phone: phone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        zip: zip || '',
        auth_id: auth_id || null,
        ...additionalFields
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        message: "User created successfully",
        user: newUser
      }),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error in handleCreateUser:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error creating user", 
        details: error.message || "Failed to create user",
        code: "CREATE_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

async function handleUpdateUser(supabaseAdmin, userId, requestBody, corsHeaders) {
  try {
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(requestBody)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ 
            error: "User not found", 
            details: `No user with ID ${userId} exists`,
            code: "NOT_FOUND" 
          }),
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }
      console.error("Error updating user:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        message: "User updated successfully",
        user: updatedUser
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error in handleUpdateUser:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error updating user", 
        details: error.message || "Failed to update user",
        code: "UPDATE_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

async function handleDeleteUser(supabaseAdmin, userId, corsHeaders) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error("Error deleting user:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        message: "User deleted successfully"
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error in handleDeleteUser:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error deleting user", 
        details: error.message || "Failed to delete user",
        code: "DELETE_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

async function handleGetRoles(supabaseAdmin, corsHeaders) {
  try {
    const { data: roles, error } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }

    return new Response(
      JSON.stringify(roles || []),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Error in handleGetRoles:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error fetching roles", 
        details: error.message || "Failed to retrieve roles",
        code: "FETCH_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

async function handleAssignRole(supabaseAdmin, requestBody, corsHeaders) {
  try {
    const { user_id, role, permissions } = requestBody;
    
    if (!user_id || !role) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          details: "user_id and role are required",
          code: "VALIDATION_ERROR" 
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Check if role already exists
    const { data: existingRole, error: checkError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', user_id)
      .eq('role', role)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing role:", checkError);
      throw checkError;
    }

    if (existingRole) {
      // Update existing role
      const { data: updatedRole, error } = await supabaseAdmin
        .from('user_roles')
        .update({
          permissions: permissions || null
        })
        .eq('id', existingRole.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating role:", error);
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          message: "Role updated successfully",
          role: updatedRole
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } else {
      // Create new role
      const { data: newRole, error } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id,
          role,
          permissions: permissions || null
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating role:", error);
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          message: "Role assigned successfully",
          role: newRole
        }),
        {
          status: 201,
          headers: corsHeaders,
        }
      );
    }
  } catch (error) {
    console.error("Error in handleAssignRole:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error assigning role", 
        details: error.message || "Failed to assign role",
        code: "ROLE_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

async function handleRemoveRole(supabaseAdmin, requestBody, corsHeaders) {
  try {
    const { user_id, role } = requestBody;
    
    if (!user_id || !role) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          details: "user_id and role are required",
          code: "VALIDATION_ERROR" 
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const { error } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', user_id)
      .eq('role', role);

    if (error) {
      console.error("Error removing role:", error);
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
  } catch (error) {
    console.error("Error in handleRemoveRole:", error);
    return new Response(
      JSON.stringify({ 
        error: "Error removing role", 
        details: error.message || "Failed to remove role",
        code: "ROLE_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
