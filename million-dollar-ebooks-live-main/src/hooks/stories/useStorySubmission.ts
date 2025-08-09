
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

export function useStorySubmission() {
  const { user, profile } = useAuth();
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

  const submitStory = useCallback(async (storyData: { title: string; description: string; content: string }) => {
    if (!user || !profile) {
      throw new Error('User not authenticated or profile not loaded');
    }

    console.log('📝 SUBMITTING STORY FOR USER:', {
      userId: user.id,
      profileId: profile.id,
      displayName: profile.display_name,
      storyTitle: storyData.title
    });

    const storyDate = new Date().toISOString().split('T')[0];
    
    const storyPayload = {
      title: storyData.title,
      description: storyData.description || null,
      content: storyData.content,
      author_id: profile.id, // Always use profile.id
      story_date: storyDate,
      is_published: true,
      view_count: 0,
      read_count: 0
    };

    console.log('📝 STORY PAYLOAD:', storyPayload);
    
    const { data: newStory, error } = await supabase
      .from('daily_stories')
      .insert(storyPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error submitting story:', error);
      throw error;
    }
    
    console.log('✅ Story submitted successfully:', newStory);
    setHasSubmittedToday(true);
    
    // Return story with profile information attached
    const newStoryWithProfile = {
      ...newStory,
      description: newStory.description || '',
      profiles: {
        display_name: profile.display_name || 'Anonymous Writer',
        avatar_url: profile.avatar_url
      },
      reactions: { heart: 0, shock: 0, 'thumbs-down': 0 },
      user_reaction: undefined,
      read_count: 0,
      view_count: 0,
      is_daily_winner: false
    };

    console.log('✅ Returning enhanced story:', newStoryWithProfile);
    return newStoryWithProfile;
  }, [user, profile]);

  const checkTodaySubmission = useCallback(async () => {
    if (!user || !profile) {
      setHasSubmittedToday(false);
      return;
    }

    console.log('🔍 Checking today submission for profile:', profile.id);

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_stories')
      .select('id')
      .eq('author_id', profile.id)
      .eq('story_date', today)
      .maybeSingle();

    if (error) {
      console.error('❌ Error checking today submission:', error);
      setHasSubmittedToday(false);
      return;
    }

    const hasSubmitted = !!data;
    console.log('📅 Has submitted today:', hasSubmitted);
    setHasSubmittedToday(hasSubmitted);
  }, [user, profile]);

  return {
    hasSubmittedToday,
    setHasSubmittedToday,
    submitStory,
    checkTodaySubmission
  };
}
