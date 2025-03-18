
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password-confirm`,
    });
    
    if (error) throw error;
    
    toast.success('Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
    
    return true;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    toast.error(`Erro ao enviar email de recuperação: ${error.message}`);
    return false;
  }
};

export const updatePassword = async (newPassword: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    
    toast.success('Senha atualizada com sucesso!');
    
    return true;
  } catch (error: any) {
    console.error('Error updating password:', error);
    toast.error(`Erro ao atualizar senha: ${error.message}`);
    return false;
  }
};

export const resendVerificationEmail = async (email: string): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      toast.error('Erro: Configuração do Supabase incompleta');
      return false;
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/email-confirmation`,
      },
    });
    
    if (error) throw error;
    
    toast.success('Email de verificação reenviado com sucesso!');
    return true;
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    toast.error(`Erro ao reenviar email de verificação: ${error.message}`);
    return false;
  }
};
