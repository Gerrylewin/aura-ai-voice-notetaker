
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useReadingStreak } from '@/hooks/useReadingStreak';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StreakWidget() {
  const { streakData, loading } = useReadingStreak();

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-9 h-9"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isStreakActive = streakData.currentStreak > 0;

  return (
    <Card className={cn(
      "border-2 transition-all duration-200",
      isStreakActive 
        ? "bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-500" 
        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isStreakActive ? "bg-orange-100 dark:bg-orange-500" : "bg-gray-100 dark:bg-gray-700"
            )}>
              <Flame className={cn(
                "w-5 h-5",
                isStreakActive ? "text-orange-600 dark:text-white" : "text-gray-600 dark:text-gray-400"
              )} />
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-bold">
                {streakData.currentStreak} Day Streak
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                Best: {streakData.longestStreak} days
              </div>
            </div>
          </div>
          
          {!isStreakActive && streakData.currentStreak === 0 && (
            <div className="text-right">
              <div className="text-gray-500 dark:text-gray-400 text-sm">Start reading to</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">begin your streak!</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
