
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-sonner';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface UseAuditLogReturn {
  logs: AuditLogEntry[];
  loading: boolean;
  error: Error | null;
  fetchLogs: (userId?: string) => Promise<void>;
  createLogEntry: (logEntry: Omit<AuditLogEntry, 'id' | 'created_at'>) => Promise<boolean>;
}

export const useAuditLog = (): UseAuditLogReturn => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchLogs = async (userId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      setLogs(data || []);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };
  
  const createLogEntry = async (
    logEntry: Omit<AuditLogEntry, 'id' | 'created_at'>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from('admin_audit_logs').insert([logEntry]);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (err: any) {
      console.error('Error creating audit log entry:', err);
      // Silently fail - don't disrupt user experience for logging errors
      return false;
    }
  };
  
  return {
    logs,
    loading,
    error,
    fetchLogs,
    createLogEntry
  };
};

export default useAuditLog;
