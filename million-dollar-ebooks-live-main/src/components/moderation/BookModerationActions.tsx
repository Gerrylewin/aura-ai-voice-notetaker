
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertTriangle, Eye, EyeOff, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BookModerationActionsProps {
  bookId: string;
  authorId: string;
  currentStatus: string;
  onUpdate?: () => void;
}

export function BookModerationActions({ 
  bookId, 
  authorId, 
  currentStatus, 
  onUpdate 
}: BookModerationActionsProps) {
  const { profile } = useAuth();
  const { toast } = useToast();

  const isModerator = profile?.user_role === 'moderator' || profile?.user_role === 'admin';
  const isAdmin = profile?.user_role === 'admin';

  if (!isModerator) return null;

  const handleHideBook = async () => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ book_status: 'archived' })
        .eq('id', bookId);

      if (error) throw error;

      toast({
        title: 'Book Hidden',
        description: 'The book has been hidden from public view.',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error hiding book:', error);
      toast({
        title: 'Error',
        description: 'Failed to hide book. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleShowBook = async () => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ book_status: 'published' })
        .eq('id', bookId);

      if (error) throw error;

      toast({
        title: 'Book Restored',
        description: 'The book is now visible to the public.',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error showing book:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore book. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteBook = async () => {
    if (!isAdmin) {
      toast({
        title: 'Insufficient Permissions',
        description: 'Only administrators can delete books.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;

      toast({
        title: 'Book Deleted',
        description: 'The book has been permanently deleted.',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete book. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleWarnAuthor = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: authorId,
          type: 'content_warning',
          title: 'Content Warning',
          message: 'Your book has been flagged for review. Please ensure your content follows our community guidelines.',
          data: { book_id: bookId, warned_by: profile?.id }
        });

      if (error) throw error;

      toast({
        title: 'Warning Sent',
        description: 'The author has been notified about the content concern.',
      });
    } catch (error) {
      console.error('Error sending warning:', error);
      toast({
        title: 'Error',
        description: 'Failed to send warning. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const isHidden = currentStatus === 'archived';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isHidden ? (
          <DropdownMenuItem onClick={handleShowBook}>
            <Eye className="w-4 h-4 mr-2" />
            Show Book
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleHideBook}>
            <EyeOff className="w-4 h-4 mr-2" />
            Hide Book
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleWarnAuthor}>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Warn Author
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {isAdmin && (
          <DropdownMenuItem 
            onClick={handleDeleteBook}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Book
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
