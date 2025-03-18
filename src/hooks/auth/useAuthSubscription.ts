
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/services/auth';

export function useAuthSubscription({
  setUser,
  setSession, 
  setProfile,
  setIsAdmin
}) {
  useEffect(() => {
    // Set up auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      setSession(newSession);
      
      if (newSession?.user) {
        setUser(newSession.user);
        
        // Check if admin
        const userEmail = newSession.user.email;
        if (userEmail) {
          const isAdminUser = userEmail.includes('@ong') || 
                          userEmail.includes('@admin') || 
                          false;
          
          console.log('Auth state update - user role check:', { email: userEmail, isAdmin: isAdminUser });
          setIsAdmin(isAdminUser);
          
          // Update localStorage
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("isAdmin", isAdminUser.toString());
          localStorage.setItem("userEmail", userEmail);
        } else {
          setIsAdmin(false);
        }
        
        // Get profile for authenticated users
        try {
          const userProfile = await getProfile();
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching profile on auth change:', error);
        }
        
        // Dispatch events to notify components about auth state change
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('authStateChanged'));
      } else {
        // Session ended
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        
        // Clear localStorage on signout
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("userEmail");
          
          // Dispatch events to notify components about auth state change
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new Event('authStateChanged'));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setProfile, setIsAdmin]);
}
