import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BookCard } from '@/components/books/BookCard';

export function BookReaderNotFound() {
  const navigate = useNavigate();
  const [suggestedBooks, setSuggestedBooks] = useState<any[]>([]);

  useEffect(() => {
    const fetchSuggestedBooks = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .limit(4);

      if (error) {
        console.error('Error fetching suggested books:', error);
      } else {
        setSuggestedBooks(data);
      }
    };

    fetchSuggestedBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The book you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/discover')} className="bg-red-600 hover:bg-red-700 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discover
        </Button>

        {suggestedBooks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Suggested Books</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}