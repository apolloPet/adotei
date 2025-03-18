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
    
    // Limpar completamente o localStorage antes do signOut para evitar problemas de estado
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    
    // Fazer o signOut do Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Signout error:', error);
      toast.error('Erro ao fazer logout');
      return;
    }
    
    // Forçar a atualização do estado de autenticação em toda a aplicação
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Logs para debug
    console.log('User signed out successfully, localStorage cleared');
    
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
    console.log('Tentando fazer login com:', { email });
    
    // Clear any previous login state to ensure a fresh login attempt
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    
    // Log debug info antes da tentativa de login
    console.log('Estado do localStorage antes do login:', {
      isLoggedIn: localStorage.getItem("isLoggedIn"),
      isAdmin: localStorage.getItem("isAdmin"),
      userEmail: localStorage.getItem("userEmail")
    });
    
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

    // Log detalhado do resultado do login
    console.log('Resposta do Supabase:', { data: data ? 'Dados recebidos' : 'Nenhum dado', error: error || 'Nenhum erro' });

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
    
    // Atualiza o localStorage manualmente para garantir que os eventos de mudança de estado sejam disparados
    localStorage.setItem("isLoggedIn", "true");
    if (email.includes('@admin') || email.includes('@ong')) {
      localStorage.setItem("isAdmin", "true");
    } else {
      localStorage.setItem("isAdmin", "false");
    }
    localStorage.setItem("userEmail", email);
    
    // Dispara eventos para atualizar a UI
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast.success('Login realizado com sucesso!');
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
          // Add other user metadata as needed
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
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            first_name: userData.name.split(' ')[0],
            last_name: userData.name.split(' ').slice(1).join(' '),
            phone: userData.phone,
            address: userData.address?.street,
            city: userData.address?.city,
            state: userData.address?.state || '', 
            zip: userData.address?.cep,
            housing_type: userData.housingType,
            has_children: userData.hasChildren,
            children_ages: userData.childrenAges,
            had_pets_before: userData.hadPetsBefore,
            has_allergies: userData.hasAllergies,
            allergies_description: userData.allergiesDescription,
            work_schedule: userData.workSchedule
          });
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      } catch (profileError) {
        console.error('Unexpected error creating profile:', profileError);
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
    // Verificar se é o admin de demonstração
    if (email === "admin@petmatch.com" && password === "admin123") {
      console.log("Demo admin login successful");
      
      // Tenta fazer login via Supabase também
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.warn("Supabase login failed, falling back to localStorage", error);
        } else {
          console.log("Successfully authenticated with Supabase as admin");
        }
      } catch (supabaseError) {
        console.warn("Supabase auth error, using localStorage fallback", supabaseError);
      }
      
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
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("userEmail", email);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChanged'));
      return true;
    } else {
      // Não é admin, fazer logout
      await supabase.auth.signOut();
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
