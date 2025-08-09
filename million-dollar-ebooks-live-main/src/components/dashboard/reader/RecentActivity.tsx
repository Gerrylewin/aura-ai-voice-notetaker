
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Star, Bookmark } from 'lucide-react';

interface Activity {
  type: 'finished' | 'review' | 'bookmark';
  message: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
      <div className="space-y-3 mb-6">
        {activities.map((activity, index) => (
          <Card key={index} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {activity.type === 'finished' && <Award className="w-4 h-4 text-green-500" />}
                  {activity.type === 'review' && <Star className="w-4 h-4 text-yellow-500" />}
                  {activity.type === 'bookmark' && <Bookmark className="w-4 h-4 text-blue-500" />}
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
