
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useAdminUserNotifications } from '@/hooks/useAdminUserNotifications';
import { useAuth } from '@/hooks/useAuth';
import { NotificationsHeader } from './notifications/NotificationsHeader';
import { NotificationsContent } from './notifications/NotificationsContent';

interface NotificationsPopoverProps {
  totalNotifications: number;
  onNavigateToDashboard: () => void;
}

export function NotificationsPopover({ totalNotifications, onNavigateToDashboard }: NotificationsPopoverProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { 
    notifications: userNotifications, 
    markAsRead: markUserAsRead, 
    deleteNotification: deleteUserNotification 
  } = useUserNotifications();
  const { 
    notifications: adminNotifications, 
    markAsRead: markAdminAsRead, 
    deleteNotification: deleteAdminNotification 
  } = useAdminNotifications();
  const { 
    notifications: adminUserNotifications, 
    markAsRead: markAdminUserAsRead, 
    deleteNotification: deleteAdminUserNotification 
  } = useAdminUserNotifications();

  const isAdmin = profile?.user_role === 'admin';
  const isModerator = profile?.user_role === 'moderator';
  const hasAdminAccess = isAdmin || isModerator;

  const handleNotificationClick = (notification: any) => {
    const notificationType = notification.notification_type || notification.type;
    
    console.log('👆 Notification clicked, navigating...', { type: notificationType, notification });
    
    // Navigate based on notification type with proper routing
    if (notificationType === 'release_notes_update') {
      navigate('/support');
    } else if (notificationType === 'new_book_submitted' || notificationType === 'book_updated') {
      if (hasAdminAccess) {
        // Navigate directly to admin content management
        navigate('/admin');
        // Use setTimeout to ensure page loads first, then set the tab
        setTimeout(() => {
          const event = new CustomEvent('setAdminTab', { detail: 'content' });
          window.dispatchEvent(event);
        }, 100);
      } else {
        navigate('/discover');
      }
    } else if (notificationType === 'new_story_published') {
      if (hasAdminAccess) {
        navigate('/admin');
        setTimeout(() => {
          const event = new CustomEvent('setAdminTab', { detail: 'content' });
          window.dispatchEvent(event);
        }, 100);
      } else {
        navigate('/stories');
      }
    } else if (notificationType === 'new_user_signup' || notificationType === 'user_login') {
      if (isAdmin) {
        navigate('/admin');
        setTimeout(() => {
          const event = new CustomEvent('setAdminTab', { detail: 'users' });
          window.dispatchEvent(event);
        }, 100);
      } else {
        navigate('/dashboard');
      }
    } else if (notificationType === 'support_request_submitted') {
      if (hasAdminAccess) {
        navigate('/admin');
        setTimeout(() => {
          const event = new CustomEvent('setAdminTab', { detail: 'support' });
          window.dispatchEvent(event);
        }, 100);
      } else {
        navigate('/support');
      }
    } else if (notificationType === 'book_pending_review' || notificationType === 'book_approved' || notificationType === 'book_rejected') {
      // Navigate to writer dashboard content management for book-related notifications
      navigate('/dashboard?tab=writer&section=manage');
    } else if (notificationType === 'story_reaction' || notificationType === 'comment') {
      // Navigate to stories page for story-related notifications
      navigate('/stories');
    } else if (notificationType === 'book_purchase') {
      // Navigate to writer dashboard analytics for purchase notifications
      navigate('/dashboard?tab=writer&section=analytics');
    } else {
      // Default navigation
      navigate('/dashboard');
    }
  };

  const handleDismissNotification = async (notification: any, type: 'user' | 'admin' | 'adminUser', event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation when clicking X
    
    console.log('📖 Dismissing notification:', notification.id, 'type:', type);
    
    try {
      if (type === 'user') {
        await markUserAsRead(notification.id);
      } else if (type === 'admin') {
        await markAdminAsRead(notification.id);
      } else if (type === 'adminUser') {
        await markAdminUserAsRead(notification.id);
      }
      
      console.log('✅ Notification dismissed successfully');
    } catch (error) {
      console.error('❌ Error dismissing notification:', error);
    }
  };

  const handleDeleteNotification = async (notification: any, type: 'user' | 'admin' | 'adminUser', event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation when clicking delete
    
    console.log('🗑️ HANDLE DELETE NOTIFICATION called for:', notification.id, 'type:', type);
    
    try {
      if (type === 'user') {
        console.log('🗑️ Calling deleteUserNotification for:', notification.id);
        await deleteUserNotification(notification.id);
      } else if (type === 'admin') {
        console.log('🗑️ Calling deleteAdminNotification for:', notification.id);
        await deleteAdminNotification(notification.id);
      } else if (type === 'adminUser') {
        console.log('🗑️ Calling deleteAdminUserNotification for:', notification.id);
        await deleteAdminUserNotification(notification.id);
      }
      
      console.log('✅ Notification deletion completed successfully');
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  const handleViewAllClick = () => {
    // Navigate to admin dashboard notifications tab
    if (hasAdminAccess) {
      navigate('/admin');
      setTimeout(() => {
        const event = new CustomEvent('setAdminTab', { detail: 'notifications' });
        window.dispatchEvent(event);
      }, 100);
    } else {
      navigate('/dashboard');
    }
  };

  const allNotifications = [
    ...userNotifications.map(n => ({ ...n, type: 'user' as const })),
    ...(hasAdminAccess 
      ? adminNotifications.map(n => ({ ...n, type: 'admin' as const }))
      : []
    ),
    ...(isAdmin 
      ? adminUserNotifications.map(n => ({ ...n, type: 'adminUser' as const }))
      : []
    ),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {totalNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
            >
              {totalNotifications > 99 ? '99+' : totalNotifications}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl" align="end">
        <NotificationsHeader 
          isAdmin={isAdmin}
          totalNotifications={totalNotifications}
          onViewAllClick={handleViewAllClick}
        />
        
        <div className="max-h-[500px] overflow-y-auto">
          <NotificationsContent
            allNotifications={allNotifications}
            isAdmin={isAdmin}
            onNotificationClick={handleNotificationClick}
            onDismissNotification={handleDismissNotification}
            onDeleteNotification={handleDeleteNotification}
            onViewAllClick={handleViewAllClick}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
