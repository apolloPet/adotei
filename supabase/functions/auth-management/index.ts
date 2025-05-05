
// Follow Deno API, TypeScript strictness, and no dependencies
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse request body
    const { action, email, password, token } = await req.json()

    // Handle different actions
    if (action === 'request_reset') {
      // Request password reset email
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.headers.get('origin')}/reset-password-confirm`,
      })

      if (error) throw error

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Password reset email sent' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } 
    else if (action === 'reset_password') {
      // Complete password reset
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Password updated successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    else if (action === 'change_admin_password') {
      // Change admin password (requires additional verification)
      // Here we would check if the user has admin privileges
      // For security, this should verify the current password and user role
      
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      // Check if user exists and has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('role', 'admin')
        .maybeSingle()
        
      if (roleError) throw roleError
      
      if (!roleData) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Unauthorized: User is not an admin' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        })
      }
      
      // Update password
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Admin password updated successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }
    else {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid action' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  } catch (error) {
    console.error('Error processing request:', error)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
