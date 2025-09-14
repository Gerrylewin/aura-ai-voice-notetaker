
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { encryptMessage, decryptMessage } from './encryption';

export interface PrivateChat {
  conversationId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface PrivateChatMessage {
  id: string;
  sender_id: string;
  encrypted_content: string;
  decrypted_content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
  sender_role?: string;
  conversation_id: string;
  is_read: boolean;
}

export function usePrivateChatData() {
  const { user, profile } = useAuth();
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [activeChatMessages, setActiveChatMessages] = useState<PrivateChatMessage[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all private conversations for the current user
  const fetchPrivateChats = async () => {
    if (!user?.id) return;

    try {
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          participant1_id,
          participant2_id,
          last_message_at,
          chat_messages (
            encrypted_content,
            created_at
          )
        `)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const chats: PrivateChat[] = [];
      
      for (const conv of conversations || []) {
        const participantId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id;
        
        // Get participant profile
        const { data: participantProfile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', participantId)
          .single();

        const lastMessage = conv.chat_messages?.[0];
        let decryptedLastMessage = '';
        
        if (lastMessage?.encrypted_content) {
          try {
            decryptedLastMessage = decryptMessage(lastMessage.encrypted_content);
          } catch (error) {
            console.error('Error decrypting last message:', error);
          }
        }

        chats.push({
          conversationId: conv.id,
          participantId,
          participantName: participantProfile?.display_name || 'Unknown User',
          participantAvatar: participantProfile?.avatar_url || undefined,
          lastMessage: decryptedLastMessage,
          lastMessageAt: conv.last_message_at,
          unreadCount: 0 // TODO: Implement unread count
        });
      }

      setPrivateChats(chats);
    } catch (error) {
      console.error('Error fetching private chats:', error);
    }
  };

  // Fetch messages for a specific conversation
  const fetchChatMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          sender_id,
          encrypted_content,
          created_at
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const decryptedMessages: PrivateChatMessage[] = [];
      
      for (const msg of messages || []) {
        // Get sender profile separately
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, user_role')
          .eq('id', msg.sender_id)
          .single();

        let decryptedContent = '';
        try {
          decryptedContent = decryptMessage(msg.encrypted_content);
        } catch (error) {
          console.error('Error decrypting message:', error);
          decryptedContent = '[Unable to decrypt message]';
        }

        decryptedMessages.push({
          id: msg.id,
          sender_id: msg.sender_id,
          encrypted_content: msg.encrypted_content,
          decrypted_content: decryptedContent,
          created_at: msg.created_at,
          sender_name: senderProfile?.display_name || 'Unknown User',
          sender_avatar: senderProfile?.avatar_url || undefined,
          sender_role: senderProfile?.user_role || 'reader',
          conversation_id: conversationId,
          is_read: true // For now, mark all as read
        });
      }

      setActiveChatMessages(decryptedMessages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    privateChats,
    activeChatMessages,
    activeChatId,
    loading,
    fetchPrivateChats,
    fetchChatMessages,
    setActiveChatId,
    setPrivateChats
  };
}
