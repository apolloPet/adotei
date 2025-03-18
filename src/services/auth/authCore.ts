import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { AuthError } from '@supabase/supabase-js';

/**
 * Desloga o usuário atual
 */
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Signout error:', error);
      toast.error('Erro ao fazer logout');
    } else {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userEmail");
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChanged'));
      console.log('User signed out successfully');
    }
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
 * Envia um email de recuperação de senha
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password-confirm`,
    });
    if (error) {
      console.error('Password reset error:', error);
      toast.error('Erro ao solicitar a redefinição de senha');
    } else {
      toast.success('Email de redefinição de senha enviado!');
      console.log('Password reset email sent:', data);
    }
  } catch (error) {
    console.error('Unexpected error during password reset:', error);
    toast.error('Erro inesperado ao solicitar a redefinição de senha');
  }
};

/**
 * Atualiza a senha do usuário
 */
export const updatePassword = async (newPassword: string): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('Password update error:', error);
      toast.error('Erro ao atualizar a senha');
    } else {
      toast.success('Senha atualizada com sucesso!');
      console.log('Password updated successfully:', data);
    }
  } catch (error) {
    console.error('Unexpected error during password update:', error);
    toast.error('Erro inesperado ao atualizar a senha');
  }
};

/**
 * Realiza o login do usuário
 */
export const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Signin error:', error);
      if (error instanceof AuthError) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Credenciais inválidas');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Erro ao fazer login');
      }
      return false;
    }

    console.log('User signed in successfully:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error during signin:', error);
    toast.error('Erro inesperado ao fazer login');
    return false;
  }
};

/**
 * Realiza o cadastro do usuário
 */
export const signUp = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/email-confirmation`,
      },
    });

    if (error) {
      console.error('Signup error:', error);
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao criar a conta');
      }
      return false;
    }

    console.log('User signed up successfully:', data);
    toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
    return true;
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    toast.error('Erro inesperado ao criar a conta');
    return false;
  }
};

/**
 * Confirma o email do usuário
 */
export const confirmEmail = async (token: string, type: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token,
      type,
    });

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
 * Busca o perfil do usuário
 */
export const getProfile = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`username, full_name, avatar_url, website`)
      .eq('id', (await getCurrentUser()!)?.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      toast.error('Erro ao buscar o perfil');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error during profile fetch:', error);
    toast.error('Erro inesperado ao buscar o perfil');
    return null;
  }
};

/**
 * Atualiza o perfil do usuário
 */
export const updateProfile = async (updates: { username: string; full_name: string; avatar_url: string | null; website: string | null }) => {
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: (await getCurrentUser()!)?.id,
      updated_at: new Date(),
      ...updates,
    });

    if (error) {
      console.error('Profile update error:', error);
      toast.error('Erro ao atualizar o perfil');
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error during profile update:', error);
    toast.error('Erro inesperado ao atualizar o perfil');
    throw error;
  }
};

/**
 * Tenta fazer login com credenciais de administrador
 */
export const signInAdmin = async (email: string, password: string): Promise<boolean> => {
  try {
    // Verificar se é o admin de demonstração
    if (email === "admin@petmatch.com" && password === "admin123") {
      console.log("Demo admin login attempt");
      
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
      console.error('Signin error:', error);
      throw error;
    }
    
    // Verificar se é admin baseado no email
    const isAdmin = email.includes('@ong') || email.includes('@admin');
    
    if (isAdmin) {
      localStorage.setItem("isAdmin", "true");
      window.dispatchEvent(new Event('storage'));
      return true;
    } else {
      // Não é admin, fazer logout
      await supabase.auth.signOut();
      return false;
    }
  } catch (error) {
    console.error('Admin login error:', error);
    if (error instanceof AuthError) {
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
