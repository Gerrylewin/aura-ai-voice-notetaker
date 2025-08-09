
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminNotification {
  id: string;
  notification_type: string;
  content_id: string;
  content_type: string;
  title: string;
  author_name: string;
  author_id: string;
  is_read: boolean;
  created_at: string;
}

export function useAdminNotifications() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id || (profile?.user_role !== 'admin' && profile?.user_role !== 'moderator')) {
        return [];
      }

      console.log('🔄 Fetching admin notifications for:', profile.id);

      // Delete notifications older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      console.log('🗑️ Cleaning up old admin notifications older than:', sevenDaysAgo.toISOString());
      
      await supabase
        .from('admin_notifications')
        .delete()
        .eq('admin_id', profile.id)
        .lt('created_at', sevenDaysAgo.toISOString());

      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('admin_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching admin notifications:', error);
        throw error;
      }

      console.log('✅ Fetched admin notifications:', data?.length || 0);
      return data as AdminNotification[];
    },
    enabled: !!profile?.id && (profile?.user_role === 'admin' || profile?.user_role === 'moderator'),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('📖 Marking admin notification as read:', notificationId);
      
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('admin_id', profile?.id);

      if (error) {
        console.error('❌ Error marking admin notification as read:', error);
        throw error;
      }
      
      console.log('✅ Admin notification marked as read:', notificationId);
    },
    onSuccess: () => {
      console.log('🔄 Invalidating admin notifications cache after mark as read');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error) => {
      console.error('❌ Mark admin notification as read mutation failed:', error);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.id) return;

      console.log('📖 Marking all admin notifications as read for user:', profile.id);
      
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('admin_id', profile.id)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking all admin notifications as read:', error);
        throw error;
      }
      
      console.log('✅ All admin notifications marked as read');
    },
    onSuccess: () => {
      console.log('🔄 Invalidating admin notifications cache after mark all as read');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error) => {
      console.error('❌ Mark all admin notifications as read mutation failed:', error);
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('🗑️ STARTING DELETE MUTATION for admin notification:', notificationId);
      console.log('🔍 Current profile ID:', profile?.id);
      
      if (!profile?.id) {
        console.error('❌ No profile ID available for deletion');
        throw new Error('User not authenticated');
      }

      console.log('🗑️ Attempting to delete admin notification...');

      const { error: deleteError, data: deletedData } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('admin_id', profile.id)
        .select();

      console.log('📊 Admin notification delete query result:', { deletedData, deleteError });

      if (deleteError) {
        console.error('❌ ADMIN NOTIFICATION DELETE QUERY FAILED:', deleteError);
        throw new Error(`Failed to delete admin notification: ${deleteError.message}`);
      }

      if (!deletedData || deletedData.length === 0) {
        console.error('❌ No admin notification was deleted');
        throw new Error('No admin notification was deleted');
      }

      console.log('✅ ADMIN NOTIFICATION DELETE SUCCESS - deleted notification:', deletedData[0]);
      return notificationId;
    },
    onSuccess: (deletedNotificationId) => {
      console.log('🎉 ADMIN NOTIFICATION DELETE MUTATION SUCCESS for:', deletedNotificationId);
      
      // Immediately update the cache to remove the deleted notification
      queryClient.setQueryData(['admin-notifications', profile?.id], (oldData: AdminNotification[] | undefined) => {
        if (!oldData) {
          console.log('⚠️ No cached admin notification data to update');
          return oldData;
        }
        const filtered = oldData.filter(n => n.id !== deletedNotificationId);
        console.log('🔄 Admin notification cache updated - removed notification from UI. Old count:', oldData.length, 'New count:', filtered.length);
        return filtered;
      });
      
      // Also invalidate to sync with server
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error, notificationId) => {
      console.error('❌ ADMIN NOTIFICATION DELETE MUTATION FAILED for:', notificationId, 'Error:', error);
    }
  });

  const createBookUpdateNotificationMutation = useMutation({
    mutationFn: async ({ bookId, title, authorName, authorId }: { bookId: string; title: string; authorName: string; authorId: string }) => {
      console.log('📚 Creating book update notification for book:', bookId);
      
      // Insert notification for all admins and moderators
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .in('user_role', ['admin', 'moderator']);

      if (adminProfiles && adminProfiles.length > 0) {
        const notifications = adminProfiles.map(admin => ({
          admin_id: admin.id,
          notification_type: 'book_updated',
          content_id: bookId,
          content_type: 'book',
          title: title,
          author_name: authorName,
          author_id: authorId
        }));

        console.log('📤 Inserting admin notifications:', notifications.length);

        const { error } = await supabase
          .from('admin_notifications')
          .insert(notifications);

        if (error) {
          console.error('❌ Error creating book update notifications:', error);
          throw error;
        }
        
        console.log('✅ Book update notifications created successfully');
      } else {
        console.log('⚠️ No admins/moderators found to notify');
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating admin notifications cache after book update notification');
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  
  console.log('📊 Admin notifications summary:', {
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
    createBookUpdateNotification: (bookId: string, title: string, authorName: string, authorId: string) => 
      createBookUpdateNotificationMutation.mutate({ bookId, title, authorName, authorId }),
    isMarkingAsRead: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
}
