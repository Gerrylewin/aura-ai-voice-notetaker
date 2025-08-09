
export interface AuthorProgress {
  id: string;
  author_id: string;
  total_words_written: number;
  books_published: number;
  total_sales: number;
  total_revenue_cents: number;
  author_level: number;
  author_points: number;
  streak_days: number;
  longest_streak: number;
  last_activity_date?: string;
  achievements_unlocked: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthorAchievement {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  icon: string;
  points_reward: number;
  requirement_type: 'words' | 'books' | 'sales' | 'revenue' | 'streak';
  requirement_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface AuthorLevelInfo {
  level: number;
  title: string;
  pointsRequired: number;
  benefits: string[];
}
