
// Follow Deno API, TypeScript strictness, and no dependencies
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebsiteContent {
  id?: string;
  title: string;
  content: string;
  section: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  // Create Supabase client with service role key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Handle different HTTP methods
  try {
    const url = new URL(req.url)
    const section = url.searchParams.get('section')
    
    if (req.method === 'GET') {
      if (!section) {
        return new Response(JSON.stringify({ error: 'Section parameter is required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Get content for specified section
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .eq('section', section)

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } 
    else if (req.method === 'POST') {
      // Parse request body
      const contentItems: WebsiteContent[] = await req.json()
      
      if (!contentItems || !Array.isArray(contentItems) || contentItems.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid content format' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Loop through each content item and upsert
      const results = []
      for (const item of contentItems) {
        const { data, error } = await supabase
          .from('website_content')
          .upsert({
            id: item.id,
            title: item.title,
            content: item.content,
            section: item.section
          })
          .select()

        if (error) throw error
        results.push(data)
      }

      return new Response(JSON.stringify({ message: 'Content updated successfully', results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } 
    else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      })
    }
  } catch (error) {
    console.error('Error processing request:', error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
