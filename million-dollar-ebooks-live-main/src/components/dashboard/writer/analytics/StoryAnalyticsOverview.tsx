
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Eye, MousePointer, Heart, MessageCircle } from 'lucide-react';

interface StoryAnalyticsOverviewProps {
  storyAnalytics: Array<{
    view_count: number;
    click_count: number;
    total_reads: number;
    total_reactions: number;
    comment_count: number;
  }>;
}

export function StoryAnalyticsOverview({ storyAnalytics }: StoryAnalyticsOverviewProps) {
  const totalStories = storyAnalytics.length;
  const totalViews = storyAnalytics.reduce((sum, story) => sum + story.view_count, 0);
  const totalClicks = storyAnalytics.reduce((sum, story) => sum + story.click_count, 0);
  const totalReads = storyAnalytics.reduce((sum, story) => sum + story.total_reads, 0);
  const totalReactions = storyAnalytics.reduce((sum, story) => sum + story.total_reactions, 0);
  const totalComments = storyAnalytics.reduce((sum, story) => sum + story.comment_count, 0);

  const overviewStats = [
    { icon: Calendar, label: 'Stories Written', value: totalStories, color: 'text-blue-600' },
    { icon: Eye, label: 'Total Views', value: totalViews, color: 'text-green-600' },
    { icon: MousePointer, label: 'Story Clicks', value: totalClicks, color: 'text-orange-600' },
    { icon: Heart, label: 'Total Reactions', value: totalReactions, color: 'text-red-600' },
    { icon: MessageCircle, label: 'Total Comments', value: totalComments, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {overviewStats.map((stat) => (
        <Card key={stat.label} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
