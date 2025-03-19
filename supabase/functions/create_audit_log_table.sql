
-- Função para criar a tabela de audit logs
CREATE OR REPLACE FUNCTION public.create_audit_log_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Verifica se a tabela já existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'admin_audit_logs'
  ) INTO table_exists;
  
  -- Se a tabela já existe, retorna true sem fazer nada
  IF table_exists THEN
    RETURN true;
  END IF;
  
  -- Cria a tabela de audit logs
  CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Aplica RLS para que apenas o próprio usuário possa ver seus logs
  ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
  
  -- Define políticas de RLS para administrativo ter acesso completo
  CREATE POLICY "Admins têm acesso completo aos logs" 
    ON public.admin_audit_logs 
    USING (
      -- Verificar se o usuário é administrador
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
      )
      OR
      -- Ou se o email termina com @admin ou @ong
      EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (
          email LIKE '%@admin%' OR 
          email LIKE '%@ong%' OR
          email = 'admin@petmatch.com'
        )
      )
    );
  
  -- Adiciona índice para melhorar performance das consultas por usuário
  CREATE INDEX admin_audit_logs_user_id_idx ON public.admin_audit_logs(user_id);
  
  -- Adiciona índice para consultas por entidade
  CREATE INDEX admin_audit_logs_entity_idx ON public.admin_audit_logs(entity_type, entity_id);
  
  -- Adiciona índice para consultas por data
  CREATE INDEX admin_audit_logs_created_at_idx ON public.admin_audit_logs(created_at);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao criar tabela de audit logs: %', SQLERRM;
    RETURN false;
END;
$$;
