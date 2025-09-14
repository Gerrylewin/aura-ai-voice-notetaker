
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, LogIn, Check, CheckCheck, Eye, User, Trash2 } from 'lucide-react';
import { useAdminUserNotifications } from '@/hooks/useAdminUserNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { FirstMemberBadge } from '@/components/layout/navigation/notifications/FirstMemberBadge';

export function AdminUserNotificationsPanel() {
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
  } = useAdminUserNotifications();

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
            <User className="w-5 h-5" />
            User Activity Notifications
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

  const getNotificationIcon = (type: string) => {
    if (type === 'new_user_signup') return <UserPlus className="w-4 h-4" />;
    if (type === 'user_login') return <LogIn className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  const getNotificationMessage = (notification: any) => {
    if (notification.notification_type === 'new_user_signup') {
      return `New user "${notification.user_display_name || notification.user_email}" signed up as ${notification.user_role}`;
    }
    if (notification.notification_type === 'user_login') {
      return `User "${notification.user_display_name || notification.user_email}" logged in`;
    }
    return `User activity: ${notification.notification_type}`;
  };

  const getNotificationDetails = (notification: any) => {
    const details = [];
    
    if (notification.notification_type === 'new_user_signup') {
      const data = notification.activity_data;
      details.push(`Email: ${notification.user_email}`);
      details.push(`Role: ${notification.user_role}`);
      if (data?.signup_timestamp) {
        details.push(`Signup: ${new Date(data.signup_timestamp).toLocaleString()}`);
      }
      if (data?.confirmed_at) {
        details.push(`Confirmed: ${new Date(data.confirmed_at).toLocaleString()}`);
      }
      // Check if this is a first 100 member
      if (data?.member_number && data.member_number <= 100) {
        details.push(`🎉 First 100 Member #${data.member_number}`);
      }
    }
    
    if (notification.notification_type === 'user_login') {
      const data = notification.activity_data;
      details.push(`Email: ${notification.user_email}`);
      details.push(`Role: ${notification.user_role}`);
      if (data?.login_timestamp) {
        details.push(`Login: ${new Date(data.login_timestamp).toLocaleString()}`);
      }
      if (data?.previous_login) {
        details.push(`Previous: ${new Date(data.previous_login).toLocaleString()}`);
      }
      if (data?.sign_in_count) {
        details.push(`Total logins: ${data.sign_in_count}`);
      }
      // Check if this is a first 100 member
      if (data?.member_number && data.member_number <= 100) {
        details.push(`👑 First 100 Member #${data.member_number}`);
      }
    }
    
    return details;
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            User Activity Notifications
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
              No user activity notifications yet.
            </div>
          ) : (
            notifications.map((notification) => {
              const isFirstMember = notification.activity_data?.member_number && notification.activity_data.member_number <= 100;
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.is_read
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  } ${isFirstMember ? 'ring-2 ring-yellow-200 dark:ring-yellow-800' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        notification.notification_type === 'new_user_signup'
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      }`}>
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {getNotificationMessage(notification)}
                          </p>
                          {isFirstMember && (
                            <FirstMemberBadge memberNumber={notification.activity_data.member_number} />
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {getNotificationDetails(notification).map((detail, index) => (
                            <div key={index}>{detail}</div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
