
import { useEffect } from 'react';
import { usePrivateChatData } from './chat/usePrivateChatData';
import { usePrivateChatActions } from './chat/usePrivateChatActions';

export function usePrivateChat() {
  const {
    privateChats,
    activeChatMessages,
    activeChatId,
    loading,
    fetchPrivateChats,
    fetchChatMessages,
    setActiveChatId,
    setPrivateChats
  } = usePrivateChatData();

  const { sendPrivateMessage, startPrivateChat } = usePrivateChatActions();

  // Auto-fetch messages when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      fetchChatMessages(activeChatId);
    }
  }, [activeChatId]);

  // Auto-fetch chats on mount
  useEffect(() => {
    fetchPrivateChats();
  }, []);

  return {
    privateChats,
    activeChatMessages,
    activeChatId,
    loading,
    fetchPrivateChats,
    fetchChatMessages,
    sendPrivateMessage,
    startPrivateChat,
    setActiveChatId,
    setPrivateChats
  };
}
