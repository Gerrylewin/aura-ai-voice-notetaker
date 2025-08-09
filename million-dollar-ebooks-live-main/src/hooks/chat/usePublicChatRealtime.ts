
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

export function usePublicChatRealtime() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile?.id) return;

    console.log('🔄 Setting up ENHANCED realtime subscription for public chat');

    const channel = supabase
      .channel('public-chat-realtime', {
        config: {
          // Optimized for responsiveness during testing
          // In production, we might want to adjust these
          broadcast: { ack: true },
          presence: { key: profile.id }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_chat_messages'
        },
        (payload) => {
          console.log('🔴 REALTIME INSERT received:', payload);
          // Force immediate refresh for new messages
          queryClient.invalidateQueries({ 
            queryKey: ['public-chat'],
            refetchType: 'all' 
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'public_chat_messages'
        },
        (payload) => {
          console.log('🔴 REALTIME DELETE received:', payload);
          
          // Remove from cache immediately for instant UI update
          queryClient.setQueryData(['public-chat'], (oldData: any) => {
            if (!oldData) return oldData;
            const messageId = payload.old?.id;
            if (!messageId) return oldData;
            
            const filtered = oldData.filter((message: any) => message.id !== messageId);
            console.log('🧹 REALTIME: Removed message from cache, remaining:', filtered.length);
            return filtered;
          });
          
          // Also invalidate to ensure consistency
          queryClient.invalidateQueries({ queryKey: ['public-chat'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'public_chat_messages'
        },
        (payload) => {
          console.log('🔴 REALTIME UPDATE received:', payload);
          queryClient.invalidateQueries({ queryKey: ['public-chat'] });
        }
      )
      .subscribe((status) => {
        console.log('🔄 Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates');
        }
      });

    return () => {
      console.log('🔄 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [profile?.id, queryClient]);
}
