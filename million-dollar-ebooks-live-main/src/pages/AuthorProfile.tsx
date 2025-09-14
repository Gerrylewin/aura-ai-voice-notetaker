
import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BookGrid } from '@/components/books/BookGrid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthorById } from '@/hooks/useAuthors';
import { Verified, BookOpen, Star, Calendar, ExternalLink, Users, PenTool } from 'lucide-react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useStories } from '@/hooks/useStories';

const AuthorProfile = () => {
  const { authorId } = useParams<{ authorId: string }>();
  const { data: author, isLoading, error } = useAuthorById(authorId!);
  const { stories } = useStories();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Author Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">The author you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Process books to add author_name for BookGrid compatibility
  const booksWithAuthorName = author.books?.map(book => ({
    ...book,
    author_name: author.display_name,
    author_id: author.id, // Ensure author_id is included
    description: book.description || undefined,
    cover_image_url: book.cover_image_url || undefined,
    price_cents: book.price_cents || undefined,
    rating_average: book.rating_average || undefined,
    rating_count: book.rating_count || undefined,
    view_count: 0,
    download_count: 0,
    book_categories: book.book_categories || [],
    book_genres: book.book_genres || []
  })) || [];

  const publishedBooks = booksWithAuthorName.filter(book => book.book_status === 'published');
  
  // Get author's stories
  const authorStories = stories.filter(story => story.author_id === author.id);
  
  const totalRatings = publishedBooks.reduce((sum, book) => sum + (book.rating_count || 0), 0);
  const avgRating = publishedBooks.length > 0 
    ? publishedBooks.reduce((sum, book) => sum + (book.rating_average || 0), 0) / publishedBooks.length 
    : 0;

  // Get unique genres from published books
  const genres = Array.from(new Set(
    publishedBooks
      .flatMap(book => book.book_genres?.map(bg => bg.genres?.name) || [])
      .filter(Boolean)
  )).slice(0, 3);

  const socialLinks = typeof author.social_links === 'object' && author.social_links ? author.social_links as Record<string, string> : {};
  const externalLinks = typeof author.external_links === 'object' && author.external_links ? author.external_links as Record<string, string> : {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Author Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={author.avatar_url} />
                  <AvatarFallback className="text-4xl">
                    {author.display_name?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {author.display_name}
                    </h1>
                    {author.is_verified && (
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <Verified className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {author.username && (
                    <p className="text-gray-600 dark:text-gray-400">@{author.username}</p>
                  )}
                </div>

                {author.bio && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {author.bio}
                  </p>
                )}

                {genres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Specializes in:</p>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <Badge key={genre} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {format(new Date(author.created_at), 'MMMM yyyy')}
                  </span>
                </div>

                {/* Social and External Links */}
                {(Object.keys(socialLinks).length > 0 || Object.keys(externalLinks).length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(socialLinks).map(([platform, url]) => (
                      <Button key={platform} variant="outline" size="sm" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {platform}
                        </a>
                      </Button>
                    ))}
                    {Object.entries(externalLinks).map(([name, url]) => (
                      <Button key={name} variant="outline" size="sm" asChild>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {name}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Author Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Books</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedBooks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stories Published</CardTitle>
              <PenTool className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{authorStories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRatings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Author's Books */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Published Works ({publishedBooks.length})
          </h2>
          
          {publishedBooks.length > 0 ? (
            <BookGrid books={publishedBooks} />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  This author hasn't published any books yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Author's Stories */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Daily Stories ({authorStories.length})
          </h2>
          
          {authorStories.length > 0 ? (
            <div className="grid gap-6">
              {authorStories.map((story) => (
                <Card key={story.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {story.title}
                        </h3>
                        {story.description && (
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            {story.description}
                          </p>
                        )}
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                          {story.content.substring(0, 200)}...
                        </p>
                      </div>
                      {story.is_daily_winner && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Daily Winner
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>{format(new Date(story.created_at), 'MMM d, yyyy')}</span>
                      <div className="flex items-center gap-4">
                        <span>{story.view_count} views</span>
                        <span>
                          {(story.reactions.heart + story.reactions.shock + story.reactions['thumbs-down'])} reactions
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  This author hasn't published any stories yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
