
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Eye, MessageCircle, Trophy, Clock } from 'lucide-react';
import { StoryReactions } from './StoryReactions';
import { StoryBookmarkButton } from './StoryBookmarkButton';
import { StoryModerationActions } from '@/components/moderation/StoryModerationActions';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    description?: string;
    content: string;
    author_id: string;
    story_date: string;
    created_at: string;
    view_count: number;
    is_daily_winner?: boolean;
    profiles: {
      display_name: string;
      avatar_url?: string;
    };
    reactions: {
      heart: number;
      shock: number;
      'thumbs-down': number;
    };
    user_reaction?: string;
  };
  onClick: () => void;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  const { profile } = useAuth();
  const isModerator = profile?.user_role === 'moderator' || profile?.user_role === 'admin';

  const getPreviewText = (content: string, maxLength: number = 150) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="w-10 h-10">
              <AvatarImage src={story.profiles?.avatar_url} />
              <AvatarFallback>
                {story.profiles?.display_name?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {story.profiles?.display_name || 'Anonymous'}
                </p>
                {story.is_daily_winner && (
                  <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
                    <Trophy className="w-3 h-3 mr-1" />
                    Winner
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StoryBookmarkButton storyId={story.id} />
            {isModerator && (
              <StoryModerationActions 
                storyId={story.id} 
                authorId={story.author_id}
              />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={onClick}>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
            {story.title}
          </h3>
          
          {story.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
              {story.description}
            </p>
          )}
          
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
            {getPreviewText(story.content)}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {story.view_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                0
              </span>
            </div>
            
            <StoryReactions 
              storyId={story.id}
              reactions={story.reactions}
              userReaction={story.user_reaction}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
