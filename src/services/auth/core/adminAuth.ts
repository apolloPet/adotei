
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

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
      
      // Importante: garantir que os eventos sejam disparados de forma assíncrona
      // para evitar problemas de concorrência
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('authStateChanged'));
      }, 50);
      
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
    console.log('Getting user role for:', userId);
    return 'user'; // Placeholder
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};
