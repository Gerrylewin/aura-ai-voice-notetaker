
import { supabase } from '@/integrations/supabase/client';
import { AuthorProgress } from '@/types/author';

export class AuthorProgressService {
  static async fetchAuthorProgress(userId: string): Promise<AuthorProgress | null> {
    try {
      // Get existing progress
      const { data: existingProgress, error: progressError } = await supabase
        .from('author_progress')
        .select('*')
        .eq('author_id', userId)
        .maybeSingle();

      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Error fetching author progress:', progressError);
        return null;
      }

      // Get ALL books for this author (not just published ones) to see what we have
      const { data: allBooks } = await supabase
        .from('books')
        .select('word_count, book_status')
        .eq('author_id', userId);

      console.log('📚 ALL BOOKS for user:', allBooks);

      // Get books that should count as "published" - let's be more flexible
      const { data: publishedBooks } = await supabase
        .from('books')
        .select('word_count, book_status')
        .eq('author_id', userId)
        .in('book_status', ['published', 'draft']); // Include draft books as they might be "published" content

      console.log('📚 PUBLISHED BOOKS:', publishedBooks);

      // Get published stories count and calculate word count from content
      const { data: publishedStories } = await supabase
        .from('daily_stories')
        .select('id, content')
        .eq('author_id', userId)
        .eq('is_published', true);

      // Calculate stats from actual data
      const booksPublished = publishedBooks?.length || 0;
      const storiesPublished = publishedStories?.length || 0;
      
      // Calculate word count from books (using stored word_count)
      const bookWordCount = publishedBooks?.reduce((total, book) => {
        return total + (book.word_count || 0);
      }, 0) || 0;
      
      // Calculate actual word count from story content
      const storyWordCount = publishedStories?.reduce((total, story) => {
        const wordCount = story.content ? story.content.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
        return total + wordCount;
      }, 0) || 0;
      
      const totalWordsWritten = bookWordCount + storyWordCount;

      // Calculate points based on actual content
      const baseStoryPoints = storiesPublished * 100;
      const baseBookPoints = Math.floor(bookWordCount / 1000) * 100; // 100 points per 1000 words
      const existingExtraPoints = existingProgress?.author_points || 0;
      
      const expectedBasePoints = baseStoryPoints + baseBookPoints;
      const actualPoints = Math.max(expectedBasePoints, existingExtraPoints);

      console.log('📊 PROGRESS CALCULATION:');
      console.log('- Books:', booksPublished, 'with', bookWordCount, 'words');
      console.log('- Stories:', storiesPublished, 'with', storyWordCount, 'words');
      console.log('- Total words:', totalWordsWritten);
      console.log('- Points:', actualPoints);

      if (existingProgress) {
        // Update existing progress with ACTUAL counts
        const { data: updatedProgress, error: updateError } = await supabase
          .from('author_progress')
          .update({
            total_words_written: totalWordsWritten,
            books_published: booksPublished,
            author_points: actualPoints,
            last_activity_date: new Date().toISOString()
          })
          .eq('author_id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating author progress:', updateError);
          return null;
        }
        return updatedProgress;
      } else {
        // Create initial progress record with ACTUAL counts
        const { data: newProgress, error: createError } = await supabase
          .from('author_progress')
          .insert({
            author_id: userId,
            total_words_written: totalWordsWritten,
            books_published: booksPublished,
            author_level: 1,
            author_points: actualPoints
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating author progress:', createError);
          return null;
        }
        return newProgress;
      }
    } catch (error) {
      console.error('Error in fetchAuthorProgress:', error);
      return null;
    }
  }

  static async updateWordCount(userId: string, currentProgress: AuthorProgress, newWordCount: number): Promise<AuthorProgress | null> {
    try {
      // Instead of tracking differences, recalculate from actual content
      const refreshedProgress = await this.fetchAuthorProgress(userId);
      return refreshedProgress;
    } catch (error) {
      console.error('Error in updateWordCount:', error);
      return null;
    }
  }

  static async awardStoryPoints(userId: string, currentProgress: AuthorProgress): Promise<AuthorProgress | null> {
    try {
      const pointsEarned = 100; // 100 points per story submission
      
      const { data, error } = await supabase
        .from('author_progress')
        .update({
          author_points: currentProgress.author_points + pointsEarned,
          last_activity_date: new Date().toISOString()
        })
        .eq('author_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error awarding story points:', error);
        return null;
      }

      console.log(`Awarded ${pointsEarned} points for story submission. New total: ${data.author_points}`);
      return data;
    } catch (error) {
      console.error('Error in awardStoryPoints:', error);
      return null;
    }
  }

  static async awardBookPoints(userId: string, currentProgress: AuthorProgress, wordCount: number): Promise<AuthorProgress | null> {
    try {
      const pointsEarned = Math.floor(wordCount / 1000) * 100; // 100 points per 1000 words
      
      const { data, error } = await supabase
        .from('author_progress')
        .update({
          author_points: currentProgress.author_points + pointsEarned,
          last_activity_date: new Date().toISOString()
        })
        .eq('author_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error awarding book points:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in awardBookPoints:', error);
      return null;
    }
  }
}
