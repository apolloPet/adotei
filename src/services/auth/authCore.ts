
import { supabase, isSupabaseConfigured, handleSupabaseError } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';
import { createUser, updateUser, fetchUserById } from '../userService';
import type { User } from '@/components/admin/users/types';
import { UserProfile } from '@/types/user';

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

export const setUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    console.log(`Setting user ${userId} to role ${role}`);
    
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
};
