
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  lastActive: string;
  createdAt: string;
  isCurrentSession?: boolean;
}

/**
 * Get all active sessions for the current user
 */
export const getUserSessions = async (): Promise<UserSession[]> => {
  try {
    // In a real implementation, this would fetch active sessions from Supabase
    // Since Supabase doesn't have a direct API for listing all sessions,
    // this is a placeholder implementation
    
    // Get current session for comparison
    const { data } = await supabase.auth.getSession();
    const currentSession = data.session;
    
    // For demo purposes, return a mock session list with the current session
    const mockSessions: UserSession[] = [
      {
        id: currentSession?.id || 'current-session', // Fixed: properly accessing session.id
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 
                navigator.userAgent.includes('Mac') ? 'MacOS' : 
                navigator.userAgent.includes('Windows') ? 'Windows PC' : 'Desktop Device',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                 navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown Browser',
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        isCurrentSession: true
      }
    ];
    
    return mockSessions;
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    toast.error('Não foi possível carregar as sessões');
    return [];
  }
};

/**
 * Terminate a specific session
 */
export const terminateSession = async (sessionId: string): Promise<boolean> => {
  try {
    // Check if this is the current session
    const { data } = await supabase.auth.getSession();
    const currentSession = data.session;
    
    if (currentSession?.id === sessionId) { // Fixed: properly accessing session.id
      // Sign out current session
      await supabase.auth.signOut();
      return true;
    } else {
      // For demo purposes, we'll just pretend we can terminate other sessions
      // In a real implementation, you would need a backend function to terminate other sessions
      console.log('Terminating session:', sessionId);
      toast.success('Sessão encerrada com sucesso');
      return true;
    }
  } catch (error) {
    console.error('Error terminating session:', error);
    toast.error('Não foi possível encerrar a sessão');
    return false;
  }
};
