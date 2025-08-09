
-- Add member_number to profiles to track the first 100 members (skip if already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='member_number') THEN
        ALTER TABLE public.profiles ADD COLUMN member_number INTEGER DEFAULT NULL;
    END IF;
END $$;

-- Add unique constraint to ensure no duplicate member numbers (skip if already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='unique_member_number') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT unique_member_number UNIQUE (member_number);
    END IF;
END $$;

-- Create a function to automatically assign member numbers to new users
CREATE OR REPLACE FUNCTION assign_member_number()
RETURNS TRIGGER AS $$
DECLARE
  next_member_number INTEGER;
BEGIN
  -- Only assign member numbers to the first 100 users
  SELECT COALESCE(MAX(member_number), 0) + 1 INTO next_member_number
  FROM public.profiles
  WHERE member_number IS NOT NULL;
  
  -- Only assign if we haven't reached 100 members yet
  IF next_member_number <= 100 THEN
    NEW.member_number = next_member_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it's correct
DROP TRIGGER IF EXISTS assign_member_number_trigger ON public.profiles;
CREATE TRIGGER assign_member_number_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_member_number();

-- Backfill member numbers for existing users (first 100 based on created_at)
WITH numbered_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.profiles
  WHERE member_number IS NULL
)
UPDATE public.profiles 
SET member_number = numbered_users.rn
FROM numbered_users
WHERE profiles.id = numbered_users.id 
AND numbered_users.rn <= 100;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" 
  ON public.notifications 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Add RLS policies for admin notifications deletion  
DROP POLICY IF EXISTS "Admins can delete admin notifications" ON public.admin_notifications;
CREATE POLICY "Admins can delete admin notifications" 
  ON public.admin_notifications 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Add RLS policies for admin user notifications deletion
DROP POLICY IF EXISTS "Admins can delete admin user notifications" ON public.admin_user_notifications;
CREATE POLICY "Admins can delete admin user notifications" 
  ON public.admin_user_notifications 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Add RLS policies for story comments deletion
DROP POLICY IF EXISTS "Users can delete their own story comments" ON public.story_comments;
CREATE POLICY "Users can delete their own story comments" 
  ON public.story_comments 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);
