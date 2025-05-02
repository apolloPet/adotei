
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

// ------------ Helper Functions ------------

// Parse the request body and validate JSON
async function parseRequestBody(req: Request) {
  try {
    const clonedReq = req.clone();
    const rawBody = await clonedReq.text();
    
    console.log('Raw request body received:', rawBody ? rawBody.substring(0, 200) + '...' : 'empty');
    
    if (!rawBody || rawBody.trim() === '') {
      return { error: { 
        success: false, 
        message: 'Corpo da requisição vazio: Nenhum dado fornecido', 
        code: 'EMPTY_REQUEST'
      }};
    }
    
    try {
      const json = JSON.parse(rawBody);
      console.log('Parsed request body successfully:', Object.keys(json));
      return { data: json };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { error: { 
        success: false,
        message: `JSON inválido: ${parseError instanceof Error ? parseError.message : 'Erro desconhecido'}`,
        code: 'INVALID_JSON',
        rawBody: rawBody.substring(0, 100)
      }};
    }
  } catch (error) {
    console.error('Request body parsing error:', error);
    return { error: { 
      success: false,
      message: 'Corpo da requisição inválido: ' + (error instanceof Error ? error.message : 'Erro de análise desconhecido'),
      code: 'INVALID_REQUEST'
    }};
  }
}

// Handle GET request authorization and processing
async function handleGetRequest(req: Request, supabase: any) {
  const { isAuthorized, userId, error } = await verifyAuth(req, supabase);
  if (!isAuthorized) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error || "Você não está autorizado a realizar esta operação.",
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

// Process and validate request body for non-GET methods
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
        message: 'Estrutura de dados da requisição inválida',
        code: 'INVALID_DATA_STRUCTURE'
      }), { status: 400, headers: corsHeaders })
    };
  }
  return { parsed: data, errorResponse: null };
}

// Main handler function
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
          message: "Configuração do servidor incompleta. Verifique as variáveis de ambiente.",
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
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (req.method === "GET") {
      return await handleGetRequest(req, supabase);
    }

    // --------- Non-GET: Body parsing + validation ---------
    const { parsed: requestData, errorResponse } = await handleNonGetBody(req);
    if (errorResponse) return errorResponse;

    // --------- Authorization ---------
    const { isAuthorized, userId, error } = await verifyAuth(req, supabase);
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({
          success: false,
          message: error || "Você não está autorizado a realizar esta operação.",
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

    // --------- Operation switch ----------
    let result;
    switch (req.method) {
      case "POST":
        if (!requestData?.grantSuperAdmin) {
          // Required fields validation
          if (!requestData?.email || !requestData?.password || !requestData?.name) {
            console.error('Missing required fields in POST request:', Object.keys(requestData || {}));
            return new Response(
              JSON.stringify({
                success: false,
                message: "Dados incompletos. Email, senha e nome são obrigatórios.",
                code: "MISSING_DATA",
                receivedFields: Object.keys(requestData || {})
              }),
              { status: 400, headers: corsHeaders }
            );
          }
          // Permissions validation
          if (!requestData?.permissions || typeof requestData?.permissions !== 'object') {
            console.error('Invalid permissions format:', requestData?.permissions);
            return new Response(
              JSON.stringify({
                success: false,
                message: "Formato inválido para permissões.",
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
              message: "Dados incompletos. ID do usuário e permissões são obrigatórios.",
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
              message: "ID do usuário não fornecido.",
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
            message: `Método ${req.method} não suportado`,
            code: "INVALID_METHOD"
          }),
          { status: 405, headers: corsHeaders }
        );
    }

    // --------- Final response ----------
    if (!result) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Operação falhou - nenhum resultado retornado",
          code: "OPERATION_FAILED"
        }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? (req.method === "POST" ? 201 : 200) : (result.code === "DUPLICATE_EMAIL" ? 409 : 500),
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Erro interno do servidor",
        code: "SERVER_ERROR"
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
