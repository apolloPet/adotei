
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getCurrentUser, getCurrentSession, getProfile, getUserRole } from '@/services/authService';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { toast } from '@/hooks/use-sonner';

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isAuthenticated: false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Check localStorage first for quicker login state
        const isLoggedInFromStorage = localStorage.getItem("isLoggedIn") === "true";
        const isAdminFromStorage = localStorage.getItem("isAdmin") === "true";
        
        // For demo purposes, we can use localStorage
        if (isLoggedInFromStorage) {
          console.log('Auth: User is logged in from localStorage');
          
          // If we're in demo mode with localStorage
          if (!user) {
            // Set admin status from localStorage
            setIsAdmin(isAdminFromStorage);
            
            // Get session and user from Supabase if available
            try {
              const currentSession = await getCurrentSession();
              setSession(currentSession);
              
              if (currentSession) {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
                
                // Check if admin from email
                if (currentUser?.email) {
                  const isAdminUser = currentUser.email.includes('@ong') || 
                                    currentUser.email.includes('@admin') || 
                                    false;
                  
                  console.log('User role check:', { email: currentUser.email, isAdmin: isAdminUser });
                  setIsAdmin(isAdminUser || isAdminFromStorage);
                  
                  // If admin status changed in Supabase, update localStorage
                  if (isAdminUser !== isAdminFromStorage) {
                    localStorage.setItem("isAdmin", isAdminUser.toString());
                  }
                }
                
                // Get profile for authenticated users
                try {
                  const userProfile = await getProfile();
                  setProfile(userProfile);
                } catch (profileError) {
                  console.error('Error fetching user profile:', profileError);
                }
              }
            } catch (authError) {
              console.warn('Error checking Supabase session:', authError);
              // Continue with localStorage values if Supabase fails
            }
          }
        } else {
          // No localStorage login, check Supabase
          console.log('Auth: Checking Supabase session');
          
          try {
            // Get session and user
            const currentSession = await getCurrentSession();
            setSession(currentSession);
            
            if (currentSession) {
              const currentUser = await getCurrentUser();
              setUser(currentUser);
              
              // Check if admin
              if (currentUser?.email) {
                const isAdminUser = currentUser.email.includes('@ong') || 
                                  currentUser.email.includes('@admin') || 
                                  false;
                
                console.log('User role check:', { email: currentUser.email, isAdmin: isAdminUser });
                setIsAdmin(isAdminUser);
                
                // Update localStorage to match Supabase state
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", isAdminUser.toString());
                localStorage.setItem("userEmail", currentUser.email);
              } else {
                setIsAdmin(false);
              }
              
              // Get profile for authenticated users
              if (currentUser) {
                try {
                  const userProfile = await getProfile();
                  setProfile(userProfile);
                } catch (profileError) {
                  console.error('Error fetching user profile:', profileError);
                }
              }
            } else {
              // No current session, clear state and localStorage
              setUser(null);
              setProfile(null);
              setIsAdmin(false);
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("isAdmin");
              localStorage.removeItem("userEmail");
            }
          } catch (supabaseError) {
            console.error('Error in Supabase auth check:', supabaseError);
            // Don't clear localStorage here as it might be a temporary Supabase error
          }
        }
      } catch (error) {
        console.error('Error in auth effect:', error);
        // Don't show toast here as it can be annoying during initial load
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

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
  }, []);

  const value = {
    user,
    session,
    profile,
    isLoading,
    isAdmin,
    isAuthenticated: !!user || localStorage.getItem("isLoggedIn") === "true"
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
