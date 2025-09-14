
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface ReadingGoal {
  target: number;
  current: number;
  year: number;
}

interface ReadingGoalProps {
  readingGoal: ReadingGoal;
}

export function ReadingGoal({ readingGoal }: ReadingGoalProps) {
  const progressPercentage = readingGoal.target > 0 ? Math.round((readingGoal.current / readingGoal.target) * 100) : 0;
  const booksRemaining = Math.max(0, readingGoal.target - readingGoal.current);

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{readingGoal.year} Reading Goal</h3>
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {readingGoal.current} of {readingGoal.target} books
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {booksRemaining === 0 
              ? "🎉 Congratulations! You've reached your goal!" 
              : `You're ${booksRemaining} book${booksRemaining === 1 ? '' : 's'} away from your goal!`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
