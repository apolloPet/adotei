
import { useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getCurrentSession, getProfile } from '@/services/auth';

export function useAuthState() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        setIsAuthenticated(true);
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
                console.error('Error fetching profile on auth change:', profileError);
              }
            }
            setIsAuthenticated(true);
          } else {
            // No current session, clear state and localStorage
            setUser(null);
            setProfile(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
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
