
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';

export function useStoryReactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const toggleReaction = async (storyId: string, reactionType: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    
    try {
      console.log('Toggling reaction:', { storyId, reactionType, userId: user.id });

      // First check if user already has any reaction for this story
      const { data: existingReaction, error: fetchError } = await supabase
        .from('story_reactions')
        .select('reaction_type')
        .eq('story_id', storyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching existing reaction:', fetchError);
        throw fetchError;
      }

      console.log('Existing reaction:', existingReaction);

      if (existingReaction?.reaction_type === reactionType) {
        // If clicking the same reaction, remove it
        console.log('Removing existing reaction');
        const { error } = await supabase
          .from('story_reactions')
          .delete()
          .eq('story_id', storyId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // If clicking a different reaction or no existing reaction, add/update it
        console.log('Adding/updating reaction');
        const { error } = await supabase
          .from('story_reactions')
          .upsert({
            story_id: storyId,
            user_id: user.id,
            reaction_type: reactionType,
          }, {
            onConflict: 'story_id,user_id'
          });

        if (error) throw error;
      }

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['stories'] });
      
    } catch (error) {
      console.error('Error in toggleReaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    toggleReaction,
  };
}
