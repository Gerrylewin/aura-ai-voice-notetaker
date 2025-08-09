
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStoryAnalyticsData } from '@/hooks/useStoryAnalyticsData';
import { StoryAnalyticsOverview } from './StoryAnalyticsOverview';
import { StoryPerformanceCard } from './StoryPerformanceCard';
import { StoryReactionDetails } from '../StoryReactionDetails';

export function StoryAnalyticsContainer() {
  const { storyAnalytics, loading } = useStoryAnalyticsData();
  const [selectedStoryForReactions, setSelectedStoryForReactions] = useState<{id: string, title: string} | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (selectedStoryForReactions) {
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setSelectedStoryForReactions(null)}
          className="mb-4"
        >
          ← Back to Analytics
        </Button>
        <StoryReactionDetails 
          storyId={selectedStoryForReactions.id} 
          storyTitle={selectedStoryForReactions.title}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StoryAnalyticsOverview storyAnalytics={storyAnalytics} />
      <StoryPerformanceCard 
        storyAnalytics={storyAnalytics} 
        onViewReactions={setSelectedStoryForReactions}
      />
    </div>
  );
}
