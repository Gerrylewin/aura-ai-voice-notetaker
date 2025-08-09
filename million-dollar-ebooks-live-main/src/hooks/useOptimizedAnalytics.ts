
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AnalyticsData {
  totalViews: number;
  totalReads: number;
  totalReactions: number;
  averageRating: number;
  topStories: Array<{
    id: string;
    title: string;
    view_count: number;
    reactions: number;
  }>;
}

export function useOptimizedAnalytics() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: analytics,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['analytics', profile?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!profile?.id) throw new Error('Profile not available');

      console.log('📊 Fetching analytics data...');

      // Fetch user's stories with analytics
      const { data: stories, error: storiesError } = await supabase
        .from('daily_stories')
        .select(`
          id,
          title,
          view_count,
          read_count
        `)
        .eq('author_id', profile.id)
        .eq('is_published', true);

      if (storiesError) throw storiesError;

      // Calculate totals
      const totalViews = stories?.reduce((sum, story) => sum + (story.view_count || 0), 0) || 0;
      const totalReads = stories?.reduce((sum, story) => sum + (story.read_count || 0), 0) || 0;

      // Get top performing stories
      const topStories = (stories || [])
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 5)
        .map(story => ({
          id: story.id,
          title: story.title,
          view_count: story.view_count || 0,
          reactions: 0 // TODO: Add reaction counts
        }));

      return {
        totalViews,
        totalReads,
        totalReactions: 0, // TODO: Calculate from reactions
        averageRating: 0, // TODO: Calculate average rating
        topStories
      };
    },
    enabled: !!profile?.id,
    staleTime: 3 * 60 * 1000, // Analytics fresh for 3 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return {
    analytics,
    loading,
    error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['analytics', profile?.id] }),
  };
}
