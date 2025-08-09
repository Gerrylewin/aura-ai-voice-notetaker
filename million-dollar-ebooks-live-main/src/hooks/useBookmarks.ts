
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useBookmarks() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          books(*, profiles:author_id(display_name, username))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useBookmarkMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bookId, action }: { bookId: string; action: 'add' | 'remove' }) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (action === 'add') {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, book_id: bookId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast({
        title: action === 'add' ? 'Book bookmarked!' : 'Bookmark removed',
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

export function useIsBookmarked(bookId: string) {
  const { data: bookmarks } = useBookmarks();
  return bookmarks?.some(bookmark => bookmark.book_id === bookId) || false;
}
