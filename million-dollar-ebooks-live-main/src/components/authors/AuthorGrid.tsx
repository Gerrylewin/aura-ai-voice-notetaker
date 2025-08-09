
import React from 'react';
import { AuthorCard } from './AuthorCard';

interface AuthorGridProps {
  authors: Array<{
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
  }>;
  loading?: boolean;
}

export function AuthorGrid({ authors, loading }: AuthorGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No authors found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {authors.map((author) => (
        <AuthorCard key={author.id} author={author} />
      ))}
    </div>
  );
}
