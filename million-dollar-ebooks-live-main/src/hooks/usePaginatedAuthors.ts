
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Author {
  id: string;
  display_name: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
  books: Array<{
    id: string;
    title: string;
    cover_image_url?: string;
    rating_average?: number;
    book_genres: Array<{
      genres: {
        name: string;
        slug: string;
      };
    }>;
  }>;
}

interface UsePaginatedAuthorsOptions {
  searchQuery?: string;
  pageSize?: number;
}

export function usePaginatedAuthors({
  searchQuery = '',
  pageSize = 20
}: UsePaginatedAuthorsOptions) {
  const { toast } = useToast();
  
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchAuthorsPage = useCallback(async (page: number, reset: boolean = false) => {
    setLoading(true);
    
    try {
      const offset = page * pageSize;
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          username,
          bio,
          avatar_url,
          is_verified,
          books!books_author_id_fkey (
            id,
            title,
            cover_image_url,
            rating_average,
            book_genres (
              genres (
                name,
                slug
              )
            )
          )
        `)
        .eq('user_role', 'writer')
        .not('books', 'is', null);

      // Add search filter
      if (searchQuery.trim()) {
        query = query.or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`);
      }

      const { data: authorsData, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;

      // Filter authors who have published books
      const publishedAuthors = (authorsData || []).filter(author => 
        author.books && author.books.length > 0
      );

      setHasNextPage(publishedAuthors.length === pageSize);

      if (reset) {
        setAuthors(publishedAuthors);
      } else {
        setAuthors(prev => [...prev, ...publishedAuthors]);
      }
      
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load authors. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [pageSize, searchQuery, toast]);

  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchAuthorsPage(nextPage, false);
    }
  }, [loading, hasNextPage, currentPage, fetchAuthorsPage]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setHasNextPage(true);
    fetchAuthorsPage(0, true);
  }, [fetchAuthorsPage]);

  // Reset when search changes
  useEffect(() => {
    refresh();
  }, [searchQuery, refresh]);

  return {
    authors,
    loading,
    hasNextPage,
    loadMore,
    refresh
  };
}
