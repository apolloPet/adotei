
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

/**
 * Desloga o usuário atual
 */
export const signOut = async (): Promise<void> => {
  try {
    console.log('Attempting to sign out user');
    
    // Primeiro, armazenar uma cópia do estado atual para análise
    const previousState = {
      isLoggedIn: localStorage.getItem("isLoggedIn"),
      isAdmin: localStorage.getItem("isAdmin"),
      userEmail: localStorage.getItem("userEmail")
    };
    
    console.log('Estado antes do logout:', previousState);
    
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
    try {
      if (window.indexedDB && window.indexedDB.databases) {
        const databases = await window.indexedDB.databases();
        databases.forEach(db => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      }
    } catch (dbError) {
      console.warn('Erro ao limpar IndexedDB (não crítico):', dbError);
    }
    
    // Forçar a atualização do estado de autenticação em toda a aplicação
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Logs para debug
    console.log('User signed out successfully, localStorage and sessionStorage cleared');
    console.log('Estado após logout:', {
      isLoggedIn: localStorage.getItem("isLoggedIn"),
      isAdmin: localStorage.getItem("isAdmin"),
      userEmail: localStorage.getItem("userEmail")
    });
    
    // Adicionar um pequeno atraso para garantir que a limpeza de estado seja concluída
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success('Logout realizado com sucesso');
  } catch (error) {
    console.error('Unexpected error during signout:', error);
    toast.error('Erro inesperado ao fazer logout');
  }
};
