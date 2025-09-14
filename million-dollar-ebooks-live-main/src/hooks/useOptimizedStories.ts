
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useMemo } from 'react';

interface StoryWithProfile {
  id: string;
  title: string;
  description?: string;
  content: string;
  author_id: string;
  story_date: string;
  created_at: string;
  view_count: number;
  read_count: number;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
  reactions: {
    heart: number;
    shock: number;
    'thumbs-down': number;
  };
  user_reaction?: string;
  is_daily_winner?: boolean;
}

export function useOptimizedStories() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Memoize today's date to prevent unnecessary recalculations
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch stories with React Query
  const {
    data: stories = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['stories'],
    queryFn: async (): Promise<StoryWithProfile[]> => {
      console.log('🔄 Fetching stories from database...');
      
      const { data, error } = await supabase
        .from('daily_stories')
        .select(`
          id,
          title,
          description,
          content,
          author_id,
          story_date,
          created_at,
          view_count,
          read_count,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform the data to match expected format
      return (data || []).map(story => ({
        ...story,
        description: story.description || '',
        profiles: story.profiles || { display_name: 'Anonymous', avatar_url: null },
        reactions: { heart: 0, shock: 0, 'thumbs-down': 0 },
        user_reaction: undefined,
        is_daily_winner: false,
        read_count: story.read_count || 0
      }));
    },
    staleTime: 2 * 60 * 1000, // Stories are fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Check if user has submitted today with React Query
  const {
    data: hasSubmittedToday = false,
  } = useQuery({
    queryKey: ['user-daily-submission', profile?.id, today],
    queryFn: async (): Promise<boolean> => {
      if (!user || !profile) return false;

      console.log('🔄 Checking today\'s submission status...');
      
      const { data, error } = await supabase
        .from('daily_stories')
        .select('id')
        .eq('author_id', profile.id)
        .eq('story_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking today submission:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!(user && profile),
    staleTime: 1 * 60 * 1000, // Fresh for 1 minute
  });

  // Submit story mutation with optimistic updates
  const submitStoryMutation = useMutation({
    mutationFn: async (storyData: { title: string; description: string; content: string }) => {
      if (!user || !profile) {
        throw new Error('User must be authenticated with a complete profile to submit stories');
      }

      console.log('📝 Submitting new story...');
      
      const { data: newStory, error } = await supabase
        .from('daily_stories')
        .insert({
          title: storyData.title,
          description: storyData.description || null,
          content: storyData.content,
          author_id: profile.id,
          story_date: today,
          is_published: true,
          view_count: 0,
          read_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...newStory,
        description: newStory.description || '',
        profiles: {
          display_name: profile.display_name || 'Anonymous',
          avatar_url: profile.avatar_url || null
        },
        reactions: { heart: 0, shock: 0, 'thumbs-down': 0 },
        user_reaction: undefined,
        read_count: 0,
        view_count: 0,
        is_daily_winner: false
      } as StoryWithProfile;
    },
    onSuccess: (newStory) => {
      // Optimistically update the stories cache
      queryClient.setQueryData(['stories'], (oldStories: StoryWithProfile[] = []) => {
        return [newStory, ...oldStories];
      });

      // Update submission status
      queryClient.setQueryData(['user-daily-submission', profile?.id, today], true);

      toast({
        title: 'Story Submitted!',
        description: 'Your story has been published successfully.',
      });

      console.log('✅ Story submitted and cache updated');
    },
    onError: (error) => {
      console.error('❌ Error submitting story:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit story. Please try again.',
        variant: 'destructive'
      });
    }
  });

  return {
    stories,
    loading,
    error,
    hasSubmittedToday,
    submitStory: submitStoryMutation.mutate,
    isSubmitting: submitStoryMutation.isPending,
    checkTodaySubmission: () => {
      // Invalidate the submission check to refetch
      queryClient.invalidateQueries({ queryKey: ['user-daily-submission', profile?.id, today] });
    },
    refetch: () => {
      // Invalidate both stories and submission status
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['user-daily-submission', profile?.id, today] });
    }
  };
}
