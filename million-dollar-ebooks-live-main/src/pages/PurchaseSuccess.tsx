
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, BookOpen, ArrowRight } from 'lucide-react';
import { PaymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function PurchaseSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [bookId, setBookId] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const bookIdFromUrl = searchParams.get('book_id');

  // Fetch book details once we have the bookId
  const { data: book } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          profiles:author_id(display_name, username)
        `)
        .eq('id', bookId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });

  useEffect(() => {
    const processPurchase = async () => {
      if (sessionId) {
        try {
          const result = await PaymentService.processPurchase(sessionId);
          setBookId(result.bookId || bookIdFromUrl);
          toast({
            title: "Purchase Successful!",
            description: "You now have access to the full book.",
          });
        } catch (error) {
          toast({
            title: "Processing Error",
            description: "There was an issue processing your purchase. Please contact support.",
            variant: "destructive",
          });
        }
      } else if (bookIdFromUrl) {
        setBookId(bookIdFromUrl);
      }
      setProcessing(false);
    };

    processPurchase();
  }, [sessionId, bookIdFromUrl, toast]);

  const handleReadBook = () => {
    if (bookId) {
      navigate(`/book/${bookId}/read`);
    }
  };

  const handleBackToDiscover = () => {
    navigate('/discover');
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-lg mx-auto bg-white dark:bg-gray-800 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Purchase Successful!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Thank you for your purchase. You now have full access to the book.
              </p>
            </div>

            {book && (
              <div className="mb-6">
                <img
                  src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=280&fit=crop'}
                  alt={book.title}
                  className="w-32 h-44 object-cover rounded-lg mx-auto mb-4 shadow-md"
                />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{book.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">by {book.author_name}</p>
              </div>
            )}

            <div className="space-y-4">
              {bookId && (
                <Button 
                  onClick={handleReadBook}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start Reading Now
                </Button>
              )}
              
              <Button 
                onClick={handleBackToDiscover}
                variant="outline"
                className="w-full"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Discover More Books
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
