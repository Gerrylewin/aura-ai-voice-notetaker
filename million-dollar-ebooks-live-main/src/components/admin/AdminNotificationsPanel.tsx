
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Book, FileText, Eye, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function AdminNotificationsPanel() {
  const { toast } = useToast();
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead,
    isDeletingNotification
  } = useAdminNotifications();

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      toast({
        title: 'Success',
        description: 'Notification deleted successfully.',
      });
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Admin Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Loading notifications...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getNotificationIcon = (type: string, contentType: string) => {
    if (contentType === 'book') return <Book className="w-4 h-4" />;
    if (contentType === 'story') return <FileText className="w-4 h-4" />;
    return <Bell className="w-4 h-4" />;
  };

  const getNotificationMessage = (notification: any) => {
    if (notification.notification_type === 'new_book_submitted') {
      return `New book "${notification.title}" submitted for review by ${notification.author_name}`;
    }
    if (notification.notification_type === 'new_story_published') {
      return `New story "${notification.title}" published by ${notification.author_name}`;
    }
    return `New ${notification.content_type} activity`;
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Admin Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAsRead}
              className="text-gray-700 dark:text-white"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.is_read
                    ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      notification.notification_type === 'new_book_submitted'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    }`}>
                      {getNotificationIcon(notification.notification_type, notification.content_type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getNotificationMessage(notification)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.notification_type === 'new_book_submitted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('/admin', '_blank')}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Review
                      </Button>
                    )}
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                        disabled={isMarkingAsRead}
                        className="text-xs"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={isDeletingNotification}
                      className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
