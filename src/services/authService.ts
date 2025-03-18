
// Este arquivo está sendo simplificado para utilizar as funções de auth.ts diretamente
// e evitar chamadas redundantes que afetam a performance

// Exporta tudo dos módulos individuais para manter compatibilidade
// com o código existente enquanto a migração é concluída
export * from './auth';

// Performance: adicionar monitoramento de tempo de resposta
import now from 'performance-now';

// Substitutos das funções para medir o tempo de resposta
import { signIn as originalSignIn } from './auth';

export const signIn = async (email: string, password: string): Promise<boolean> => {
  const startTime = now();
  
  try {
    console.log(`[PERF] Iniciando login para ${email} em ${new Date().toISOString()}`);
    const result = await originalSignIn(email, password);
    
    const endTime = now();
    const elapsedTime = (endTime - startTime).toFixed(2);
    
    console.log(`[PERF] Login ${result ? 'bem-sucedido' : 'falhou'} em ${elapsedTime}ms`);
    
    return result;
  } catch (error) {
    const endTime = now();
    const elapsedTime = (endTime - startTime).toFixed(2);
    
    console.error(`[PERF] Erro de login após ${elapsedTime}ms:`, error);
    throw error;
  }
};
