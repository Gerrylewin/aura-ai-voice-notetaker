
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { NotificationItem } from './NotificationItem';

interface NotificationsContentProps {
  allNotifications: any[];
  isAdmin: boolean;
  onNotificationClick: (notification: any) => void;
  onDismissNotification: (notification: any, type: 'user' | 'admin' | 'adminUser', event: React.MouseEvent) => void;
  onDeleteNotification: (notification: any, type: 'user' | 'admin' | 'adminUser', event: React.MouseEvent) => void;
  onViewAllClick: () => void;
}

export function NotificationsContent({
  allNotifications,
  isAdmin,
  onNotificationClick,
  onDismissNotification,
  onDeleteNotification,
  onViewAllClick
}: NotificationsContentProps) {
  if (allNotifications.length === 0) {
    return (
      <div className="p-12 text-center">
        <Bell className="w-16 h-16 mx-auto text-gray-400 mb-6" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications yet</h3>
        <p className="text-gray-500 dark:text-gray-400">We'll notify you when something interesting happens!</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {allNotifications.slice(0, 8).map((notification) => (
        <NotificationItem
          key={`${notification.type}-${notification.id}`}
          notification={notification}
          onNotificationClick={onNotificationClick}
          onDismissNotification={onDismissNotification}
          onDeleteNotification={onDeleteNotification}
        />
      ))}
      
      {allNotifications.length > 8 && isAdmin && (
        <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllClick}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View {allNotifications.length - 8} more notifications
          </Button>
        </div>
      )}
    </div>
  );
}
