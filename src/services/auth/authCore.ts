
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { AuthError } from '@supabase/supabase-js';
import { SignupData } from './types';
import { createProfile as createProfileService } from './profileService';

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
export const signUp = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Attempting to sign up user:", userData.email);
    
    // 1. Create auth user
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: window.location.origin + '/email-confirmation',
        data: {
          name: userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.name || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
        }
      }
    });

    if (signupError) {
      console.error("Signup error:", signupError);
      return { 
        success: false, 
        error: signupError.message 
      };
    }

    if (!authData.user) {
      console.error("No user returned from signup");
      return { 
        success: false, 
        error: "Falha no registro. Tente novamente." 
      };
    }
    
    console.log("Auth user created successfully:", authData.user.id);
    
    // 2. Create user profile via edge function to bypass RLS
    try {
      const profileData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email,
        phone: userData.phone || '',
        address: userData.address?.street || '',
        city: userData.address?.city || '',
        state: userData.address?.state || '',
        zip: userData.address?.cep || '',
        housingType: userData.housingType || 'house',
        hasChildren: userData.hasChildren || false,
        childrenAges: userData.childrenAges || '',
        hadPetsBefore: userData.hadPetsBefore || false,
        hasAllergies: userData.hasAllergies || false,
        allergiesDescription: userData.allergiesDescription || '',
        workSchedule: userData.workSchedule || ''
      };
      
      // Create profile using the imported createProfileService
      const profileCreated = await createProfileService(profileData);
      
      if (!profileCreated) {
        console.error("Error creating user profile");
        // Continue with signup even if profile creation fails - can be fixed later
      } else {
        console.log("Profile created successfully");
      }
    } catch (profileCreationError) {
      console.error("Exception in profile creation:", profileCreationError);
      // Continue with signup even if profile creation fails
    }

    console.log("User signup completed successfully");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error during signup:", error);
    return { 
      success: false, 
      error: "Ocorreu um erro inesperado durante o cadastro. Por favor, tente novamente." 
    };
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
