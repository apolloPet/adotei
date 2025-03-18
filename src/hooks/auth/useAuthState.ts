
import { useState, useEffect, useCallback } from 'react';
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
  const [lastCheck, setLastCheck] = useState(0);

  const fetchUserData = useCallback(async () => {
    // Evitar chamadas em rápida sucessão (debounce)
    const now = Date.now();
    if (now - lastCheck < 1000) {
      console.log('Ignorando chamada rápida para fetchUserData');
      return;
    }
    
    setLastCheck(now);
    
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
        // Manter status de admin do localStorage mesmo em caso de erro
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(localStorageAdmin); 
        setIsAuthenticated(localStorageLoggedIn); 
        return;
      }
      
      const currentSession = sessionData.session;
      setSession(currentSession);
      
      if (currentSession) {
        // Usuário autenticado via Supabase
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
          
          // Status final (incluindo localStorage para compatibilidade)
          const finalAdminStatus = isAdminByEmail || isAdminByMetadata || localStorageAdmin;
          
          console.log('Verificação de perfil admin:', { 
            email: userData.email, 
            finalStatus: finalAdminStatus,
            isAdminByEmail,
            isAdminByMetadata,
            localStorageAdmin
          });
          
          setIsAdmin(finalAdminStatus);
          
          // Atualizar localStorage apenas se necessário
          if (finalAdminStatus && localStorage.getItem("isAdmin") !== "true") {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("isAdmin", "true");
          }
          
          if (!localStorage.getItem("userEmail")) {
            localStorage.setItem("userEmail", userData.email);
          }
        } else if (localStorageAdmin) {
          // Manter admin via localStorage se não temos email
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        
        // Obter perfil do usuário em segundo plano (não bloquear)
        try {
          setTimeout(async () => {
            try {
              const userProfile = await getProfile();
              if (userProfile) {
                setProfile(userProfile);
              }
            } catch (profileError) {
              console.error('Erro ao obter perfil (background):', profileError);
            }
          }, 100);
        } catch (profileError) {
          console.error('Erro ao iniciar busca de perfil:', profileError);
        }
      } else if (localStorageLoggedIn && localStorageAdmin) {
        // Admin de demonstração (sem sessão no Supabase)
        console.log('Nenhuma sessão Supabase, mas login via localStorage (admin demo)');
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
        
        // NÃO limpar localStorage se for admin de demonstração
        if (!localStorageAdmin) {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("userEmail");
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      
      // Preservar estado para admin de demonstração mesmo em caso de erro
      const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
      const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      if (localStorageLoggedIn && localStorageAdmin) {
        console.log('Erro na verificação, mas admin via localStorage detectado');
        setIsAdmin(true);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
        
        // Limpar localStorage, mas NUNCA para admin de demonstração
        if (!localStorageAdmin) {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("userEmail");
        }
      }
    } finally {
      setIsLoading(false);
      console.log('Verificação de autenticação concluída');
    }
  }, [lastCheck]);

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
