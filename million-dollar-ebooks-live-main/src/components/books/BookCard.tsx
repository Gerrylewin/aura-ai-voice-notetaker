import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookModal } from '@/components/book/BookModal';
import { StoryBookmarkButton } from '@/components/stories/StoryBookmarkButton';
import { CryptoPaymentModal } from '@/components/crypto/CryptoPaymentModal';
import { 
  Star, 
  Eye, 
  DollarSign,
  Coins
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useCryptoAuthor } from '@/hooks/useCryptoAuthor';

interface BookCardProps {
  book: {
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
  };
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();

  // Get split contract for the book's author
  const { splitContract } = useCryptoAuthor();

  const formatPrice = (priceInCents?: number) => {
    if (!priceInCents || priceInCents === 0) return 'Free';
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const handleCryptoPurchase = () => {
    if (!splitContract?.contract_address) {
      toast({
        title: 'Crypto Not Available',
        description: 'This author has not set up crypto payments yet.',
        variant: 'destructive',
      });
      return;
    }
    setShowCryptoModal(true);
  };

  const handleReadBook = () => {
    setShowModal(false);
    navigate(`/book/${book.id}`);
  };

  return (
    <>
      <Card 
        className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-0 bg-white dark:bg-gray-800 shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowModal(true)}
      >
        {/* Book Cover Section */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
          <img
            src={book.cover_image_url || '/placeholder.svg'}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Top Corner Elements */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
            <div className="flex gap-2">
              {book.price_cents === 0 && (
                <Badge className="bg-emerald-500 text-white border-0 shadow-lg text-xs px-2 py-1 font-medium">
                  Free
                </Badge>
              )}
              {book.book_categories?.length && (
                <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs px-2 py-1 font-medium backdrop-blur-sm">
                  {book.book_categories[0].categories.name}
                </Badge>
              )}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <StoryBookmarkButton storyId={book.id} size="sm" />
            </div>
          </div>

          {/* Frosty translucent overlay for bottom half */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/90 via-white/70 to-transparent backdrop-blur-sm">
            {/* Content in overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                {book.title}
              </h3>
              <p className="text-gray-700 text-xs mb-2 font-medium">
                by {book.author_name}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {book.rating_average && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-medium text-gray-800">{book.rating_average.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-emerald-700">
                      {formatPrice(book.price_cents)}
                    </span>
                    {splitContract?.contract_address && book.price_cents && book.price_cents > 0 && (
                      <Coins className="w-3 h-3 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Hover Overlay */}
          <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="text-center text-white">
              <p className="text-lg font-semibold">Click for more details</p>
              {splitContract?.contract_address && book.price_cents && book.price_cents > 0 && (
                <p className="text-sm mt-2 flex items-center justify-center gap-1">
                  <Coins className="w-4 h-4" />
                  Crypto payments available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Publication Date */}
        {book.created_at && (
          <div className="p-3 bg-white dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center">
              Published {formatDistanceToNow(new Date(book.created_at), { addSuffix: true })}
            </p>
          </div>
        )}
      </Card>

      <BookModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        book={book}
        onRead={handleReadBook}
      />

      {splitContract?.contract_address && book.price_cents && book.price_cents > 0 && (
        <CryptoPaymentModal
          isOpen={showCryptoModal}
          onClose={() => setShowCryptoModal(false)}
          book={{
            id: book.id,
            title: book.title,
            author_name: book.author_name,
            author_id: book.author_id,
            price_cents: book.price_cents,
            cover_image_url: book.cover_image_url,
          }}
          splitContractAddress={splitContract.contract_address}
        />
      )}
    </>
  );
}
