
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Download, 
  Star, 
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BookStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author_name: string;
    cover_image_url?: string;
    view_count?: number;
    download_count?: number;
    rating_average?: number;
    rating_count?: number;
    created_at?: string;
    book_categories?: Array<{ category_id: string; categories: { name: string; slug: string } }>;
    book_genres?: Array<{ genre_id: string; genres: { name: string; slug: string } }>;
  } | null;
}

export function BookStatsModal({ isOpen, onClose, book }: BookStatsModalProps) {
  if (!book) {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-6">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="flex items-center gap-3">
            <img 
              src={book.cover_image_url || '/placeholder.svg'} 
              alt={book.title} 
              className="w-12 h-16 object-cover rounded" 
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white break-words">
                {book.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">by {book.author_name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Key Stats Cards - Only show if data exists */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {book.view_count !== undefined && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Total Views</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {book.view_count.toLocaleString()}
                </p>
              </div>
            )}

            {book.download_count !== undefined && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Downloads</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {book.download_count.toLocaleString()}
                </p>
              </div>
            )}

            {book.rating_average && book.rating_count && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-600">Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {book.rating_average.toFixed(1)}
                  </span>
                  {renderStars(book.rating_average)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {book.rating_count} reviews
                </p>
              </div>
            )}
          </div>

          {/* Show message if no stats available */}
          {!book.view_count && !book.download_count && !book.rating_average && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No analytics data available for this book yet.
              </p>
            </div>
          )}

          {/* Categories and Genres */}
          {(book.book_categories?.length || book.book_genres?.length) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Categories & Genres
              </h3>
              
              <div className="space-y-3">
                {book.book_categories?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {book.book_categories.map((category) => (
                        <Badge key={category.category_id} variant="secondary" className="text-xs">
                          {category.categories.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {book.book_genres?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {book.book_genres.map((genre) => (
                        <Badge key={genre.genre_id} variant="outline" className="text-xs">
                          {genre.genres.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Publication Info */}
          {book.created_at && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900 dark:text-white">Publication Date</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Published {formatDistanceToNow(new Date(book.created_at), { addSuffix: true })}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
