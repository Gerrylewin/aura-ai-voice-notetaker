
import React from 'react';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/stories/StoryCard';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { usePaginatedStories } from '@/hooks/usePaginatedStories';
import { useNavigate } from 'react-router-dom';
import { PenTool, ArrowRight, Loader2 } from 'lucide-react';

export const StoriesSection = () => {
  const { stories, loading } = usePaginatedStories(3);
  const navigate = useNavigate();

  const handleStoryClick = (story: any) => {
    navigate('/stories');
  };

  const handleReadAllStories = () => {
    navigate('/stories');
  };

  const handleWriteStory = () => {
    navigate('/stories');
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/50 to-transparent">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white leading-tight">
            Daily Stories
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-light px-4">
            Fresh stories every day from our community of writers. Read, react, and discover new voices.
          </p>
        </div>

        <ErrorBoundary fallback={
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-8">Unable to load stories at the moment.</p>
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold"
              onClick={handleWriteStory}
            >
              <PenTool className="w-5 h-5 mr-2" />
              Write a Story
            </Button>
          </div>
        }>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : stories.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 mb-8 sm:mb-12">
              {stories.map((story) => (
                <div key={story.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
                  <StoryCard
                    story={{
                      ...story,
                      is_daily_winner: story.is_daily_winner || false,
                      reactions: story.reactions || { heart: 0, shock: 0, 'thumbs-down': 0 }
                    }}
                    onClick={() => handleStoryClick(story)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-8">No stories yet today. Be the first to share yours!</p>
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold"
                onClick={handleWriteStory}
              >
                <PenTool className="w-5 h-5 mr-2" />
                Write a Story
              </Button>
            </div>
          )}
        </ErrorBoundary>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold"
              onClick={handleReadAllStories}
            >
              Read All Stories
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-white px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold text-white bg-transparent hover:bg-white hover:text-gray-900"
              onClick={handleWriteStory}
            >
              <PenTool className="w-5 h-5 mr-2" />
              Write Your Story
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
