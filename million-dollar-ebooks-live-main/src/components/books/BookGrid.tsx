
import React from 'react';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: Array<{
    id: string;
    title: string;
    author_name: string;
    author_id: string;
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
  }>;
  loading?: boolean;
}

export function BookGrid({ books, loading }: BookGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[3/5] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No books found. Be the first to publish a book!</p>
      </div>
    );
  }

  console.log('BookGrid rendering books:', books.length);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
        />
      ))}
    </div>
  );
}
