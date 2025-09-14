
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gift } from 'lucide-react';
import { useFriends } from '@/hooks/useFriends';
import { useBookGifts } from '@/hooks/useBookGifts';
import { useAuth } from '@/hooks/useAuth';

interface BookGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
    author_name: string;
    cover_image_url?: string;
    price_cents?: number;
  };
}

export function BookGiftModal({ isOpen, onClose, book }: BookGiftModalProps) {
  const { friends } = useFriends();
  const { sendBookGift } = useBookGifts();
  const { profile } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendGift = async () => {
    if (!selectedFriend) return;
    
    setIsSubmitting(true);
    try {
      await sendBookGift.mutateAsync({
        recipientId: selectedFriend,
        bookId: book.id,
        message: message.trim() || undefined,
      });
      onClose();
      setSelectedFriend('');
      setMessage('');
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-red-400" />
            Gift Book to Friend
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Book Info */}
          <div className="flex gap-4 p-4 bg-gray-800 rounded-lg">
            <img
              src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=80&h=120&fit=crop'}
              alt={book.title}
              className="w-16 h-24 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold">{book.title}</h3>
              <p className="text-gray-400">by {book.author_name}</p>
              {book.price_cents && (
                <p className="text-green-400 mt-2">${(book.price_cents / 100).toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Friend Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select Friend</label>
            <Select value={selectedFriend} onValueChange={setSelectedFriend}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Choose a friend to gift this book to..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {friends.map((friendship) => {
                  // Determine which user is the friend (not the current user)
                  const friend = friendship.requester_id === profile?.id 
                    ? friendship.addressee 
                    : friendship.requester;
                  
                  const friendId = friendship.requester_id === profile?.id 
                    ? friendship.addressee_id 
                    : friendship.requester_id;
                  
                  return (
                    <SelectItem key={friendship.id} value={friendId}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={friend?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {friend?.display_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {friend?.display_name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Gift Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Gift Message (Optional)</label>
            <Textarea
              placeholder="Write a personal message with your gift..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSendGift}
              disabled={!selectedFriend || isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Gift className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending Gift...' : 'Send Gift'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
