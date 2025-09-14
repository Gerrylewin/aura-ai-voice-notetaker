
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Zap, ThumbsDown } from 'lucide-react';
import { useStoryReactions } from '@/hooks/useStoryReactions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAuthorGamification } from '@/hooks/useAuthorGamification';

interface StoryReactionsProps {
  storyId: string;
  reactions: {
    heart: number;
    shock: number;
    'thumbs-down': number;
  };
  userReaction?: string;
  authorId?: string;
}

export function StoryReactions({ storyId, reactions, userReaction, authorId }: StoryReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { toggleReaction, loading } = useStoryReactions();
  const { refreshReactionPoints } = useAuthorGamification();
  
  // Local state for immediate UI feedback
  const [localUserReaction, setLocalUserReaction] = useState(userReaction);
  const [localReactions, setLocalReactions] = useState(reactions);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update local state when props change (from server)
  useEffect(() => {
    setLocalUserReaction(userReaction);
    setLocalReactions(reactions);
  }, [userReaction, reactions]);

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to react to stories.',
        variant: 'destructive'
      });
      return;
    }

    if (isProcessing) return;

    // Immediately update local state for visual feedback
    const previousReaction = localUserReaction;
    const previousReactions = { ...localReactions };
    
    setIsProcessing(true);
    
    // Calculate new local state
    let newUserReaction: string | undefined;
    const newReactions = { ...localReactions };
    
    if (previousReaction === reactionType) {
      // Removing current reaction
      newUserReaction = undefined;
      const key = reactionType === 'thumbs-down' ? 'thumbs-down' : reactionType as keyof typeof newReactions;
      newReactions[key] = Math.max(0, newReactions[key] - 1);
    } else {
      // Adding new reaction or switching
      newUserReaction = reactionType;
      
      // Remove old reaction count
      if (previousReaction) {
        const oldKey = previousReaction === 'thumbs-down' ? 'thumbs-down' : previousReaction as keyof typeof newReactions;
        newReactions[oldKey] = Math.max(0, newReactions[oldKey] - 1);
      }
      
      // Add new reaction count
      const newKey = reactionType === 'thumbs-down' ? 'thumbs-down' : reactionType as keyof typeof newReactions;
      newReactions[newKey] = newReactions[newKey] + 1;
    }
    
    // Update local state immediately
    setLocalUserReaction(newUserReaction);
    setLocalReactions(newReactions);

    try {
      await toggleReaction(storyId, reactionType);
      
      // Refresh reaction points for the story author if this affects their points
      if (authorId && refreshReactionPoints) {
        await refreshReactionPoints();
      }
      
      // Show encouraging message for self-reactions
      if (user.id === authorId) {
        toast({
          title: 'Self-reaction updated!',
          description: 'Your reaction counts as 0.5 points and helps get the voting started!',
        });
      } else if (previousReaction && previousReaction !== reactionType) {
        toast({
          title: 'Reaction updated!',
          description: 'You can change your vote anytime until the day ends.',
        });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      
      // Revert local state on error
      setLocalUserReaction(previousReaction);
      setLocalReactions(previousReactions);
      
      toast({
        title: 'Error',
        description: 'Failed to update reaction. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getReactionButton = (type: string, icon: React.ReactNode, count: number) => {
    const isActive = localUserReaction === type;
    const isOwnStory = user?.id === authorId;
    const isDisabled = loading || isProcessing;
    
    return (
      <Button
        variant={isActive ? "default" : "outline"}
        size="sm"
        onClick={() => handleReaction(type)}
        disabled={isDisabled}
        className={`flex items-center gap-1 transition-all duration-150 ease-in-out transform ${
          isActive 
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg scale-105' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 active:scale-95'
        } ${isOwnStory && isActive ? 'ring-2 ring-yellow-400' : ''} ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        title={
          isOwnStory && isActive 
            ? 'Your self-reaction (0.5 points)' 
            : user 
              ? 'Click to vote'
              : 'Sign in to vote'
        }
      >
        <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}>
          {icon}
        </span>
        <span className={`font-medium transition-all duration-150 ${isActive ? 'text-white font-bold' : ''}`}>
          {count}
        </span>
        {isOwnStory && isActive && (
          <span className="text-xs ml-1">★</span>
        )}
      </Button>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {getReactionButton('heart', <Heart className="w-4 h-4" />, localReactions.heart)}
      {getReactionButton('shock', <Zap className="w-4 h-4" />, localReactions.shock)}
      {getReactionButton('thumbs-down', <ThumbsDown className="w-4 h-4" />, localReactions['thumbs-down'])}
    </div>
  );
}
