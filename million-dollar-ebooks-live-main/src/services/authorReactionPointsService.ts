
import { supabase } from '@/integrations/supabase/client';
import { AuthorProgress } from '@/types/author';

export class AuthorReactionPointsService {
  // Heart = 3 points, Shock = 2 points, Thumbs-down = -1 point
  static REACTION_POINTS = {
    heart: 3,
    shock: 2,
    'thumbs-down': -1
  };

  static async calculateReactionPoints(authorId: string): Promise<number> {
    try {
      // Get all stories by this author
      const { data: authorStories, error: storiesError } = await supabase
        .from('daily_stories')
        .select('id')
        .eq('author_id', authorId)
        .eq('is_published', true);

      if (storiesError) {
        console.error('Error fetching author stories:', storiesError);
        return 0;
      }

      if (!authorStories || authorStories.length === 0) {
        return 0;
      }

      const storyIds = authorStories.map(story => story.id);

      // Get all reactions to these stories
      const { data: reactions, error: reactionsError } = await supabase
        .from('story_reactions')
        .select('reaction_type, user_id, story_id')
        .in('story_id', storyIds);

      if (reactionsError) {
        console.error('Error fetching story reactions:', reactionsError);
        return 0;
      }

      if (!reactions || reactions.length === 0) {
        return 0;
      }

      // Calculate total points from reactions
      let totalPoints = 0;
      
      for (const reaction of reactions) {
        const points = this.REACTION_POINTS[reaction.reaction_type as keyof typeof this.REACTION_POINTS] || 0;
        
        // Check if this is a self-reaction (author reacting to their own story)
        // Self-reactions are worth half points
        const { data: storyData, error: storyError } = await supabase
          .from('daily_stories')
          .select('author_id')
          .eq('id', reaction.story_id)
          .single();
        
        if (storyError) {
          console.error('Error fetching story data for reaction:', storyError);
          // If we can't determine, treat as non-self reaction
          totalPoints += points;
          continue;
        }
        
        if (storyData && storyData.author_id === reaction.user_id) {
          totalPoints += points * 0.5;
        } else {
          totalPoints += points;
        }
      }

      return Math.max(0, Math.floor(totalPoints)); // Ensure no negative total and round down
    } catch (error) {
      console.error('Error calculating reaction points:', error);
      return 0;
    }
  }

  static async updateAuthorReactionPoints(authorId: string): Promise<AuthorProgress | null> {
    try {
      const reactionPoints = await this.calculateReactionPoints(authorId);
      
      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('author_progress')
        .select('*')
        .eq('author_id', authorId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching current progress:', fetchError);
        return null;
      }

      if (!currentProgress) {
        return null;
      }

      // Calculate base points (stories and books)
      const { data: publishedStories } = await supabase
        .from('daily_stories')
        .select('id')
        .eq('author_id', authorId)
        .eq('is_published', true);

      const { data: publishedBooks } = await supabase
        .from('books')
        .select('word_count')
        .eq('author_id', authorId)
        .eq('book_status', 'published');

      const baseStoryPoints = (publishedStories?.length || 0) * 100;
      const baseBookPoints = publishedBooks?.reduce((total, book) => {
        return total + Math.floor((book.word_count || 0) / 1000) * 100;
      }, 0) || 0;

      const totalPoints = baseStoryPoints + baseBookPoints + reactionPoints;

      // Update the author progress with reaction points included
      const { data: updatedProgress, error: updateError } = await supabase
        .from('author_progress')
        .update({
          author_points: totalPoints,
          last_activity_date: new Date().toISOString()
        })
        .eq('author_id', authorId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating author reaction points:', updateError);
        return null;
      }

      return updatedProgress;
    } catch (error) {
      console.error('Error in updateAuthorReactionPoints:', error);
      return null;
    }
  }
}
