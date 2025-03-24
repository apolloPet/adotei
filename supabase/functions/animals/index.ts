
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
    console.log('Edge Function invocada com método:', req.method);
    console.log('URL da requisição:', req.url);
    
    // Obter variáveis de ambiente e garantir que existam
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    // Verificar se as variáveis de ambiente estão definidas
    if (!supabaseUrl) {
      console.error('Erro crítico: SUPABASE_URL não definida');
      return new Response(
        JSON.stringify({ 
          error: 'Configuração incompleta: URL da Supabase não encontrada nas variáveis de ambiente do servidor',
          detail: 'A variável SUPABASE_URL precisa ser configurada na seção de segredos da Edge Function'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
    
    if (!supabaseServiceRoleKey) {
      console.error('Erro crítico: SUPABASE_SERVICE_ROLE_KEY não definida');
      return new Response(
        JSON.stringify({ 
          error: 'Configuração incompleta: Chave de serviço da Supabase não encontrada',
          detail: 'A variável SUPABASE_SERVICE_ROLE_KEY precisa ser configurada na seção de segredos da Edge Function'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
    
    if (!supabaseAnonKey) {
      console.error('Erro crítico: SUPABASE_ANON_KEY não definida');
      return new Response(
        JSON.stringify({ 
          error: 'Configuração incompleta: Chave anônima da Supabase não encontrada',
          detail: 'A variável SUPABASE_ANON_KEY precisa ser configurada na seção de segredos da Edge Function'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    console.log('Variáveis de ambiente verificadas com sucesso:');
    console.log('- SUPABASE_URL: Disponível');
    console.log('- SUPABASE_SERVICE_ROLE_KEY: Disponível');
    console.log('- SUPABASE_ANON_KEY: Disponível');

    // Verificar cabeçalho de autorização
    const authHeader = req.headers.get('Authorization') || '';
    console.log('Cabeçalho de autorização presente:', !!authHeader);

    // Criar cliente Supabase com role de administrador para bypass de RLS
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Criar cliente regular com contexto de autenticação do usuário
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Obter usuário autenticado, se presente
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    console.log('Usuário autenticado:', !!user);
    
    // Determinar se estamos no modo admin sem sessão de usuário
    const isAdminMode = !user && authHeader.includes(supabaseAnonKey);
    console.log('Modo admin detectado:', isAdminMode);
    
    // Escolher o cliente apropriado com base no contexto
    const clientToUse = isAdminMode ? supabaseAdmin : supabaseClient;

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    const animalId = path.length > 1 ? path[1] : null;

    console.log('Caminho da requisição:', path);
    console.log('ID do animal do caminho:', animalId);

    // POST /animals - Criar um novo animal
    if (req.method === 'POST' && !animalId) {
      console.log('Processando requisição de criação de animal');
      
      // Analisar corpo da requisição
      let requestData;
      try {
        requestData = await req.json();
        console.log('Dados recebidos:', JSON.stringify(requestData));
      } catch (parseError) {
        console.error('Erro ao analisar JSON:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Formato de dados inválido',
            detail: 'O corpo da requisição deve ser um JSON válido'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Validar campos obrigatórios
      const requiredFields = ['nome', 'idade', 'tipo', 'porte', 'sexo'];
      const missingFields = requiredFields.filter(field => !requestData[field]);
      
      if (missingFields.length > 0) {
        console.error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
        return new Response(
          JSON.stringify({ 
            error: 'Campos obrigatórios não informados',
            detail: `Os seguintes campos são obrigatórios: ${missingFields.join(', ')}`
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }

      // Validação adicional
      if (typeof requestData.idade !== 'number' || isNaN(requestData.idade) || requestData.idade < 0) {
        console.error('Valor de idade inválido:', requestData.idade);
        return new Response(
          JSON.stringify({ 
            error: 'Valor inválido para idade',
            detail: 'A idade deve ser um número positivo' 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        );
      }
      
      // Definir responsavel_id para o usuário atual se não fornecido e temos um usuário
      if (!requestData.responsavel_id && user) {
        requestData.responsavel_id = user.id;
        console.log(`Definindo responsável para o usuário atual: ${user.id}`);
      } else if (!requestData.responsavel_id) {
        // Para modo admin demo, usar um ID padrão
        requestData.responsavel_id = "00000000-0000-0000-0000-000000000000";
        console.log(`Definindo responsável padrão para modo admin`);
      }

      // Garantir que arrays vazios sejam definidos corretamente
      if (!requestData.vacinas) {
        requestData.vacinas = [];
      }
      
      if (!requestData.fotos) {
        requestData.fotos = [];
      }

      // Remover campo castrado se ele não existir
      if (requestData.hasOwnProperty('castrado') && requestData.castrado === undefined) {
        delete requestData.castrado;
      }

      console.log('Inserindo animal no banco de dados...');
      console.log('Usando cliente:', isAdminMode ? 'Cliente admin (bypass de RLS)' : 'Cliente regular');
      
      try {
        // Inserir o novo animal usando o cliente apropriado
        const { data, error } = await clientToUse
          .from('animals')
          .insert(requestData)
          .select();

        if (error) {
          console.error('Erro detalhado do banco de dados:', error);
          
          if (error.code === '23505') {
            return new Response(
              JSON.stringify({ 
                error: 'Animal já cadastrado',
                detail: 'Já existe um animal com estas informações no sistema'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 409,
              }
            );
          }
          
          if (error.code === '42501') {
            return new Response(
              JSON.stringify({ 
                error: 'Permissão negada',
                detail: 'Você não tem permissão para cadastrar animais. Verifique suas credenciais e políticas de segurança.'
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
              }
            );
          }
          
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao cadastrar animal no banco de dados',
              detail: error.message,
              code: error.code
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        if (!data || data.length === 0) {
          console.error('Nenhum dado retornado após inserção');
          return new Response(
            JSON.stringify({ 
              error: 'Falha no processamento',
              detail: 'O animal foi cadastrado, mas não foi possível recuperar os dados'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        console.log('Animal cadastrado com sucesso:', data[0]);
        return new Response(
          JSON.stringify({
            ...data[0],
            message: 'Animal cadastrado com sucesso!'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
          }
        );
      } catch (dbError) {
        console.error('Erro inesperado no banco de dados:', dbError);
        return new Response(
          JSON.stringify({ 
            error: 'Erro interno no servidor',
            detail: 'Ocorreu um erro ao salvar o animal no banco de dados. Por favor, tente novamente mais tarde.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }

    // GET /animals - Listar todos os animais (com filtros opcionais)
    if (req.method === 'GET' && !animalId) {
      // Parse query parameters for filtering
      const params = url.searchParams;
      const nome = params.get('nome');
      const tipo = params.get('tipo');
      const porte = params.get('porte');
      const responsavel_id = params.get('responsavel_id');

      console.log('Parâmetros de filtragem:', { nome, tipo, porte, responsavel_id });

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

      console.log('Executando consulta GET animals...');
      const { data, error } = await query.order('data_cadastro', { ascending: false });

      if (error) {
        console.error('Erro ao buscar animais:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log(`GET animals bem-sucedido: ${data?.length} animais encontrados`);
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

      console.log('Executando consulta GET single animal...');
      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Animal não encontrado:', animalId);
          return new Response(JSON.stringify({ error: 'Animal não encontrado' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        console.error('Erro ao buscar animal:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log('GET animal bem-sucedido:', animalId);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // PUT /animals/:id - Update an animal
    if (req.method === 'PUT' && animalId) {
      // Check if animal exists and user has permission
      let query = clientToUse.from('animals').select('*').eq('id', animalId);

      // If not admin, only allow access to their own animals
      if (!isAdminMode && user) {
        query = query.eq('responsavel_id', user.id);
      }

      console.log('Verificando se o animal existe antes da atualização...');
      const { data: existingAnimal, error: fetchError } = await query.single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.log('Animal não encontrado ou permissão negada:', animalId);
          return new Response(JSON.stringify({ error: 'Animal não encontrado ou sem permissão' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        console.error('Erro ao buscar animal para atualização:', fetchError);
        return new Response(JSON.stringify({ error: fetchError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // Parse request body
      const requestData = await req.json();
      console.log('Dados de atualização:', JSON.stringify(requestData));

      // Don't allow changing the responsavel_id if user is not admin
      if (!isAdminMode && user && requestData.responsavel_id && requestData.responsavel_id !== user.id) {
        delete requestData.responsavel_id;
      }

      // Update animal
      console.log('Atualizando animal:', animalId);
      const { data, error } = await clientToUse
        .from('animals')
        .update(requestData)
        .eq('id', animalId)
        .select();

      if (error) {
        console.error('Erro ao atualizar animal:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log('Animal atualizado com sucesso');
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

      console.log('Verificando se o animal existe antes da exclusão...');
      const { data: existingAnimal, error: fetchError } = await query.single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.log('Animal não encontrado ou permissão negada:', animalId);
          return new Response(JSON.stringify({ error: 'Animal não encontrado ou sem permissão' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
          });
        }
        console.error('Erro ao buscar animal para exclusão:', fetchError);
        return new Response(JSON.stringify({ error: fetchError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // Delete animal
      console.log('Excluindo animal:', animalId);
      const { error } = await clientToUse
        .from('animals')
        .delete()
        .eq('id', animalId);

      if (error) {
        console.error('Erro ao excluir animal:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      console.log('Animal excluído com sucesso');
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Endpoint not found
    console.log('Endpoint não encontrado');
    return new Response(
      JSON.stringify({ 
        error: 'Recurso não encontrado',
        detail: 'O endpoint solicitado não existe' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    );
  } catch (err) {
    console.error('Erro inesperado:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno no servidor',
        detail: err instanceof Error ? err.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
