
import React, { useState, useCallback } from 'react';
import { StoryCard } from './StoryCard';
import { StoryModal } from './StoryModal';
import { StorySubmissionForm } from './StorySubmissionForm';
import { DailyWinner } from './DailyWinner';
import { Button } from '@/components/ui/button';
import { PenTool, Loader2 } from 'lucide-react';
import { usePaginatedStories } from '@/hooks/usePaginatedStories';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const STORIES_PER_PAGE = 10;

export function VirtualizedStoryFeed() {
  const { user } = useAuth();
  const {
    stories,
    loading,
    hasNextPage,
    hasSubmittedToday,
    loadMore,
    submitStory: submitStoryBase
  } = usePaginatedStories(STORIES_PER_PAGE);
  
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const handleStoryClick = useCallback((story: any) => {
    setSelectedStory(story);
  }, []);

  const handleStorySubmitted = useCallback(() => {
    setShowSubmissionForm(false);
  }, []);

  return (
    <ErrorBoundary>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <DailyWinner />

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Share Your Story
            </h2>
            <Button
              onClick={() => setShowSubmissionForm(true)}
              disabled={!user || hasSubmittedToday}
              className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
            >
              <PenTool className="w-4 h-4 mr-2" />
              {hasSubmittedToday ? 'Submitted Today' : 'Write Story'}
            </Button>
          </div>
          
          <div className="text-gray-600 dark:text-gray-400">
            {!user ? (
              <p>Sign in to share your daily story with the community.</p>
            ) : hasSubmittedToday ? (
              <p>You've already submitted your story for today. Come back tomorrow!</p>
            ) : (
              <p>What's your story today? Share your thoughts, experiences, or creativity with our community.</p>
            )}
          </div>
        </div>

        {showSubmissionForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Write Your Story
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowSubmissionForm(false)}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                Cancel
              </Button>
            </div>
            <StorySubmissionForm onStorySubmitted={handleStorySubmitted} />
          </div>
        )}

        <div className="space-y-6">
          {loading && stories.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-600">Loading stories...</span>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No stories have been shared today yet.
              </p>
              <p className="text-gray-400 dark:text-gray-500">
                Be the first to share your story!
              </p>
            </div>
          ) : (
            <>
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={{
                    ...story,
                    is_daily_winner: story.is_daily_winner || false,
                    reactions: story.reactions || { heart: 0, shock: 0, 'thumbs-down': 0 }
                  }}
                  onClick={() => handleStoryClick(story)}
                />
              ))}
              
              {hasNextPage && (
                <div className="flex justify-center py-8">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    variant="outline"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Stories'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <StoryModal
          isOpen={!!selectedStory}
          onClose={() => setSelectedStory(null)}
          story={selectedStory}
        />
      </div>
    </ErrorBoundary>
  );
}
