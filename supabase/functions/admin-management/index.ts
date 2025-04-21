
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { verifyAuth } from "./auth.ts";
import { 
  createAdmin, 
  grantSuperAdmin, 
  getAdminUsers, 
  updateAdminPermissions, 
  removeAdminRole 
} from "./operations.ts";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-override, x-admin-email",
  "Content-Type": "application/json",
};

serve(async (req) => {
  console.log(`[admin-management] Received ${req.method} request`);
  
  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    console.log("[admin-management] Handling OPTIONS request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("[admin-management] Environment variables not configured");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Server configuration incomplete. Check environment variables.",
          code: "ENV_VARS_MISSING"
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    // Initialize Supabase client with service key for administrative access
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Handle GET requests separately as they don't need request body
    if (req.method === "GET") {
      console.log("[admin-management] Processing GET request");
      // Verify authorization for GET requests
      const { isAuthorized, userId, error } = await verifyAuth(req, supabase);
      
      if (!isAuthorized) {
        return new Response(
          JSON.stringify({ 
            success: false,
            message: error || "You are not authorized to perform this operation.",
            code: "UNAUTHORIZED" 
          }),
          {
            status: 403,
            headers: corsHeaders,
          }
        );
      }
      
      const result = await getAdminUsers(supabase);
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 500,
          headers: corsHeaders,
        }
      );
    }

    // For non-GET requests, check if there's a body
    // Get request body safely
    let requestData;
    
    // Log request details for debugging
    console.log(`[admin-management] Processing ${req.method} request`);
    console.log(`[admin-management] Content-type: ${req.headers.get("content-type")}`);
    console.log(`[admin-management] Content-length: ${req.headers.get("content-length")}`);
    
    try {
      // Clone the request to read the body
      const clonedReq = req.clone();
      const rawBody = await clonedReq.text();
      console.log('[admin-management] Raw body received:', rawBody);
      
      if (!rawBody || rawBody.trim() === '') {
        console.error('[admin-management] Empty request body received');
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Empty request body: No data provided',
            code: 'EMPTY_REQUEST'
          }),
          {
            status: 400,
            headers: corsHeaders
          }
        );
      }
      
      try {
        requestData = JSON.parse(rawBody);
        console.log('[admin-management] Request data parsed:', requestData);
      } catch (parseError) {
        console.error('[admin-management] Error parsing JSON:', parseError, 'Raw body:', rawBody);
        return new Response(
          JSON.stringify({
            success: false,
            message: `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
            code: 'INVALID_JSON',
            rawBody: rawBody.substring(0, 100) // Include part of the raw body in the error response
          }),
          {
            status: 400,
            headers: corsHeaders
          }
        );
      }
      
      // Verify we have valid data object
      if (!requestData || typeof requestData !== 'object') {
        console.error('[admin-management] Invalid request data structure:', requestData);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid request data structure',
            code: 'INVALID_DATA_STRUCTURE'
          }),
          {
            status: 400,
            headers: corsHeaders
          }
        );
      }
    } catch (error) {
      console.error('[admin-management] Error processing request body:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid request body: ' + (error instanceof Error ? error.message : 'Unknown parsing error'),
          code: 'INVALID_REQUEST'
        }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Verify authorization
    const { isAuthorized, userId, error } = await verifyAuth(req, supabase);

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: error || "You are not authorized to perform this operation.",
          code: "UNAUTHORIZED" 
        }),
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Handle super admin grant for admin@petmatch.com
    if (requestData?.grantSuperAdmin && requestData?.email === 'admin@petmatch.com') {
      const result = await grantSuperAdmin(supabase, 'admin@petmatch.com');
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 500,
          headers: corsHeaders
        }
      );
    }

    // Handle different operations based on HTTP method
    let result;
    
    switch(req.method) {
      case "POST":
        if (!requestData?.grantSuperAdmin) {
          // Log received data for debugging
          console.log("[admin-management] POST request data:", requestData);
          
          // Validate required fields
          if (!requestData?.email || !requestData?.password || !requestData?.name) {
            console.error("[admin-management] Missing required fields");
            return new Response(
              JSON.stringify({ 
                success: false,
                message: "Missing data. Email, password and name are required.",
                code: "MISSING_DATA",
                receivedFields: Object.keys(requestData || {})
              }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
          }
          
          // Validate permissions format
          if (!requestData?.permissions || typeof requestData?.permissions !== 'object') {
            console.error("[admin-management] Invalid permissions format");
            return new Response(
              JSON.stringify({ 
                success: false,
                message: "Invalid format for permissions.",
                code: "INVALID_PERMISSIONS",
                receivedPermissions: requestData?.permissions
              }),
              {
                status: 400,
                headers: corsHeaders,
              }
            );
          }

          console.log("[admin-management] Creating admin user:", 
            requestData.email, 
            "name:", requestData.name,
            "permissions:", requestData.permissions
          );
          
          result = await createAdmin(
            supabase,
            requestData.email,
            requestData.password,
            requestData.name,
            requestData.permissions
          );
          
          console.log("[admin-management] Create admin result:", result);
        }
        break;
        
      case "PUT":
        if (!requestData?.userId || !requestData?.permissions) {
          return new Response(
            JSON.stringify({ 
              success: false,
              message: "Missing data. User ID and permissions are required.",
              code: "MISSING_DATA",
              receivedFields: Object.keys(requestData || {})
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        result = await updateAdminPermissions(
          supabase,
          requestData.userId,
          requestData.permissions,
          userId
        );
        break;
        
      case "DELETE":
        if (!requestData?.userId) {
          return new Response(
            JSON.stringify({ 
              success: false,
              message: "User ID not provided.",
              code: "MISSING_USER_ID",
              receivedFields: Object.keys(requestData || {})
            }),
            {
              status: 400,
              headers: corsHeaders,
            }
          );
        }
        
        result = await removeAdminRole(supabase, requestData.userId, userId);
        break;
        
      default:
        return new Response(
          JSON.stringify({ 
            success: false,
            message: `Method ${req.method} not supported`,
            code: "INVALID_METHOD" 
          }),
          {
            status: 405,
            headers: corsHeaders,
          }
        );
    }

    // Handle response
    if (!result) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: "Operation failed - no result returned",
          code: "OPERATION_FAILED" 
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? (req.method === "POST" ? 201 : 200) : 500,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        code: "SERVER_ERROR" 
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
