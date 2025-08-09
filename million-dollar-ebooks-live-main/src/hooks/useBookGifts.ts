
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useBookGifts() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get received gifts
  const { data: receivedGifts = [] } = useQuery({
    queryKey: ['book-gifts', 'received', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('book_gifts')
        .select(`
          *,
          book:books(title, author_name, cover_image_url, preview_text),
          giver:profiles!book_gifts_giver_id_fkey(display_name, avatar_url)
        `)
        .eq('recipient_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Get sent gifts
  const { data: sentGifts = [] } = useQuery({
    queryKey: ['book-gifts', 'sent', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('book_gifts')
        .select(`
          *,
          book:books(title, author_name, cover_image_url),
          recipient:profiles!book_gifts_recipient_id_fkey(display_name, avatar_url)
        `)
        .eq('giver_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Send book gift
  const sendBookGift = useMutation({
    mutationFn: async ({ 
      recipientId, 
      bookId, 
      message 
    }: { 
      recipientId: string; 
      bookId: string; 
      message?: string; 
    }) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('book_gifts')
        .insert({
          giver_id: profile.id,
          recipient_id: recipientId,
          book_id: bookId,
          gift_message: message,
          status: 'pending'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-gifts'] });
      toast({ title: 'Gift sent successfully!' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send gift',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  return {
    receivedGifts,
    sentGifts,
    sendBookGift,
  };
}
