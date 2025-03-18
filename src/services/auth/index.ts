
// Use explicit named imports and exports to avoid ambiguity
import { signIn, signUp, signOut, getCurrentUser, getCurrentSession, confirmEmail, signInAdmin, getUserRole, setUserRole } from './authCore';
import { resetPassword as resetPasswordService, updatePassword as updatePasswordService, resendVerificationEmail } from './passwordService';
import { getProfile as getProfileService, updateProfile as updateProfileService } from './profileService';
import { getUserSessions, terminateSession } from './sessionService';
import { type SignupData, type UserRoleData } from './types';

// Export everything with clear naming
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
  
  // Types
  type SignupData,
  type UserRoleData
};
