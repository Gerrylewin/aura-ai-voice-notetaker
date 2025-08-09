-- Create bookmarks table
CREATE TABLE public.book_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create annotations table
CREATE TABLE public.book_annotations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  selected_text text NOT NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_book_bookmarks_book_id ON public.book_bookmarks(book_id);
CREATE INDEX idx_book_bookmarks_user_id ON public.book_bookmarks(user_id);
CREATE INDEX idx_book_bookmarks_page_number ON public.book_bookmarks(page_number);
CREATE INDEX idx_book_annotations_book_id ON public.book_annotations(book_id);
CREATE INDEX idx_book_annotations_user_id ON public.book_annotations(user_id);
CREATE INDEX idx_book_annotations_page_number ON public.book_annotations(page_number);

-- Enable RLS on new tables
ALTER TABLE public.book_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_annotations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for book_bookmarks
CREATE POLICY "Users can manage their own bookmarks" 
  ON public.book_bookmarks FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view bookmarks for books they have access to" 
  ON public.book_bookmarks FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.books 
      WHERE books.id = book_bookmarks.book_id AND books.book_status = 'published'
    )
  );

-- RLS Policies for book_annotations
CREATE POLICY "Users can manage their own annotations" 
  ON public.book_annotations FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view annotations for books they have access to" 
  ON public.book_annotations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.books 
      WHERE books.id = book_annotations.book_id AND books.book_status = 'published'
    )
  );

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_book_bookmarks_updated_at 
  BEFORE UPDATE ON public.book_bookmarks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_annotations_updated_at 
  BEFORE UPDATE ON public.book_annotations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
