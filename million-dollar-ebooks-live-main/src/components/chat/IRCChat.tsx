
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { IRCChatHeader } from './IRCChatHeader';
import { IRCChatMessages } from './IRCChatMessages';
import { IRCChatInput } from './IRCChatInput';
import { ChatSidebar } from './ChatSidebar';
import { usePublicChat } from '@/hooks/usePublicChat';
import { usePrivateChat } from '@/hooks/usePrivateChat';
import { useAuth } from '@/hooks/useAuth';

interface PrivateChat {
  conversationId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  unreadCount: number;
}

interface IRCChatProps {
  initialPrivateChat?: {
    userId: string;
    userName: string;
    userAvatar?: string;
  };
  embedded?: boolean;
}

export function IRCChat({ initialPrivateChat, embedded = false }: IRCChatProps) {
  const { user } = useAuth();
  const { 
    messages: publicMessages, 
    isLoading: publicLoading, 
    sendMessage: sendPublicMessage, 
    deleteMessage: deletePublicMessage, 
    isSending: publicSending, 
    isDeleting: publicDeleting 
  } = usePublicChat();
  
  const [activeChannel, setActiveChannel] = useState<'public' | string>('public');

  const {
    privateChats,
    activeChatMessages: privateMessages,
    sendPrivateMessage,
    loading: privateLoading,
    startPrivateChat,
    setActiveChatId,
    activeChatId,
    setPrivateChats
  } = usePrivateChat();

  // Set initial active channel if we have an initial private chat
  React.useEffect(() => {
    if (initialPrivateChat && activeChannel === 'public') {
      setActiveChannel(initialPrivateChat.userId);
      startPrivateChat(initialPrivateChat.userId, initialPrivateChat.userName, initialPrivateChat.userAvatar);
    }
  }, [initialPrivateChat, activeChannel]);

  // Update active chat when channel changes
  React.useEffect(() => {
    if (activeChannel !== 'public' && activeChatId !== activeChannel) {
      setActiveChatId(activeChannel);
    }
  }, [activeChannel, activeChatId, setActiveChatId]);

  const handleDeleteMessage = async (messageId: string) => {
    console.log('IRCChat: Delete message requested:', messageId);
    
    try {
      if (activeChannel === 'public') {
        await deletePublicMessage(messageId);
      }
      // For private messages, we'd need to implement private message deletion
      console.log('IRCChat: Message deleted successfully');
    } catch (error) {
      console.error('IRCChat: Failed to delete message:', error);
    }
  };

  const handleStartPrivateChat = async (userId: string, userName: string, userAvatar?: string) => {
    const existingChat = privateChats.find(chat => chat.participantId === userId);
    
    if (!existingChat) {
      const conversationId = await startPrivateChat(userId, userName, userAvatar);
      if (conversationId) {
        const newChat: PrivateChat = {
          conversationId,
          participantId: userId,
          participantName: userName,
          participantAvatar: userAvatar,
          unreadCount: 0
        };
        setPrivateChats(prev => [...prev, newChat]);
      }
    }
    
    setActiveChannel(existingChat?.conversationId || userId);
  };

  const handleRemovePrivateChat = (chatId: string) => {
    setPrivateChats(prev => prev.filter(chat => chat.conversationId !== chatId));
    if (activeChannel === chatId) {
      setActiveChannel('public');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (activeChannel === 'public') {
      await sendPublicMessage(content);
    } else {
      await sendPrivateMessage(activeChannel, content);
    }
  };

  // Calculate unique users - for public channel use actual count, for private show 1 (just current user)
  const uniqueUsers = activeChannel === 'public' 
    ? new Set(publicMessages.map(m => m.user_id)).size 
    : 1; // For private chats, we can only confirm the current user is online
    
  const currentMessages = activeChannel === 'public' ? publicMessages : privateMessages;
  const isLoading = activeChannel === 'public' ? publicLoading : privateLoading;
  const isSending = activeChannel === 'public' ? publicSending : false;

  const isPrivateChannel = activeChannel !== 'public';
  const currentChatName = isPrivateChannel 
    ? privateChats.find(chat => chat.conversationId === activeChannel)?.participantName || 'Private Chat'
    : 'Public Chat';

  // Full embedded layout for the chat page
  if (!embedded) {
    return (
      <div className="h-full flex bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - responsive */}
        <div className="hidden md:block md:w-80 lg:w-96">
          <ChatSidebar
            privateChats={privateChats}
            activeChannel={activeChannel}
            onChannelSelect={setActiveChannel}
            onRemoveChat={handleRemovePrivateChat}
            className="h-full rounded-none border-r border-gray-200 dark:border-gray-700"
          />
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-0 md:border-l border-gray-200 dark:border-gray-700 rounded-none">
            <IRCChatHeader 
              uniqueUsers={uniqueUsers} 
              messagesCount={currentMessages.length}
              channelName={currentChatName}
              isPrivate={isPrivateChannel}
            />
            
            <IRCChatMessages
              messages={currentMessages}
              isLoading={isLoading}
              onDeleteMessage={handleDeleteMessage}
              onStartPrivateChat={handleStartPrivateChat}
              isPrivateChannel={isPrivateChannel}
            />
            
            <IRCChatInput
              onSendMessage={handleSendMessage}
              isLoading={isSending || publicDeleting}
              disabled={!user}
              placeholder={isPrivateChannel ? `Message ${currentChatName}...` : "Type your message..."}
            />
          </Card>
        </div>

        {/* Mobile sidebar overlay */}
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 hidden" id="mobile-sidebar-overlay">
          <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800">
            <ChatSidebar
              privateChats={privateChats}
              activeChannel={activeChannel}
              onChannelSelect={setActiveChannel}
              onRemoveChat={handleRemovePrivateChat}
              className="h-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // Original embedded widget layout (smaller, for dashboard etc)
  return (
    <div className="flex h-[700px] gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
      <ChatSidebar
        privateChats={privateChats}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
        onRemoveChat={handleRemovePrivateChat}
      />
      
      <Card className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <IRCChatHeader 
          uniqueUsers={uniqueUsers} 
          messagesCount={currentMessages.length}
          channelName={currentChatName}
          isPrivate={isPrivateChannel}
        />
        
        <IRCChatMessages
          messages={currentMessages}
          isLoading={isLoading}
          onDeleteMessage={handleDeleteMessage}
          onStartPrivateChat={handleStartPrivateChat}
          isPrivateChannel={isPrivateChannel}
        />
        
        <IRCChatInput
          onSendMessage={handleSendMessage}
          isLoading={isSending || publicDeleting}
          disabled={!user}
          placeholder={isPrivateChannel ? `Message ${currentChatName}...` : "Type your message..."}
        />
      </Card>
    </div>
  );
}
