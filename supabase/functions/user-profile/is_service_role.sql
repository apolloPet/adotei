
-- Create a function to check if the connection is using service role
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current role has bypassing RLS capabilities
  RETURN (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user);
END;
$$;
