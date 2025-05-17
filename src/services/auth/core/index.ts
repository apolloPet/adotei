
// Reexport functions from individual files
export { signIn } from './signIn';
export { signOut } from './signOut';
export { signUp } from './signUp';
export { signInAdmin, getUserRole, setUserRole } from './adminAuth';
export { getCurrentSession, getCurrentUser } from './session';
export { confirmEmail } from './emailVerification';
