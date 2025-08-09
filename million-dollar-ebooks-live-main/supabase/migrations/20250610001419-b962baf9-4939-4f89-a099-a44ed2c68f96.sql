
-- First enable RLS if not already enabled
ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Anyone can read story comments" ON public.story_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.story_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.story_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.story_comments;

-- Allow anyone to read comments on published stories
CREATE POLICY "Anyone can read story comments" 
  ON public.story_comments 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert their own comments
CREATE POLICY "Authenticated users can create comments" 
  ON public.story_comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" 
  ON public.story_comments 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments" 
  ON public.story_comments 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);
