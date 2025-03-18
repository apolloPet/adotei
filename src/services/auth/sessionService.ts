
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

/**
 * Creates a new session log entry
 */
export const createSessionLog = async (session: Session | null, eventType: string): Promise<void> => {
  try {
    if (!session) {
      console.warn('Tentativa de criar log de sessão com sessão nula');
      return;
    }
    
    // Log para debugging
    console.log(`Criando log de sessão: ${eventType}, sessionId: ${session?.id || 'N/A'}`);
    
    // Inserir log na tabela session_logs
    const { error } = await supabase
      .from('session_logs')
      .insert({
        user_id: session.user.id,
        session_id: session?.id, // Use optional chaining here
        event_type: eventType,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: null // IP deve ser capturado no backend por segurança
      });
      
    if (error) {
      console.error('Erro ao criar log de sessão:', error);
    }
  } catch (error) {
    console.error('Erro inesperado ao criar log de sessão:', error);
  }
};

/**
 * Recupera o histórico de sessões de um usuário
 */
export const getSessionHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('session_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error('Erro ao recuperar histórico de sessões:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro inesperado ao recuperar histórico de sessões:', error);
    return null;
  }
};

/**
 * Recupera a sessão atual
 */
export const getCurrentSessionInfo = async (session: Session | null) => {
  try {
    if (!session) {
      return null;
    }
    
    const { data, error } = await supabase
      .from('session_logs')
      .select('*')
      .eq('session_id', session?.id) // Use optional chaining here
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      console.error('Erro ao recuperar informações da sessão atual:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro inesperado ao recuperar informações da sessão:', error);
    return null;
  }
};
