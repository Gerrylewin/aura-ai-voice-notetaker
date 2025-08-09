
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGamification } from '@/hooks/useGamification';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Flame, BookOpen, PenTool } from 'lucide-react';

export function ProgressCard() {
  const { userProgress, getCurrentLevelInfo, getNextLevelInfo } = useGamification();

  if (!userProgress) return null;

  const currentLevel = getCurrentLevelInfo();
  const nextLevel = getNextLevelInfo();
  const progressToNext = userProgress.totalPoints - currentLevel.pointsRequired;
  const pointsNeededForNext = nextLevel.pointsRequired - currentLevel.pointsRequired;
  const progressPercentage = (progressToNext / pointsNeededForNext) * 100;

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">Level {userProgress.level}</div>
            <div className="text-gray-600 dark:text-gray-300">{currentLevel.title}</div>
          </div>
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
            {userProgress.totalPoints} points
          </Badge>
        </div>

        {/* Progress to Next Level */}
        {userProgress.level < 10 && (
          <div>
            <div className="flex justify-between text-sm mb-2 text-gray-600 dark:text-gray-300">
              <span>Progress to Level {nextLevel.level}</span>
              <span>{progressToNext}/{pointsNeededForNext}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userProgress.booksRead}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Books Read</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Flame className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userProgress.currentStreak}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userProgress.reviewsWritten}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Reviews</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{userProgress.storyWins || 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Story Wins</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
