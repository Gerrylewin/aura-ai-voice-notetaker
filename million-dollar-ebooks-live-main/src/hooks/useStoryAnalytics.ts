
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useStoryAnalytics() {
  const { user } = useAuth();

  const trackStoryView = useCallback(async (storyId: string) => {
    try {
      console.log('Tracking story view for:', storyId);
      
      // Track analytics event for view
      const { error } = await supabase
        .from('story_analytics')
        .insert({
          story_id: storyId,
          user_id: user?.id || null,
          event_type: 'view',
          event_data: { timestamp: new Date().toISOString() }
        });

      if (error) {
        console.error('Error tracking story view:', error);
      } else {
        console.log('Story view tracked successfully');
      }
    } catch (error) {
      console.error('Error tracking story view:', error);
    }
  }, [user]);

  const trackStoryClick = useCallback(async (storyId: string) => {
    try {
      console.log('Tracking story click for:', storyId);
      
      // Track analytics event for click (when someone opens the full story)
      const { error } = await supabase
        .from('story_analytics')
        .insert({
          story_id: storyId,
          user_id: user?.id || null,
          event_type: 'click',
          event_data: { timestamp: new Date().toISOString() }
        });

      if (error) {
        console.error('Error tracking story click:', error);
      } else {
        console.log('Story click tracked successfully');
      }
    } catch (error) {
      console.error('Error tracking story click:', error);
    }
  }, [user]);

  const trackStoryRead = useCallback(async (storyId: string, durationSeconds: number) => {
    try {
      console.log('Tracking story read completion for:', storyId, 'Duration:', durationSeconds);
      
      const { error } = await supabase
        .from('story_analytics')
        .insert({
          story_id: storyId,
          user_id: user?.id || null,
          event_type: 'read_complete',
          session_duration_seconds: durationSeconds,
          event_data: { 
            duration: durationSeconds,
            timestamp: new Date().toISOString() 
          }
        });

      if (error) {
        console.error('Error tracking story read:', error);
      } else {
        console.log('Story read tracked successfully');
      }
    } catch (error) {
      console.error('Error tracking story read:', error);
    }
  }, [user]);

  return {
    trackStoryView,
    trackStoryClick,
    trackStoryRead,
  };
}
