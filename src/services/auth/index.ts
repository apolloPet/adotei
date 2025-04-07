
import { signIn, signOut, getCurrentUser, getCurrentSession, confirmEmail, signInAdmin, getUserRole, setUserRole } from './authCore';
import { resetPassword as resetPasswordService, updatePassword as updatePasswordService, resendVerificationEmail } from './passwordService';
import { getProfile as getProfileService, updateProfile as updateProfileService, createProfile as createProfileService } from './profileService';
import { getUserSessions, terminateSession, createSessionLog, getSessionHistory, getCurrentSessionInfo } from './sessionService';
import type { UserSession } from './sessionService';
import type { SignupData, UserRoleData } from './types';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

// Removed the local signUp function and will re-export the one from authCore

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
