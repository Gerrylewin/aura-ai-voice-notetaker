
import { usePublicChatMessages } from './chat/usePublicChatMessages';
import { usePublicChatMutations } from './chat/usePublicChatMutations';
import { usePublicChatRealtime } from './chat/usePublicChatRealtime';

export function usePublicChat() {
  const messagesQuery = usePublicChatMessages();
  const { sendMessage, deleteMessage } = usePublicChatMutations();
  
  // Set up real-time subscriptions
  usePublicChatRealtime();

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      await sendMessage.mutateAsync({ content: content.trim() });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  };

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage: handleSendMessage,
    deleteMessage: handleDeleteMessage,
    isSending: sendMessage.isPending,
    isDeleting: deleteMessage.isPending,
  };
}
