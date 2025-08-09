
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

interface StoryAnalyticsData {
  id: string;
  title: string;
  story_date: string;
  view_count: number;
  click_count: number;
  total_reads: number;
  avg_read_time: number;
  total_reactions: number;
  heart_count: number;
  shock_count: number;
  thumbs_down_count: number;
  comment_count: number;
}

interface StoryPerformanceCardProps {
  storyAnalytics: StoryAnalyticsData[];
  onViewReactions: (story: { id: string; title: string }) => void;
}

export function StoryPerformanceCard({ storyAnalytics, onViewReactions }: StoryPerformanceCardProps) {
  if (storyAnalytics.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Story Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No stories written yet.</p>
            <p className="text-sm text-gray-400 mt-2">Submit your first daily story to see analytics here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Story Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {storyAnalytics.map((story) => (
            <div key={story.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{story.title}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(story.story_date), 'MMMM d, yyyy')}
                  </p>
                </div>
                {story.total_reactions > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewReactions({ id: story.id, title: story.title })}
                    className="flex items-center gap-1"
                  >
                    <Users className="w-4 h-4" />
                    View Reactions
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">{story.view_count}</div>
                  <div className="text-gray-500">Views</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{story.click_count}</div>
                  <div className="text-gray-500">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">{story.total_reads}</div>
                  <div className="text-gray-500">Reads</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {story.avg_read_time > 0 ? `${Math.floor(story.avg_read_time / 60)}:${(story.avg_read_time % 60).toString().padStart(2, '0')}` : '0:00'}
                  </div>
                  <div className="text-gray-500">Avg Read Time</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">{story.heart_count}</div>
                  <div className="text-gray-500">Hearts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600">{story.shock_count}</div>
                  <div className="text-gray-500">Shock</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">{story.comment_count}</div>
                  <div className="text-gray-500">Comments</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
