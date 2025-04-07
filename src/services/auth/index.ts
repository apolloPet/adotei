import { signIn, signUp, signOut, getCurrentUser, getCurrentSession, confirmEmail, signInAdmin, getUserRole, setUserRole } from './authCore';
import { resetPassword as resetPasswordService, updatePassword as updatePasswordService, resendVerificationEmail } from './passwordService';
import { getProfile as getProfileService, updateProfile as updateProfileService } from './profileService';
import { getUserSessions, terminateSession, createSessionLog, getSessionHistory, getCurrentSessionInfo } from './sessionService';
import type { UserSession } from './sessionService';
import type { SignupData, UserRoleData } from './types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export const signUp = async (userData: SignupData): Promise<boolean> => {
  try {
    // First, create the authentication account
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      console.error('Auth signup error:', error);
      throw error;
    }

    if (!data.user) {
      throw new Error('No user returned from signup');
    }

    // Prepare profile data
    const profileData = {
      firstName: userData.firstName || (userData.name ? userData.name.split(' ')[0] : ''),
      lastName: userData.lastName || (userData.name ? userData.name.split(' ').slice(1).join(' ') : ''),
      email: userData.email,
      phone: userData.phone || '',
      address: userData.address?.street || '',
      city: userData.address?.city || '',
      state: userData.address?.state || '',
      zip: userData.address?.cep || '',
      housingType: userData.housingType || 'house',
      hasChildren: userData.hasChildren || false,
      childrenAges: userData.childrenAges || '',
      hadPetsBefore: userData.hadPetsBefore || false,
      hasAllergies: userData.hasAllergies || false,
      allergiesDescription: userData.allergiesDescription || '',
      workSchedule: userData.workSchedule || ''
    };

    console.log('Creating profile after signup with data:', profileData);

    // Create the user profile
    const profileCreated = await createProfile(profileData);
    
    if (!profileCreated) {
      console.error('Failed to create profile during signup');
      // Don't throw error here as the auth account is already created
      toast.warning('Conta criada, mas houve um problema ao configurar seu perfil. Por favor, complete seu perfil após o login.');
    }

    return true;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export {
  // Auth core
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getCurrentSession,
  confirmEmail,
  signInAdmin,
  getUserRole,
  setUserRole,
  
  // Password service
  resetPasswordService as resetPassword,
  updatePasswordService as updatePassword,
  resendVerificationEmail,
  
  // Profile service
  getProfileService as getProfile,
  updateProfileService as updateProfile,
  
  // Session service
  getUserSessions,
  terminateSession,
  createSessionLog,
  getSessionHistory,
  getCurrentSessionInfo,
};

export type { UserSession, SignupData, UserRoleData };
