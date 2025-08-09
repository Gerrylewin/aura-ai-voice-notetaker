
import { Achievement } from '@/types/gamification';

export const ACHIEVEMENTS: Achievement[] = [
  // Reading Achievements
  {
    id: 'first-book',
    title: 'First Steps',
    description: 'Complete your first book',
    icon: '📖',
    type: 'reading',
    requirement: 1,
    points: 100,
    rarity: 'common'
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Read 10 books',
    icon: '🐛',
    type: 'reading',
    requirement: 10,
    points: 500,
    rarity: 'rare'
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Read 25 books',
    icon: '🎓',
    type: 'reading',
    requirement: 25,
    points: 1000,
    rarity: 'epic'
  },
  {
    id: 'master-reader',
    title: 'Master Reader',
    description: 'Read 50 books',
    icon: '👑',
    type: 'reading',
    requirement: 50,
    points: 2500,
    rarity: 'legendary'
  },

  // Writing Achievements
  {
    id: 'first-story-win',
    title: 'Story Champion',
    description: 'Win your first daily story competition',
    icon: '🏆',
    type: 'writing',
    requirement: 1,
    points: 1000,
    rarity: 'rare'
  },
  {
    id: 'story-legend',
    title: 'Story Legend',
    description: 'Win 3 daily story competitions',
    icon: '👑',
    type: 'writing',
    requirement: 3,
    points: 3000,
    rarity: 'epic'
  },
  {
    id: 'story-master',
    title: 'Story Master',
    description: 'Win 10 daily story competitions',
    icon: '⭐',
    type: 'writing',
    requirement: 10,
    points: 10000,
    rarity: 'legendary'
  },

  // Streak Achievements
  {
    id: 'consistent-reader',
    title: 'Consistent Reader',
    description: 'Maintain a 7-day reading streak',
    icon: '🔥',
    type: 'streak',
    requirement: 7,
    points: 200,
    rarity: 'common'
  },
  {
    id: 'dedication',
    title: 'Dedication',
    description: 'Maintain a 30-day reading streak',
    icon: '⚡',
    type: 'streak',
    requirement: 30,
    points: 750,
    rarity: 'rare'
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Maintain a 100-day reading streak',
    icon: '💫',
    type: 'streak',
    requirement: 100,
    points: 2000,
    rarity: 'legendary'
  },

  // Social Achievements
  {
    id: 'first-review',
    title: 'Critic',
    description: 'Write your first book review',
    icon: '✍️',
    type: 'social',
    requirement: 1,
    points: 50,
    rarity: 'common'
  },
  {
    id: 'helpful-reviewer',
    title: 'Helpful Reviewer',
    description: 'Write 10 book reviews',
    icon: '⭐',
    type: 'social',
    requirement: 10,
    points: 300,
    rarity: 'rare'
  },

  // Milestone Achievements
  {
    id: 'point-collector',
    title: 'Point Collector',
    description: 'Earn 1,000 points',
    icon: '💎',
    type: 'milestone',
    requirement: 1000,
    points: 0,
    rarity: 'rare'
  },
  {
    id: 'elite-member',
    title: 'Elite Member',
    description: 'Reach level 10',
    icon: '🏆',
    type: 'milestone',
    requirement: 10,
    points: 0,
    rarity: 'epic'
  }
];

export const LEVELS = [
  { level: 1, pointsRequired: 0, title: 'Newcomer', benefits: ['Welcome bonus'] },
  { level: 2, pointsRequired: 100, title: 'Reader', benefits: ['Book recommendations'] },
  { level: 3, pointsRequired: 300, title: 'Enthusiast', benefits: ['Early access to new releases'] },
  { level: 4, pointsRequired: 600, title: 'Devoted', benefits: ['Exclusive content access'] },
  { level: 5, pointsRequired: 1000, title: 'Scholar', benefits: ['Author chat access'] },
  { level: 6, pointsRequired: 1500, title: 'Expert', benefits: ['Beta feature access'] },
  { level: 7, pointsRequired: 2200, title: 'Master', benefits: ['Premium support'] },
  { level: 8, pointsRequired: 3000, title: 'Legend', benefits: ['Custom achievements'] },
  { level: 9, pointsRequired: 4000, title: 'Champion', benefits: ['Platform influence'] },
  { level: 10, pointsRequired: 5500, title: 'Grandmaster', benefits: ['All perks unlocked'] }
];
