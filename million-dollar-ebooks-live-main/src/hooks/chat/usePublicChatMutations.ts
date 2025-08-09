
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useToast } from '@/hooks/use-toast';
import { encryptMessage } from './encryption';

export function usePublicChatMutations() {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ content, messageType = 'text' }: { content: string; messageType?: string }) => {
      if (!profile?.id || !user?.id) throw new Error('Not authenticated');

      // Check if user is muted
      const { data: muteData } = await supabase
        .from('chat_mutes')
        .select('expires_at')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (muteData) {
        throw new Error('You are currently muted and cannot send messages');
      }

      const encryptedContent = encryptMessage(content);
      
      const { data, error } = await supabase
        .from('public_chat_messages')
        .insert({
          user_id: user.id,
          encrypted_content: encryptedContent,
          message_type: messageType
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-chat'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Delete message - HARD DELETE WITH MODERATION LOGGING
  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      console.log('🗑️ DELETING MESSAGE:', messageId);
      
      // Get message details first for permission check and logging
      const { data: messageData, error: fetchError } = await supabase
        .from('public_chat_messages')
        .select('user_id, encrypted_content')
        .eq('id', messageId)
        .single();

      if (fetchError) {
        console.error('❌ FAILED TO FETCH MESSAGE:', fetchError);
        throw fetchError;
      }

      // Check if user can delete (own message or admin/moderator)
      const isOwnMessage = messageData.user_id === user.id;
      const canDelete = isOwnMessage || 
                       profile?.user_role === 'admin' || 
                       profile?.user_role === 'moderator';

      if (!canDelete) {
        throw new Error('Insufficient permissions to delete this message');
      }

      // If it's a moderation action (not own message), log it
      if (!isOwnMessage && (profile?.user_role === 'admin' || profile?.user_role === 'moderator')) {
        console.log('📝 LOGGING MODERATION ACTION');
        
        // Decrypt message content for logging
        let messageContent = '';
        try {
          messageContent = atob(messageData.encrypted_content);
        } catch {
          messageContent = 'Could not decrypt message content';
        }

        // Log the moderation action using direct insert with type assertion
        const { error: logError } = await supabase
          .from('chat_moderation_log' as any)
          .insert({
            message_id: messageId,
            user_id: messageData.user_id,
            moderator_id: user.id,
            message_content: messageContent,
            deletion_reason: 'Message deleted by moderator'
          });

        if (logError) {
          console.error('❌ FAILED TO LOG MODERATION ACTION:', logError);
          // Don't fail the deletion if logging fails
        } else {
          console.log('✅ MODERATION ACTION LOGGED');
        }
      }
      
      // COMPLETELY DELETE FROM DATABASE
      const { error } = await supabase
        .from('public_chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('❌ DELETE FAILED:', error);
        throw error;
      }
      
      console.log('✅ MESSAGE COMPLETELY REMOVED FROM DATABASE');
      return messageId;
    },
    onSuccess: (deletedMessageId) => {
      console.log('✅ DELETE SUCCESS FOR:', deletedMessageId);
      
      // REMOVE FROM CACHE IMMEDIATELY
      queryClient.setQueryData(['public-chat'], (oldData: any) => {
        if (!oldData) return oldData;
        const filtered = oldData.filter((message: any) => message.id !== deletedMessageId);
        console.log('🧹 REMOVED FROM CACHE, REMAINING:', filtered.length);
        return filtered;
      });
      
      // Also invalidate moderation log to show new entry
      queryClient.invalidateQueries({ queryKey: ['moderation-log'] });
      
      // Show success message only
      toast({
        title: 'Message deleted',
        description: 'Message permanently removed',
      });
    },
    onError: (error) => {
      console.error('❌ DELETE ERROR:', error);
      // Only show error toast if there's actually an error
      toast({
        title: 'Failed to delete message',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    sendMessage,
    deleteMessage,
  };
}
