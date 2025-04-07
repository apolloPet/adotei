
import { signIn, signOut, getCurrentUser, getCurrentSession, confirmEmail, signInAdmin, getUserRole, setUserRole, signUp } from './authCore';
import { resetPassword as resetPasswordService, updatePassword as updatePasswordService, resendVerificationEmail } from './passwordService';
import { getProfile as getProfileService, updateProfile as updateProfileService, createProfile as createProfileService } from './profileService';
import { getUserSessions, terminateSession, createSessionLog, getSessionHistory, getCurrentSessionInfo } from './sessionService';
import type { UserSession } from './sessionService';
import type { SignupData, UserRoleData } from './types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export {
  // Auth core
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession,
  confirmEmail,
  signInAdmin,
  getUserRole,
  setUserRole,
  signUp,
  
  // Password service
  resetPasswordService as resetPassword,
  updatePasswordService as updatePassword,
  resendVerificationEmail,
  
  // Profile service
  getProfileService as getProfile,
  updateProfileService as updateProfile,
  createProfileService as createProfile,
  
  // Session service
  getUserSessions,
  terminateSession,
  createSessionLog,
  getSessionHistory,
  getCurrentSessionInfo,
};

export type { UserSession, SignupData, UserRoleData };
