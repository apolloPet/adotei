import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log('Edge function invoked with method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Auth header present:', !!req.headers.get('Authorization'));
    
    // Get Supabase URL and service role key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    // Log environment variable status (without exposing actual values)
    console.log('SUPABASE_URL available:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY available:', !!supabaseServiceRoleKey);
    console.log('SUPABASE_ANON_KEY available:', !!supabaseAnonKey);
    
    if (!supabaseUrl) {
      console.error('Missing SUPABASE_URL environment variable');
      return new Response(
        JSON.stringify({ error: 'Configuração incompleta para cadastro de animal - URL não configurada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
    
    if (!supabaseServiceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Configuração incompleta para cadastro de animal - Service role key não configurada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
    
    if (!supabaseAnonKey) {
      console.error('Missing SUPABASE_ANON_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Configuração incompleta para cadastro de animal - Anon key não configurada' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Create a Supabase client with the Admin role to bypass RLS
    // When called from demo mode
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Create a regular client with user auth context
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    // Get auth user if present
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    console.log('User authenticated:', !!user);
    
    // Determine if we're in admin mode without user session
    const authHeader = req.headers.get('Authorization') || '';
    const isAdminMode = !user && authHeader.includes(supabaseAnonKey);
    
    console.log('Is admin mode:', isAdminMode);
    
    // Choose the appropriate client based on context
    const clientToUse = isAdminMode ? supabaseAdmin : supabaseClient;

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    const animalId = path.length > 1 ? path[1] : null;

    console.log('Request path:', path);
    console.log('Animal ID from path:', animalId);

    // Handle different endpoints based on HTTP method and path
    // GET /animals - List all animals (with optional filters)
    if (req.method === 'GET' && !animalId) {
      // Parse query parameters for filtering
      const params = url.searchParams;
      const nome = params.get('nome');
      const tipo = params.get('tipo');
      const porte = params.get('porte');
      const responsavel_id = params.get('responsavel_id');

      console.log('Filtering parameters:', { nome, tipo, porte, responsavel_id });

      let query = clientToUse.from('animals').select('*');

      // Apply filters if provided
      if (nome) query = query.ilike('nome', `%${nome}%`);
      if (tipo) query = query.eq('tipo', tipo);
      if (porte) query = query.eq('porte', porte);
      if (responsavel_id) query = query.eq('responsavel_id', responsavel_id);

      // If not admin, only show their own animals
      if (!isAdminMode && user) {
        query = query.eq('responsavel_id', user.id);
      }

      console.log('Executing GET animals query...');
      const { data, error } = await query.order('data_cadastro', { ascending: false });

      if (error) {
        console.error('Error fetching animals:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log(`GET animals successful: ${data?.length} animals found`);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // GET /animals/:id - Get a specific animal
    if (req.method === 'GET' && animalId) {
      let query = clientToUse.from('animals').select('*').eq('id', animalId);

      // If not admin, only allow access to their own animals
      if (!isAdminMode && user) {
        query = query.eq('responsavel_id', user.id);
      }

      console.log('Executing GET single animal query...');
      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Animal not found:', animalId);
          return new Response(JSON.stringify({ error: 'Animal não encontrado' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        console.error('Error fetching animal:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log('GET animal successful:', animalId);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // POST /animals - Create a new animal
    if (req.method === 'POST' && !animalId) {
      console.log('Creating new animal...');
      
      // Parse request body
      const requestData = await req.json();
      console.log('Request data:', JSON.stringify(requestData));

      // Validate required fields
      const requiredFields = ['nome', 'idade', 'tipo', 'porte', 'sexo'];
      for (const field of requiredFields) {
        if (!requestData[field]) {
          console.error(`Missing required field: ${field}`);
          return new Response(JSON.stringify({ error: `Campo obrigatório: ${field}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
      }

      // Additional validation
      if (typeof requestData.idade !== 'number' || isNaN(requestData.idade) || requestData.idade < 0) {
        console.error('Invalid age value:', requestData.idade);
        return new Response(JSON.stringify({ error: 'Idade deve ser um número positivo' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      
      if (requestData.descricao && requestData.descricao.length > 200) {
        console.error('Description too long:', requestData.descricao.length);
        return new Response(JSON.stringify({ error: 'Descrição deve ter no máximo 200 caracteres' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Set responsible_id to current user if not provided and we have a user
      if (!requestData.responsavel_id && user) {
        requestData.responsavel_id = user.id;
        console.log(`Setting responsavel_id to current user: ${user.id}`);
      } else if (!requestData.responsavel_id) {
        // For admin demo mode, use a placeholder ID
        requestData.responsavel_id = "00000000-0000-0000-0000-000000000000";
        console.log(`Setting responsavel_id to placeholder for admin mode`);
      }

      // Remove castrado field if it doesn't exist
      if (requestData.hasOwnProperty('castrado') && requestData.castrado === undefined) {
        delete requestData.castrado;
      }

      console.log('Inserting animal into database...');
      console.log('Using client:', isAdminMode ? 'Admin client (bypassing RLS)' : 'Regular client');
      
      try {
        // Insert the new animal using the appropriate client
        const { data, error } = await clientToUse
          .from('animals')
          .insert(requestData)
          .select();

        if (error) {
          console.error('Error creating animal:', error);
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        if (!data || data.length === 0) {
          console.error('No data returned after insertion');
          return new Response(JSON.stringify({ error: 'Nenhum dado retornado após inserção' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          });
        }

        console.log('Animal created successfully:', data);
        return new Response(JSON.stringify(data[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      } catch (dbError) {
        console.error('Unexpected database error:', dbError);
        return new Response(JSON.stringify({ error: 'Erro ao salvar o animal no banco de dados' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    // PUT /animals/:id - Update an animal
    if (req.method === 'PUT' && animalId) {
      // Check if animal exists and user has permission
      let query = clientToUse.from('animals').select('*').eq('id', animalId);

      // If not admin, only allow access to their own animals
      if (!isAdminMode && user) {
        query = query.eq('responsavel_id', user.id);
      }

      console.log('Checking if animal exists before update...');
      const { data: existingAnimal, error: fetchError } = await query.single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.log('Animal not found or permission denied:', animalId);
          return new Response(JSON.stringify({ error: 'Animal não encontrado ou sem permissão' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        console.error('Error fetching animal for update:', fetchError);
        return new Response(JSON.stringify({ error: fetchError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // Parse request body
      const requestData = await req.json();
      console.log('Update data:', JSON.stringify(requestData));

      // Don't allow changing the responsavel_id if user is not admin
      if (!isAdminMode && user && requestData.responsavel_id && requestData.responsavel_id !== user.id) {
        delete requestData.responsavel_id;
      }

      // Update animal
      console.log('Updating animal:', animalId);
      const { data, error } = await clientToUse
        .from('animals')
        .update(requestData)
        .eq('id', animalId)
        .select();

      if (error) {
        console.error('Error updating animal:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log('Animal updated successfully');
      return new Response(JSON.stringify(data[0]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // DELETE /animals/:id - Delete an animal
    if (req.method === 'DELETE' && animalId) {
      // Check if animal exists and user has permission
      let query = clientToUse.from('animals').select('*').eq('id', animalId);

      // If not admin, only allow access to their own animals
      if (!isAdminMode && user) {
        query = query.eq('responsavel_id', user.id);
      }

      console.log('Checking if animal exists before deletion...');
      const { data: existingAnimal, error: fetchError } = await query.single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.log('Animal not found or permission denied:', animalId);
          return new Response(JSON.stringify({ error: 'Animal não encontrado ou sem permissão' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        console.error('Error fetching animal for deletion:', fetchError);
        return new Response(JSON.stringify({ error: fetchError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // Delete animal
      console.log('Deleting animal:', animalId);
      const { error } = await clientToUse
        .from('animals')
        .delete()
        .eq('id', animalId);

      if (error) {
        console.error('Error deleting animal:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log('Animal deleted successfully');
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Endpoint not found
    console.log('Endpoint not found');
    return new Response(JSON.stringify({ error: 'Endpoint não encontrado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor', details: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
