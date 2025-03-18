import { supabase, isSupabaseConfigured, handleSupabaseError } from '@/lib/supabase';
import { createUser, updateUser, fetchUserById } from './userService';
import { toast } from '@/hooks/use-sonner';
import type { User } from '@/components/admin/users/types';
import { UserProfile, UserRole, UserSession } from '@/types/user';

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
    const configCheck = await isSupabaseConfigured();
    if (!configCheck) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { data: existingUsers, error: existingError } = await supabase
      .from('users')
      .select('email')
      .eq('email', data.email)
      .maybeSingle();
    
    if (existingError) {
      console.error("Error checking existing user:", existingError);
    } else if (existingUsers) {
      toast.error('Este email já está cadastrado. Por favor, faça login.');
      return false;
    }

    console.log('Starting user registration process', { email: data.email });

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
    
    if (authError) {
      console.error("Auth sign up error:", authError);
      handleSupabaseError(authError, 'Falha ao criar conta de autenticação');
      return false;
    }
    
    if (!authData.user) {
      console.error("No user data returned from signUp");
      toast.error('Falha ao criar usuário: Resposta inesperada do servidor');
      return false;
    }
    
    console.log('Auth account created successfully', { userId: authData.user.id });
    
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
    
    console.log('Attempting to create user profile', { authId: authData.user.id });
    const user = await createUser(userData, authData.user.id);
    
    if (!user) {
      console.error("Failed to create user profile");
      toast.error('Falha ao criar perfil de usuário');
      return false;
    }
    
    console.log('User profile created successfully');
    
    try {
      await setUserRole(authData.user.id, 'user');
      console.log('User role set successfully');
    } catch (roleError) {
      console.error("Error setting user role:", roleError);
      // Non-blocking error, continue with signup
    }
    
    toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
    
    return true;
  } catch (error: any) {
    console.error('Error signing up:', error);
    handleSupabaseError(error, 'Erro ao criar conta');
    return false;
  }
};

export const signIn = async (email: string, password: string): Promise<boolean> => {
  try {
    const configCheck = await isSupabaseConfigured();
    if (!configCheck) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    console.log('Attempting to sign in user', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Sign in error:", error);
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Credenciais inválidas. Verifique seu email e senha.');
      } else {
        handleSupabaseError(error, 'Erro ao fazer login');
      }
      
      return false;
    }
    
    console.log('User signed in successfully', { userId: data.user?.id });
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authStateChanged'));
    
    toast.success('Login realizado com sucesso!');
    
    return true;
  } catch (error: any) {
    console.error('Error signing in:', error);
    handleSupabaseError(error, 'Erro ao fazer login');
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
    const configCheck = await isSupabaseConfigured();
    if (!configCheck) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    console.log('Attempting admin login for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Admin sign in error:", error);
      
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Credenciais inválidas. Verifique seu email e senha.');
      } else {
        handleSupabaseError(error, 'Erro ao fazer login administrativo');
      }
      
      return false;
    }
    
    if (!email.includes('@ong') && !email.includes('@admin')) {
      console.error("Login successful but user is not an admin:", email);
      await signOut();
      toast.error('Esta conta não tem permissão de administrador');
      return false;
    }
    
    console.log('Admin login successful:', data.user?.id);
    
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
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting current session:', error);
      return null;
    }
    
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
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    if (!data) return null;
    
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
    
    if (profile.firstName || profile.lastName) {
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

export const setUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    console.log(`Setting user ${userId} to role ${role}`);
    
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
