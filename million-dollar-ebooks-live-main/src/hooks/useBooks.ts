
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      console.log('Fetching all published books...');
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles:author_id(display_name, username),
          book_categories(category_id, categories(name, slug)),
          book_genres(genre_id, genres(name, slug))
        `)
        .eq('book_status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books:', error);
        throw error;
      }

      console.log('Fetched books:', data?.length || 0);
      return data || [];
    },
  });
}

export function useBooksByCategory(categorySlug?: string) {
  return useQuery({
    queryKey: ['books', 'category', categorySlug],
    queryFn: async () => {
      if (!categorySlug) return [];
      
      console.log('Fetching books by category:', categorySlug);
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles:author_id(display_name, username),
          book_categories!inner(category_id, categories!inner(name, slug)),
          book_genres(genre_id, genres(name, slug))
        `)
        .eq('book_status', 'published')
        .eq('book_categories.categories.slug', categorySlug)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books by category:', error);
        throw error;
      }
      
      console.log(`Books in category ${categorySlug}:`, data?.length || 0);
      return data || [];
    },
    enabled: !!categorySlug,
  });
}

export function useBooksByGenre(genreSlug?: string) {
  return useQuery({
    queryKey: ['books', 'genre', genreSlug],
    queryFn: async () => {
      if (!genreSlug) return [];
      
      console.log('Fetching books by genre:', genreSlug);
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles:author_id(display_name, username),
          book_categories(category_id, categories(name, slug)),
          book_genres!inner(genre_id, genres!inner(name, slug))
        `)
        .eq('book_status', 'published')
        .eq('book_genres.genres.slug', genreSlug)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books by genre:', error);
        throw error;
      }
      
      console.log(`Books in genre ${genreSlug}:`, data?.length || 0);
      return data || [];
    },
    enabled: !!genreSlug,
  });
}

export function useUserBooks(userId?: string) {
  return useQuery({
    queryKey: ['user-books', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Fetching user books for:', userId);
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles:author_id(display_name, username),
          book_categories(category_id, categories(name, slug)),
          book_genres(genre_id, genres(name, slug))
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user books:', error);
        throw error;
      }

      console.log(`User books for ${userId}:`, data?.length || 0);
      return data || [];
    },
    enabled: !!userId,
  });
}
