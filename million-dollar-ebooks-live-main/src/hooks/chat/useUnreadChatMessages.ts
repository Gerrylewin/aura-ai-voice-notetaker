
import { useEffect, useState } from 'react';
import { usePublicChatMessages } from './usePublicChatMessages';
import { useAuth } from '../useAuth';

export function useUnreadChatMessages() {
  const { data: messages = [] } = usePublicChatMessages();
  const { profile } = useAuth();
  const [lastReadTimestamp, setLastReadTimestamp] = useState<string | null>(null);

  // Load last read timestamp from localStorage on mount
  useEffect(() => {
    if (profile?.id) {
      const stored = localStorage.getItem(`chat_last_read_${profile.id}`);
      setLastReadTimestamp(stored);
    }
  }, [profile?.id]);

  // Mark messages as read when chat is opened
  const markAsRead = () => {
    if (profile?.id && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const timestamp = latestMessage.created_at;
      localStorage.setItem(`chat_last_read_${profile.id}`, timestamp);
      setLastReadTimestamp(timestamp);
    }
  };

  // Calculate unread count
  const unreadCount = lastReadTimestamp 
    ? messages.filter(message => 
        message.created_at > lastReadTimestamp && 
        message.user_id !== profile?.id
      ).length 
    : messages.filter(message => message.user_id !== profile?.id).length;

  return {
    unreadCount,
    markAsRead
  };
}
