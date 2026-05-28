
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
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const lastCheckRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

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
      const isBackgroundRefresh = hasInitializedRef.current;
      if (!isBackgroundRefresh) {
        setIsLoading(true);
      }
      console.log('Verificando estado de autenticação atual...');
      
      // Performance: verificar diretamente a sessão do Supabase para evitar chamadas extras
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão do Supabase:', sessionError);
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        setIsVolunteer(false);
        setIsAuthenticated(false);
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
          setUser(null);
          setSession(null);
          setProfile(null);
          setIsAdmin(false);
          setIsVolunteer(false);
          setIsAuthenticated(false);
        } else {
          // Sessão atualizada com sucesso
          console.log('Sessão atualizada com sucesso');
          setSession(refreshData.session);
          const refreshedUser = refreshData.session.user;
          if (lastUserIdRef.current !== refreshedUser.id) {
            setUser(refreshedUser);
            lastUserIdRef.current = refreshedUser.id;
          }
          setIsAuthenticated(true);
          
          const refreshAdminStatus = Boolean(
            refreshData.session.user?.app_metadata?.role === 'admin' ||
            refreshData.session.user?.user_metadata?.isAdmin === true
          );
          const refreshVolunteerStatus = Boolean(
            refreshData.session.user?.user_metadata?.userType === 'VOLUNTARIO' ||
            (refreshData.session.user?.user_metadata?.roles as string[] | undefined)?.includes('VOLUNTARIO')
          );
          setIsAdmin(refreshAdminStatus);
          setIsVolunteer(refreshVolunteerStatus);
        }
      } else if (currentSession) {
        // Usuário autenticado via Supabase com sessão válida
        const userData = currentSession.user;
        if (lastUserIdRef.current !== userData.id) {
          setUser(userData);
          lastUserIdRef.current = userData.id;
        }
        setIsAuthenticated(true);
        
        const isAdminByMetadata =
          userData.app_metadata?.role === 'admin' ||
          userData.user_metadata?.isAdmin === true;
        const isVolunteerByMetadata =
          userData.user_metadata?.userType === 'VOLUNTARIO' ||
          (userData.user_metadata?.roles as string[] | undefined)?.includes('VOLUNTARIO');
        setIsAdmin(isAdminByMetadata);
        setIsVolunteer(isVolunteerByMetadata);
        
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
      } else {
        console.log('Nenhuma sessão ativa encontrada');
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsVolunteer(false);
        setIsAuthenticated(false);
        lastUserIdRef.current = null;
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
      setIsVolunteer(false);
      setIsAuthenticated(false);
      lastUserIdRef.current = null;
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userEmail");
    } finally {
      hasInitializedRef.current = true;
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
    isVolunteer,
    setIsVolunteer,
    isAuthenticated,
    setIsAuthenticated,
    fetchUserData
  };
}
