
import { useState, useEffect, useCallback } from 'react';
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
  is_daily_winner?: boolean;
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
}

export function usePaginatedStories(pageSize: number = 10) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

  const checkTodaySubmission = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_stories')
        .select('id')
        .eq('author_id', user.id)
        .eq('story_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking today submission:', error);
        return;
      }

      setHasSubmittedToday(!!data);
    } catch (error) {
      console.error('Error in checkTodaySubmission:', error);
    }
  }, [user]);

  const fetchStoriesPage = useCallback(async (page: number, reset: boolean = false) => {
    setLoading(true);
    
    try {
      const offset = page * pageSize;
      
      const { data: basicStories, error: storiesError } = await supabase
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
          profiles:author_id (
            display_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (storiesError) throw storiesError;

      setHasNextPage(basicStories.length === pageSize);

      if (!basicStories || basicStories.length === 0) {
        if (reset) setStories([]);
        setLoading(false);
        return;
      }

      const storyIds = basicStories.map(story => story.id);
      
      const [reactionsData, winnersData, userReactionsData] = await Promise.all([
        supabase
          .from('story_reactions')
          .select('story_id, reaction_type')
          .in('story_id', storyIds),
          
        supabase
          .from('daily_story_winners')
          .select('story_id')
          .in('story_id', storyIds),
          
        user ? supabase
          .from('story_reactions')
          .select('story_id, reaction_type')
          .eq('user_id', user.id)
          .in('story_id', storyIds) : Promise.resolve({ data: [] })
      ]);

      const reactionCounts: Record<string, any> = {};
      reactionsData.data?.forEach(reaction => {
        if (!reactionCounts[reaction.story_id]) {
          reactionCounts[reaction.story_id] = { heart: 0, shock: 0, 'thumbs-down': 0 };
        }
        reactionCounts[reaction.story_id][reaction.reaction_type]++;
      });

      const winnerIds = new Set(winnersData.data?.map(w => w.story_id) || []);

      const userReactions: Record<string, string> = {};
      userReactionsData.data?.forEach(reaction => {
        userReactions[reaction.story_id] = reaction.reaction_type;
      });

      const enhancedStories: StoryWithProfile[] = basicStories.map(story => ({
        ...story,
        profiles: story.profiles || { display_name: 'Anonymous', avatar_url: null },
        reactions: reactionCounts[story.id] || { heart: 0, shock: 0, 'thumbs-down': 0 },
        user_reaction: userReactions[story.id],
        is_daily_winner: winnerIds.has(story.id)
      }));

      if (reset) {
        setStories(enhancedStories);
      } else {
        setStories(prev => [...prev, ...enhancedStories]);
      }
      
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stories. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [pageSize, user, toast]);

  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchStoriesPage(nextPage, false);
    }
  }, [loading, hasNextPage, currentPage, fetchStoriesPage]);

  const refresh = useCallback(() => {
    setCurrentPage(0);
    setHasNextPage(true);
    fetchStoriesPage(0, true);
  }, [fetchStoriesPage]);

  const submitStory = useCallback(async (storyData: { title: string; description: string; content: string }) => {
    if (!user || !profile) {
      throw new Error('User must be authenticated with a complete profile to submit stories');
    }

    try {
      const { data: newStory, error } = await supabase
        .from('daily_stories')
        .insert({
          title: storyData.title,
          description: storyData.description,
          content: storyData.content,
          author_id: user.id,
          story_date: new Date().toISOString().split('T')[0],
        })
        .select(`
          id,
          title,
          description,
          content,
          author_id,
          story_date,
          created_at,
          view_count
        `)
        .single();

      if (error) throw error;

      const newStoryWithProfile: StoryWithProfile = {
        ...newStory,
        profiles: {
          display_name: profile.display_name || 'Anonymous',
          avatar_url: profile.avatar_url || null
        },
        reactions: { heart: 0, shock: 0, 'thumbs-down': 0 },
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
  }, [user, profile, toast]);

  useEffect(() => {
    fetchStoriesPage(0, true);
    checkTodaySubmission();
  }, [fetchStoriesPage, checkTodaySubmission]);

  return {
    stories,
    loading,
    hasNextPage,
    hasSubmittedToday,
    loadMore,
    refresh,
    submitStory,
    checkTodaySubmission
  };
}
