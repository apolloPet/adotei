
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const lastCheckRef = useRef(0);

  // Função para verificar se uma sessão está expirada
  const isSessionExpired = (session: Session | null): boolean => {
    if (!session) return true;
    
    // Verificar se a sessão tem um token de acesso e data de expiração
    if (!session.access_token || !session.expires_at) return true;
    
    // Calcular quando o token expira (em milissegundos)
    const expiresAt = session.expires_at * 1000; // convert to milliseconds
    const now = Date.now();
    
    // Sessão expirada se a data atual é posterior à de expiração
    return now >= expiresAt;
  };

  const fetchUserData = useCallback(async () => {
    // Evitar chamadas em rápida sucessão (debounce)
    const now = Date.now();
    if (now - lastCheckRef.current < 1000) {
      console.log('Ignorando chamada rápida para fetchUserData');
      return;
    }
    lastCheckRef.current = now;
    
    try {
      setIsLoading(true);
      console.log('Verificando estado de autenticação atual...');
      
      // Verificar localStorage primeiro para compatibilidade com login de demonstração
      const localStorageAdmin = localStorage.getItem("isAdmin") === "true";
      const localStorageLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      // Se é admin de demonstração, aplicar configuração imediatamente
      if (localStorageAdmin && localStorageLoggedIn) {
        console.log('Admin via localStorage detectado, aplicando configurações');
        setIsAdmin(true);
        setIsAuthenticated(true);
      }
      
      // Performance: verificar diretamente a sessão do Supabase para evitar chamadas extras
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão do Supabase:', sessionError);
        // Manter status de admin do localStorage mesmo em caso de erro
        // mas apenas se não for o login de demonstração
        if (!localStorageAdmin || !localStorageLoggedIn) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
        return;
      }
      
      const currentSession = sessionData.session;
      setSession(currentSession);
      
      // Verificar se a sessão está expirada
      if (currentSession && isSessionExpired(currentSession)) {
        console.log('Sessão Supabase expirada, tentando atualizar...');
        
        // Tentar atualizar a sessão
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Não foi possível atualizar a sessão:', refreshError);
          
          // Manter admin demo via localStorage se aplicável
          if (localStorageAdmin && localStorageLoggedIn) {
            console.log('Sessão expirada mas mantendo login admin demo');
            // Não alterar estado, manter o que foi definido anteriormente
          } else {
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
          }
        } else {
          // Sessão atualizada com sucesso
          console.log('Sessão atualizada com sucesso');
          setSession(refreshData.session);
          setUser(refreshData.session.user);
          setIsAuthenticated(true);
          
          // Verificar se o email indica administrador
          const userEmail = refreshData.session.user?.email;
          if (userEmail) {
            const isAdminEmail = userEmail.includes('@ong') || 
                             userEmail.includes('@admin') || 
                             userEmail === 'admin@petmatch.com';
                             
            if (isAdminEmail) {
              setIsAdmin(true);
              localStorage.setItem("isAdmin", "true");
            }
            
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userEmail", userEmail);
          }
        }
      } else if (currentSession) {
        // Usuário autenticado via Supabase com sessão válida
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
          localStorage.setItem("isLoggedIn", "true");
          if (finalAdminStatus) {
            localStorage.setItem("isAdmin", "true");
          }
          localStorage.setItem("userEmail", userData.email);
        } else if (localStorageAdmin) {
          // Manter admin via localStorage se não temos email
          setIsAdmin(true);
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
  }, []);

  // Verificar sessão periodicamente para evitar logout automático
  useEffect(() => {
    fetchUserData();

    const interval = window.setInterval(() => {
      if (localStorage.getItem("isLoggedIn") === "true") {
        console.log('Verificação periódica de sessão');
        fetchUserData();
      }
    }, 60000);

    return () => {
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
