
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoryModal } from '@/components/stories/StoryModal';
import { SocialShareButton } from '@/components/social/SocialShareButton';
import { Eye, Calendar, Share2, BookOpen, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface StoryManagementProps {
  stories: any[];
}

export function StoryManagement({ stories }: StoryManagementProps) {
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const handleReadStory = (story: any) => {
    setSelectedStory(story);
    setIsStoryModalOpen(true);
  };

  const closeStoryModal = () => {
    setIsStoryModalOpen(false);
    setSelectedStory(null);
  };

  const getStoryShareUrl = (storyId: string) => {
    return `https://dollarebooks.app/stories?story=${storyId}`;
  };

  const getStoryShareTitle = (story: any) => {
    return `"${story.title}" by ${story.profiles?.display_name || 'Anonymous'}`;
  };

  const getStoryShareDescription = (story: any) => {
    return story.description || `Read this amazing story on Million Dollar eBooks!`;
  };

  const handleCopyLink = async (storyId: string) => {
    const url = getStoryShareUrl(storyId);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Story link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="space-y-4">
      {stories.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No stories published yet.
        </div>
      ) : (
        stories.map((story) => (
          <Card key={story.id} className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                      {story.title}
                    </h3>
                    {story.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {story.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {story.view_count} views
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleReadStory(story)}
                    variant="outline"
                    size="sm"
                    className="ml-4"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read Story
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share on Social Media
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <SocialShareButton
                      title={getStoryShareTitle(story)}
                      description={getStoryShareDescription(story)}
                      url={getStoryShareUrl(story.id)}
                      authorImageUrl={story.profiles?.avatar_url}
                      platform="twitter"
                      size="sm"
                    />
                    <SocialShareButton
                      title={getStoryShareTitle(story)}
                      description={getStoryShareDescription(story)}
                      url={getStoryShareUrl(story.id)}
                      authorImageUrl={story.profiles?.avatar_url}
                      platform="facebook"
                      size="sm"
                    />
                    <SocialShareButton
                      title={getStoryShareTitle(story)}
                      description={getStoryShareDescription(story)}
                      url={getStoryShareUrl(story.id)}
                      authorImageUrl={story.profiles?.avatar_url}
                      platform="linkedin"
                      size="sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopyLink(story.id)}
                      className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900 w-full justify-center"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="ml-2 hidden sm:inline">Copy Link</span>
                      <span className="ml-2 sm:hidden">Copy</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {selectedStory && (
        <StoryModal
          isOpen={isStoryModalOpen}
          onClose={closeStoryModal}
          story={selectedStory}
        />
      )}
    </div>
  );
}
