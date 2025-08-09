
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Check, X, Calendar, FileText, User, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/providers/ReactQueryProvider';
import { formatDistanceToNow } from 'date-fns';

interface BookReviewCardProps {
  book: any;
  onStatusUpdate: () => void;
}

export function BookReviewCard({ book, onStatusUpdate }: BookReviewCardProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('books')
        .update({ 
          book_status: 'published',
          publication_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', book.id);

      if (error) throw error;

      // Send notification to author
      await supabase
        .from('notifications')
        .insert({
          user_id: book.author_id,
          type: 'book_approved',
          title: 'Book Approved!',
          message: `Your book "${book.title}" has been approved and is now published.`,
          data: { book_id: book.id, book_title: book.title }
        });

      // Invalidate caches for immediate updates across the app
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['user-books'] });
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-content'] });

      toast({
        title: 'Book Approved',
        description: `"${book.title}" has been published successfully.`
      });

      onStatusUpdate();
    } catch (error) {
      console.error('Error approving book:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve book. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      toast({
        title: 'Review Notes Required',
        description: 'Please provide feedback for the author before rejecting.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('books')
        .update({ 
          book_status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', book.id);

      if (error) throw error;

      // Send notification to author with feedback
      await supabase
        .from('notifications')
        .insert({
          user_id: book.author_id,
          type: 'book_rejected',
          title: 'Book Needs Revision',
          message: `Your book "${book.title}" needs some changes before publication. Please review the feedback and resubmit.`,
          data: { 
            book_id: book.id, 
            book_title: book.title,
            feedback: reviewNotes
          }
        });

      // Invalidate caches for immediate updates
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['user-books'] });
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-content'] });

      toast({
        title: 'Book Rejected',
        description: `Feedback sent to author for "${book.title}".`
      });

      onStatusUpdate();
      setShowReviewForm(false);
      setReviewNotes('');
    } catch (error) {
      console.error('Error rejecting book:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject book. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const BookCover = ({ book }: { book: any }) => {
    if (!book.cover_image_url) {
      return (
        <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-gray-400" />
        </div>
      );
    }
    
    return (
      <img
        src={book.cover_image_url}
        alt={`${book.title} cover`}
        className="w-20 h-28 object-cover rounded shadow-sm"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  };

  // Check if this is a recently updated book (cover upload scenario)
  const isRecentUpdate = book.updated_at && book.created_at && 
    new Date(book.updated_at).getTime() > new Date(book.created_at).getTime() + 60000; // More than 1 minute difference

  return (
    <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <BookCover book={book} />
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900 dark:text-white mb-2">
                {book.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {book.author_name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {isRecentUpdate ? 'Updated' : 'Submitted'} {formatDistanceToNow(new Date(book.updated_at || book.created_at), { addSuffix: true })}
                </div>
                {book.word_count > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {book.word_count.toLocaleString()} words
                  </div>
                )}
                {book.cover_image_url && isRecentUpdate && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Image className="w-4 h-4" />
                    Cover Updated
                  </div>
                )}
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                {isRecentUpdate ? 'Updated - Pending Review' : 'Pending Review'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {book.description && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
              {book.description}
            </p>
          </div>
        )}

        {book.preview_text && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Content Preview</h4>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
              {book.preview_text.substring(0, 300)}
              {book.preview_text.length > 300 && '...'}
            </div>
          </div>
        )}

        {isRecentUpdate && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Recent Update
            </h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              This book was recently updated and needs re-approval. Please review the changes, especially the cover image.
            </p>
          </div>
        )}

        {showReviewForm && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Review Feedback</h4>
            <Textarea
              placeholder="Provide feedback for the author about what needs to be changed..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            Approve & Publish
          </Button>
          
          {showReviewForm ? (
            <>
              <Button
                onClick={handleReject}
                disabled={isProcessing || !reviewNotes.trim()}
                variant="destructive"
              >
                <X className="w-4 h-4 mr-2" />
                Send Feedback & Reject
              </Button>
              <Button
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewNotes('');
                }}
                variant="outline"
                disabled={isProcessing}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setShowReviewForm(true)}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Request Changes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
