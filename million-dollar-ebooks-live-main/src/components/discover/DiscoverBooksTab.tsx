
import React, { useState, useEffect } from 'react';
import { VirtualizedBookGrid } from '@/components/books/VirtualizedBookGrid';
import { CategoryFilter } from '@/components/filters/CategoryFilter';
import { GenreFilter } from '@/components/filters/GenreFilter';
import { Filter } from 'lucide-react';
import { usePaginatedBooks } from '@/hooks/usePaginatedBooks';

interface DiscoverBooksTabProps {
  searchQuery: string;
  selectedCategory?: string;
  selectedGenre?: string;
  onCategoryChange: (category?: string) => void;
  onGenreChange: (genre?: string) => void;
  showFilters: boolean;
}

export function DiscoverBooksTab({
  searchQuery,
  selectedCategory,
  selectedGenre,
  onCategoryChange,
  onGenreChange,
  showFilters
}: DiscoverBooksTabProps) {
  const { books, loading, hasNextPage, loadMore } = usePaginatedBooks({
    searchQuery,
    selectedCategory,
    selectedGenre,
    pageSize: 20
  });

  // Load more when scrolling near bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
        hasNextPage &&
        !loading
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, loading, loadMore]);

  // Transform books to ensure they have all required properties for VirtualizedBookGrid
  const transformedBooks = books.map(book => ({
    id: book.id,
    title: book.title,
    author_name: book.author_name,
    author_id: book.author_id || '', // Provide default if missing
    description: book.description,
    cover_image_url: book.cover_image_url,
    price_cents: book.price_cents,
    rating_average: book.rating_average,
    rating_count: book.rating_count,
    view_count: book.view_count || 0,
    download_count: book.download_count || 0,
    created_at: book.created_at,
    book_categories: book.book_categories || [],
    book_genres: book.book_genres || []
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full overflow-hidden">
      <aside className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'} min-w-0`}>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Filter className="w-5 h-5" />
            Filters
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
          <GenreFilter
            selectedGenre={selectedGenre}
            onGenreChange={onGenreChange}
          />
        </div>
      </aside>

      <main className="lg:col-span-3 min-w-0 overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {loading && books.length === 0 ? 'Loading books...' : `${books.length}+ books found`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedCategory && `Category: ${selectedCategory} • `}
              {selectedGenre && `Genre: ${selectedGenre} • `}
              {searchQuery && `Search: "${searchQuery}"`}
            </p>
          </div>
        </div>
        
        <div className="w-full overflow-hidden">
          <VirtualizedBookGrid books={transformedBooks} loading={loading && books.length === 0} />
        </div>
        
        {loading && books.length > 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading more books...</p>
          </div>
        )}
      </main>
    </div>
  );
}
