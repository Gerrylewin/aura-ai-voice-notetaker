
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProgress, Achievement, StreakData } from '@/types/gamification';
import { ACHIEVEMENTS, LEVELS } from '@/data/achievements';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useGamification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user progress from Supabase and sync with localStorage
  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
    setLoading(false);
  }, [user]);

  const loadUserProgress = async () => {
    if (!user) return;

    try {
      // Get author progress for story wins and points
      const { data: authorProgress } = await supabase
        .from('author_progress')
        .select('*')
        .eq('author_id', user.id)
        .maybeSingle();

      // Get daily story wins count
      const { data: storyWins } = await supabase
        .from('daily_story_winners')
        .select('id')
        .eq('author_id', user.id);

      // Get completed books from reading history
      const { data: completedBooks } = await supabase
        .from('reading_history')
        .select('id')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null);

      // Get reviews written
      const { data: reviewsWritten } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id);

      const savedProgress = localStorage.getItem(`gamification_${user.id}`);
      let baseProgress: UserProgress;

      if (savedProgress) {
        baseProgress = JSON.parse(savedProgress);
      } else {
        baseProgress = {
          userId: user.id,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
          booksRead: 0,
          reviewsWritten: 0,
          friendsReferred: 0,
          level: 1,
          unlockedAchievements: [],
          dailyReadingSessions: {},
        };
      }

      // Sync with database data
      const authorPoints = authorProgress?.author_points || 0;
      const storyWinCount = storyWins?.length || 0;
      const completedBookCount = completedBooks?.length || 0;
      const reviewCount = reviewsWritten?.length || 0;

      // Calculate total points: author points + story wins bonus + reading achievements
      const storyWinBonus = storyWinCount * 1000; // 1000 points per story win
      const readingBonus = completedBookCount * 100; // 100 points per book read
      const reviewBonus = reviewCount * 50; // 50 points per review

      const totalPoints = Math.max(
        baseProgress.totalPoints,
        authorPoints + readingBonus + reviewBonus
      );

      const updatedProgress: UserProgress = {
        ...baseProgress,
        totalPoints,
        booksRead: Math.max(baseProgress.booksRead, completedBookCount),
        reviewsWritten: Math.max(baseProgress.reviewsWritten, reviewCount),
        level: calculateLevel(totalPoints),
        storyWins: storyWinCount, // Add story wins tracking
      };

      setUserProgress(updatedProgress);
      localStorage.setItem(`gamification_${user.id}`, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Error loading user progress:', error);
      // Fallback to localStorage only
      const savedProgress = localStorage.getItem(`gamification_${user.id}`);
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
    }
  };

  const updateProgress = (updates: Partial<UserProgress>) => {
    if (!userProgress || !user) return;

    const newProgress = { ...userProgress, ...updates };
    
    // Calculate level based on points
    const newLevel = calculateLevel(newProgress.totalPoints);
    if (newLevel > userProgress.level) {
      newProgress.level = newLevel;
      toast({
        title: "Level Up! 🎉",
        description: `You've reached level ${newLevel}!`,
      });
    }

    // Check for new achievements
    checkAchievements(newProgress);

    setUserProgress(newProgress);
    localStorage.setItem(`gamification_${user.id}`, JSON.stringify(newProgress));
  };

  const addPoints = (points: number, reason: string) => {
    if (!userProgress) return;
    
    updateProgress({
      totalPoints: userProgress.totalPoints + points
    });

    toast({
      title: `+${points} points!`,
      description: reason,
    });
  };

  const startReadingSession = (bookId: string) => {
    if (!userProgress || !user) return;

    const today = new Date().toDateString();
    const dailySessions = userProgress.dailyReadingSessions || {};
    const todaysSessions = dailySessions[today] || [];

    // Check if already awarded points for this book today
    if (todaysSessions.includes(bookId)) {
      return; // Already got points for this book today
    }

    // Add this book to today's sessions
    const updatedSessions = {
      ...dailySessions,
      [today]: [...todaysSessions, bookId]
    };

    updateProgress({
      dailyReadingSessions: updatedSessions,
      totalPoints: userProgress.totalPoints + 25,
      lastActivityDate: new Date().toISOString()
    });

    toast({
      title: "+25 points!",
      description: "Reading session started!",
    });

    checkStreak();
  };

  const incrementBooksRead = () => {
    if (!userProgress) return;
    
    updateProgress({
      booksRead: userProgress.booksRead + 1,
      totalPoints: userProgress.totalPoints + 100, // 100 points per book
      lastActivityDate: new Date().toISOString()
    });

    checkStreak();
  };

  const incrementReviews = () => {
    if (!userProgress) return;
    
    updateProgress({
      reviewsWritten: userProgress.reviewsWritten + 1,
      totalPoints: userProgress.totalPoints + 50 // 50 points per review
    });
  };

  const checkStreak = () => {
    if (!userProgress) return;

    const today = new Date().toDateString();
    const lastActivity = userProgress.lastActivityDate 
      ? new Date(userProgress.lastActivityDate).toDateString()
      : null;

    if (lastActivity === today) return; // Already counted today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = userProgress.currentStreak;
    
    if (lastActivity === yesterdayStr) {
      // Continuing streak
      newStreak += 1;
    } else if (lastActivity !== today) {
      // Streak broken or starting new
      newStreak = 1;
    }

    const newLongestStreak = Math.max(userProgress.longestStreak, newStreak);

    updateProgress({
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: new Date().toISOString()
    });

    if (newStreak > userProgress.currentStreak) {
      addPoints(newStreak * 10, `${newStreak} day reading streak!`);
    }
  };

  const checkAchievements = (progress: UserProgress) => {
    ACHIEVEMENTS.forEach(achievement => {
      if (progress.unlockedAchievements.includes(achievement.id)) return;

      let unlocked = false;

      switch (achievement.type) {
        case 'reading':
          unlocked = progress.booksRead >= achievement.requirement;
          break;
        case 'streak':
          unlocked = progress.longestStreak >= achievement.requirement;
          break;
        case 'social':
          unlocked = progress.reviewsWritten >= achievement.requirement;
          break;
        case 'milestone':
          if (achievement.id === 'point-collector') {
            unlocked = progress.totalPoints >= achievement.requirement;
          } else if (achievement.id === 'elite-member') {
            unlocked = progress.level >= achievement.requirement;
          }
          break;
      }

      if (unlocked) {
        progress.unlockedAchievements.push(achievement.id);
        progress.totalPoints += achievement.points;
        
        toast({
          title: "Achievement Unlocked! 🏆",
          description: `${achievement.icon} ${achievement.title}`,
        });
      }
    });
  };

  const calculateLevel = (points: number): number => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].pointsRequired) {
        return LEVELS[i].level;
      }
    }
    return 1;
  };

  const getCurrentLevelInfo = () => {
    if (!userProgress) return LEVELS[0];
    return LEVELS.find(l => l.level === userProgress.level) || LEVELS[0];
  };

  const getNextLevelInfo = () => {
    if (!userProgress) return LEVELS[1];
    const nextLevel = LEVELS.find(l => l.level === userProgress.level + 1);
    return nextLevel || LEVELS[LEVELS.length - 1];
  };

  const getUnlockedAchievements = (): Achievement[] => {
    if (!userProgress) return [];
    return ACHIEVEMENTS.filter(a => userProgress.unlockedAchievements.includes(a.id));
  };

  const getAvailableAchievements = (): Achievement[] => {
    if (!userProgress) return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(a => !userProgress.unlockedAchievements.includes(a.id));
  };

  // Refresh data when user navigates back to dashboard
  const refreshProgress = () => {
    if (user) {
      loadUserProgress();
    }
  };

  return {
    userProgress,
    loading,
    addPoints,
    startReadingSession,
    incrementBooksRead,
    incrementReviews,
    getCurrentLevelInfo,
    getNextLevelInfo,
    getUnlockedAchievements,
    getAvailableAchievements,
    checkStreak,
    refreshProgress
  };
}
