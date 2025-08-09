import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CryptoPaymentModal } from '@/components/crypto/CryptoPaymentModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  Eye, 
  DollarSign,
  BookOpen,
  Coins
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useCryptoAuthor } from '@/hooks/useCryptoAuthor';
import { useMobileUtils } from '@/hooks/useMobileUtils';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  } | null;
  onRead: () => void;
}

export function BookModal({ isOpen, onClose, book, onRead }: BookModalProps) {
  const navigate = useNavigate();
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const { toast } = useToast();
  const { isMobile } = useMobileUtils();

  const { splitContract } = useCryptoAuthor();

  if (!book) {
    return null;
  }

  const formatPrice = (priceInCents?: number) => {
    if (!priceInCents || priceInCents === 0) return 'Free';
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const handlePurchase = () => {
    if (!splitContract?.contract_address) {
      toast({
        title: 'Crypto Payment Required',
        description: 'This author has not set up crypto payments yet.',
        variant: 'destructive',
      });
      return;
    }
    setShowCryptoModal(true);
  };

  const handleRead = () => {
    onClose();
    navigate(`/read/${book.id}`);
  };

  const isFree = !book.price_cents || book.price_cents === 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className={`
            ${isMobile 
              ? 'max-w-[95vw] max-h-[95vh] p-4 m-2' 
              : 'max-w-4xl max-h-[90vh]'
            } 
            overflow-y-auto
          `}
        >
          <DialogHeader className={isMobile ? 'pb-3' : 'pb-4'}>
            <DialogTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
              {book.title}
            </DialogTitle>
          </DialogHeader>

          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
            {/* Book Cover */}
            <div className={isMobile ? 'flex justify-center' : 'md:col-span-1'}>
              <img
                src={book.cover_image_url || '/placeholder.svg'}
                alt={book.title}
                className={`${isMobile ? 'w-48 h-64' : 'w-full aspect-[3/4]'} object-cover rounded-lg shadow-lg`}
              />
            </div>

            {/* Book Details */}
            <div className={`${isMobile ? '' : 'md:col-span-2'} space-y-4`}>
              <div>
                <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-600 dark:text-gray-400`}>
                  by {book.author_name}
                </p>
                {book.created_at && (
                  <p className="text-sm text-gray-500">
                    Published {formatDistanceToNow(new Date(book.created_at), { addSuffix: true })}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className={`flex items-center ${isMobile ? 'flex-wrap' : ''} gap-4 text-sm text-gray-600 dark:text-gray-400`}>
                {book.rating_average && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span>{book.rating_average.toFixed(1)}</span>
                    {book.rating_count && <span>({book.rating_count} reviews)</span>}
                  </div>
                )}
                {book.view_count && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{book.view_count} views</span>
                  </div>
                )}
              </div>

              {/* Categories and Genres */}
              <div className="space-y-3">
                {book.book_categories && book.book_categories.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Categories: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {book.book_categories.map((bc) => (
                        <Badge key={bc.category_id} variant="secondary" className="text-xs">
                          {bc.categories.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {book.book_genres && book.book_genres.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Genres: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {book.book_genres.map((bg) => (
                        <Badge key={bg.genre_id} variant="outline" className="text-xs">
                          {bg.genres.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  {isMobile ? (
                    <ScrollArea className="h-32">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm pr-4">
                        {book.description}
                      </p>
                    </ScrollArea>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>
              )}

              {/* Price and Purchase */}
              <Card>
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                        {formatPrice(book.price_cents)}
                      </span>
                      {splitContract?.contract_address && book.price_cents && book.price_cents > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Coins className="w-4 h-4" />
                          <span className="text-sm">Crypto available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {!isFree && (
                    <div className={`text-sm text-gray-600 dark:text-gray-400 ${isMobile ? 'mb-3' : 'mb-4'}`}>
                      <p>• Author receives 90% (${((book.price_cents || 0) * 0.9 / 100).toFixed(2)})</p>
                      <p>• Platform fee 10% (${((book.price_cents || 0) * 0.1 / 100).toFixed(2)})</p>
                    </div>
                  )}

                  <div className={`flex ${isMobile ? 'flex-col' : ''} gap-3`}>
                    {isFree ? (
                      <Button 
                        onClick={handleRead}
                        className={`${isMobile ? 'w-full' : 'flex-1'} bg-green-600 hover:bg-green-700`}
                        size={isMobile ? "lg" : "default"}
                      >
                        <BookOpen className="w-5 h-5 mr-2" />
                        Read for Free
                      </Button>
                    ) : (
                      <Button 
                        onClick={handlePurchase}
                        disabled={!splitContract?.contract_address}
                        className={`${isMobile ? 'w-full' : 'flex-1'}`}
                        size={isMobile ? "lg" : "default"}
                      >
                        <Coins className="w-5 h-5 mr-2" />
                        {splitContract?.contract_address 
                          ? `Pay ${formatPrice(book.price_cents)} USDC` 
                          : 'Crypto Not Available'
                        }
                      </Button>
                    )}
                  </div>

                  {!splitContract?.contract_address && book.price_cents && book.price_cents > 0 && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 text-center">
                      This author hasn't set up crypto payments yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
