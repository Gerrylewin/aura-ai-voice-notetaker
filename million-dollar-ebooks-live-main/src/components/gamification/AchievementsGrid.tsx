
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementBadge } from './AchievementBadge';
import { useGamification } from '@/hooks/useGamification';
import { ACHIEVEMENTS } from '@/data/achievements';
import { Award } from 'lucide-react';

export function AchievementsGrid() {
  const { userProgress } = useGamification();

  if (!userProgress) return null;

  const unlockedCount = userProgress.unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5" />
          Achievements ({unlockedCount}/{totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {ACHIEVEMENTS.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              unlocked={userProgress.unlockedAchievements.includes(achievement.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
