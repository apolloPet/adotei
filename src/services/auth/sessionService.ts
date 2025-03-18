
import { supabase } from '@/lib/supabase';
import { UserRole, UserSession } from '@/types/user';
import { toast } from '@/hooks/use-sonner';

export const getUserSessions = async (): Promise<UserSession[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return [];
    
    const userAgent = navigator.userAgent;
    const browserInfo = detectBrowser(userAgent);
    
    return [{
      id: session.access_token,
      device: detectDevice(userAgent),
      browser: browserInfo,
      ip: 'Não disponível',
      lastActive: new Date().toISOString(),
      createdAt: session.expires_at 
        ? new Date(Date.now() - (session.expires_at - Math.floor(Date.now() / 1000)) * 1000).toISOString() 
        : new Date().toISOString()
    }];
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

export const terminateSession = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    toast.success('Sessão encerrada com sucesso!');
    window.location.href = '/login';
    return true;
  } catch (error: any) {
    console.error('Error terminating session:', error);
    toast.error(`Erro ao encerrar sessão: ${error.message}`);
    return false;
  }
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const userEmail = user.email || '';
    
    if (userEmail.includes('@admin') || userEmail.includes('@ong')) {
      return 'admin';
    } else if (userEmail.includes('@moderator')) {
      return 'moderator';
    } else if (userEmail.includes('@staff')) {
      return 'staff';
    } else {
      return 'user';
    }
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const hasPermission = async (permission: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const role = await getUserRole(user.id);
    
    const rolePermissions: Record<UserRole, string[]> = {
      admin: ['manage_users', 'manage_pets', 'approve_adoptions', 'manage_settings', 'manage_admins'],
      moderator: ['manage_pets', 'approve_adoptions'],
      staff: ['manage_pets'],
      user: ['view_pets', 'apply_adoption']
    };
    
    if (!role || !rolePermissions[role]) return false;
    
    return rolePermissions[role].includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Funções auxiliares
function detectDevice(userAgent: string): string {
  if (/iPad|iPhone|iPod/.test(userAgent)) return 'iOS';
  if (/Android/.test(userAgent)) return 'Android';
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Mac/.test(userAgent)) return 'Mac';
  if (/Linux/.test(userAgent)) return 'Linux';
  return 'Desconhecido';
}

function detectBrowser(userAgent: string): string {
  if (/Chrome/.test(userAgent) && !/Chromium|Edge|OPR/.test(userAgent)) return 'Chrome';
  if (/Firefox/.test(userAgent)) return 'Firefox';
  if (/Safari/.test(userAgent) && !/Chrome|Chromium|Edge|OPR/.test(userAgent)) return 'Safari';
  if (/Edge/.test(userAgent)) return 'Edge';
  if (/OPR/.test(userAgent)) return 'Opera';
  return 'Desconhecido';
}
