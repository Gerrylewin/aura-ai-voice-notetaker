import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookReaderPurchaseProps {
  book: any;
  handlePurchase: () => void;
}

export function BookReaderPurchase({ book, handlePurchase }: BookReaderPurchaseProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <img
          src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop'}
          alt={book.title}
          className="w-48 h-64 object-cover rounded-lg mx-auto mb-6 shadow-lg"
        />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">by {book.author_name}</p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You need to purchase this book to read the full content.
        </p>
        <div className="space-y-4">
          <Button 
            onClick={handlePurchase}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Buy for ${((book.price_cents || 0) / 100).toFixed(2)}
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/discover')}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </div>
      </div>
    </div>
  );
}
