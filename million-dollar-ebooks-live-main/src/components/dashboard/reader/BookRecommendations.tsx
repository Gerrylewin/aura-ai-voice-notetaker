
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  id: string; // Changed from number to string
  title: string;
  author: string;
  rating: number;
  cover: string;
  price: string;
}

interface BookRecommendationsProps {
  recommendations: Recommendation[];
}

export function BookRecommendations({ recommendations }: BookRecommendationsProps) {
  const navigate = useNavigate();

  const handleViewBook = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <TrendingUp className="w-5 h-5" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No recommendations available</p>
        ) : (
          <div className="space-y-4">
            {recommendations.map((book) => (
              <div key={book.id} className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{book.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">by {book.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{book.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">{book.price}</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewBook(book.id)}
                    className="mt-2 h-6 px-2 text-xs border-gray-300 dark:border-gray-600"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
