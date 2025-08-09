
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, BookOpen, Verified, PenTool, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RoleBadge } from '@/components/ui/role-badge';

interface AuthorCardProps {
  author: {
    id: string;
    display_name: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    is_verified: boolean;
    user_role?: 'reader' | 'writer' | 'moderator' | 'admin';
    books: Array<{
      id: string;
      title: string;
      cover_image_url?: string;
      rating_average?: number;
      book_status?: string;
      book_genres: Array<{
        genres: {
          name: string;
          slug: string;
        };
      }>;
    }>;
  };
}

export function AuthorCard({ author }: AuthorCardProps) {
  const navigate = useNavigate();

  // Get all books (including drafts) to show author has written content
  const allBooks = author.books || [];
  const publishedBooks = allBooks.filter(book => book.book_status === 'published');
  
  // Get primary genres from all books (not just published ones)
  const genres = allBooks
    .flatMap(book => book.book_genres?.map(bg => bg.genres?.name) || [])
    .filter(Boolean)
    .reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topGenres = Object.entries(genres)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([genre]) => genre);

  const averageRating = publishedBooks.length > 0
    ? publishedBooks.reduce((sum, book) => sum + (book.rating_average || 0), 0) / publishedBooks.length
    : 0;

  const hasAnyBooks = allBooks.length > 0;
  const hasPublishedBooks = publishedBooks.length > 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/authors/${author.id}`)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Author Avatar */}
          <Avatar className="w-16 h-16 flex-shrink-0">
            <AvatarImage src={author.avatar_url || ''} />
            <AvatarFallback className="bg-red-600 text-white text-lg">
              {author.display_name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Author Name and Verification */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {author.display_name}
              </h3>
              {author.is_verified && (
                <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
              {author.user_role && (
                <RoleBadge userRole={author.user_role} size="sm" showText={false} />
              )}
              {/* Author Status Badge */}
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <Trophy className="w-3 h-3 mr-1" />
                Author
              </Badge>
            </div>

            {/* Username */}
            {author.username && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                @{author.username}
              </p>
            )}

            {/* Bio */}
            {author.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                {author.bio}
              </p>
            )}

            {/* Author Stats */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {hasPublishedBooks 
                    ? `${publishedBooks.length} published book${publishedBooks.length !== 1 ? 's' : ''}` 
                    : hasAnyBooks 
                      ? `${allBooks.length} book${allBooks.length !== 1 ? 's' : ''} in progress`
                      : 'Published stories'
                  }
                </span>
              </div>
              {averageRating > 0 && hasPublishedBooks && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Top Genres */}
            {topGenres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {topGenres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Book Covers Preview or Story Writer Badge */}
            {hasAnyBooks ? (
              <div className="flex gap-2">
                {allBooks.slice(0, 3).map((book) => (
                  <div key={book.id} className="w-8 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600" />
                    )}
                  </div>
                ))}
                {allBooks.length > 3 && (
                  <div className="w-8 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{allBooks.length - 3}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  <PenTool className="w-3 h-3 mr-1" />
                  Story Author
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
