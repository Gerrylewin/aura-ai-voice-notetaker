
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, MessageCircle } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface IRCUserActionsProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  onStartPrivateChat: (userId: string, userName: string, userAvatar?: string) => void;
}

export function IRCUserActions({ userId, userName, userAvatar, onStartPrivateChat }: IRCUserActionsProps) {
  const { profile } = useAuth();
  const { friends, sendFriendRequest } = useFriends();
  const { toast } = useToast();

  // Don't show actions for yourself
  if (userId === profile?.id) return null;

  // Don't show actions for anonymous users
  if (userName === 'Anonymous') return null;

  // Check if already friends
  const isFriend = friends.some(friendship => 
    (friendship.requester_id === userId && friendship.addressee_id === profile?.id) ||
    (friendship.addressee_id === userId && friendship.requester_id === profile?.id)
  );

  const handleAddFriend = async () => {
    try {
      console.log('Attempting to send friend request to:', userId);
      await sendFriendRequest.mutateAsync(userId);
      toast({
        title: 'Friend request sent',
        description: `Friend request sent to ${userName}`,
      });
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast({
        title: 'Failed to send friend request',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const handleStartChat = () => {
    if (!isFriend) {
      toast({
        title: 'Cannot start chat',
        description: 'You need to be friends to start a private chat.',
        variant: 'destructive'
      });
      return;
    }
    onStartPrivateChat(userId, userName, userAvatar);
  };

  return (
    <div className="flex gap-1">
      {!isFriend && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAddFriend}
          disabled={sendFriendRequest.isPending}
          className="text-gray-400 hover:text-green-400 p-1 h-6 w-6"
          title="Add friend"
        >
          <UserPlus className="w-3 h-3" />
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleStartChat}
        disabled={!isFriend}
        className={`p-1 h-6 w-6 ${
          isFriend 
            ? 'text-gray-400 hover:text-blue-400' 
            : 'text-gray-600 cursor-not-allowed'
        }`}
        title={isFriend ? "Start private chat" : "Must be friends to chat"}
      >
        <MessageCircle className="w-3 h-3" />
      </Button>
    </div>
  );
}
