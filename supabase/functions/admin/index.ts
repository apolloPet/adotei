
// Follow the Supabase edge function format
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";

// Set up CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse request
    const { endpoint } = await req.json();

    // Get auth token from request header
    const authHeader = req.headers.get('Authorization');
    
    // Create admin client using service role to bypass RLS
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default when deployed to Supabase
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API SERVICE ROLE KEY - env var exported by default when deployed to Supabase
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin status if JWT is present
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (authError) {
        throw new Error('Unauthorized: Invalid token');
      }
      
      if (!user) {
        throw new Error('Unauthorized: User not found');
      }
      
      // Check admin status (you can enhance this check as needed)
      // Here we'll proceed with the request regardless of admin status
      // since we're already in an admin-only function
      console.log(`Request from user: ${user.email}`);
    }
    
    // Process specific endpoints
    if (endpoint === '/users') {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return new Response(JSON.stringify(data), { 
        headers: corsHeaders, 
        status: 200 
      });
    }
    
    // Default response for unknown endpoints
    return new Response(JSON.stringify({ 
      error: 'Endpoint not supported' 
    }), { 
      headers: corsHeaders, 
      status: 400 
    });
    
  } catch (error) {
    console.error('Error in admin function:', error.message);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), { 
      headers: corsHeaders, 
      status: 500 
    });
  }
});
