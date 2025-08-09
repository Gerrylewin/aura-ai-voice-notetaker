
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface TopStoriesCardProps {
  topStories: Array<{
    id: string;
    title: string;
    profiles?: { display_name: string };
    view_count: number;
    heart_count: number;
    total_reactions: number;
  }>;
}

export function TopStoriesCard({ topStories }: TopStoriesCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Top Performing Stories</CardTitle>
        <p className="text-sm text-gray-400">Based on analytics events only</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topStories.map((story) => (
            <div key={story.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{story.title}</p>
                <p className="text-sm text-gray-400">by {story.profiles?.display_name || 'Anonymous'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">{story.view_count} analytics views</p>
                <div className="flex items-center text-sm text-gray-400">
                  <Heart className="w-3 h-3 mr-1 text-red-400" />
                  {story.heart_count} • {story.total_reactions} reactions
                </div>
              </div>
            </div>
          ))}
          {topStories.length === 0 && (
            <p className="text-center text-gray-400 py-4">No story analytics data available yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
