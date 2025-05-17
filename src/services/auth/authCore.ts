
// Re-export from the core directory for backward compatibility
// This file exists to maintain backward compatibility with code that imports from authCore.ts
export {
  signIn,
  signOut,
  getCurrentUser,
  getCurrentSession,
  confirmEmail,
  signInAdmin,
  getUserRole,
  setUserRole,
  signUp
} from './core';
