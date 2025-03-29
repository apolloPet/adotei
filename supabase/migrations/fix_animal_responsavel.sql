
-- Note: This migration should be run on the supabase project
-- It makes responsavel_id nullable in the animals table to avoid FK errors 

ALTER TABLE public.animals 
  ALTER COLUMN responsavel_id DROP NOT NULL;

-- Next time you need this, you should run this SQL to create a system user:
-- INSERT INTO auth.users (id, email, role)
-- VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'system@petmatch.com', 'authenticated')
-- ON CONFLICT (id) DO NOTHING;
-- 
-- INSERT INTO public.profiles (id, first_name, last_name)  
-- VALUES
--   ('00000000-0000-0000-0000-000000000000', 'Sistema', 'PetMatch')
-- ON CONFLICT (id) DO NOTHING;
