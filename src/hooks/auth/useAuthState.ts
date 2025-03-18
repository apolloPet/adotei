
import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getCurrentSession } from '@/services/auth';
import { getProfile } from '@/services/auth/profileService';

export function useAuthState() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      console.log('Verificando estado de autenticação atual...');
      
      // Verificar diretamente com o Supabase para obter o estado mais atualizado
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão do Supabase:', sessionError);
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
        
        // Limpar localStorage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("userEmail");
        
        return;
      }
      
      const currentSession = sessionData.session;
      setSession(currentSession);
      
      if (currentSession) {
        // Obter dados do usuário
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Erro ao obter usuário do Supabase:', userError);
          setUser(null);
          setIsAuthenticated(false);
        } else {
          const currentUser = userData.user;
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Verificar se é admin pelo email
          if (currentUser?.email) {
            const isAdminUser = currentUser.email.includes('@admin') || 
                            currentUser.email.includes('@ong') || 
                            currentUser.email === 'admin@petmatch.com';
            
            console.log('Verificação de perfil do usuário:', { 
              email: currentUser.email, 
              isAdmin: isAdminUser 
            });
            
            setIsAdmin(isAdminUser);
            
            // Atualizar localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isAdmin", isAdminUser.toString());
            localStorage.setItem("userEmail", currentUser.email);
          } else {
            setIsAdmin(false);
          }
          
          // Obter perfil do usuário
          try {
            const userProfile = await getProfile();
            if (userProfile) {
              setProfile(userProfile);
            }
          } catch (profileError) {
            console.error('Erro ao obter perfil do usuário:', profileError);
          }
        }
      } else {
        console.log('Nenhuma sessão ativa encontrada');
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
        
        // Limpar localStorage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("userEmail");
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      
      // Limpar localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userEmail");
    } finally {
      setIsLoading(false);
      console.log('Verificação de autenticação concluída');
    }
  };

  return {
    user,
    setUser,
    session,
    setSession,
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    isAdmin,
    setIsAdmin,
    isAuthenticated,
    setIsAuthenticated,
    fetchUserData
  };
}
