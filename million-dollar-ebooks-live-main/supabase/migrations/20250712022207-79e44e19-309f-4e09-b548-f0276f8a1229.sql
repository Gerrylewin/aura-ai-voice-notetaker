
-- Create a dedicated table for book content with proper structure
CREATE TABLE public.book_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  content_type text NOT NULL DEFAULT 'html', -- 'html', 'markdown', 'plain'
  full_content text NOT NULL,
  preview_content text,
  chapter_data jsonb DEFAULT '[]'::jsonb, -- Store chapter structure
  word_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1
);

-- Create table for import progress tracking
CREATE TABLE public.import_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  import_type text NOT NULL, -- 'epub', 'word', 'google-docs'
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  progress_percentage integer DEFAULT 0,
  current_step text DEFAULT 'Starting import...',
  total_steps integer DEFAULT 1,
  completed_steps integer DEFAULT 0,
  error_message text,
  import_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Create table for tracking imported images
CREATE TABLE public.book_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  import_job_id uuid REFERENCES public.import_jobs(id) ON DELETE SET NULL,
  original_path text NOT NULL,
  storage_url text NOT NULL,
  file_size_bytes integer,
  mime_type text,
  width integer,
  height integer,
  alt_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_book_content_book_id ON public.book_content(book_id);
CREATE INDEX idx_import_jobs_user_id ON public.import_jobs(user_id);
CREATE INDEX idx_import_jobs_status ON public.import_jobs(status);
CREATE INDEX idx_book_images_book_id ON public.book_images(book_id);
CREATE INDEX idx_book_images_import_job_id ON public.book_images(import_job_id);

-- Enable RLS on new tables
ALTER TABLE public.book_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for book_content
CREATE POLICY "Authors can manage their book content" 
  ON public.book_content FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.books 
      WHERE books.id = book_content.book_id AND books.author_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view published book content" 
  ON public.book_content FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.books 
      WHERE books.id = book_content.book_id AND books.book_status = 'published'
    )
  );

CREATE POLICY "Admins can view all book content" 
  ON public.book_content FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- RLS Policies for import_jobs
CREATE POLICY "Users can manage their own import jobs" 
  ON public.import_jobs FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all import jobs" 
  ON public.import_jobs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- RLS Policies for book_images
CREATE POLICY "Authors can manage their book images" 
  ON public.book_images FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.books 
      WHERE books.id = book_images.book_id AND books.author_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view published book images" 
  ON public.book_images FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.books 
      WHERE books.id = book_images.book_id AND books.book_status = 'published'
    )
  );

-- Function to update import job progress
CREATE OR REPLACE FUNCTION public.update_import_progress(
  job_id uuid,
  new_progress integer,
  new_step text DEFAULT NULL,
  increment_completed_steps boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.import_jobs 
  SET 
    progress_percentage = new_progress,
    current_step = COALESCE(new_step, current_step),
    completed_steps = CASE 
      WHEN increment_completed_steps THEN completed_steps + 1 
      ELSE completed_steps 
    END,
    updated_at = now()
  WHERE id = job_id;
END;
$$;

-- Function to complete import job
CREATE OR REPLACE FUNCTION public.complete_import_job(
  job_id uuid,
  success boolean,
  error_msg text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.import_jobs 
  SET 
    status = CASE WHEN success THEN 'completed' ELSE 'failed' END,
    progress_percentage = CASE WHEN success THEN 100 ELSE progress_percentage END,
    error_message = error_msg,
    completed_at = now(),
    updated_at = now()
  WHERE id = job_id;
END;
$$;
