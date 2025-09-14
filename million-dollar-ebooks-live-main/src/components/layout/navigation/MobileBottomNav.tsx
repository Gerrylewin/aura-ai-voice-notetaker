import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  BookOpen, 
  PenTool, 
  User, 
  Wallet,
  Compass,
  Library,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadChatMessages } from '@/hooks/chat/useUnreadChatMessages';
import { useStoryNotifications } from '@/hooks/useStoryNotifications';

export function MobileBottomNav() {
  const location = useLocation();
  const { profile } = useAuth();
  const { unreadCount } = useUnreadChatMessages();
  const { newStoriesCount } = useStoryNotifications();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Determine user role for navigation
  const isWriter = profile?.user_role === 'writer' || profile?.user_role === 'admin' || profile?.user_role === 'moderator';
  
  const navigationItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      show: true
    },
    {
      path: '/discover',
      label: 'Discover',
      icon: Compass,
      show: true
    },
    {
      path: '/library',
      label: 'Library',
      icon: Library,
      show: true
    },
    {
      path: '/dashboard',
      label: 'Create',
      icon: PenTool,
      show: isWriter
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      show: true
    }
  ];

  const visibleItems = navigationItems.filter(item => item.show);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {visibleItems.map(({ path, label, icon: Icon }) => (
          <Button
            key={path}
            variant="ghost"
            size="sm"
            asChild
            className={`relative flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 ${
              isActive(path) 
                ? 'text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Link to={path} className="flex flex-col items-center gap-1">
              <div className="relative">
                <Icon className="w-5 h-5" />
                {/* Notification badges */}
                {path === '/dashboard' && newStoriesCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 text-xs p-0 flex items-center justify-center"
                  >
                    {newStoriesCount > 9 ? '9+' : newStoriesCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium leading-none">
                {label}
              </span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
