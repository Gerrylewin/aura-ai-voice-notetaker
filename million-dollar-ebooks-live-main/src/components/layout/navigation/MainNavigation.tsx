
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, Search, MessageSquare } from 'lucide-react';
import { useUnreadChatMessages } from '@/hooks/chat/useUnreadChatMessages';

export function MainNavigation() {
  const location = useLocation();
  const { unreadCount } = useUnreadChatMessages();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navigationItems = [
    {
      path: '/discover',
      label: 'Discover',
      icon: Search,
      show: true
    },
    {
      path: '/stories',
      label: 'Stories',
      icon: PenTool,
      show: true
    },
    {
      path: '/chat',
      label: 'Chat',
      icon: MessageSquare,
      show: true,
      badge: unreadCount > 0 ? unreadCount : undefined
    }
  ];

  const visibleItems = navigationItems.filter(item => item.show);

  return (
    <nav className="hidden lg:flex items-center space-x-1">
      {visibleItems.map(({ path, label, icon: Icon, badge }) => (
        <Button
          key={path}
          variant={isActive(path) ? 'default' : 'ghost'}
          size="sm"
          asChild
          className={`relative ${
            isActive(path) 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          <Link to={path} className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {label}
            {badge && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-xs">
                {badge > 9 ? '9+' : badge}
              </Badge>
            )}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
