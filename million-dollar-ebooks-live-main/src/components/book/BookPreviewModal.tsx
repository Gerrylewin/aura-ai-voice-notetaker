
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Download, Eye, X, BookOpen, Headphones } from 'lucide-react';
import { BookReader } from '@/components/reader/BookReader';
import { AudioExperience } from '@/components/audio/AudioExperience';
import { SocialShareButton } from '@/components/social/SocialShareButton';
import { PaymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

interface BookPreviewModalProps {
  book: {
    id: string;
    title: string;
    author: string;
    price: string;
    cover: string;
    description?: string;
    content?: string;
    isFree?: boolean;
    rating_average?: number;
    rating_count?: number;
    view_count?: number;
    download_count?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookPreviewModal({ book, isOpen, onClose }: BookPreviewModalProps) {
  // ✅ WORKING: Book reader state management - DO NOT BREAK
  const [showReader, setShowReader] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { toast } = useToast();

  // Don't render anything if book is null
  if (!book) {
    return null;
  }

  // ✅ WORKING: Sample content for preview (first 2-4 pages) - DO NOT BREAK
  const getPreviewContent = () => {
    if (book.content) {
      // Return first ~1000 words (approximately 2-4 pages)
      const words = book.content.split(' ').slice(0, 1000);
      return words.join(' ') + (book.content.split(' ').length > 1000 ? '...\n\n[Preview ends here]' : '');
    }
    
    // Default sample content for books without content
    return `Chapter 1: The Beginning

The morning sun cast long shadows across the quiet street as our story begins. This is where we first meet our protagonist, embarking on a journey that will change everything they thought they knew about the world.

The air was crisp with the promise of autumn, and leaves danced gently in the breeze. Each step forward seemed to echo with possibility, as if the universe itself was holding its breath, waiting to see what would unfold.

In the distance, a clock tower chimed the hour, its melodic tones carrying across the town like a herald announcing the start of something extraordinary. Little did anyone know that this seemingly ordinary day would mark the beginning of an adventure that would span continents and touch the lives of countless people.

As we turn the page, we invite you to join this incredible journey. The characters you're about to meet will become like old friends, their struggles and triumphs weaving a tapestry of human experience that resonates long after the final chapter.

${book.isFree ? '[Continue reading the full book...]' : '[This is a preview of the first few pages. To continue reading, please purchase the full book.]'}`;
  };

  // ✅ WORKING: Determine if book is free based on price - DO NOT BREAK
  const isFreeBook = book.price === 'Free' || book.price === '$0.00' || book.isFree;

  // ✅ WORKING: Handle reader view toggle - DO NOT BREAK
  const handleReadPreview = () => {
    console.log('Opening book reader for preview:', book.title);
    setShowReader(true);
  };

  const handleCloseReader = () => {
    setShowReader(false);
    setAudioEnabled(false);
  };

  const handleAudioPreview = () => {
    console.log('Opening audio preview for:', book.title);
    setAudioEnabled(true);
  };

  const handleCloseAudio = () => {
    setAudioEnabled(false);
  };

  const handlePurchase = async () => {
    try {
      const priceInCents = parseFloat(book.price.replace('$', '')) * 100;
      
      await PaymentService.purchaseBook({
        bookId: book.id,
        bookTitle: book.title,
        authorName: book.author,
        price: priceInCents / 100
      });
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  // ✅ WORKING: Full book reader view - DO NOT BREAK
  if (showReader) {
    return (
      <BookReader
        content={getPreviewContent()}
        title={`${book.title} ${isFreeBook ? '(Full Book)' : '(Preview)'}`}
        onClose={handleCloseReader}
      />
    );
  }

  // ✅ WORKING: Audio experience view - DO NOT BREAK
  if (audioEnabled) {
    return (
      <AudioExperience
        content={getPreviewContent()}
        title={book.title}
        onClose={handleCloseAudio}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-0">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left side - Book Cover */}
          <div className="lg:w-1/2 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-8">
            <div className="relative">
              <img
                src={book.cover}
                alt={book.title}
                className="w-80 h-[480px] object-cover rounded-lg shadow-2xl"
              />
              {isFreeBook && (
                <Badge className="absolute top-4 left-4 bg-green-600 text-white text-sm px-3 py-1">
                  Free Book
                </Badge>
              )}
            </div>
          </div>

          {/* Right side - Book Details */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Header */}
            <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700">
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Book Preview
              </DialogTitle>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Book Info */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {book.title}
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    by {book.author}
                  </p>
                </div>

                {/* Real Stats - only show if data exists */}
                {(book.rating_average || book.view_count || book.download_count) && (
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                    {book.rating_average && book.rating_count && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{book.rating_average.toFixed(1)} ({book.rating_count} reviews)</span>
                      </div>
                    )}
                    {book.view_count && book.view_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{book.view_count.toLocaleString()} views</span>
                      </div>
                    )}
                    {book.download_count && book.download_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{book.download_count.toLocaleString()} downloads</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    About This Book
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {book.description || "Experience an amazing journey in this captivating story. This book will take you on an adventure you won't forget, filled with compelling characters and an engaging plot that will keep you turning pages."}
                  </p>
                </div>

                {/* Social Sharing */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Share This Book
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    <SocialShareButton
                      title={book.title}
                      description={book.description || `Check out this amazing book by ${book.author}`}
                      platform="native"
                      size="sm"
                    />
                    <SocialShareButton
                      title={book.title}
                      description={book.description || `Check out this amazing book by ${book.author}`}
                      platform="twitter"
                      size="sm"
                    />
                    <SocialShareButton
                      title={book.title}
                      description={book.description || `Check out this amazing book by ${book.author}`}
                      platform="facebook"
                      size="sm"
                    />
                    <SocialShareButton
                      title={book.title}
                      description={book.description || `Check out this amazing book by ${book.author}`}
                      platform="linkedin"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {book.price}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={handleReadPreview}
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 h-12"
                  >
                    <BookOpen className="w-5 h-5" />
                    {isFreeBook ? 'Read Book' : 'Preview Pages'}
                  </Button>
                  
                  {!isFreeBook && (
                    <Button 
                      onClick={handlePurchase}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                    >
                      Buy {book.price}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 h-12"
                    onClick={handleAudioPreview}
                  >
                    <Headphones className="w-5 h-5" />
                    Audio Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
