
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertTriangle, Eye, EyeOff, Trash2, Flag, MoreVertical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StoryModerationActionsProps {
  storyId: string;
  authorId: string;
  isHidden?: boolean;
  onUpdate?: () => void;
}

export function StoryModerationActions({ 
  storyId, 
  authorId, 
  isHidden = false, 
  onUpdate 
}: StoryModerationActionsProps) {
  const { profile } = useAuth();
  const { toast } = useToast();

  const isModerator = profile?.user_role === 'moderator' || profile?.user_role === 'admin';
  const isAdmin = profile?.user_role === 'admin';

  if (!isModerator) return null;

  const handleHideStory = async () => {
    try {
      const { error } = await supabase
        .from('daily_stories')
        .update({ is_published: false })
        .eq('id', storyId);

      if (error) throw error;

      toast({
        title: 'Story Hidden',
        description: 'The story has been hidden from public view.',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error hiding story:', error);
      toast({
        title: 'Error',
        description: 'Failed to hide story. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleShowStory = async () => {
    try {
      const { error } = await supabase
        .from('daily_stories')
        .update({ is_published: true })
        .eq('id', storyId);

      if (error) throw error;

      toast({
        title: 'Story Restored',
        description: 'The story is now visible to the public.',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error showing story:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore story. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteStory = async () => {
    if (!isAdmin) {
      toast({
        title: 'Insufficient Permissions',
        description: 'Only administrators can delete stories.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;

      toast({
        title: 'Story Deleted',
        description: 'The story has been permanently deleted.',
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete story. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleWarnAuthor = async () => {
    try {
      // Create a warning notification for the author
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: authorId,
          type: 'content_warning',
          title: 'Content Warning',
          message: 'Your recent story has been flagged for review. Please ensure your content follows our community guidelines.',
          data: { story_id: storyId, warned_by: profile?.id }
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isHidden ? (
          <DropdownMenuItem onClick={handleShowStory}>
            <Eye className="w-4 h-4 mr-2" />
            Show Story
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleHideStory}>
            <EyeOff className="w-4 h-4 mr-2" />
            Hide Story
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleWarnAuthor}>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Warn Author
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {isAdmin && (
          <DropdownMenuItem 
            onClick={handleDeleteStory}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Story
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
