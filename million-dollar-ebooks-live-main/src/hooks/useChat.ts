
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChatConversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  participant1?: {
    display_name: string;
    avatar_url?: string;
  };
  participant2?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  encrypted_content: string;
  message_type: string;
  book_recommendation_id?: string;
  created_at: string;
  is_read: boolean;
  book?: {
    title: string;
    author_name: string;
    cover_image_url?: string;
  };
}

// Simple encryption/decryption functions
const encryptMessage = (message: string): string => {
  return btoa(message); // Base64 encoding for simple encryption
};

const decryptMessage = (encryptedMessage: string): string => {
  try {
    return atob(encryptedMessage); // Base64 decoding
  } catch {
    return 'Message could not be decrypted';
  }
};

export function useChat() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          participant1:profiles!chat_conversations_participant1_id_fkey(display_name, avatar_url),
          participant2:profiles!chat_conversations_participant2_id_fkey(display_name, avatar_url)
        `)
        .or(`participant1_id.eq.${profile.id},participant2_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Get messages for a conversation
  const getMessages = (conversationId: string) => {
    return useQuery({
      queryKey: ['messages', conversationId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            book:books(title, author_name, cover_image_url)
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Decrypt messages
        return (data || []).map(message => ({
          ...message,
          decrypted_content: decryptMessage(message.encrypted_content)
        }));
      },
      enabled: !!conversationId,
    });
  };

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ 
      conversationId, 
      content, 
      messageType = 'text', 
      bookId 
    }: { 
      conversationId: string; 
      content: string; 
      messageType?: string; 
      bookId?: string; 
    }) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const encryptedContent = encryptMessage(content);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          encrypted_content: encryptedContent,
          message_type: messageType,
          book_recommendation_id: bookId
        });

      if (error) throw error;

      // Update conversation last message time
      await supabase
        .from('chat_conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Create conversation
  const createConversation = useMutation({
    mutationFn: async (friendId: string) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          participant1_id: profile.id,
          participant2_id: friendId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Delete conversation
  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({ title: 'Conversation deleted' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete conversation',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    conversations,
    isLoading,
    getMessages,
    sendMessage,
    createConversation,
    deleteConversation,
  };
}
