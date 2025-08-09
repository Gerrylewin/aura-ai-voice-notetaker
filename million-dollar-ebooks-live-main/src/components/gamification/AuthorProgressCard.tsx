
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuthorGamification } from '@/hooks/useAuthorGamification';
import { Trophy, BookOpen, Award, TrendingUp, FileText, Heart } from 'lucide-react';

export function AuthorProgressCard() {
  const { authorProgress, loading, getCurrentLevel, getNextLevel } = useAuthorGamification();

  if (loading || !authorProgress) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progressToNext = nextLevel ? authorProgress.author_points - currentLevel.pointsRequired : 0;
  const pointsNeededForNext = nextLevel ? nextLevel.pointsRequired - currentLevel.pointsRequired : 0;
  const progressPercentage = nextLevel ? (progressToNext / pointsNeededForNext) * 100 : 100;

  // Calculate points breakdown
  const storiesPublished = Math.floor(authorProgress.author_points / 100);
  const baseStoryPoints = storiesPublished * 100;
  const bonusPoints = authorProgress.author_points - baseStoryPoints;

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Author Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">Level {currentLevel.level}</div>
            <div className="text-gray-600 dark:text-gray-300">{currentLevel.title}</div>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 text-lg px-3 py-1">
            {authorProgress.author_points.toLocaleString()} points
          </Badge>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
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
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {authorProgress.total_words_written.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Words Written</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{authorProgress.books_published}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Books Published</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <FileText className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {storiesPublished}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Stories Published</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{authorProgress.total_sales}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Sales</div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Points Breakdown:</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Story Submissions (100 pts each):</span>
              <span className="font-medium">{storiesPublished} × 100 = {baseStoryPoints} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Reaction Points (❤️3, ⚡2, 👎-1):
              </span>
              <span className="font-medium">{bonusPoints} pts</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-1">
              <span className="font-semibold">Total Points:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{authorProgress.author_points} pts</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
