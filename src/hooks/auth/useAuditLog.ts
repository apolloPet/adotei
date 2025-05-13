
import { supabase } from '@/lib/supabase';

interface AuditLogEntry {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export const useAuditLog = () => {
  const createLogEntry = async (entry: AuditLogEntry) => {
    try {
      // Log to console for debugging
      console.log('Audit log entry:', entry);
      
      // Get the current user ID
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id || 'anonymous';
      
      // In a real implementation, send to database in background
      // to avoid blocking critical operations
      setTimeout(async () => {
        try {
          await supabase.from('admin_audit_logs').insert({
            user_id: userId,
            action: entry.action,
            entity_type: entry.resource,
            entity_id: entry.resourceId || null,
            details: entry.details || {}
          });
          
          console.log('Log de auditoria registrado com sucesso');
        } catch (err) {
          // Silent error to prevent interrupting main flow
          console.error('Erro ao registrar log de auditoria (não crítico):', err);
        }
      }, 100);
      
      return true;
    } catch (err) {
      // Silent failure to avoid affecting user experience
      console.error('Erro ao criar entrada de log de auditoria:', err);
      return false;
    }
  };

  return { createLogEntry };
};
