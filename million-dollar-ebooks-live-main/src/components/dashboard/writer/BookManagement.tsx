import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Edit, Eye, Calendar, Download, BarChart, Clock, Trash2 } from 'lucide-react';
import { BookAnalyticsModal } from '@/components/analytics/BookAnalyticsModal';
import { DeleteConfirmationDialog } from '@/components/chat/DeleteConfirmationDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookManagementProps {
  books: any[];
  onEditBook?: (book: any) => void;
  onCreateNewBook?: () => void;
}

export function BookManagement({
  books,
  onEditBook,
  onCreateNewBook
}: BookManagementProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [analyticsBook, setAnalyticsBook] = useState<any>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditBook = (book: any) => {
    if (onEditBook) {
      onEditBook(book);
    }
  };

  const handleCreateNewBook = () => {
    if (onCreateNewBook) {
      onCreateNewBook();
    }
  };

  const handleViewBook = (book: any) => {
    navigate(`/book/${book.id}`);
  };

  const handleShowAnalytics = (book: any) => {
    const transformedBook = {
      id: book.id,
      title: book.title,
      cover: book.cover_image_url || '/placeholder.svg'
    };
    setAnalyticsBook(transformedBook);
    setIsAnalyticsOpen(true);
  };

  const handleDeleteBook = async () => {
    if (!deleteBookId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('books').delete().eq('id', deleteBookId);
      if (error) throw error;
      toast({
        title: "Book Deleted",
        description: "Your book has been successfully deleted."
      });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: "Error",
        description: "Failed to delete book. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteBookId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'draft':
        return 'Pending Review';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const BookCover = ({ book }: { book: any }) => {
    if (!book.cover_image_url) {
      return (
        <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-gray-400" />
        </div>
      );
    }
    
    return (
      <div className="w-16 h-24 flex-shrink-0">
        <img
          src={book.cover_image_url}
          alt={`${book.title} cover`}
          className="w-full h-full object-cover rounded shadow-sm cursor-pointer hover:scale-105 transition-transform"
          onClick={() => window.open(book.cover_image_url, '_blank')}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center hidden">
          <BookOpen className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    );
  };

  // Separate books by status
  const draftBooks = books.filter(book => book.book_status === 'draft');
  const publishedBooks = books.filter(book => book.book_status === 'published');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Books</h3>
        <Button onClick={handleCreateNewBook} className="bg-red-600 hover:bg-red-700 text-white">
          <BookOpen className="w-4 h-4 mr-2" />
          Write New Book
        </Button>
      </div>

      {books.length === 0 ? (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No books yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start writing your first book to see it here.
            </p>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCreateNewBook}>
              <BookOpen className="w-4 h-4 mr-2" />
              Write Your First Book
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Review Section */}
          {draftBooks.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Review ({draftBooks.length})
              </h4>
              <div className="grid gap-4">
                {draftBooks.map(book => (
                  <Card key={book.id} className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <BookCover book={book} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {book.title}
                            </h4>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                              Pending Review
                            </Badge>
                          </div>
                          
                          {book.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                              {book.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Submitted {new Date(book.created_at).toLocaleDateString()}
                            </div>
                            {book.word_count > 0 && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {book.word_count.toLocaleString()} words
                              </div>
                            )}
                          </div>
                          
                          <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
                            📋 Your book is being reviewed by our team and will be published soon!
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditBook(book)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteBookId(book.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Published Books Section */}
          {publishedBooks.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Published Books ({publishedBooks.length})
              </h4>
              <div className="grid gap-4">
                {publishedBooks.map(book => (
                  <Card key={book.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <BookCover book={book} />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {book.title}
                            </h4>
                            <Badge variant={getStatusBadgeVariant(book.book_status)}>
                              {getStatusDisplay(book.book_status)}
                            </Badge>
                          </div>
                          
                          {book.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                              {book.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(book.created_at).toLocaleDateString()}
                            </div>
                            {book.word_count > 0 && (
                              <div className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {book.word_count.toLocaleString()} words
                              </div>
                            )}
                            {book.download_count > 0 && (
                              <div className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                {book.download_count} downloads
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditBook(book)}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          
                          <Button variant="outline" size="sm" onClick={() => handleViewBook(book)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleShowAnalytics(book)}>
                            <BarChart className="w-4 h-4 mr-1" />
                            Analytics
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeleteBookId(book.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {analyticsBook && (
        <BookAnalyticsModal 
          isOpen={isAnalyticsOpen} 
          onClose={() => setIsAnalyticsOpen(false)} 
          book={analyticsBook} 
        />
      )}

      <DeleteConfirmationDialog 
        isOpen={!!deleteBookId} 
        onConfirm={handleDeleteBook} 
        onCancel={() => setDeleteBookId(null)} 
      />
    </div>
  );
}
