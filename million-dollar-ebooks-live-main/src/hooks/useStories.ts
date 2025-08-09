
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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

export function useStories() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

  // Memoize today's date to prevent unnecessary recalculations
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
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
        .limit(20); // Limit initial load for better performance

      if (error) {
        setError(error);
      } else {
        // Transform the data to match expected format
        const transformedStories: StoryWithProfile[] = (data || []).map(story => ({
          ...story,
          description: story.description || '',
          profiles: story.profiles || { display_name: 'Anonymous', avatar_url: null },
          reactions: { heart: 0, shock: 0, 'thumbs-down': 0 },
          user_reaction: undefined,
          is_daily_winner: false,
          read_count: story.read_count || 0
        }));
        setStories(transformedStories);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkTodaySubmission = useCallback(async () => {
    if (!user || !profile) {
      setHasSubmittedToday(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('daily_stories')
        .select('id')
        .eq('author_id', profile.id)
        .eq('story_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking today submission:', error);
        return;
      }

      setHasSubmittedToday(!!data);
    } catch (error) {
      console.error('Error in checkTodaySubmission:', error);
      setHasSubmittedToday(false);
    }
  }, [user, profile, today]);

  const submitStory = useCallback(async (storyData: { title: string; description: string; content: string }) => {
    if (!user || !profile) {
      throw new Error('User must be authenticated with a complete profile to submit stories');
    }

    try {
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

      if (error) {
        console.error('Error submitting story:', error);
        throw error;
      }

      const newStoryWithProfile: StoryWithProfile = {
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
      };

      setStories(prev => [newStoryWithProfile, ...prev]);
      setHasSubmittedToday(true);

      toast({
        title: 'Story Submitted!',
        description: 'Your story has been published successfully.',
      });

      return newStoryWithProfile;
    } catch (error) {
      console.error('Error submitting story:', error);
      throw error;
    }
  }, [user, profile, toast, today]);

  // Only fetch stories and check submission status on mount or when user changes
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    if (user && profile) {
      checkTodaySubmission();
    }
  }, [user, profile, checkTodaySubmission]);

  return {
    stories,
    loading,
    error,
    hasSubmittedToday,
    submitStory,
    checkTodaySubmission,
    refetch: fetchStories
  };
}
