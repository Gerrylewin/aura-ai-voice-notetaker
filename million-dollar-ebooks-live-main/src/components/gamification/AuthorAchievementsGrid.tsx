
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementBadge } from './AchievementBadge';
import { useAuthorGamification } from '@/hooks/useAuthorGamification';
import { Award } from 'lucide-react';

export function AuthorAchievementsGrid() {
  const { authorProgress, achievements } = useAuthorGamification();

  if (!authorProgress) return null;

  const unlockedCount = authorProgress.achievements_unlocked.length;
  const totalCount = achievements.length;

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5" />
          Author Achievements ({unlockedCount}/{totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={{
                id: achievement.achievement_key,
                title: achievement.title,
                description: achievement.description,
                icon: achievement.icon,
                type: achievement.requirement_type as any,
                requirement: achievement.requirement_value,
                points: achievement.points_reward,
                rarity: achievement.rarity as any
              }}
              unlocked={authorProgress.achievements_unlocked.includes(achievement.achievement_key)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
