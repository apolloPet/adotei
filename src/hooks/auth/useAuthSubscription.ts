
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Authentication event detected:', event);
      
      // Performance: update session state immediately
      setSession(newSession);
      
      if (newSession?.user) {
        // Performance: set user immediately
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
        } else {
          setIsAdmin(false);
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
        
      } else {
        // Session ended
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        
        // Clear localStorage on logout
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("userEmail");
        }
      }
    });

    // Performance: proper cleanup on component unmount
    return () => {
      console.log('Cancelling authentication event subscription');
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setIsAdmin]);
}
