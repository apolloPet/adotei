
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

/**
 * Interface for session information displayed to the user
 */
export interface UserSession {
  id: string;
  device: string;
  browser: string;
  lastActive: string;
  createdAt: string;
  isCurrentSession: boolean;
}

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
    console.log(`Criando log de sessão: ${eventType}, sessionId: ${session.access_token ? session.access_token.slice(0, 8) + '...' : 'N/A'}`);
    
    // Como a tabela session_logs não existe no esquema, este código foi comentado
    // Este é um placeholder para implementação futura
    console.log('Função createSessionLog foi chamada, mas a tabela session_logs não está disponível.');
    
    // Código original comentado para evitar erros de TS:
    /*
    const { error } = await supabase
      .from('session_logs')
      .insert({
        user_id: session.user.id,
        session_id: session.access_token,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: null // IP deve ser capturado no backend por segurança
      });
      
    if (error) {
      console.error('Erro ao criar log de sessão:', error);
    }
    */
  } catch (error) {
    console.error('Erro inesperado ao criar log de sessão:', error);
  }
};

/**
 * Mock function to get session history until we implement session_logs table
 */
export const getSessionHistory = async (userId: string): Promise<UserSession[]> => {
  try {
    console.log('Buscando histórico de sessão para userId:', userId);
    
    // Retornando dados fictícios como placeholder até que a tabela real exista
    const currentSession = await getCurrentSession();
    
    const mockSessions: UserSession[] = [
      {
        id: currentSession?.access_token || 'current-session',
        device: 'Seu dispositivo atual',
        browser: navigator.userAgent.split(' ').slice(-1)[0],
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        isCurrentSession: true
      }
    ];
    
    return mockSessions;
  } catch (error) {
    console.error('Erro ao recuperar histórico de sessões:', error);
    return [];
  }
};

/**
 * Recupera a sessão atual
 */
export const getCurrentSessionInfo = async (session: Session | null): Promise<UserSession | null> => {
  try {
    if (!session) {
      return null;
    }
    
    // Retorna informações básicas da sessão atual
    return {
      id: session.access_token || 'unknown',
      device: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvel' : 'Computador',
      browser: getBrowserInfo(),
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isCurrentSession: true
    };
  } catch (error) {
    console.error('Erro inesperado ao recuperar informações da sessão:', error);
    return null;
  }
};

/**
 * Get current session from supabase
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

/**
 * Mock function to get user sessions
 */
export const getUserSessions = async (): Promise<UserSession[]> => {
  const session = await getCurrentSession();
  if (!session) return [];
  
  // Criar algumas sessões fictícias para exibição, até implementarmos a tabela real
  const currentSession: UserSession = {
    id: session.access_token || 'current-session',
    device: navigator.userAgent.includes('Mobile') ? 'Dispositivo Móvel' : 'Computador',
    browser: getBrowserInfo(),
    lastActive: new Date().toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutos atrás
    isCurrentSession: true
  };
  
  // Sessões adicionais fictícias
  const olderSessions: UserSession[] = [
    {
      id: 'past-session-1',
      device: 'iPhone',
      browser: 'Safari Mobile',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 dias atrás
      isCurrentSession: false
    },
    {
      id: 'past-session-2',
      device: 'Windows PC',
      browser: 'Chrome',
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 dias atrás
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 dias atrás
      isCurrentSession: false
    }
  ];
  
  return [currentSession, ...olderSessions];
};

/**
 * Extract browser info from user agent
 */
const getBrowserInfo = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
  return 'Desconhecido';
};

/**
 * Mock function to terminate a session
 */
export const terminateSession = async (sessionId: string): Promise<boolean> => {
  try {
    const currentSession = await getCurrentSession();
    
    // Se for a sessão atual, faça logout
    if (currentSession && (currentSession.access_token === sessionId || sessionId === 'current-session')) {
      // Fazer logout com escopo global para remover todas as sessões do usuário
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Erro ao fazer logout:', error);
        return false;
      }
      
      // Limpar dados da sessão no localStorage e sessionStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("supabase.auth.token");
      sessionStorage.clear();
      
      // Limpar cookies relacionados à autenticação se existirem
      document.cookie.split(";").forEach(cookie => {
        const [name] = cookie.trim().split("=");
        if (name.includes("supabase") || name.includes("auth") || name.includes("session")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      // Disparar eventos para atualizar a UI
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChanged'));
      
      return true;
    }
    
    // Para sessões fictícias, apenas simular sucesso
    if (sessionId === 'past-session-1' || sessionId === 'past-session-2') {
      return true;
    }
    
    console.log('Sessão não encontrada para encerrar:', sessionId);
    return false;
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    return false;
  }
};
