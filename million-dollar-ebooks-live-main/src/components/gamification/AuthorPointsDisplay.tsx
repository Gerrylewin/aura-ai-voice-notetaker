
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthorGamification } from '@/hooks/useAuthorGamification';
import { useAuth } from '@/hooks/useAuth';
import { Coins, BookOpen, PenTool, Trophy } from 'lucide-react';

export function AuthorPointsDisplay() {
  const { user, profile } = useAuth();
  const { authorProgress, loading } = useAuthorGamification();

  // Only show if user is authenticated with a profile
  if (loading || !authorProgress || !user || !profile) return null;

  const recentPointsEarned = [
    { activity: 'Story Submission', points: 100, icon: <PenTool className="w-4 h-4" /> },
    { activity: 'Book Writing (per 1000 words)', points: 100, icon: <BookOpen className="w-4 h-4" /> },
    { activity: 'Daily Story Winner', points: 1000, icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Points & Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Points */}
        <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {authorProgress.author_points.toLocaleString()}
          </div>
          <div className="text-gray-600 dark:text-gray-300">Total Points</div>
        </div>

        {/* How to Earn Points */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">How to Earn Points:</h4>
          {recentPointsEarned.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.activity}</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                +{item.points} pts
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
