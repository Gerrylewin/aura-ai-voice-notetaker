
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StoryBookmarkButtonProps {
  storyId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StoryBookmarkButton({ storyId, size = 'md' }: StoryBookmarkButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query to get user's bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['story-bookmarks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('story_bookmarks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isBookmarked = bookmarks?.some((bookmark: any) => bookmark.story_id === storyId) || false;

  // Mutation to add bookmark
  const addBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('story_bookmarks')
        .insert({ user_id: user.id, story_id: storyId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-bookmarks'] });
    },
  });

  // Mutation to remove bookmark
  const removeBookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('story_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story-bookmarks'] });
    },
  });

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to bookmark stories.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isBookmarked) {
        await removeBookmarkMutation.mutateAsync();
        toast({
          title: 'Bookmark removed',
          description: 'Story removed from your bookmarks.',
        });
      } else {
        await addBookmarkMutation.mutateAsync();
        toast({
          title: 'Story bookmarked',
          description: 'Story added to your bookmarks.',
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const buttonSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';

  const isLoading = addBookmarkMutation.isPending || removeBookmarkMutation.isPending;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`${buttonSize} p-0 rounded-full bg-transparent hover:bg-transparent border-0 shadow-none`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
    >
      {isBookmarked ? (
        <BookmarkCheck className={`${iconSize} text-red-500 fill-red-500`} />
      ) : (
        <Bookmark className={`${iconSize} text-red-500`} />
      )}
    </Button>
  );
}
