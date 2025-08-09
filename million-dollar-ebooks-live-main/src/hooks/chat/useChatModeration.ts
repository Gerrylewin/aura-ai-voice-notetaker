
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useToast } from '@/hooks/use-toast';

export function useChatModeration() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check if current user is muted
  const { data: isMuted } = useQuery({
    queryKey: ['user-mute-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('chat_mutes')
        .select('expires_at')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking mute status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Warn user
  const warnUser = useMutation({
    mutationFn: async ({ userId, messageId }: { userId: string; messageId: string }) => {
      if (!user?.id || !profile) throw new Error('Not authenticated');
      if (profile.user_role !== 'admin' && profile.user_role !== 'moderator') {
        throw new Error('Insufficient permissions');
      }

      console.log('📢 ISSUING WARNING TO USER:', userId);
      
      const { data, error } = await supabase
        .from('chat_warnings')
        .insert({
          user_id: userId,
          issued_by: user.id,
          message_id: messageId,
          reason: 'Inappropriate message content'
        })
        .select();

      if (error) {
        console.error('❌ WARNING FAILED:', error);
        throw error;
      }
      
      console.log('✅ WARNING ISSUED SUCCESSFULLY');
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Warning issued',
        description: 'User has been warned for inappropriate content',
      });
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['public-chat'] });
    },
    onError: (error) => {
      console.error('❌ WARNING ERROR:', error);
      toast({
        title: 'Failed to issue warning',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    warnUser,
    isWarning: warnUser.isPending,
    isMuted: !!isMuted,
  };
}
