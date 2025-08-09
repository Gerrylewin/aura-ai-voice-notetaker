
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface StoryAnalytics {
  id: string;
  title: string;
  story_date: string;
  view_count: number;
  click_count: number;
  total_reads: number;
  avg_read_time: number;
  total_reactions: number;
  heart_count: number;
  shock_count: number;
  thumbs_down_count: number;
  comment_count: number;
}

export function useStoryAnalyticsData() {
  const { user } = useAuth();
  const [storyAnalytics, setStoryAnalytics] = useState<StoryAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStoryAnalytics = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping analytics fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching story analytics for user:', user.id);

      // Get stories with basic data
      const { data: stories, error: storiesError } = await supabase
        .from('daily_stories')
        .select('id, title, story_date')
        .eq('author_id', user.id)
        .order('story_date', { ascending: false });

      if (storiesError) {
        console.error('Error fetching stories:', storiesError);
        throw storiesError;
      }

      console.log('Found stories:', stories?.length || 0);

      if (!stories || stories.length === 0) {
        console.log('No stories found for user');
        setStoryAnalytics([]);
        return;
      }

      const storyIds = stories.map(s => s.id);

      // Get view analytics (when users open story modal) - only from analytics table
      const { data: viewAnalytics, error: viewError } = await supabase
        .from('story_analytics')
        .select('story_id')
        .in('story_id', storyIds)
        .eq('event_type', 'view');

      if (viewError) {
        console.error('Error fetching view analytics:', viewError);
        throw viewError;
      }

      // Get click analytics (when users click "Read Full Story" or story links)
      const { data: clickAnalytics, error: clickError } = await supabase
        .from('story_analytics')
        .select('story_id')
        .in('story_id', storyIds)
        .eq('event_type', 'click');

      if (clickError) {
        console.error('Error fetching click analytics:', clickError);
        throw clickError;
      }

      // Get read analytics (completed reads with duration)
      const { data: readAnalytics, error: readError } = await supabase
        .from('story_analytics')
        .select('story_id, session_duration_seconds')
        .in('story_id', storyIds)
        .eq('event_type', 'read_complete');

      if (readError) {
        console.error('Error fetching read analytics:', readError);
        throw readError;
      }

      // Get reactions
      const { data: reactions, error: reactionsError } = await supabase
        .from('story_reactions')
        .select('story_id, reaction_type')
        .in('story_id', storyIds);

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError);
        throw reactionsError;
      }

      // Get comments
      const { data: comments, error: commentsError } = await supabase
        .from('story_comments')
        .select('story_id')
        .in('story_id', storyIds);

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        throw commentsError;
      }

      console.log('Analytics data fetched:', {
        views: viewAnalytics?.length || 0,
        clicks: clickAnalytics?.length || 0,
        reads: readAnalytics?.length || 0,
        reactions: reactions?.length || 0,
        comments: comments?.length || 0
      });

      // Process analytics data using only the analytics events
      const analytics = stories.map(story => {
        const storyViews = viewAnalytics?.filter(v => v.story_id === story.id) || [];
        const storyClicks = clickAnalytics?.filter(c => c.story_id === story.id) || [];
        const storyReads = readAnalytics?.filter(r => r.story_id === story.id) || [];
        const storyReactions = reactions?.filter(r => r.story_id === story.id) || [];
        const storyComments = comments?.filter(c => c.story_id === story.id) || [];

        const avgReadTime = storyReads.length > 0
          ? Math.round(storyReads.reduce((sum, r) => sum + (r.session_duration_seconds || 0), 0) / storyReads.length)
          : 0;

        const result = {
          id: story.id,
          title: story.title,
          story_date: story.story_date,
          view_count: storyViews.length, // Only count actual view events
          click_count: storyClicks.length, // Count actual click events
          total_reads: storyReads.length,
          avg_read_time: avgReadTime,
          total_reactions: storyReactions.length,
          heart_count: storyReactions.filter(r => r.reaction_type === 'heart').length,
          shock_count: storyReactions.filter(r => r.reaction_type === 'shock').length,
          thumbs_down_count: storyReactions.filter(r => r.reaction_type === 'thumbs-down').length,
          comment_count: storyComments.length,
        };

        console.log('Processed story analytics:', story.title, result);
        return result;
      });

      console.log('Final analytics processed:', analytics);
      setStoryAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching story analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auto-fetch when user is available
  useEffect(() => {
    if (user) {
      fetchStoryAnalytics();
    }
  }, [user, fetchStoryAnalytics]);

  return {
    storyAnalytics,
    loading,
    fetchStoryAnalytics,
  };
}
