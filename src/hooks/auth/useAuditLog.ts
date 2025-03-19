
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '.';
import { toast } from '@/hooks/use-sonner';

// Interface for audit log entry
export interface AuditLogEntry {
  id?: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Types of operations for audit logging
export type AuditAction = 
  | 'login' 
  | 'logout' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'approve' 
  | 'reject'
  | 'password_reset'
  | 'role_change';

// Hook for audit logging
export const useAuditLog = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to create an audit log entry
  const createLogEntry = useCallback(async (
    action: AuditAction,
    entityType?: string,
    entityId?: string,
    details?: Record<string, any>
  ): Promise<boolean> => {
    try {
      if (!user?.id) {
        console.warn('Attempt to log audit without authenticated user');
        return false;
      }
      
      setIsLoading(true);
      
      // Get client info for the log
      const userAgent = navigator.userAgent;
      let ipAddress = null;
      
      // Try to get IP address from API
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const data = await ipResponse.json();
          ipAddress = data.ip;
        }
      } catch (ipError) {
        console.warn('Could not fetch IP address for audit log:', ipError);
      }
      
      // Create log entry object
      const logEntry: AuditLogEntry = {
        user_id: user.id,
        action,
        entity_type: entityType || '',
        entity_id: entityId || '',
        details: details || {},
        ip_address: ipAddress,
        user_agent: userAgent
      };
      
      // Insert into audit_logs table
      const { error } = await supabase
        .from('admin_audit_logs')
        .insert(logEntry);
      
      if (error) {
        console.error('Error creating audit log:', error);
        
        // If the table doesn't exist, try to create it
        if (error.message.includes('relation "admin_audit_logs" does not exist')) {
          console.log('Attempting to create admin_audit_logs table...');
          return false;
        }
        
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error creating audit log:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Function to batch create log entries
  const createBatchLogEntries = useCallback(async (
    entries: {
      action: AuditAction;
      entityType?: string;
      entityId?: string;
      details?: Record<string, any>;
    }[]
  ): Promise<boolean> => {
    try {
      if (!user?.id) {
        console.warn('Attempt to batch log audit without authenticated user');
        return false;
      }
      
      if (entries.length === 0) {
        return true; // Nothing to do
      }
      
      setIsLoading(true);
      
      // Get client info for the logs
      const userAgent = navigator.userAgent;
      let ipAddress = null;
      
      // Try to get IP address from API
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const data = await ipResponse.json();
          ipAddress = data.ip;
        }
      } catch (ipError) {
        console.warn('Could not fetch IP address for audit logs:', ipError);
      }
      
      // Map entries to proper format
      const logEntries: AuditLogEntry[] = entries.map(entry => ({
        user_id: user.id,
        action: entry.action,
        entity_type: entry.entityType || '',
        entity_id: entry.entityId || '',
        details: entry.details || {},
        ip_address: ipAddress,
        user_agent: userAgent
      }));
      
      // Insert batch into audit_logs table
      const { error } = await supabase
        .from('admin_audit_logs')
        .insert(logEntries);
      
      if (error) {
        console.error('Error creating batch audit logs:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error creating batch audit logs:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Function to get audit logs for a user
  const getUserLogs = useCallback(async (userId?: string, limit = 100): Promise<AuditLogEntry[]> => {
    try {
      setIsLoading(true);
      
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching user audit logs:', error);
        return [];
      }
      
      return data as AuditLogEntry[];
    } catch (error) {
      console.error('Unexpected error fetching user audit logs:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  return {
    createLogEntry,
    createBatchLogEntries,
    getUserLogs,
    isLoading
  };
};
