
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MessageCircle, Users } from 'lucide-react';
import { usePrivateChat } from '@/hooks/usePrivateChat';
import { IRCChatMessages } from './IRCChatMessages';
import { IRCChatInput } from './IRCChatInput';

interface IRCPrivateChatTabsProps {
  conversations: any[];
  onClose: () => void;
}

export function IRCPrivateChatTabs({ conversations, onClose }: IRCPrivateChatTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('');
  const { activeChatMessages, sendPrivateMessage } = usePrivateChat();

  useEffect(() => {
    if (conversations.length > 0 && !activeTab) {
      setActiveTab(conversations[0].id);
    }
  }, [conversations, activeTab]);

  const handleSendMessage = async (content: string) => {
    if (activeTab) {
      await sendPrivateMessage(activeTab, content);
    }
  };

  const getUnreadCount = (conversationId: string) => {
    return activeChatMessages?.filter(msg => !msg.is_read && msg.conversation_id === conversationId).length || 0;
  };

  const getOtherParticipant = (conversation: any) => {
    // Logic to get the other participant's name
    return conversation.participant1_id === conversation.current_user_id 
      ? conversation.participant2_name 
      : conversation.participant1_name;
  };

  const handleDeleteMessage = (messageId: string) => {
    // TODO: Implement message deletion
    console.log('Delete message:', messageId);
  };

  const handleStartPrivateChat = (userId: string, userName: string, userAvatar?: string) => {
    // TODO: Implement starting new private chat
    console.log('Start private chat with:', userId, userName);
  };

  if (conversations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Private Messages</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No private conversations yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Private Messages</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
            {conversations.map((conversation) => {
              const unreadCount = getUnreadCount(conversation.id);
              const participantName = getOtherParticipant(conversation);
              
              return (
                <TabsTrigger
                  key={conversation.id}
                  value={conversation.id}
                  className="relative px-4 py-2 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 border-b-2 border-transparent data-[state=active]:border-blue-500"
                >
                  <span className="truncate max-w-[120px]">{participantName}</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 min-w-5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {conversations.map((conversation) => (
          <TabsContent key={conversation.id} value={conversation.id} className="p-0">
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-hidden">
                <IRCChatMessages 
                  messages={activeChatMessages?.filter(msg => msg.conversation_id === conversation.id) || []}
                  isLoading={false}
                  onDeleteMessage={handleDeleteMessage}
                  onStartPrivateChat={handleStartPrivateChat}
                  isPrivateChannel={true}
                />
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <IRCChatInput 
                  onSendMessage={handleSendMessage}
                  placeholder={`Message ${getOtherParticipant(conversation)}...`}
                  isLoading={false}
                />
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
