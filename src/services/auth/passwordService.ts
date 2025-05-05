
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

/**
 * Request a password reset email
 * @param email The email address to send the reset link to
 * @returns True if successful, false otherwise
 */
export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    // Use the built-in Supabase client functionality first (more efficient)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password-confirm`,
    });

    if (error) throw error;
    
    toast.success("Email de recuperação enviado. Verifique sua caixa de entrada.");
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    toast.error("Erro ao enviar email de recuperação de senha.");
    return false;
  }
};

/**
 * Reset password with token
 * @param newPassword The new password
 * @returns True if successful, false otherwise
 */
export const resetPassword = async (newPassword: string): Promise<boolean> => {
  try {
    // Use the built-in Supabase client functionality
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    
    toast.success("Senha atualizada com sucesso!");
    return true;
  }
  catch (error) {
    console.error("Password reset error:", error);
    toast.error("Erro ao redefinir senha.");
    return false;
  }
};

/**
 * Update user password (alias for resetPassword - for consistent naming)
 * @param newPassword The new password
 * @returns True if successful, false otherwise
 */
export const updatePassword = async (newPassword: string): Promise<boolean> => {
  return resetPassword(newPassword);
};

/**
 * Change admin password (requires authentication)
 * @param newPassword The new password
 * @returns True if successful, false otherwise
 */
export const changeAdminPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // Use built-in Supabase client functionality with session validation
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (!sessionData.session) {
      toast.error("Você precisa estar autenticado para alterar sua senha.");
      return false;
    }

    // Verify current password by attempting a sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: sessionData.session.user.email!,
      password: currentPassword
    });

    if (signInError) {
      toast.error("Senha atual incorreta.");
      return false;
    }

    // Update the password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    
    toast.success("Senha atualizada com sucesso!");
    return true;
  } catch (error) {
    console.error("Password change error:", error);
    toast.error("Erro ao alterar senha.");
    return false;
  }
};

/**
 * Resend verification email
 * @param email The email address to send the verification link to
 * @returns True if successful, false otherwise
 */
export const resendVerificationEmail = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/email-confirmation?type=signup`
      }
    });

    if (error) throw error;
    
    toast.success("Email de verificação enviado. Verifique sua caixa de entrada.");
    return true;
  } catch (error) {
    console.error("Email verification resend error:", error);
    toast.error("Erro ao reenviar email de verificação.");
    return false;
  }
};
