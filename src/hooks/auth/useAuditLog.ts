
import { supabase } from '@/lib/supabase';

interface AuditLogEntry {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export const useAuditLog = () => {
  const createLogEntry = (entry: AuditLogEntry) => {
    try {
      // Apenas registrar no console para não bloquear operações críticas
      console.log('Audit log entry:', entry);
      
      // Em uma implementação real, enviaríamos para o banco de dados,
      // mas em segundo plano para não afetar a experiência do usuário
      setTimeout(() => {
        try {
          // Esta operação não deve falhar o fluxo principal,
          // então envolvemos em try/catch adicional
          supabase.from('admin_audit_logs').insert([{
            user_id: supabase.auth.getUser().then(({ data }) => data?.user?.id) || 'anonymous',
            action: entry.action,
            entity_type: entry.resource,
            entity_id: entry.resourceId || null,
            details: entry.details || {}
          }]).then(() => {
            console.log('Log de auditoria registrado com sucesso');
          }).catch(error => {
            console.error('Erro ao registrar log de auditoria (não crítico):', error);
          });
        } catch (err) {
          // Silenciar erro para não interromper o fluxo principal
          console.error('Erro na operação de log (não crítico):', err);
        }
      }, 100);
      
      return true;
    } catch (err) {
      // Falha silenciosa para não afetar a experiência do usuário
      console.error('Erro ao criar entrada de log de auditoria:', err);
      return false;
    }
  };

  return { createLogEntry };
};
