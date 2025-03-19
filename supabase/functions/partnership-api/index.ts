
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

// Configurações do Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Headers CORS para permitir acesso de parceiros
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Em produção, limite para domínios específicos
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Chaves de API de parceiros (em produção, use um sistema mais robusto)
// Na versão de produção, isso deve estar no banco de dados
const PARTNER_API_KEYS: { [key: string]: { name: string, permissions: string[] } } = {
  "partner_k3y_example": { 
    name: "Partner Example", 
    permissions: ["read_pets", "submit_adoption_interest"]
  },
};

// Middleware de autenticação para parceiros
const authenticatePartner = (req: Request) => {
  const apiKey = req.headers.get("x-api-key");
  
  if (!apiKey) {
    return { authenticated: false, error: "API key não fornecida" };
  }
  
  const partner = PARTNER_API_KEYS[apiKey];
  
  if (!partner) {
    return { authenticated: false, error: "API key inválida" };
  }
  
  return { authenticated: true, partner };
};

// Função para registrar logs de API
const logApiRequest = async (
  partnerId: string, 
  endpoint: string, 
  method: string,
  status: number,
  details?: any
) => {
  try {
    await supabase.from("partnership_api_logs").insert({
      partner_id: partnerId,
      endpoint,
      method,
      status,
      details,
      ip_address: null, // Será preenchido pelo middleware
      user_agent: null, // Será preenchido pelo middleware
    });
  } catch (error) {
    console.error("Erro ao registrar log de API:", error);
  }
};

// Handlers para diferentes endpoints
const handlePetsRequest = async (req: Request, partner: any) => {
  // Verificar permissão específica
  if (!partner.permissions.includes("read_pets")) {
    return new Response(
      JSON.stringify({ error: "Sem permissão para acessar este recurso" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    // Buscar pets disponíveis para adoção
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, age, gender, description, main_image_url")
      .eq("status", "available")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    // Registrar log de sucesso
    await logApiRequest(
      partner.name,
      "/pets",
      "GET",
      200,
      { count: data.length }
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao buscar pets:", error);
    
    // Registrar log de erro
    await logApiRequest(
      partner.name,
      "/pets",
      "GET",
      500,
      { error: error.message }
    );
    
    return new Response(
      JSON.stringify({ error: "Erro ao buscar pets" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

// Endpoint para documentação de API
const handleApiDocs = async () => {
  const documentation = {
    name: "API de Parcerias PetMatch",
    version: "1.0.0",
    baseUrl: "https://jwbcrddblmiurmeziszp.functions.supabase.co/partnership-api",
    authentication: "API Key via header X-API-Key",
    endpoints: [
      {
        path: "/pets",
        method: "GET",
        description: "Retorna a lista de pets disponíveis para adoção",
        requiredPermissions: ["read_pets"],
        responseExample: {
          success: true,
          data: [
            {
              id: "uuid",
              name: "Rex",
              species: "dog",
              breed: "Labrador",
              age: 2,
              gender: "male",
              description: "Cão amigável e brincalhão",
              main_image_url: "https://example.com/image.jpg"
            }
          ],
          timestamp: "2023-10-10T10:10:10Z"
        }
      },
      {
        path: "/docs",
        method: "GET",
        description: "Retorna a documentação da API",
        requiredPermissions: [],
        responseExample: {
          name: "API de Parcerias PetMatch",
          version: "1.0.0",
          // outros campos
        }
      }
    ],
    errorResponses: {
      400: "Requisição inválida",
      401: "API key não fornecida",
      403: "API key inválida ou sem permissão",
      500: "Erro interno do servidor"
    }
  };
  
  return new Response(
    JSON.stringify(documentation),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
};

// Função principal que recebe e roteia as requisições
const handleRequest = async (req: Request): Promise<Response> => {
  // Tratar requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  const url = new URL(req.url);
  const endpoint = url.pathname.replace("/partnership-api", "");
  
  // Endpoint de documentação não requer autenticação
  if (endpoint === "/docs" && req.method === "GET") {
    return handleApiDocs();
  }
  
  // Autenticar parceiro
  const { authenticated, error, partner } = authenticatePartner(req);
  
  if (!authenticated) {
    // Registrar tentativa de acesso não autorizada
    await logApiRequest(
      "unknown",
      endpoint,
      req.method,
      401,
      { error }
    );
    
    return new Response(
      JSON.stringify({ error }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Rotear para o endpoint apropriado
  switch (true) {
    case endpoint === "/pets" && req.method === "GET":
      return handlePetsRequest(req, partner);
    
    default:
      // Registrar requisição para endpoint desconhecido
      await logApiRequest(
        partner.name,
        endpoint,
        req.method,
        404,
        { error: "Endpoint não encontrado" }
      );
      
      return new Response(
        JSON.stringify({ error: "Endpoint não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
  }
};

// Iniciar o servidor
serve(handleRequest);
