
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { AuthError } from '@supabase/supabase-js';
import { SignupData } from './types';

/**
 * Desloga o usuário atual
 */
export const signOut = async (): Promise<void> => {
  try {
    console.log('Attempting to sign out user');
    
    // Primeiro, fazer o signOut do Supabase (antes de limpar localStorage)
    // para garantir que todos os tokens sejam invalidados no servidor
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Signout error:', error);
      toast.error('Erro ao fazer logout');
      return;
    }
    
    console.log('Supabase sign out completed, now clearing local storage');
    
    // Limpar completamente o localStorage após o signOut
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    
    // Remover qualquer sessão do Supabase que possa estar armazenada localmente
    localStorage.removeItem("supabase.auth.token");
    
    // Limpar sessões ou dados adicionais que possam persistir
    sessionStorage.clear(); // Limpar todo o sessionStorage também
    
    // Para browsers mais recentes, também pode-se usar
    if (window.indexedDB) {
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      });
    }
    
    // Forçar a atualização do estado de autenticação em toda a aplicação
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Logs para debug
    console.log('User signed out successfully, localStorage and sessionStorage cleared');
    
    // Adicionar um pequeno atraso para garantir que a limpeza de estado seja concluída
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success('Logout realizado com sucesso');
  } catch (error) {
    console.error('Unexpected error during signout:', error);
    toast.error('Erro inesperado ao fazer logout');
  }
};

/**
 * Recupera a sessão atual do usuário
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Unexpected error getting session:', error);
    return null;
  }
};

/**
 * Recupera o usuário atual
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return data.user;
  } catch (error) {
    console.error('Unexpected error getting user:', error);
    return null;
  }
};

/**
 * Realiza o login do usuário
 */
export const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log('Iniciando login com:', { email });
    
    // Performance: remover limpeza de localStorage antes da tentativa de login
    // para evitar operações desnecessárias se o login falhar
    
    // Validação básica de entrada
    if (!email || !password) {
      console.error('Email ou senha não fornecidos');
      toast.error('Email e senha são obrigatórios');
      return false;
    }
    
    // Tenta fazer login através do Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Tratamento de erros
    if (error) {
      console.error('Erro de autenticação:', error);
      if (error instanceof AuthError) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciais inválidas. Verifique seu email e senha.');
        } else {
          toast.error(`Erro de autenticação: ${error.message}`);
        }
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
      return false;
    }

    if (!data.session) {
      console.error('Nenhuma sessão retornada após o login');
      toast.error('Erro ao iniciar sessão. Tente novamente.');
      return false;
    }

    console.log('Usuário autenticado com sucesso:', { 
      userId: data.user?.id,
      email: data.user?.email,
      hasSession: !!data.session
    });
    
    // Performance: atualizar o localStorage apenas após confirmar autenticação bem-sucedida
    localStorage.setItem("isLoggedIn", "true");
    if (email.includes('@admin') || email.includes('@ong')) {
      localStorage.setItem("isAdmin", "true");
    } else {
      localStorage.setItem("isAdmin", "false");
    }
    localStorage.setItem("userEmail", email);
    
    // Dispara apenas um evento para atualizar a UI (reduzido de dois para um)
    window.dispatchEvent(new Event('authStateChanged'));
    
    return true;
  } catch (error) {
    console.error('Erro inesperado durante o login:', error);
    toast.error('Erro inesperado ao fazer login. Tente novamente.');
    return false;
  }
};

/**
 * Realiza o cadastro do usuário
 */
export const signUp = async (userData: SignupData): Promise<boolean> => {
  try {
    console.log('Tentando registrar usuário:', { email: userData.email });
    
    // Validação básica dos dados
    if (!userData.email || !userData.password || !userData.name) {
      toast.error('Dados incompletos para cadastro');
      return false;
    }
    
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/email-confirmation`,
        data: {
          name: userData.name,
          phone: userData.phone,
          // Adicionar outros metadados necessários
        }
      },
    });

    // Log detalhado do resultado do cadastro
    console.log('Resposta do Supabase para signUp:', { 
      user: data.user ? 'Usuário criado' : 'Nenhum usuário criado',
      session: data.session ? 'Sessão criada' : 'Nenhuma sessão',
      error: error || 'Nenhum erro' 
    });

    if (error) {
      console.error('Erro no cadastro:', error);
      if (error instanceof AuthError) {
        if (error.message.includes('User already registered')) {
          toast.error('Este email já está registrado. Por favor, faça login ou redefina sua senha.');
        } else {
          toast.error(`Erro no cadastro: ${error.message}`);
        }
      } else {
        toast.error('Erro ao criar a conta. Tente novamente.');
      }
      return false;
    }

    if (!data.user) {
      console.error('Nenhum usuário retornado após o cadastro');
      toast.error('Erro ao criar usuário. Tente novamente.');
      return false;
    }

    console.log('Usuário cadastrado com sucesso:', { 
      userId: data.user.id,
      email: data.user.email,
      hasSession: !!data.session
    });
    
    // Verificar se o e-mail de confirmação está habilitado
    if (data.session) {
      // E-mail de confirmação desabilitado, o usuário está automaticamente logado
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "false");
      localStorage.setItem("userEmail", userData.email);
      
      // Dispare eventos para atualizar a UI
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChanged'));
      
      toast.success('Conta criada com sucesso! Você está logado.');
    } else {
      // E-mail de confirmação habilitado
      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
    }
    
    // Criar perfil do usuário
    if (data.user) {
      try {
        // Obter a sessão atual para utilizar com a Edge Function
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          console.log('Criando perfil de usuário via Edge Function...');
          
          // Preparar os dados do perfil
          const profileData = {
            name: userData.name,
            phone: userData.phone || '',
            address: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            zip: userData.address?.cep || '',
            housing_type: userData.housingType || 'house',
            has_children: userData.hasChildren || false,
            children_ages: userData.childrenAges || '',
            had_pets_before: userData.hadPetsBefore || false,
            has_allergies: userData.hasAllergies || false,
            allergies_description: userData.allergiesDescription || '',
            work_schedule: userData.workSchedule || '',
            operation: 'create-profile' // Adicionando a operação no body
          };
          
          console.log('Enviando dados para edge function:', {
            accessToken: `${sessionData.session.access_token.substring(0, 10)}...`,
            profileData
          });
          
          // Usando a forma correta de invocar a edge function com headers explícitos de autorização
          const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('user-profile', {
            method: 'POST',
            body: JSON.stringify(profileData),
            headers: {
              Authorization: `Bearer ${sessionData.session.access_token}`,
              'Content-Type': 'application/json',
            }
          });
          
          if (edgeFunctionError) {
            console.error('Erro ao criar perfil via Edge Function:', edgeFunctionError);
            // Tentar alternativa com endpoint padronizado para casos de erro
            try {
              const { data: fallbackData, error: fallbackError } = await supabase
                .from('users')
                .insert({
                  auth_id: data.user.id,
                  email: data.user.email,
                  name: userData.name,
                  phone: userData.phone || '',
                  address: userData.address?.street || '',
                  city: userData.address?.city || '',
                  state: userData.address?.state || '',
                  zip: userData.address?.cep || '',
                  housing_type: userData.housingType || 'house',
                  has_children: userData.hasChildren || false,
                  children_ages: userData.childrenAges || '',
                  had_pets_before: userData.hadPetsBefore || false,
                  has_allergies: userData.hasAllergies || false,
                  allergies_description: userData.allergiesDescription || '',
                  work_schedule: userData.workSchedule || ''
                })
                .select()
                .single();
                
              if (fallbackError) {
                console.error('Fallback também falhou:', fallbackError);
              } else {
                console.log('Perfil criado com sucesso via fallback method');
              }
            } catch (fallbackException) {
              console.error('Exceção no fallback:', fallbackException);
            }
          } else {
            console.log('Perfil criado com sucesso via Edge Function:', edgeFunctionData);
          }
        } else {
          console.error('Não foi possível obter a sessão para criar o perfil');
        }
      } catch (profileError) {
        console.error('Erro inesperado ao criar perfil:', profileError);
        // Não interromper o fluxo, apenas logar o erro
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro inesperado durante o cadastro:', error);
    toast.error('Erro inesperado ao criar a conta. Tente novamente.');
    return false;
  }
};

/**
 * Confirma o email do usuário
 */
export const confirmEmail = async (token: string, type: 'signup' | 'recovery' = 'signup'): Promise<boolean> => {
  try {
    let result;
    
    // Handle different types of verification
    if (type === 'signup') {
      result = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'signup',
      });
    } else if (type === 'recovery') {
      result = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });
    } else {
      throw new Error('Invalid verification type');
    }

    const { data, error } = result;

    if (error) {
      console.error('Email confirmation error:', error);
      toast.error('Erro ao confirmar o email');
      return false;
    }

    console.log('Email confirmed successfully:', data);
    toast.success('Email confirmado com sucesso!');
    return true;
  } catch (error) {
    console.error('Unexpected error during email confirmation:', error);
    toast.error('Erro inesperado ao confirmar o email');
    return false;
  }
};

/**
 * Tenta fazer login com credenciais de administrador
 */
export const signInAdmin = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log("Tentativa de login administrativo:", { email });
    
    // Verificar se é o admin de demonstração
    if (email === "admin@petmatch.com" && password === "admin123") {
      console.log("Demo admin login successful");
      
      // Definir no localStorage primeiro (redundância importante)
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("userEmail", email);
      
      // Trigger auth state change events
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChanged'));
      
      return true;
    }
    
    // Login normal via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Admin signin error:', error);
      throw error;
    }
    
    // Verificar se é admin baseado no email
    const isAdmin = email.includes('@ong') || email.includes('@admin') || email === 'admin@petmatch.com';
    
    if (isAdmin) {
      console.log("Login de administrador baseado no email bem-sucedido");
      
      // Definir flags e disparar eventos
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("userEmail", email);
      
      // Tentar atualizar metadados do usuário
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { isAdmin: true, role: 'admin' }
        });
        
        if (updateError) {
          console.warn("Não foi possível atualizar metadados do usuário", updateError);
        } else {
          console.log("Metadados de admin atualizados com sucesso");
        }
      } catch (metadataError) {
        console.warn("Erro ao atualizar metadados", metadataError);
      }
      
      // Disparar eventos de mudança de estado
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChanged'));
      
      return true;
    } else {
      // Não é admin, fazer logout
      await supabase.auth.signOut();
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userEmail");
      
      toast.error('Este usuário não tem permissão de administrador');
      return false;
    }
  } catch (error) {
    console.error('Admin login error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Credenciais inválidas');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.error('Erro ao fazer login como administrador');
    }
    return false;
  }
};

// Add functions for setting user roles if needed
export const setUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    // Implementation goes here
    console.log('Setting user role:', { userId, role });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    toast.error('Erro ao definir função do usuário');
    return false;
  }
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    // Implementation goes here
    console.log('Getting user role for:', userId);
    return 'user'; // Placeholder
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};
