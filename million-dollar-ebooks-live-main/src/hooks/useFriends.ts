
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

interface Friend {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  requester?: {
    display_name: string;
    avatar_url?: string;
    username?: string;
  };
  addressee?: {
    display_name: string;
    avatar_url?: string;
    username?: string;
  };
}

export function useFriends() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Get friends list
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ['friends', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:profiles!friends_requester_id_fkey(display_name, avatar_url, username),
          addressee:profiles!friends_addressee_id_fkey(display_name, avatar_url, username)
        `)
        .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Get pending friend requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['friend-requests', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:profiles!friends_requester_id_fkey(display_name, avatar_url, username)
        `)
        .eq('addressee_id', profile.id)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  // Send friend request
  const sendFriendRequest = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('friends')
        .insert({
          requester_id: profile.id,
          addressee_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast({ title: 'Friend request sent!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to send friend request', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Accept friend request
  const acceptFriendRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast({ title: 'Friend request accepted!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to accept request', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Decline friend request
  const declineFriendRequest = useMutation({
    mutationFn: async (requestId: string) => {
      const { data, error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      toast({ title: 'Friend request declined' });
    },
  });

  return {
    friends,
    pendingRequests,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
  };
}
