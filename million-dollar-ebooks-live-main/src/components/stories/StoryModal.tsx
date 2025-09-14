
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoryReactions } from './StoryReactions';
import { StoryComments } from './StoryComments';
import { StoryShareButtons } from './StoryShareButtons';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStoryAnalytics } from '@/hooks/useStoryAnalytics';
import { useMobileUtils } from '@/hooks/useMobileUtils';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: {
    id: string;
    title: string;
    description: string;
    content: string;
    author_id: string;
    story_date: string;
    created_at: string;
    view_count: number;
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
  } | null;
}

export function StoryModal({ isOpen, onClose, story }: StoryModalProps) {
  const { trackStoryView, trackStoryRead } = useStoryAnalytics();
  const { isMobile } = useMobileUtils();
  const [readStartTime, setReadStartTime] = useState<number | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (isOpen && story) {
      trackStoryView(story.id);
      setReadStartTime(Date.now());

      const originalTitle = document.title;
      document.title = `${story.title} by ${story.profiles.display_name} - Million Dollar eBooks`;
      
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', `https://dollarebooks.app/stories?story=${story.id}`);

      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: story.title,
        description: story.description || story.content.substring(0, 200),
        author: {
          '@type': 'Person',
          name: story.profiles.display_name
        },
        datePublished: story.created_at,
        dateModified: story.created_at,
        url: `https://dollarebooks.app/stories?story=${story.id}`,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://dollarebooks.app/stories?story=${story.id}`
        },
        publisher: {
          '@type': 'Organization',
          name: 'Million Dollar eBooks',
          logo: {
            '@type': 'ImageObject',
            url: 'https://milliondollarebooks.com/lovable-uploads/41d6c92c-08df-42d6-abd8-bf3735f498ca.png'
          }
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      script.id = 'story-modal-structured-data';
      
      const existingScript = document.getElementById('story-modal-structured-data');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      document.head.appendChild(script);

      return () => {
        document.title = originalTitle;
        const scriptToRemove = document.getElementById('story-modal-structured-data');
        if (scriptToRemove) {
          document.head.removeChild(scriptToRemove);
        }
        
        if (readStartTime) {
          const duration = Math.floor((Date.now() - readStartTime) / 1000);
          trackStoryRead(story.id, duration);
        }
      };
    }
  }, [isOpen, story, trackStoryView, trackStoryRead, readStartTime]);

  if (!story) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${isMobile 
            ? 'max-w-[95vw] max-h-[95vh] p-0 m-2' 
            : 'max-w-6xl max-h-[90vh] p-0'
          } 
          bg-white dark:bg-gray-900 overflow-hidden
        `} 
        role="dialog" 
        aria-labelledby="story-title"
      >
        {isMobile ? (
          // Mobile Layout - Single Column with Comments Toggle
          <div className="flex flex-col h-full max-h-[95vh]">
            {/* Mobile Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="p-2"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={story.profiles.avatar_url} alt={`${story.profiles.display_name}'s avatar`} />
                  <AvatarFallback>
                    {story.profiles.display_name?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    by {story.profiles.display_name}
                  </p>
                  <time dateTime={story.created_at} className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                  </time>
                </div>
                <StoryReactions 
                  storyId={story.id}
                  reactions={story.reactions}
                  userReaction={story.user_reaction}
                />
              </div>
            </div>

            {showComments ? (
              // Comments View
              <div className="flex-1 overflow-hidden">
                <StoryComments storyId={story.id} />
              </div>
            ) : (
              // Story Content View
              <>
                <div className="p-4 flex-shrink-0">
                  <DialogTitle id="story-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {story.title}
                  </DialogTitle>
                  {story.description && (
                    <p className="text-gray-600 dark:text-gray-300 italic text-sm leading-relaxed">
                      {story.description}
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-hidden px-4">
                  <ScrollArea className="h-full">
                    <article className="pb-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {story.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3 leading-relaxed text-gray-900 dark:text-gray-100">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </article>
                  </ScrollArea>
                </div>

                <div className="p-4 flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
                  <StoryShareButtons story={story} />
                </div>
              </>
            )}
          </div>
        ) : (
          // Desktop Layout - Two Column
          <div className="flex h-full max-h-[90vh]">
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <DialogHeader className="pb-4 flex-shrink-0">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={story.profiles.avatar_url} alt={`${story.profiles.display_name}'s avatar`} />
                    <AvatarFallback>
                      {story.profiles.display_name?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="truncate">by {story.profiles.display_name}</span>
                      <span>•</span>
                      <time dateTime={story.created_at} className="whitespace-nowrap">
                        {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle id="story-title" className="text-2xl font-bold text-gray-900 dark:text-white flex-1 min-w-0 break-words">
                    {story.title}
                  </DialogTitle>
                  <div className="flex-shrink-0">
                    <StoryReactions 
                      storyId={story.id}
                      reactions={story.reactions}
                      userReaction={story.user_reaction}
                    />
                  </div>
                </div>
              </DialogHeader>

              {story.description && (
                <div className="mb-6 flex-shrink-0">
                  <p className="text-lg text-gray-600 dark:text-gray-300 italic leading-relaxed break-words">
                    {story.description}
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <article className="space-y-4">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      {story.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 leading-relaxed break-words">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </article>
                </ScrollArea>
              </div>

              <div className="pt-4 flex-shrink-0">
                <Separator className="mb-4" />
                <StoryShareButtons story={story} />
              </div>
            </div>

            <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  Discussion
                </h3>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <StoryComments storyId={story.id} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
