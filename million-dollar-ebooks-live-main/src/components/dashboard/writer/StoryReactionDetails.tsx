import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Zap, ThumbsDown, UserPlus, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useToast } from '@/hooks/use-toast';

interface StoryReactionDetailsProps {
  storyId: string;
  storyTitle: string;
}

interface ReactionWithProfile {
  id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
    username?: string;
  };
}

export function StoryReactionDetails({ storyId, storyTitle }: StoryReactionDetailsProps) {
  const { user } = useAuth();
  const { friends, sendFriendRequest } = useFriends();
  const { toast } = useToast();
  const [reactions, setReactions] = useState<ReactionWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactionDetails();
  }, [storyId]);

  const fetchReactionDetails = async () => {
    setLoading(true);
    try {
      // First get the reactions
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('story_reactions')
        .select('id, user_id, reaction_type, created_at')
        .eq('story_id', storyId)
        .order('created_at', { ascending: false });

      if (reactionsError) throw reactionsError;

      if (!reactionsData || reactionsData.length === 0) {
        setReactions([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(reactionsData.map(r => r.user_id))];

      // Get profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const combinedData = reactionsData.map(reaction => {
        const profile = profilesData?.find(p => p.id === reaction.user_id);
        return {
          ...reaction,
          profiles: {
            display_name: profile?.display_name || 'Anonymous',
            avatar_url: profile?.avatar_url,
            username: profile?.username
          }
        };
      });

      setReactions(combinedData);
    } catch (error) {
      console.error('Error fetching reaction details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reaction details.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'shock':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'thumbs-down':
        return <ThumbsDown className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const isAlreadyFriend = (userId: string) => {
    return friends.some(friendship => 
      (friendship.requester_id === userId && friendship.addressee_id === user?.id) ||
      (friendship.addressee_id === userId && friendship.requester_id === user?.id)
    );
  };

  const handleAddFriend = async (userId: string, userName: string) => {
    try {
      await sendFriendRequest.mutateAsync(userId);
      toast({
        title: 'Friend request sent!',
        description: `Friend request sent to ${userName}`,
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleStartChat = (userId: string, userName: string, userAvatar?: string) => {
    // This would open a chat modal - for now just show a toast
    toast({
      title: 'Chat feature',
      description: `Chat with ${userName} - feature coming soon!`,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction_type]) {
      acc[reaction.reaction_type] = [];
    }
    acc[reaction.reaction_type].push(reaction);
    return acc;
  }, {} as Record<string, ReactionWithProfile[]>);

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Reactions for "{storyTitle}"
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          See who reacted to your story and connect with them
        </p>
      </CardHeader>
      <CardContent>
        {reactions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No reactions yet. Share your story to get more engagement!
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedReactions).map(([reactionType, reactionList]) => (
              <div key={reactionType} className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  {getReactionIcon(reactionType)}
                  <span className="capitalize">{reactionType === 'thumbs-down' ? 'Thumbs Down' : reactionType}</span>
                  <span className="text-sm text-gray-500">({reactionList.length})</span>
                </div>
                
                <div className="grid gap-3">
                  {reactionList.map((reaction) => (
                    <div 
                      key={reaction.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={reaction.profiles.avatar_url} />
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {reaction.profiles.display_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {reaction.profiles.display_name}
                          </div>
                          {reaction.profiles.username && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              @{reaction.profiles.username}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(reaction.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {reaction.user_id !== user?.id && (
                        <div className="flex gap-2">
                          {!isAlreadyFriend(reaction.user_id) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddFriend(reaction.user_id, reaction.profiles.display_name)}
                              disabled={sendFriendRequest.isPending}
                              className="flex items-center gap-1"
                            >
                              <UserPlus className="w-4 h-4" />
                              Add Friend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartChat(reaction.user_id, reaction.profiles.display_name, reaction.profiles.avatar_url)}
                              className="flex items-center gap-1"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Chat
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
