
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { getCurrentUser, getCurrentSession, getProfile } from '@/services/authService';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';

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
        
        // Get session and user
        const currentSession = await getCurrentSession();
        setSession(currentSession);
        
        if (currentSession) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          
          // Check if admin
          const isAdminUser = currentUser?.email?.includes('@ong') || 
                             currentUser?.email?.includes('@admin') || 
                             false;
          setIsAdmin(isAdminUser);
          
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
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
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
      setUser(newSession?.user ?? null);
      
      // Check if admin
      const isAdminUser = newSession?.user?.email?.includes('@ong') || 
                         newSession?.user?.email?.includes('@admin') || 
                         false;
      setIsAdmin(isAdminUser);
      
      // Get profile for authenticated users
      if (newSession?.user) {
        try {
          const userProfile = await getProfile();
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching profile on auth change:', error);
        }
      } else {
        setProfile(null);
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
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
