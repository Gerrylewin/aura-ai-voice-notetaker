
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Book {
  id: string;
  title: string;
  author_name: string;
  author_id?: string; // Add this missing property
  description?: string;
  cover_image_url?: string;
  price_cents?: number;
  rating_average?: number;
  rating_count?: number;
  view_count?: number;
  download_count?: number;
  created_at?: string;
  book_categories?: Array<{ category_id: string; categories: { name: string; slug: string } }>;
  book_genres?: Array<{ genre_id: string; genres: { name: string; slug: string } }>;
}

interface UsePaginatedBooksOptions {
  searchQuery?: string;
  selectedCategory?: string;
  selectedGenre?: string;
  pageSize?: number;
}

export function usePaginatedBooks({
  searchQuery = '',
  selectedCategory,
  selectedGenre,
  pageSize = 20
}: UsePaginatedBooksOptions) {
  const { toast } = useToast();
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const buildQuery = useCallback(() => {
    let query = supabase
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
        view_count,
        download_count,
        created_at,
        book_categories (
          category_id,
          categories (
            name,
            slug
          )
        ),
        book_genres (
          genre_id,
          genres (
            name,
            slug
          )
        )
      `)
      .eq('book_status', 'published');

    // Add search filter
    if (searchQuery.trim()) {
      query = query.or(`title.ilike.%${searchQuery}%,author_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    return query.order('created_at', { ascending: false });
  }, [searchQuery]);

  const fetchBooksPage = useCallback(async (page: number, reset: boolean = false) => {
    setLoading(true);
    
    try {
      const offset = page * pageSize;
      const query = buildQuery();
      
      const { data: booksData, error } = await query.range(offset, offset + pageSize - 1);

      if (error) throw error;

      // Filter by category/genre on client side for now
      let filteredBooks = booksData || [];
      
      if (selectedCategory) {
        filteredBooks = filteredBooks.filter(book => 
          book.book_categories?.some(bc => bc.categories?.name === selectedCategory)
        );
      }
      
      if (selectedGenre) {
        filteredBooks = filteredBooks.filter(book => 
          book.book_genres?.some(bg => bg.genres?.name === selectedGenre)
        );
      }

      setHasNextPage(filteredBooks.length === pageSize);

      if (reset) {
        setBooks(filteredBooks);
      } else {
        setBooks(prev => [...prev, ...filteredBooks]);
      }
      
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: 'Error',
        description: 'Failed to load books. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [pageSize, buildQuery, selectedCategory, selectedGenre, toast]);

  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchBooksPage(nextPage, false);
    }
  }, [loading, hasNextPage, currentPage, fetchBooksPage]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setHasNextPage(true);
    fetchBooksPage(0, true);
  }, [fetchBooksPage]);

  // Reset when filters change
  useEffect(() => {
    refresh();
  }, [searchQuery, selectedCategory, selectedGenre, refresh]);

  return {
    books,
    loading,
    hasNextPage,
    loadMore,
    refresh
  };
}
