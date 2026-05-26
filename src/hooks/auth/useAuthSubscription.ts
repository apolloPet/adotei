
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/services/auth/profileService';

export function useAuthSubscription({
  setUser,
  setSession, 
  setProfile,
  setIsAdmin,
  setIsVolunteer
}) {
  // Use uma ref para controlar subscrições duplicadas
  const subscriptionRef = useRef(null);
  
  useEffect(() => {
    // Evitar múltiplas subscrições
    if (subscriptionRef.current) return;
    
    // Performance: improved setup for auth events
    console.log('Setting up subscription for authentication events');
    
    // Importante: usar objeto data para garantir tipagem correta
    const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Authentication event detected:', event);
      
      // Verificar tipos de eventos importantes
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token atualizado com sucesso');
      }
      
      // Não remover ou alterar a sessão em eventos que não sejam explicitamente SIGNED_OUT
      if (event === 'SIGNED_OUT') {
        console.log('Usuário fez logout explicitamente');
        
        // Performance: set user immediately
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        setIsVolunteer(false);
        
        // Clear localStorage on explicit logout
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("userEmail");
        
        // Adicionar evento personalizado para informar todos os componentes
        window.dispatchEvent(new Event('authStateChanged'));
        
        return;
      }
      
      // Para outros eventos, atualizar apenas se houver uma sessão válida
      if (newSession?.user) {
        console.log('Sessão atualizada:', { 
          userId: newSession.user.id,
          event,
          accessToken: newSession.access_token ? 'presente' : 'ausente',
          expiraEm: newSession.expires_at ? new Date(newSession.expires_at * 1000).toISOString() : 'desconhecido'
        });
        
        // Performance: set user and session immediately
        setSession(newSession);
        setUser(newSession.user);
        
        const isAdminUser = Boolean(
          newSession.user.app_metadata?.role === 'admin' ||
          newSession.user.user_metadata?.isAdmin === true
        );
        const isVolunteerUser = Boolean(
          newSession.user.user_metadata?.userType === 'VOLUNTARIO' ||
          (newSession.user.user_metadata?.roles as string[] | undefined)?.includes('VOLUNTARIO')
        );
        setIsAdmin(isAdminUser);
        setIsVolunteer(isVolunteerUser);

        if (newSession.user.email) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("isAdmin", isAdminUser.toString());
          localStorage.setItem("userEmail", newSession.user.email);
        }
        
        // Adicionar evento personalizado para informar todos os componentes
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Performance: fetch user profile in background
        setTimeout(async () => {
          try {
            const userProfile = await getProfile();
            if (userProfile) {
              console.log('Profile fetched in background:', userProfile);
              setProfile(userProfile);
            } else {
              console.log('No profile found in background fetch');
            }
          } catch (error) {
            console.error('Error fetching profile in background:', error);
          }
        }, 100);
      } else if (event !== 'INITIAL_SESSION') {
        // Para eventos sem sessão (exceto verificação inicial), notificar mudança
        console.log('Evento de autenticação sem sessão:', event);
        window.dispatchEvent(new Event('authStateChanged'));
      }
    });
    
    // Importante: obter subscription do objeto data
    const subscription = data.subscription;
    subscriptionRef.current = subscription;

    // Performance: proper cleanup on component unmount
    return () => {
      console.log('Cancelling authentication event subscription');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [setUser, setSession, setProfile, setIsAdmin, setIsVolunteer]);
}
