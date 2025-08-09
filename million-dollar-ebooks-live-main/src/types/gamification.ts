
export interface UserProgress {
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  booksRead: number;
  reviewsWritten: number;
  friendsReferred: number;
  level: number;
  unlockedAchievements: string[];
  dailyReadingSessions: Record<string, string[]>;
  lastActivityDate?: string;
  storyWins?: number; // Add story wins tracking
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'reading' | 'social' | 'streak' | 'milestone' | 'writing';
  requirement: number;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastReadDate?: string;
}

export interface LevelInfo {
  level: number;
  pointsRequired: number;
  title: string;
  benefits: string[];
}
