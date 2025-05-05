
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Configure Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { method } = await req.json();
    let result = null;
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Verify JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    switch (method) {
      case "createSessionLog": {
        const { sessionId, eventType, userAgent, ipAddress, deviceInfo } = await req.json();
        
        // Inserir log na tabela session_logs
        const { data, error } = await supabase
          .from("session_logs")
          .insert({
            user_id: user.id,
            session_id: sessionId,
            event_type: eventType,
            user_agent: userAgent,
            ip_address: ipAddress,
            device_info: deviceInfo || {}
          });
        
        if (error) throw error;
        result = { success: true, message: "Log de sessão criado com sucesso" };
        break;
      }
      
      case "getUserSessions": {
        // Buscar sessões do usuário
        const { data, error } = await supabase
          .from("session_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false });
        
        if (error) throw error;
        
        // Agrupar por session_id para obter sessões únicas com timestamps mais recentes
        const groupedSessions = {};
        data.forEach(session => {
          if (!groupedSessions[session.session_id] || 
              new Date(session.timestamp) > new Date(groupedSessions[session.session_id].timestamp)) {
            groupedSessions[session.session_id] = session;
          }
        });
        
        result = Object.values(groupedSessions);
        break;
      }
      
      case "terminateSession": {
        const { sessionId } = await req.json();
        
        // Verificar se o usuário é admin ou dono da sessão
        const { data: adminData } = await supabase.rpc('is_admin', { uid: user.id });
        const isAdmin = !!adminData;
        
        if (!isAdmin) {
          const { data: sessionData, error: sessionError } = await supabase
            .from("session_logs")
            .select("user_id")
            .eq("session_id", sessionId)
            .single();
          
          if (sessionError || (sessionData && sessionData.user_id !== user.id)) {
            return new Response(
              JSON.stringify({ error: "Sem permissão para encerrar esta sessão" }),
              { 
                status: 403, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          }
        }
        
        // Registrar encerramento da sessão
        await supabase
          .from("session_logs")
          .insert({
            user_id: user.id,
            session_id: sessionId,
            event_type: "session_terminated",
            user_agent: req.headers.get("User-Agent") || ""
          });
        
        result = { success: true, message: "Sessão encerrada com sucesso" };
        break;
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Método não suportado" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Erro na função de sessão:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
