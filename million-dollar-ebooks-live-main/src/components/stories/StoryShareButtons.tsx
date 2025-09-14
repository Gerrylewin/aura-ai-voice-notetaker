
import React from 'react';
import { SocialShareButton } from '@/components/social/SocialShareButton';
import { Share2 } from 'lucide-react';

interface StoryShareButtonsProps {
  story: {
    id: string;
    title: string;
    description: string;
    profiles: {
      display_name: string;
      avatar_url?: string;
    };
  };
}

export function StoryShareButtons({ story }: StoryShareButtonsProps) {
  const shareUrl = `https://dollarebooks.app/stories?story=${story.id}`;
  const shareTitle = `"${story.title}" by ${story.profiles.display_name}`;
  const shareDescription = story.description || `Read this amazing story by ${story.profiles.display_name} on Million Dollar eBooks`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Share2 className="w-4 h-4" />
        <span>Share this story</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SocialShareButton
          title={shareTitle}
          description={shareDescription}
          url={shareUrl}
          authorImageUrl={story.profiles.avatar_url}
          platform="twitter"
          size="sm"
        />
        
        <SocialShareButton
          title={shareTitle}
          description={shareDescription}
          url={shareUrl}
          authorImageUrl={story.profiles.avatar_url}
          platform="facebook"
          size="sm"
        />
        
        <SocialShareButton
          title={shareTitle}
          description={shareDescription}
          url={shareUrl}
          authorImageUrl={story.profiles.avatar_url}
          platform="linkedin"
          size="sm"
        />
        
        <SocialShareButton
          title={shareTitle}
          description={shareDescription}
          url={shareUrl}
          authorImageUrl={story.profiles.avatar_url}
          platform="native"
          size="sm"
        />
      </div>
    </div>
  );
}
