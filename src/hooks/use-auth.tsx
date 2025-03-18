
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
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
        const currentUser = await getCurrentUser();
        const currentSession = await getCurrentSession();
        
        setUser(currentUser);
        setSession(currentSession);
        
        // Check if admin
        const isAdminUser = currentUser?.email?.includes('@ong') || currentUser?.email?.includes('@admin') || false;
        setIsAdmin(isAdminUser);
        
        // Get profile for authenticated users
        if (currentUser) {
          const userProfile = await getProfile();
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error in auth effect:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Set up auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      setUser(session?.user ?? null);
      setSession(session);
      
      // Check if admin
      const isAdminUser = session?.user?.email?.includes('@ong') || session?.user?.email?.includes('@admin') || false;
      setIsAdmin(isAdminUser);
      
      // Get profile for authenticated users
      if (session?.user) {
        const userProfile = await getProfile();
        setProfile(userProfile);
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
