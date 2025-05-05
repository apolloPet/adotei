
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-sonner';

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
    
    const sessionId = session.access_token || session.refresh_token;
    if (!sessionId) {
      console.warn('Sessão sem tokens válidos');
      return;
    }
    
    const userAgent = navigator.userAgent;
    const deviceInfo = {
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    // Chamar a edge function para registrar o log de sessão
    const { error } = await supabase.functions.invoke('session-management', {
      body: {
        method: 'createSessionLog',
        sessionId,
        eventType,
        userAgent,
        deviceInfo
      }
    });
    
    if (error) {
      console.error('Erro ao criar log de sessão:', error);
    }
  } catch (error) {
    console.error('Erro inesperado ao criar log de sessão:', error);
  }
};

/**
 * Recupera o histórico de sessões do usuário
 */
export const getSessionHistory = async (userId: string): Promise<UserSession[]> => {
  try {
    console.log('Buscando histórico de sessão para userId:', userId);
    
    // Chamar a edge function para buscar histórico de sessões
    const { data, error } = await supabase.functions.invoke('session-management', {
      body: {
        method: 'getUserSessions'
      }
    });
    
    if (error) {
      throw error;
    }
    
    if (!data || !Array.isArray(data)) {
      return [];
    }
    
    const currentSession = await getCurrentSession();
    const currentSessionId = currentSession?.access_token || '';
    
    // Mapear os dados retornados para o formato UserSession
    return data.map(session => {
      const deviceInfo = session.device_info || {};
      const isCurrentSession = session.session_id === currentSessionId;
      
      return {
        id: session.session_id,
        device: getBrowserDevice(session.user_agent),
        browser: getBrowserInfo(session.user_agent),
        lastActive: session.timestamp,
        createdAt: session.created_at,
        isCurrentSession
      };
    });
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
      browser: getBrowserInfo(navigator.userAgent),
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
 * Get user sessions
 */
export const getUserSessions = async (): Promise<UserSession[]> => {
  const session = await getCurrentSession();
  if (!session) return [];
  
  return getSessionHistory(session.user.id);
};

/**
 * Extract browser info from user agent
 */
const getBrowserInfo = (ua: string): string => {
  if (!ua) return 'Desconhecido';
  
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
  return 'Desconhecido';
};

/**
 * Extract device info from user agent
 */
const getBrowserDevice = (ua: string): string => {
  if (!ua) return 'Desconhecido';
  
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Windows Phone')) return 'Windows Phone';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'Mac OS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Desconhecido';
};

/**
 * Terminate a session
 */
export const terminateSession = async (sessionId: string): Promise<boolean> => {
  try {
    const currentSession = await getCurrentSession();
    
    // Se for a sessão atual, faça logout
    if (currentSession && currentSession.access_token === sessionId) {
      // Registrar o encerramento da sessão antes do logout
      try {
        await supabase.functions.invoke('session-management', {
          body: {
            method: 'terminateSession',
            sessionId
          }
        });
      } catch (error) {
        console.error('Erro ao registrar encerramento de sessão:', error);
      }
      
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
    
    // Para sessões que não são a atual, chamar a edge function
    const { error } = await supabase.functions.invoke('session-management', {
      body: {
        method: 'terminateSession',
        sessionId
      }
    });
    
    if (error) {
      console.error('Erro ao encerrar sessão:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    return false;
  }
};
