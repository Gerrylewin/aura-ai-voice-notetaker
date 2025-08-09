
import React from 'react';
import { NotificationsPopover } from './NotificationsPopover';

interface NotificationBellProps {
  totalNotifications: number;
  onNavigateToDashboard: () => void;
}

export function NotificationBell({ totalNotifications, onNavigateToDashboard }: NotificationBellProps) {
  return (
    <NotificationsPopover 
      totalNotifications={totalNotifications}
      onNavigateToDashboard={onNavigateToDashboard}
    />
  );
}
