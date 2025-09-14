
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useReadingProgress() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reading-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('reading_progress')
        .select(`
          *,
          books(*, profiles:author_id(display_name, username))
        `)
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useReadingHistory() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reading-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('reading_history')
        .select(`
          *,
          books(*, profiles:author_id(display_name, username))
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateReadingProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ bookId, percentage }: { bookId: string; percentage: number }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Update reading history with conflict resolution
      const { error: historyError } = await supabase
        .from('reading_history')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          started_at: new Date().toISOString(),
          last_position: `${percentage}%`,
        }, {
          onConflict: 'user_id,book_id'
        });

      if (historyError) console.log('Reading history update failed:', historyError);

      // Update reading progress with conflict resolution
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          progress_percentage: percentage,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,book_id'
        });

      if (error) throw error;

      // Track analytics
      const { error: analyticsError } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user.id,
          event_type: 'reading_progress',
          event_data: {
            book_id: bookId,
            progress_percentage: percentage,
            timestamp: new Date().toISOString(),
          },
        });

      if (analyticsError) console.log('Analytics tracking failed:', analyticsError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress'] });
      queryClient.invalidateQueries({ queryKey: ['reading-history'] });
      queryClient.invalidateQueries({ queryKey: ['reader-dashboard-data'] });
    },
    onError: (error) => {
      console.error('Error updating reading progress:', error);
    },
  });
}
