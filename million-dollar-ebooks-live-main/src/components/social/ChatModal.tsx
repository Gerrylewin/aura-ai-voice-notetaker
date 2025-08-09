
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Send, Book } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { BookGiftModal } from './BookGiftModal';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendId: string;
  friendName: string;
  friendAvatar?: string;
}

export function ChatModal({ isOpen, onClose, friendId, friendName, friendAvatar }: ChatModalProps) {
  const { profile } = useAuth();
  const { conversations, createConversation, deleteConversation, sendMessage } = useChat();
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find existing conversation
  useEffect(() => {
    if (conversations.length > 0 && friendId) {
      const existing = conversations.find(conv => 
        (conv.participant1_id === friendId && conv.participant2_id === profile?.id) ||
        (conv.participant2_id === friendId && conv.participant1_id === profile?.id)
      );
      setConversationId(existing?.id || null);
    }
  }, [conversations, friendId, profile?.id]);

  const messagesQuery = useChat().getMessages(conversationId || '');
  const messages = messagesQuery.data || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    let currentConversationId = conversationId;
    
    // Create conversation if it doesn't exist
    if (!currentConversationId) {
      try {
        const newConversation = await createConversation.mutateAsync(friendId);
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
      } catch (error) {
        return;
      }
    }

    await sendMessage.mutateAsync({
      conversationId: currentConversationId,
      content: message
    });

    setMessage('');
  };

  const handleDeleteConversation = async () => {
    if (!conversationId) return;
    await deleteConversation.mutateAsync(conversationId);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md h-[600px] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={friendAvatar} />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {friendName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <DialogTitle>{friendName}</DialogTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowGiftModal(true)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Book className="w-4 h-4" />
                </Button>
                {conversationId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteConversation}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender_id === profile?.id 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-gray-100'
                  }`}>
                    {msg.message_type === 'book_recommendation' && msg.book ? (
                      <div className="space-y-2">
                        <p className="text-sm">📚 Book Recommendation:</p>
                        <div className="p-2 bg-gray-800 rounded">
                          <p className="font-semibold">{msg.book.title}</p>
                          <p className="text-sm text-gray-300">by {msg.book.author_name}</p>
                        </div>
                        {msg.decrypted_content && msg.decrypted_content !== msg.book.title && (
                          <p className="text-sm">{msg.decrypted_content}</p>
                        )}
                      </div>
                    ) : (
                      <p>{msg.decrypted_content}</p>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex-shrink-0 p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="bg-gray-800 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessage.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showGiftModal && (
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
    </>
  );
}
