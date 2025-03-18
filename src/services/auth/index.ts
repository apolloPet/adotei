
// Use explicit named imports and exports to avoid ambiguity
import { signIn, signUp, signOut, getCurrentUser, getCurrentSession, confirmEmail, signInAdmin } from './authCore';
import { resetPassword, updatePassword, resendVerificationEmail } from './passwordService';
import { getProfile, updateProfile } from './profileService';
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
  
  // Password service
  resetPassword,
  updatePassword,
  resendVerificationEmail,
  
  // Profile service
  getProfile,
  updateProfile,
  
  // Types
  type SignupData,
  type UserRoleData
};
