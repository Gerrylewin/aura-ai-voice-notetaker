
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Book {
  id: string;
  title: string;
  author_name: string;
  description?: string;
  cover_image_url?: string;
  price_cents: number;
  rating_average: number;
  rating_count: number;
  book_status: string;
  created_at: string;
  view_count: number;
  download_count: number;
}

export function useOptimizedBooks(limit: number = 50) {
  const queryClient = useQueryClient();

  const {
    data: books = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['books', limit],
    queryFn: async (): Promise<Book[]> => {
      console.log('📚 Fetching books from database...');
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          author_name,
          description,
          cover_image_url,
          price_cents,
          rating_average,
          rating_count,
          book_status,
          created_at,
          view_count,
          download_count
        `)
        .eq('book_status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Books are fresh for 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  return {
    books,
    loading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  };
}
