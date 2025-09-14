
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { encryptMessage } from './encryption';
import { PrivateChat } from './usePrivateChatData';

export function usePrivateChatActions() {
  const { user, profile } = useAuth();

  // Send a message in a private chat
  const sendPrivateMessage = async (conversationId: string, content: string) => {
    if (!user?.id || !content.trim()) return;

    try {
      const encryptedContent = encryptMessage(content);
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          encrypted_content: encryptedContent,
          message_type: 'text'
        });

      if (error) throw error;

      // Update last message time in conversation
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error sending private message:', error);
      throw error;
    }
  };

  // Start a new private chat
  const startPrivateChat = async (participantId: string, participantName: string, participantAvatar?: string) => {
    if (!user?.id) return null;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${user.id})`)
        .single();

      if (existingConv) {
        return existingConv.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('chat_conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: participantId
        })
        .select('id')
        .single();

      if (error) throw error;

      const conversationId = newConv.id;

      // Send notification if current user is admin/moderator
      if (profile?.user_role === 'admin' || profile?.user_role === 'moderator') {
        await supabase.functions.invoke('send-private-chat-notification', {
          body: {
            targetUserId: participantId,
            senderName: profile.display_name || 'An administrator',
            conversationId
          }
        });
      }

      return conversationId;
    } catch (error) {
      console.error('Error starting private chat:', error);
      return null;
    }
  };

  return {
    sendPrivateMessage,
    startPrivateChat
  };
}
