
import React from 'react';
import { Button } from '@/components/ui/button';

interface NotificationsHeaderProps {
  isAdmin: boolean;
  totalNotifications: number;
  onViewAllClick: () => void;
}

export function NotificationsHeader({ 
  isAdmin, 
  totalNotifications, 
  onViewAllClick 
}: NotificationsHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
        {isAdmin && totalNotifications > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAllClick}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View All
          </Button>
        )}
      </div>
    </div>
  );
}
