
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getNotificationIcon, getNotificationMessage, getNotificationColor } from './notificationUtils';

interface NotificationItemProps {
  notification: any;
  onNotificationClick: (notification: any) => void;
  onDismissNotification: (notification: any, type: 'user' | 'admin' | 'adminUser', event: React.MouseEvent) => void;
  onDeleteNotification?: (notification: any, type: 'user' | 'admin' | 'adminUser', event: React.MouseEvent) => void;
}

export function NotificationItem({ 
  notification, 
  onNotificationClick, 
  onDismissNotification,
  onDeleteNotification
}: NotificationItemProps) {
  const IconComponent = getNotificationIcon(notification);
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🗑️ DELETE CLICKED - notification:', notification.id, 'type:', notification.type);
    
    if (onDeleteNotification) {
      console.log('✅ Calling onDeleteNotification function');
      onDeleteNotification(notification, notification.type, e);
    } else {
      console.error('❌ NO onDeleteNotification function provided!');
    }
  };

  const handleDismissClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('📖 DISMISS CLICKED - notification:', notification.id, 'type:', notification.type);
    onDismissNotification(notification, notification.type, e);
  };
  
  return (
    <div
      onClick={() => {
        console.log('👆 Notification clicked:', notification.id);
        onNotificationClick(notification);
      }}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification)}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
            {getNotificationMessage(notification)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
          {!notification.is_read && (
            <div className="flex items-center gap-1 mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">New</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissClick}
              className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              title="Mark as read"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteClick}
            className="w-8 h-8 p-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"
            title="Delete notification"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
