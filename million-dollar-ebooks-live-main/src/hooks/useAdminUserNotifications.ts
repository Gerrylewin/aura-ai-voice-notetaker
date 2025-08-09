
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminUserNotification {
  id: string;
  notification_type: string;
  user_id: string;
  user_email: string;
  user_display_name: string;
  user_role: string;
  activity_data: any;
  is_read: boolean;
  created_at: string;
}

export function useAdminUserNotifications() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-user-notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id || profile?.user_role !== 'admin') {
        return [];
      }

      console.log('🔄 Fetching admin user notifications for:', profile.id);

      // Delete notifications older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      console.log('🗑️ Cleaning up old admin user notifications older than:', sevenDaysAgo.toISOString());
      
      await supabase
        .from('admin_user_notifications')
        .delete()
        .eq('admin_id', profile.id)
        .lt('created_at', sevenDaysAgo.toISOString());

      const { data, error } = await supabase
        .from('admin_user_notifications')
        .select('*')
        .eq('admin_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching admin user notifications:', error);
        throw error;
      }

      console.log('✅ Fetched admin user notifications:', data?.length || 0);
      return data as AdminUserNotification[];
    },
    enabled: !!profile?.id && profile?.user_role === 'admin',
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('📖 Marking admin user notification as read:', notificationId);
      
      const { error } = await supabase
        .from('admin_user_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('admin_id', profile?.id);

      if (error) {
        console.error('❌ Error marking admin user notification as read:', error);
        throw error;
      }
      
      console.log('✅ Admin user notification marked as read:', notificationId);
    },
    onSuccess: () => {
      console.log('🔄 Invalidating admin user notifications cache after mark as read');
      queryClient.invalidateQueries({ queryKey: ['admin-user-notifications'] });
    },
    onError: (error) => {
      console.error('❌ Mark admin user notification as read mutation failed:', error);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;

      console.log('📖 Marking all admin user notifications as read for user:', profile.id);
      
      const { error } = await supabase
        .from('admin_user_notifications')
        .update({ is_read: true })
        .eq('admin_id', profile.id)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking all admin user notifications as read:', error);
        throw error;
      }
      
      console.log('✅ All admin user notifications marked as read');
    },
    onSuccess: () => {
      console.log('🔄 Invalidating admin user notifications cache after mark all as read');
      queryClient.invalidateQueries({ queryKey: ['admin-user-notifications'] });
    },
    onError: (error) => {
      console.error('❌ Mark all admin user notifications as read mutation failed:', error);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('🗑️ STARTING DELETE MUTATION for admin user notification:', notificationId);
      console.log('🔍 Current profile ID:', profile?.id);
      
      if (!profile?.id) {
        console.error('❌ No profile ID available for deletion');
        throw new Error('User not authenticated');
      }

      console.log('🗑️ Attempting to delete admin user notification...');

      const { error: deleteError, data: deletedData } = await supabase
        .from('admin_user_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('admin_id', profile.id)
        .select();

      console.log('📊 Admin user notification delete query result:', { deletedData, deleteError });

      if (deleteError) {
        console.error('❌ ADMIN USER NOTIFICATION DELETE QUERY FAILED:', deleteError);
        throw new Error(`Failed to delete admin user notification: ${deleteError.message}`);
      }

      if (!deletedData || deletedData.length === 0) {
        console.error('❌ No admin user notification was deleted');
        throw new Error('No admin user notification was deleted');
      }

      console.log('✅ ADMIN USER NOTIFICATION DELETE SUCCESS - deleted notification:', deletedData[0]);
      return notificationId;
    },
    onSuccess: (deletedNotificationId) => {
      console.log('🎉 ADMIN USER NOTIFICATION DELETE MUTATION SUCCESS for:', deletedNotificationId);
      
      // Immediately update the cache to remove the deleted notification
      queryClient.setQueryData(['admin-user-notifications', profile?.id], (oldData: AdminUserNotification[] | undefined) => {
        if (!oldData) {
          console.log('⚠️ No cached admin user notification data to update');
          return oldData;
        }
        const filtered = oldData.filter(n => n.id !== deletedNotificationId);
        console.log('🔄 Admin user notification cache updated - removed notification from UI. Old count:', oldData.length, 'New count:', filtered.length);
        return filtered;
      });
      
      // Also invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['admin-user-notifications'] });
    },
    onError: (error, notificationId) => {
      console.error('❌ ADMIN USER NOTIFICATION DELETE MUTATION FAILED for:', notificationId, 'Error:', error);
    }
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  console.log('📊 Admin user notifications summary:', {
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
