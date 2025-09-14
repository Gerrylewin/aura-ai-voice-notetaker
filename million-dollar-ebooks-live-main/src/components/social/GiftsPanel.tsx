
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Heart, BookOpen, Star } from 'lucide-react';
import { useBookGifts } from '@/hooks/useBookGifts';
import { ThankYouModal } from './ThankYouModal';
import { BookReader } from '@/components/reader/BookReader';

export function GiftsPanel() {
  const { receivedGifts, sentGifts } = useBookGifts();
  const [showThankModal, setShowThankModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [showBookReader, setShowBookReader] = useState(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const handleReadNow = (gift: any) => {
    setSelectedBook({
      title: gift.book?.title || 'Unknown Book',
      content: gift.book?.preview_text || 'Book content not available.',
      author: gift.book?.author_name || 'Unknown Author'
    });
    setShowBookReader(true);
  };

  const handleThank = (gift: any) => {
    setSelectedGift(gift);
    setShowThankModal(true);
  };

  if (showBookReader && selectedBook) {
    return (
      <BookReader
        content={selectedBook.content}
        title={selectedBook.title}
        onClose={() => setShowBookReader(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Received Gifts
          </h3>
          <div className="space-y-4">
            {receivedGifts.map((gift) => (
              <div key={gift.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <img 
                    src={gift.book?.cover_image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150&h=200&fit=crop'} 
                    alt={gift.book?.title} 
                    className="w-12 h-16 object-cover rounded" 
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{gift.book?.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">From {gift.giver?.display_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(gift.created_at).toLocaleDateString()}
                    </p>
                    {gift.gift_message && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">"{gift.gift_message}"</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleReadNow(gift)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleThank(gift)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Thank
                  </Button>
                </div>
              </div>
            ))}
            {receivedGifts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No gifts received yet. Ask your friends to send you some books!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5" />
            Sent Gifts
          </h3>
          <div className="space-y-3">
            {sentGifts.map((gift) => (
              <div key={gift.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{gift.book?.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">To {gift.recipient?.display_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(gift.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    gift.status === 'claimed' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {gift.status === 'claimed' ? 'Claimed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
            {sentGifts.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No gifts sent yet. Share some great books with your friends!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedGift && showThankModal && (
        <ThankYouModal
          isOpen={showThankModal}
          onClose={() => setShowThankModal(false)}
          giftId={selectedGift.id}
          bookTitle={selectedGift.book?.title || 'Unknown Book'}
          giftFrom={selectedGift.giver?.display_name || 'Unknown'}
        />
      )}
    </div>
  );
}
