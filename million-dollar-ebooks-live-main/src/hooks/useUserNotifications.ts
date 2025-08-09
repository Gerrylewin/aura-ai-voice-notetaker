
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export function useUserNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('🔄 Fetching user notifications for:', user.id);

      // Delete notifications older than 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      console.log('🗑️ Cleaning up old notifications older than:', threeDaysAgo.toISOString());
      
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .lt('created_at', threeDaysAgo.toISOString());

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }

      console.log('✅ Fetched notifications:', data?.length || 0);
      return data as UserNotification[];
    },
    enabled: !!user?.id,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('📖 Marking notification as read:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        throw error;
      }
      
      console.log('✅ Notification marked as read:', notificationId);
    },
    onSuccess: () => {
      console.log('🔄 Invalidating notifications cache after mark as read');
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      console.log('📖 Marking all notifications as read for user:', user.id);
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        throw error;
      }
      
      console.log('✅ All notifications marked as read');
    },
    onSuccess: () => {
      console.log('🔄 Invalidating notifications cache after mark all as read');
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('🗑️ STARTING DELETE MUTATION for notification:', notificationId);
      console.log('🔍 Current user ID:', user?.id);
      
      if (!user?.id) {
        console.error('❌ No user ID available for deletion');
        throw new Error('User not authenticated');
      }

      // First check if the notification exists and belongs to the user
      console.log('🔍 Checking if notification exists and belongs to user...');
      const { data: existingNotification, error: checkError } = await supabase
        .from('notifications')
        .select('id, user_id')
        .eq('id', notificationId)
        .single();

      console.log('📊 Notification check result:', { existingNotification, checkError });

      if (checkError) {
        console.error('❌ Error checking notification:', checkError);
        throw new Error(`Failed to find notification: ${checkError.message}`);
      }

      if (!existingNotification) {
        console.error('❌ Notification not found');
        throw new Error('Notification not found');
      }

      if (existingNotification.user_id !== user.id) {
        console.error('❌ Notification does not belong to current user');
        console.error('Expected user_id:', user.id, 'Actual user_id:', existingNotification.user_id);
        throw new Error('Notification does not belong to current user');
      }

      console.log('✅ Notification exists and belongs to user, proceeding with deletion...');

      // Now attempt the deletion
      const { error: deleteError, data: deletedData } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id)
        .select();

      console.log('📊 Delete query result:', { deletedData, deleteError });

      if (deleteError) {
        console.error('❌ DELETE QUERY FAILED:', deleteError);
        throw new Error(`Failed to delete notification: ${deleteError.message}`);
      }

      if (!deletedData || deletedData.length === 0) {
        console.error('❌ No notification was deleted - this should not happen after our checks');
        throw new Error('No notification was deleted');
      }

      console.log('✅ DELETE SUCCESS - deleted notification:', deletedData[0]);
      return notificationId;
    },
    onSuccess: (deletedNotificationId) => {
      console.log('🎉 DELETE MUTATION SUCCESS for:', deletedNotificationId);
      
      // Immediately update the cache to remove the deleted notification
      queryClient.setQueryData(['user-notifications', user?.id], (oldData: UserNotification[] | undefined) => {
        if (!oldData) {
          console.log('⚠️ No cached data to update');
          return oldData;
        }
        const filtered = oldData.filter(n => n.id !== deletedNotificationId);
        console.log('🔄 Cache updated - removed notification from UI. Old count:', oldData.length, 'New count:', filtered.length);
        return filtered;
      });
      
      // Also invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
    // Removed onError handler to prevent false error messages
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  console.log('📊 Notifications summary:', {
    total: notifications?.length || 0,
    unread: unreadCount,
    isLoading,
    isDeletingNotification: deleteNotificationMutation.isPending
  });

  return {
    notifications: notifications || [],
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}
