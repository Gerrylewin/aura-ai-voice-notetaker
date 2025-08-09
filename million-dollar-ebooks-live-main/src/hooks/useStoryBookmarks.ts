
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useStoryBookmarks() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['story-bookmarks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('story_bookmarks')
        .select(`
          *,
          daily_stories(*, profiles:author_id(display_name, username))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useStoryBookmarkMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ storyId, action }: { storyId: string; action: 'add' | 'remove' }) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (action === 'add') {
        const { error } = await supabase
          .from('story_bookmarks')
          .insert({ user_id: user.id, story_id: storyId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('story_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('story_id', storyId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['story-bookmarks'] });
      toast({
        title: action === 'add' ? 'Story bookmarked!' : 'Bookmark removed',
        description: action === 'add' ? 'Added to your reading list' : 'Removed from your reading list',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useIsStoryBookmarked(storyId: string) {
  const { data: bookmarks } = useStoryBookmarks();
  return bookmarks?.some(bookmark => bookmark.story_id === storyId) || false;
}
