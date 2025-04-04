
-- Enable Row Level Security on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a policy allowing authenticated users to select their own data
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

-- Create a policy allowing authenticated users to insert their own data
CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Create a policy allowing authenticated users to update their own data
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

-- Create a policy allowing authenticated users to delete their own data
CREATE POLICY "Users can delete their own data" ON public.users
  FOR DELETE USING (auth.uid() = auth_id);

-- Create a policy allowing service role (edge functions) to manage all user data
CREATE POLICY "Service role can manage all user data" ON public.users
  USING (public.is_service_role());
