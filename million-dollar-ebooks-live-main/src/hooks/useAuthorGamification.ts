import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthorProgress, AuthorAchievement } from '@/types/author';
import { useToast } from '@/hooks/use-toast';
import { AuthorProgressService } from '@/services/authorProgressService';
import { AuthorAchievementsService } from '@/services/authorAchievementsService';
import { AuthorReactionPointsService } from '@/services/authorReactionPointsService';
import { AuthorLevelUtils } from '@/utils/authorLevelUtils';

export function useAuthorGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [authorProgress, setAuthorProgress] = useState<AuthorProgress | null>(null);
  const [achievements, setAchievements] = useState<AuthorAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAuthorProgress();
      fetchAchievements();
    }
  }, [user]);

  const fetchAuthorProgress = async () => {
    if (!user) return;

    try {
      let progress = await AuthorProgressService.fetchAuthorProgress(user.id);
      
      // Update with reaction points
      if (progress) {
        const updatedProgress = await AuthorReactionPointsService.updateAuthorReactionPoints(user.id);
        if (updatedProgress) {
          progress = updatedProgress;
        }
      }
      
      setAuthorProgress(progress);
    } catch (error) {
      console.error('Error in fetchAuthorProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const achievementsList = await AuthorAchievementsService.fetchAchievements();
      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error in fetchAchievements:', error);
    }
  };

  const updateWordCount = async (newWordCount: number) => {
    if (!user || !authorProgress) return;

    try {
      const updatedProgress = await AuthorProgressService.updateWordCount(user.id, authorProgress, newWordCount);
      if (updatedProgress) {
        setAuthorProgress(updatedProgress);
        checkForNewAchievements(updatedProgress);

        const wordDifference = newWordCount - authorProgress.total_words_written;
        const pointsEarned = Math.floor(wordDifference / 100) * 5;
        if (pointsEarned > 0) {
          toast({
            title: `+${pointsEarned} points!`,
            description: `Great progress! You've written ${wordDifference} words.`,
          });
        }
      }
    } catch (error) {
      console.error('Error in updateWordCount:', error);
    }
  };

  const awardStoryPoints = async () => {
    if (!user || !authorProgress) return;

    try {
      const updatedProgress = await AuthorProgressService.awardStoryPoints(user.id, authorProgress);
      if (updatedProgress) {
        // Also update reaction points when a story is submitted
        const finalProgress = await AuthorReactionPointsService.updateAuthorReactionPoints(user.id);
        setAuthorProgress(finalProgress || updatedProgress);
        checkForNewAchievements(finalProgress || updatedProgress);
      }
    } catch (error) {
      console.error('Error in awardStoryPoints:', error);
    }
  };

  const awardBookPoints = async (wordCount: number) => {
    if (!user || !authorProgress) return;

    try {
      const updatedProgress = await AuthorProgressService.awardBookPoints(user.id, authorProgress, wordCount);
      if (updatedProgress) {
        setAuthorProgress(updatedProgress);
        checkForNewAchievements(updatedProgress);

        const pointsEarned = Math.floor(wordCount / 1000) * 100;
        if (pointsEarned > 0) {
          toast({
            title: `+${pointsEarned} points!`,
            description: `Excellent work on your book! ${Math.floor(wordCount / 1000)}k words written.`,
          });
        }
      }
    } catch (error) {
      console.error('Error in awardBookPoints:', error);
    }
  };

  const checkForNewAchievements = (progress: AuthorProgress) => {
    const newAchievements = AuthorAchievementsService.checkForNewAchievements(progress, achievements);
    
    newAchievements.forEach(achievement => {
      unlockAchievement(achievement);
    });
  };

  const unlockAchievement = async (achievement: AuthorAchievement) => {
    if (!user || !authorProgress) return;

    try {
      const updatedProgress = await AuthorAchievementsService.unlockAchievement(user.id, authorProgress, achievement);
      if (updatedProgress) {
        setAuthorProgress(updatedProgress);

        toast({
          title: "Achievement Unlocked! 🏆",
          description: `${achievement.icon} ${achievement.title} - +${achievement.points_reward} points!`,
        });
      }
    } catch (error) {
      console.error('Error in unlockAchievement:', error);
    }
  };

  const getCurrentLevel = () => AuthorLevelUtils.getCurrentLevel(authorProgress);
  const getNextLevel = () => AuthorLevelUtils.getNextLevel(authorProgress);

  const getUnlockedAchievements = (): AuthorAchievement[] => {
    if (!authorProgress) return [];
    return achievements.filter(a => authorProgress.achievements_unlocked.includes(a.achievement_key));
  };

  const refreshReactionPoints = async () => {
    if (!user) return;
    try {
      const updatedProgress = await AuthorReactionPointsService.updateAuthorReactionPoints(user.id);
      if (updatedProgress) {
        setAuthorProgress(updatedProgress);
      }
    } catch (error) {
      console.error('Error refreshing reaction points:', error);
    }
  };

  return {
    authorProgress,
    achievements,
    loading,
    updateWordCount,
    awardStoryPoints,
    awardBookPoints,
    getCurrentLevel,
    getNextLevel,
    getUnlockedAchievements,
    refreshProgress: fetchAuthorProgress,
    refreshReactionPoints
  };
}
