
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useThankMessages() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendThankYou = useMutation({
    mutationFn: async ({ giftId, message }: { giftId: string; message?: string }) => {
      if (!profile?.id) throw new Error('Not authenticated');

      // Get gift details to find recipient
      const { data: gift, error: giftError } = await supabase
        .from('book_gifts')
        .select('giver_id')
        .eq('id', giftId)
        .single();

      if (giftError) throw giftError;

      const { data, error } = await supabase
        .from('thank_messages')
        .insert({
          gift_id: giftId,
          sender_id: profile.id,
          recipient_id: gift.giver_id,
          message: message
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Thank you message sent!' });
      queryClient.invalidateQueries({ queryKey: ['book-gifts'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send thank you',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    sendThankYou,
  };
}
