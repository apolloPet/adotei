
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { createUser, updateUser, fetchUserById } from './userService';
import { toast } from '@/hooks/use-sonner';
import type { User } from '@/components/admin/users/types';
import { UserProfile, UserRole, UserSession } from '@/types/user';

// Type for signup data combining user and auth information
export interface SignupData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    cep: string;
  };
  housingType: 'apartment' | 'house' | 'other';
  hasChildren: boolean;
  childrenAges?: string;
  hadPetsBefore: boolean;
  hasAllergies: boolean;
  allergiesDescription?: string;
  workSchedule: string;
}

export const signUp = async (data: SignupData): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    // Register the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone
        },
        emailRedirectTo: `${window.location.origin}/auth/email-confirmation`
      }
    });
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Falha ao criar usuário');
    
    // Create user profile
    const userData: Omit<User, 'id' | 'registrationDate'> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: {
        street: data.address.street,
        number: data.address.number,
        neighborhood: data.address.neighborhood,
        city: data.address.city,
        cep: data.address.cep
      },
      housingType: data.housingType,
      hasChildren: data.hasChildren,
      childrenAges: data.childrenAges,
      hadPetsBefore: data.hadPetsBefore,
      hasAllergies: data.hasAllergies,
      allergiesDescription: data.allergiesDescription,
      workSchedule: data.workSchedule
    };
    
    const user = await createUser(userData, authData.user.id);
    
    if (!user) throw new Error('Falha ao criar perfil de usuário');
    
    // Set default role for new user
    await setUserRole(authData.user.id, 'user');
    
    toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
    
    return true;
  } catch (error: any) {
    console.error('Error signing up:', error);
    toast.error(`Erro ao criar conta: ${error.message}`);
    return false;
  }
};

export const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast.success('Login realizado com sucesso!');
    
    return true;
  } catch (error: any) {
    console.error('Error signing in:', error);
    toast.error(`Erro ao fazer login: ${error.message}`);
    return false;
  }
};

export const signOut = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userEmail");
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast.success('Logout realizado com sucesso!');
    
    return true;
  } catch (error: any) {
    console.error('Error signing out:', error);
    toast.error(`Erro ao fazer logout: ${error.message}`);
    return false;
  }
};

export const signInAdmin = async (email: string, password: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (!email.includes('@ong') && !email.includes('@admin')) {
      await signOut();
      throw new Error('Esta conta não tem permissão de administrador');
    }
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("userEmail", email);
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast.success('Login de administrador realizado com sucesso!');
    
    return true;
  } catch (error: any) {
    console.error('Error signing in as admin:', error);
    toast.error(`Erro ao fazer login como administrador: ${error.message}`);
    return false;
  }
};

export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password-confirm`,
    });
    
    if (error) throw error;
    
    toast.success('Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
    
    return true;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    toast.error(`Erro ao enviar email de recuperação: ${error.message}`);
    return false;
  }
};

export const updatePassword = async (newPassword: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    
    toast.success('Senha atualizada com sucesso!');
    
    return true;
  } catch (error: any) {
    console.error('Error updating password:', error);
    toast.error(`Erro ao atualizar senha: ${error.message}`);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return data.session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

export const getProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      avatarUrl: data.avatar_url,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
      housingType: data.housing_type,
      hasChildren: data.has_children,
      childrenAges: data.children_ages,
      hadPetsBefore: data.had_pets_before,
      hasAllergies: data.has_allergies,
      allergiesDescription: data.allergies_description,
      workSchedule: data.work_schedule
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateProfile = async (profile: Partial<UserProfile>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }
    
    const updates = {
      first_name: profile.firstName,
      last_name: profile.lastName,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      phone: profile.phone,
      avatar_url: profile.avatarUrl,
      housing_type: profile.housingType,
      has_children: profile.hasChildren,
      children_ages: profile.childrenAges,
      had_pets_before: profile.hadPetsBefore,
      has_allergies: profile.hasAllergies,
      allergies_description: profile.allergiesDescription,
      work_schedule: profile.workSchedule,
      updated_at: new Date().toISOString() // Convert Date to ISO string format
    };
    
    // Filter out undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
      
    if (error) throw error;
    
    // If name is changing, also update in the users table
    if (profile.firstName || profile.lastName) {
      // Get existing user data
      const userData = await fetchUserById(user.id);
      if (userData) {
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        if (fullName && fullName !== userData.name) {
          await updateUser(user.id, { name: fullName });
        }
      }
    }
    
    toast.success('Perfil atualizado com sucesso!');
    return true;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error(`Erro ao atualizar perfil: ${error.message}`);
    return false;
  }
};

// Novas funções para gerenciamento de verificação de e-mail
export const resendVerificationEmail = async (email: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/email-confirmation`,
      },
    });
    
    if (error) throw error;
    
    toast.success('Email de verificação reenviado com sucesso!');
    return true;
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    toast.error(`Erro ao reenviar email de verificação: ${error.message}`);
    return false;
  }
};

// Funções para gerenciamento de sessões
export const getUserSessions = async (): Promise<UserSession[]> => {
  try {
    // Na API atual do Supabase, não existe uma maneira direta de obter todas as sessões
    // Então, retornamos apenas a sessão atual formatada
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return [];
    
    const userAgent = navigator.userAgent;
    const browserInfo = detectBrowser(userAgent);
    
    return [{
      id: session.access_token,
      device: detectDevice(userAgent),
      browser: browserInfo,
      ip: 'Não disponível', // Supabase não fornece o IP
      lastActive: new Date().toISOString(),
      createdAt: session.created_at || new Date().toISOString()
    }];
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

export const terminateSession = async (sessionId: string): Promise<boolean> => {
  try {
    // Na API atual, apenas podemos encerrar a sessão atual
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

// Funções para gerenciamento de roles e permissões
export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    return data?.role as UserRole || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const setUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    // Primeiro verifica se já existe um role para o usuário
    const { data, error: fetchError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (fetchError) throw fetchError;
    
    if (data && data.length > 0) {
      // Atualiza o role existente
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
    } else {
      // Cria um novo role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
};

export const hasPermission = async (permission: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const role = await getUserRole(user.id);
    
    // Mapeamento simples de permissões baseado nos roles
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

// Funções de suporte
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
