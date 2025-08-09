
-- Create storage bucket for book cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for book-covers bucket
CREATE POLICY "Book cover images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'book-covers');

CREATE POLICY "Authors can upload book covers" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'book-covers' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authors can update book covers" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'book-covers' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authors can delete book covers" ON storage.objects
FOR DELETE USING (
  bucket_id = 'book-covers' 
  AND auth.uid() IS NOT NULL
);
