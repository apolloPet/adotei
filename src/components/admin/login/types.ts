
import { z } from 'zod';

export interface AdminLoginProps {
  /**
   * Função de callback chamada após login bem-sucedido
   */
  onLogin?: () => void;
}

export const adminLoginSchema = z.object({
  email: z.string()
    .min(1, { message: 'Email é obrigatório' })
    .email({ message: 'Email inválido' }),
  password: z.string()
    .min(1, { message: 'Senha é obrigatória' })
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
