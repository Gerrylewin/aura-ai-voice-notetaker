
import React from 'react';
import { ProgressCard } from '@/components/gamification/ProgressCard';
import { AchievementsGrid } from '@/components/gamification/AchievementsGrid';
import { StreakWidget } from '@/components/gamification/StreakWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGamification } from '@/hooks/useGamification';
import { Trophy, Target, Zap } from 'lucide-react';

export function GamificationTab() {
  const { userProgress, getCurrentLevelInfo } = useGamification();

  if (!userProgress) return null;

  const currentLevel = getCurrentLevelInfo();

  return (
    <div className="space-y-6">
      {/* Top Section - Progress and Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressCard />
        <div className="space-y-4">
          <StreakWidget />
          
          {/* Level Benefits */}
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Level {userProgress.level} Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                {currentLevel.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievements Section */}
      <AchievementsGrid />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{userProgress.totalPoints}</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Total Points</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-500">{userProgress.level}</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Current Level</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">{userProgress.longestStreak}</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Best Streak</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-500">{userProgress.unlockedAchievements.length}</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Achievements</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
