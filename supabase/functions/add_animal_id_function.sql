
-- Function to add animal_id column to adoptions table if it doesn't exist
CREATE OR REPLACE FUNCTION public.add_animal_id_to_adoptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if animal_id column already exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'adoptions'
    AND column_name = 'animal_id'
  ) THEN
    -- Add the animal_id column
    EXECUTE 'ALTER TABLE public.adoptions ADD COLUMN animal_id UUID DEFAULT NULL';
    
    -- Add a comment for documentation
    EXECUTE 'COMMENT ON COLUMN public.adoptions.animal_id IS ''ID from animals table, used as alternative to pet_id''';
    
    -- Create an index for better query performance
    EXECUTE 'CREATE INDEX idx_adoptions_animal_id ON public.adoptions (animal_id)';
    
    -- Modify the RLS policy to include the animal_id column if needed
    -- This would depend on your specific RLS setup
  END IF;
END;
$$;
