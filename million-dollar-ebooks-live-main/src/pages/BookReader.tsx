import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PaymentService } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';
import { BookReaderContent } from '@/components/reader/BookReaderContent';
import { BookReaderLoading } from '@/components/reader/BookReaderLoading';
import { BookReaderNotFound } from '@/components/reader/BookReaderNotFound';
import { BookReaderPurchase } from '@/components/reader/BookReaderPurchase';
import { BookReaderSignIn } from '@/components/reader/BookReaderSignIn';

export default function BookReader() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Fetch book details
  const { data: book, isLoading: bookLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) throw new Error('Book ID is required');
      
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

  // Check if user owns the book
  useEffect(() => {
    const checkOwnership = async () => {
      if (!user?.id || !bookId) {
        setCheckingAccess(false);
        return;
      }

      try {
        const owns = await PaymentService.checkBookOwnership(bookId, user.id);
        setHasAccess(owns || (book?.price_cents === 0));
      } catch (error) {
        console.error('Error checking book ownership:', error);
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    if (book) {
      checkOwnership();
    }
  }, [user?.id, bookId, book]);

  const handlePurchase = async () => {
    if (!book || !user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to purchase books.",
        variant: "destructive",
      });
      return;
    }

    try {
      await PaymentService.purchaseBook({
        bookId: book.id,
        bookTitle: book.title,
        authorName: book.author_name,
        price: (book.price_cents || 0) / 100
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

  // Get book content - use the actual preview_text if available, or fallback to formatted sample
  const getBookContent = () => {
    if (!book) return '';
    
    // If the book has preview_text (imported content), use it
    if (book.preview_text && book.preview_text.trim()) {
      return book.preview_text;
    }
    
    // Otherwise, return formatted sample content
    return `<h1>${book.title}</h1>
<p><em>by ${book.author_name}</em></p>

<div class="page-break">• • •</div>

<p>${book.description || 'This is an amazing story that will captivate your imagination from the very first page. Every word has been carefully chosen to create an immersive experience that will stay with you long after you finish reading.'}</p>
`;
  };

  if (bookLoading || checkingAccess) {
    return <BookReaderLoading />;
  }

  if (!book) {
    return <BookReaderNotFound />;
  }

  if (!user) {
    return <BookReaderSignIn />;
  }

  if (!hasAccess) {
    return <BookReaderPurchase book={book} handlePurchase={handlePurchase} />;
  }

  return (
    <BookReaderContent
      content={getBookContent()}
      title={book.title}
      bookId={bookId}
      onClose={() => navigate('/discover')}
    />
  );
}
