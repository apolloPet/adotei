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

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-override, x-admin-email",
  "Content-Type": "application/json",
};

// ------------ Funções Auxiliares ------------

// Parseia o corpo da requisição e valida JSON
async function parseRequestBody(req: Request) {
  try {
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();
    if (!rawBody || rawBody.trim() === '') {
      return { error: { 
        success: false, 
        message: 'Empty request body: No data provided', 
        code: 'EMPTY_REQUEST'
      }};
    }
    try {
      const json = JSON.parse(rawBody);
      return { data: json };
    } catch (parseError) {
      return { error: { 
        success: false,
        message: `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        code: 'INVALID_JSON',
        rawBody: rawBody.substring(0, 100)
      }};
    }
  } catch (error) {
    return { error: { 
      success: false,
      message: 'Invalid request body: ' + (error instanceof Error ? error.message : 'Unknown parsing error'),
      code: 'INVALID_REQUEST'
    }};
  }
}

// Faz a verificação de autorização para GET ou demais métodos
async function handleGetRequest(req: Request, supabase: any) {
  const { isAuthorized, userId, error } = await verifyAuth(req, supabase);
  if (!isAuthorized) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error || "You are not authorized to perform this operation.",
        code: "UNAUTHORIZED"
      }),
      { status: 403, headers: corsHeaders }
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

// Processa e valida o corpo da requisição para métodos não-GET (POST/PUT/DELETE)
async function handleNonGetBody(req: Request) {
  const { data, error } = await parseRequestBody(req);
  if (error) {
    return { parsed: null, errorResponse: new Response(JSON.stringify(error), { status: 400, headers: corsHeaders }) };
  }
  if (!data || typeof data !== 'object') {
    return {
      parsed: null,
      errorResponse: new Response(JSON.stringify({
        success: false,
        message: 'Invalid request data structure',
        code: 'INVALID_DATA_STRUCTURE'
      }), { status: 400, headers: corsHeaders })
    };
  }
  return { parsed: data, errorResponse: null };
}

// Handler principal da função
serve(async (req) => {
  console.log(`[admin-management] Received ${req.method} request`);
  
  // OPTIONS CORS handler
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Check env
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

    // Instancia supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (req.method === "GET") {
      return await handleGetRequest(req, supabase);
    }

    // --------- Não-GET: Body parse + validações ---------
    const { parsed: requestData, errorResponse } = await handleNonGetBody(req);
    if (errorResponse) return errorResponse;

    // --------- Autorização ---------
    const { isAuthorized, userId, error } = await verifyAuth(req, supabase);
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error || "You are not authorized to perform this operation.",
          code: "UNAUTHORIZED"
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Super admin grant
    if (requestData?.grantSuperAdmin && requestData?.email === 'admin@petmatch.com') {
      const result = await grantSuperAdmin(supabase, 'admin@petmatch.com');
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: corsHeaders
      });
    }

    // --------- Switch de operações ----------
    let result;
    switch (req.method) {
      case "POST":
        if (!requestData?.grantSuperAdmin) {
          // Validação campos obrigatórios
          if (!requestData?.email || !requestData?.password || !requestData?.name) {
            return new Response(
              JSON.stringify({
                success: false,
                message: "Missing data. Email, password and name are required.",
                code: "MISSING_DATA",
                receivedFields: Object.keys(requestData || {})
              }),
              { status: 400, headers: corsHeaders }
            );
          }
          // Validação permissions
          if (!requestData?.permissions || typeof requestData?.permissions !== 'object') {
            return new Response(
              JSON.stringify({
                success: false,
                message: "Invalid format for permissions.",
                code: "INVALID_PERMISSIONS",
                receivedPermissions: requestData?.permissions
              }),
              { status: 400, headers: corsHeaders }
            );
          }
          result = await createAdmin(
            supabase,
            requestData.email,
            requestData.password,
            requestData.name,
            requestData.permissions
          );
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
            { status: 400, headers: corsHeaders }
          );
        }
        result = await updateAdminPermissions(supabase, requestData.userId, requestData.permissions, userId);
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
            { status: 400, headers: corsHeaders }
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
          { status: 405, headers: corsHeaders }
        );
    }

    // --------- Resposta final ----------
    if (!result) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Operation failed - no result returned",
          code: "OPERATION_FAILED"
        }),
        { status: 500, headers: corsHeaders }
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
      { status: 500, headers: corsHeaders }
    );
  }
});
