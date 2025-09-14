
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Users, Compass, BarChart, PenTool, Settings, MessageSquare, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStoryNotifications } from '@/hooks/useStoryNotifications';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { IRCChat } from '@/components/chat/IRCChat';

export function NavigationTabs() {
  const location = useLocation();
  const { profile } = useAuth();
  const { newStoriesCount } = useStoryNotifications();
  const [showIRCChat, setShowIRCChat] = useState(false);
  
  // Only show Write tab for writers, admins, and moderators - but redirect to dashboard
  const isWriter = profile?.user_role === 'writer' || profile?.user_role === 'admin' || profile?.user_role === 'moderator';
  
  const tabs = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart, shortLabel: 'Dash' },
    { path: '/discover', label: 'Discover', icon: Compass, shortLabel: 'Discover' },
    { path: '/library', label: 'Library', icon: Book, shortLabel: 'Library' },
    { path: '/stories', label: 'Stories', icon: PenTool, shortLabel: 'Stories', hasNotification: newStoriesCount > 0, notificationCount: newStoriesCount },
    { path: '/settings', label: 'Settings', icon: Settings, shortLabel: 'Settings' },
    { path: '/support', label: 'Support', icon: HelpCircle, shortLabel: 'Help' },
    // Admin panel for admins and moderators
    ...(profile?.user_role === 'admin' || profile?.user_role === 'moderator' ? [
      { path: '/admin', label: profile?.user_role === 'admin' ? 'Admin' : 'Moderation', icon: Settings, shortLabel: profile?.user_role === 'admin' ? 'Admin' : 'Mod' }
    ] : []),
  ];

  return (
    <>
      <div className="flex overflow-x-auto scrollbar-hide space-x-1 pb-2 -mb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          const isDashboard = tab.path === '/dashboard';
          const isAnyOtherTabActive = location.pathname !== '/dashboard' && tabs.some(t => t.path === location.pathname);
          
          // Dashboard should be red unless another tab is active
          const shouldBeRed = isDashboard && !isAnyOtherTabActive;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`
                relative flex items-center px-2 sm:px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 min-w-fit
                ${isActive || shouldBeRed
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="text-xs sm:text-sm lg:text-base">
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </span>
              {tab.hasNotification && tab.notificationCount && tab.notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-bold">
                  {tab.notificationCount > 99 ? '99+' : tab.notificationCount}
                </div>
              )}
            </Link>
          );
        })}
        
        {/* IRC Chat Button */}
        {profile && (
          <Button
            onClick={() => setShowIRCChat(true)}
            className="flex items-center px-2 sm:px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 min-w-fit bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageSquare className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm lg:text-base">Chat</span>
          </Button>
        )}
      </div>

      <Dialog open={showIRCChat} onOpenChange={setShowIRCChat}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full h-[80vh] p-0">
          <IRCChat />
        </DialogContent>
      </Dialog>
    </>
  );
}
