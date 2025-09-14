
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock } from 'lucide-react';
import { BookReader } from '@/components/reader/BookReader';
import { useGamification } from '@/hooks/useGamification';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PaymentService } from '@/services/paymentService';

interface Book {
  id: string; // Changed from number to string
  title: string;
  author: string;
  progress: number;
  cover: string;
  lastRead: string;
}

interface ContinueReadingProps {
  books: Book[];
}

export function ContinueReading({ books }: ContinueReadingProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { user } = useAuth();
  const { startReadingSession } = useGamification();

  // Fetch the selected book's content when a book is selected
  const { data: bookContent, isLoading: loadingContent } = useQuery({
    queryKey: ['book-content', selectedBook?.id],
    queryFn: async () => {
      if (!selectedBook?.id || !user?.id) return null;

      // Check if user has access to this book
      const hasAccess = await PaymentService.checkBookOwnership(selectedBook.id, user.id);
      
      // Get book details
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', selectedBook.id)
        .single();

      if (bookError) throw bookError;

      // Check if book is free or user owns it
      if (!hasAccess && book.price_cents > 0) {
        throw new Error('Access denied - book not purchased');
      }

      // Get book content - try preview_text first, then book_content table
      let content = book.preview_text;
      
      if (!content) {
        const { data: bookContentData } = await supabase
          .from('book_content')
          .select('full_content, preview_content')
          .eq('book_id', selectedBook.id)
          .single();

        content = hasAccess ? bookContentData?.full_content : bookContentData?.preview_content;
      }

      // Fallback to formatted sample if no content available
      if (!content) {
        content = `<h1>${book.title}</h1>
<p><em>by ${book.author_name}</em></p>

<div class="page-break">• • •</div>

<p>${book.description || 'This book content is being prepared. Please check back soon.'}</p>`;
      }

      return {
        book,
        content,
        hasAccess
      };
    },
    enabled: !!selectedBook?.id && !!user?.id,
  });

  const handleContinueReading = (book: Book) => {
    startReadingSession(book.id);
    setSelectedBook(book);
  };

  const handleCloseReader = () => {
    setSelectedBook(null);
  };

  if (selectedBook && bookContent) {
    return (
      <BookReader
        content={bookContent.content}
        title={selectedBook.title}
        bookId={selectedBook.id}
        onClose={handleCloseReader}
      />
    );
  }

  if (selectedBook && loadingContent) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <BookOpen className="w-5 h-5" />
          Continue Reading
        </CardTitle>
      </CardHeader>
      <CardContent>
        {books.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No books in progress</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => (
              <div key={book.id} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{book.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{book.progress}%</span>
                    </div>
                    <Progress value={book.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {book.lastRead}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleContinueReading(book)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
