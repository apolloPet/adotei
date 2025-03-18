
import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getCurrentSession } from '@/services/auth';
import { getProfile } from '@/services/auth/profileService';
import { getUserRole } from '@/services/auth/authCore';

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
      
      // Verificar localStorage primeiro para compatibilidade com login de demonstração
      const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
      const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      // Performance: verificar diretamente a sessão do Supabase para evitar chamadas extras
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão do Supabase:', sessionError);
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(localStorageAdmin); // Manter status de admin do localStorage mesmo em caso de erro
        setIsAuthenticated(localStorageLoggedIn); // Usar flag do localStorage
        return;
      }
      
      const currentSession = sessionData.session;
      setSession(currentSession);
      
      if (currentSession) {
        // Performance: fazer apenas uma chamada para obter o usuário
        const userData = currentSession.user;
        setUser(userData);
        setIsAuthenticated(true);
        
        // Verificar se é admin
        if (userData?.email) {
          // Verificação por email (critério primário)
          const isAdminByEmail = 
            userData.email.includes('@admin') || 
            userData.email.includes('@ong') || 
            userData.email === 'admin@petmatch.com';
          
          // Verificação por metadados (critério secundário)
          const isAdminByMetadata = 
            userData.app_metadata?.role === 'admin' || 
            userData.user_metadata?.isAdmin === true;
          
          // Verificação pelo localStorage (para compatibilidade com login de demonstração)
          const finalAdminStatus = isAdminByEmail || isAdminByMetadata || localStorageAdmin;
          
          console.log('Verificação de perfil:', { 
            email: userData.email, 
            isAdminByEmail,
            isAdminByMetadata,
            localStorageAdmin,
            finalStatus: finalAdminStatus
          });
          
          setIsAdmin(finalAdminStatus);
          
          // Atualizar localStorage
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("isAdmin", finalAdminStatus.toString());
          localStorage.setItem("userEmail", userData.email);
        } else if (localStorageAdmin) {
          // Se não temos email mas temos flag de admin no localStorage, manter como admin
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        
        // Performance: obter perfil do usuário apenas se necessário e em background
        try {
          // Executar em segundo plano para não bloquear o login
          setTimeout(async () => {
            try {
              const userProfile = await getProfile();
              if (userProfile) {
                setProfile(userProfile);
              }
            } catch (profileError) {
              console.error('Erro ao obter perfil do usuário (background):', profileError);
            }
          }, 100);
        } catch (profileError) {
          console.error('Erro ao obter perfil do usuário:', profileError);
        }
      } else if (localStorageLoggedIn && localStorageAdmin) {
        // Sem sessão válida no Supabase mas com login no localStorage (para admin de demonstração)
        console.log('Nenhuma sessão Supabase, mas login detectado via localStorage. Possível admin de demonstração.');
        setUser(null);
        setProfile(null);
        setIsAdmin(true);
        setIsAuthenticated(true);
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
      
      // Verificar localStorage mesmo em caso de erro (para compatibilidade com admin de demonstração)
      const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
      const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      if (localStorageLoggedIn && localStorageAdmin) {
        console.log('Erro ao verificar autenticação, mas login admin detectado via localStorage.');
        setIsAdmin(true);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
        
        // Limpar localStorage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("userEmail");
      }
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
