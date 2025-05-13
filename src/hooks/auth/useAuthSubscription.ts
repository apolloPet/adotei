
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/services/auth/profileService';

export function useAuthSubscription({
  setUser,
  setSession, 
  setProfile,
  setIsAdmin
}) {
  useEffect(() => {
    // Performance: improved setup for auth events
    console.log('Setting up subscription for authentication events');
    
    // Importante: usar objeto data para garantir tipagem correta
    const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Authentication event detected:', event);
      
      // Não remover ou alterar a sessão em eventos que não sejam explicitamente SIGNED_OUT
      if (event === 'SIGNED_OUT') {
        console.log('Usuário fez logout explicitamente');
        
        // Performance: set user immediately
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsAdmin(false);
        
        // Clear localStorage on explicit logout
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("userEmail");
        
        return;
      }
      
      // Para outros eventos, atualizar apenas se houver uma sessão válida
      if (newSession?.user) {
        console.log('Sessão atualizada:', { 
          userId: newSession.user.id,
          event 
        });
        
        // Performance: set user and session immediately
        setSession(newSession);
        setUser(newSession.user);
        
        // Check admin status
        const userEmail = newSession.user.email;
        if (userEmail) {
          const isAdminUser = userEmail.includes('@ong') || 
                          userEmail.includes('@admin') || 
                          userEmail === 'admin@petmatch.com';
          
          console.log('State update - permissions check:', { 
            email: userEmail, 
            isAdmin: isAdminUser 
          });
          
          setIsAdmin(isAdminUser);
          
          // Update localStorage
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("isAdmin", isAdminUser.toString());
          localStorage.setItem("userEmail", userEmail);
        }
        
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
      }
    });
    
    // Importante: obter subscription do objeto data
    const subscription = data.subscription;

    // Performance: proper cleanup on component unmount
    return () => {
      console.log('Cancelling authentication event subscription');
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setIsAdmin]);
}
