
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Search, MessageCircle, Gift, Users } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { BookGiftModal } from './BookGiftModal';
import { ChatModal } from './ChatModal';

export function FriendsPanel() {
  const { friends } = useFriends();
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  const openGiftModal = (friend: any) => {
    setSelectedFriend(friend);
    setShowGiftModal(true);
  };

  const openChatModal = (friend: any) => {
    setSelectedFriend(friend);
    setShowChatModal(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Friends
          </h3>
          <div className="flex gap-2">
            <Input 
              placeholder="Search by username or email"
              className="flex-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            />
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Friends ({friends.length})
          </h3>
          <div className="space-y-4">
            {friends.map((friendship) => {
              // Determine which user is the friend (not the current user)
              const friend = friendship.requester_id === friendship.requester?.display_name 
                ? friendship.addressee 
                : friendship.requester;
              
              const friendId = friendship.requester_id === friendship.requester?.display_name 
                ? friendship.addressee_id 
                : friendship.requester_id;

              return (
                <div key={friendship.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend?.avatar_url} alt={friend?.display_name} />
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {friend?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{friend?.display_name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {friend?.username ? `@${friend.username}` : 'Friend'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => openChatModal({ id: friendId, name: friend?.display_name, avatar: friend?.avatar_url })}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => openGiftModal({ id: friendId, name: friend?.display_name })}
                    >
                      <Gift className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedFriend && showGiftModal && (
        <BookGiftModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          book={{
            id: '',
            title: '',
            author_name: '',
            cover_image_url: '',
            price_cents: 0
          }}
        />
      )}

      {selectedFriend && showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          friendId={selectedFriend.id}
          friendName={selectedFriend.name}
          friendAvatar={selectedFriend.avatar}
        />
      )}
    </div>
  );
}
