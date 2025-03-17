import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { createUser } from './userService';
import { toast } from '@/hooks/use-sonner';
import type { User } from '@/components/admin/users/types';

export const signUp = async (
  email: string, 
  password: string, 
  userData: Omit<User, 'id' | 'registrationDate'>
): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');
    
    const user = await createUser(userData, data.user.id);
    
    if (!user) throw new Error('Failed to create user profile');
    
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
