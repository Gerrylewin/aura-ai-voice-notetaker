
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

interface AdminPrivateChatProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar?: string;
}

export function AdminPrivateChat({ 
  isOpen, 
  onClose, 
  targetUserId, 
  targetUserName, 
  targetUserAvatar 
}: AdminPrivateChatProps) {
  const { profile } = useAuth();
  const { conversations, createConversation, sendMessage } = useChat();
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find or create conversation with target user
  useEffect(() => {
    if (conversations.length > 0 && targetUserId) {
      const existing = conversations.find(conv => 
        (conv.participant1_id === targetUserId && conv.participant2_id === profile?.id) ||
        (conv.participant2_id === targetUserId && conv.participant1_id === profile?.id)
      );
      setConversationId(existing?.id || null);
    }
  }, [conversations, targetUserId, profile?.id]);

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
        const newConversation = await createConversation.mutateAsync(targetUserId);
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        return;
      }
    }

    await sendMessage.mutateAsync({
      conversationId: currentConversationId,
      content: message
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 max-w-lg h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={targetUserAvatar} />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {targetUserName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-gray-900 dark:text-white">{targetUserName}</DialogTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">Private Admin Chat</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 border-gray-300 hover:border-red-300 dark:border-gray-600 dark:hover:border-red-500"
            >
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>Start a private conversation with {targetUserName}</p>
                <p className="text-xs mt-2">This is an admin-initiated private chat</p>
              </div>
            )}
            
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender_id === profile?.id 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  <p className="text-sm">{msg.decrypted_content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessage.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
