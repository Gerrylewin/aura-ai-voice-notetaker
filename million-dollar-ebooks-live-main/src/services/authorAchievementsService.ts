
import { supabase } from '@/integrations/supabase/client';
import { AuthorAchievement, AuthorProgress } from '@/types/author';

export class AuthorAchievementsService {
  static async fetchAchievements(): Promise<AuthorAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('author_achievements')
        .select('*')
        .order('points_reward', { ascending: true });

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }

      // Type assertion to ensure proper typing from database
      const typedAchievements: AuthorAchievement[] = (data || []).map(achievement => ({
        ...achievement,
        requirement_type: achievement.requirement_type as 'words' | 'books' | 'sales' | 'revenue' | 'streak',
        rarity: achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary'
      }));

      return typedAchievements;
    } catch (error) {
      console.error('Error in fetchAchievements:', error);
      return [];
    }
  }

  static checkForNewAchievements(progress: AuthorProgress, achievements: AuthorAchievement[]): AuthorAchievement[] {
    const newAchievements: AuthorAchievement[] = [];

    achievements.forEach(achievement => {
      if (progress.achievements_unlocked.includes(achievement.achievement_key)) return;

      let unlocked = false;
      switch (achievement.requirement_type) {
        case 'words':
          unlocked = progress.total_words_written >= achievement.requirement_value;
          break;
        case 'books':
          unlocked = progress.books_published >= achievement.requirement_value;
          break;
        case 'sales':
          unlocked = progress.total_sales >= achievement.requirement_value;
          break;
        case 'streak':
          unlocked = progress.streak_days >= achievement.requirement_value;
          break;
      }

      if (unlocked) {
        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }

  static async unlockAchievement(userId: string, currentProgress: AuthorProgress, achievement: AuthorAchievement): Promise<AuthorProgress | null> {
    try {
      const newAchievements = [...currentProgress.achievements_unlocked, achievement.achievement_key];
      const newPoints = currentProgress.author_points + achievement.points_reward;

      const { data, error } = await supabase
        .from('author_progress')
        .update({
          achievements_unlocked: newAchievements,
          author_points: newPoints
        })
        .eq('author_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error unlocking achievement:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in unlockAchievement:', error);
      return null;
    }
  }
}
