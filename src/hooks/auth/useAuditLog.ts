
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/auth';

interface LogEntry {
  action: string;
  details?: Record<string, any>;
  entity_id?: string;
  entity_type?: string;
}

interface AuditLogOptions {
  autoInitialize?: boolean;
  batchingEnabled?: boolean;
  batchInterval?: number;
  maxBatchSize?: number;
}

/**
 * Hook para registrar logs de auditoria para ações administrativas
 */
export function useAuditLog(options: AuditLogOptions = {}) {
  const { 
    autoInitialize = true,
    batchingEnabled = true, 
    batchInterval = 10000, // 10 segundos
    maxBatchSize = 10 
  } = options;
  
  const { user, isAdmin } = useAuth();
  const [logQueue, setLogQueue] = useState<LogEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  
  // A tabela agora já está criada pelo SQL executado anteriormente
  const initializeLogTable = useCallback(async () => {
    if (initialized) return;
    
    try {
      console.log('[AuditLog] Verificando se a tabela de logs existe');
      setInitialized(true);
    } catch (error) {
      console.error('[AuditLog] Erro ao inicializar tabela de logs:', error);
    }
  }, [initialized]);
  
  // Registra uma entrada de log
  const logAction = useCallback((entry: LogEntry) => {
    if (!user) {
      console.warn('[AuditLog] Tentativa de log sem usuário autenticado');
      return;
    }
    
    const logEntry = {
      ...entry,
      user_id: user.id,
      timestamp: new Date().toISOString()
    };
    
    console.log('[AuditLog] Novo log:', logEntry);
    
    if (batchingEnabled) {
      // Adiciona ao batch para envio posterior
      setLogQueue(prev => [...prev, entry]);
    } else {
      // Envia imediatamente
      sendLog(entry);
    }
  }, [user, batchingEnabled]);
  
  // Envia um log individual para o servidor
  const sendLog = async (entry: LogEntry) => {
    try {
      if (!user) return;
      
      // Usando o tipo any para contornar as limitações do TypeScript com tabelas dinâmicas
      const { error } = await supabase
        .from('admin_audit_logs' as any)
        .insert({
          user_id: user.id,
          action: entry.action,
          details: entry.details || {},
          entity_id: entry.entity_id,
          entity_type: entry.entity_type,
          ip_address: null, // Será preenchido pelo servidor
          user_agent: navigator.userAgent
        } as any);
      
      if (error) {
        console.error('[AuditLog] Erro ao salvar log:', error);
      }
    } catch (error) {
      console.error('[AuditLog] Erro ao enviar log:', error);
    }
  };
  
  // Envia todos os logs em batch
  const flushLogs = useCallback(async () => {
    if (logQueue.length === 0) return;
    
    console.log(`[AuditLog] Enviando batch de ${logQueue.length} logs`);
    
    try {
      if (!user) return;
      
      const batch = logQueue.map(entry => ({
        user_id: user.id,
        action: entry.action,
        details: entry.details || {},
        entity_id: entry.entity_id,
        entity_type: entry.entity_type,
        ip_address: null, // Será preenchido pelo servidor
        user_agent: navigator.userAgent
      }));
      
      // Processando um por um para garantir compatibilidade
      for (const item of batch) {
        // Usando o tipo any para contornar as limitações do TypeScript
        const { error } = await supabase
          .from('admin_audit_logs' as any)
          .insert(item as any);
        
        if (error) {
          console.error('[AuditLog] Erro ao salvar log individual:', error);
        }
      }
      
      // Limpa a fila
      setLogQueue([]);
    } catch (error) {
      console.error('[AuditLog] Erro ao enviar batch de logs:', error);
    }
  }, [logQueue, user]);
  
  // Inicializa o hook
  useEffect(() => {
    if (autoInitialize && !initialized && isAdmin) {
      initializeLogTable();
    }
  }, [autoInitialize, initialized, initializeLogTable, isAdmin]);
  
  // Configura o timer para envio em batch
  useEffect(() => {
    if (!batchingEnabled) return;
    
    const timer = setInterval(() => {
      if (logQueue.length > 0) {
        flushLogs();
      }
    }, batchInterval);
    
    return () => clearInterval(timer);
  }, [batchingEnabled, batchInterval, logQueue, flushLogs]);
  
  // Envia logs quando a fila atinge o tamanho máximo
  useEffect(() => {
    if (batchingEnabled && logQueue.length >= maxBatchSize) {
      flushLogs();
    }
  }, [batchingEnabled, logQueue, maxBatchSize, flushLogs]);
  
  // Função auxiliar para log de operações CRUD
  const logCrudAction = useCallback((
    action: 'create' | 'read' | 'update' | 'delete',
    entityType: string,
    entityId: string,
    details?: Record<string, any>
  ) => {
    logAction({
      action: `${action.toUpperCase()}_${entityType.toUpperCase()}`,
      entity_type: entityType,
      entity_id: entityId,
      details
    });
  }, [logAction]);
  
  return {
    logAction,
    logCrudAction,
    flushLogs,
    initialized,
    initializeLogTable,
    queueSize: logQueue.length
  };
}

export default useAuditLog;
