
-- Create author_applications table for the application system
CREATE TABLE public.author_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT NOT NULL,
  writing_samples TEXT[] NOT NULL DEFAULT '{}',
  previous_publications TEXT,
  writing_genres TEXT[] NOT NULL DEFAULT '{}',
  social_media_links TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT
);

-- Enable RLS on author_applications
ALTER TABLE public.author_applications ENABLE ROW LEVEL Security;

-- Allow anyone to submit applications
CREATE POLICY "Anyone can submit applications" 
  ON public.author_applications 
  FOR INSERT 
  WITH CHECK (true);

-- Allow applicants to view their own applications
CREATE POLICY "Applicants can view own applications" 
  ON public.author_applications 
  FOR SELECT 
  USING (true);

-- Allow admins to manage all applications
CREATE POLICY "Admins can manage applications" 
  ON public.author_applications 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role IN ('admin', 'moderator')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_author_applications_status ON public.author_applications(status);
CREATE INDEX idx_author_applications_created_at ON public.author_applications(created_at);
