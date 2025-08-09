
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useStoryNotifications() {
  const { user } = useAuth();
  const [newStoriesCount, setNewStoriesCount] = useState(0);
  const [lastViewedAt, setLastViewedAt] = useState<string | null>(null);

  // Load last viewed timestamp from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('stories_last_viewed_at');
    if (stored) {
      setLastViewedAt(stored);
    }
  }, []);

  // Check for new stories since last viewed
  const checkForNewStories = useCallback(async () => {
    if (!lastViewedAt) return;

    try {
      const { data, error } = await supabase
        .from('daily_stories')
        .select('id')
        .eq('is_published', true)
        .gt('created_at', lastViewedAt);

      if (error) {
        console.error('Error checking for new stories:', error);
        return;
      }

      setNewStoriesCount(data?.length || 0);
    } catch (error) {
      console.error('Error in checkForNewStories:', error);
    }
  }, [lastViewedAt]);

  // Mark stories as viewed
  const markStoriesAsViewed = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem('stories_last_viewed_at', now);
    setLastViewedAt(now);
    setNewStoriesCount(0);
  }, []);

  // Listen for real-time story insertions
  useEffect(() => {
    const channel = supabase
      .channel('new-stories-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_stories',
          filter: 'is_published=eq.true'
        },
        (payload) => {
          console.log('New story detected:', payload);
          // Only increment if we have a last viewed timestamp and the story is newer
          if (lastViewedAt && payload.new.created_at > lastViewedAt) {
            setNewStoriesCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lastViewedAt]);

  // Check for new stories on mount and when lastViewedAt changes
  useEffect(() => {
    checkForNewStories();
  }, [checkForNewStories]);

  return {
    newStoriesCount,
    markStoriesAsViewed,
    checkForNewStories
  };
}
