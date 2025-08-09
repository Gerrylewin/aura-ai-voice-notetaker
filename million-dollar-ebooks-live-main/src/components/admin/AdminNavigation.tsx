
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Shield, 
  HelpCircle, 
  UserPlus, 
  Bell,
  DollarSign,
  ClipboardCheck
} from 'lucide-react';

interface AdminNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userActivityUnreadCount: number;
  pendingApplicationsCount?: number;
  isAdmin?: boolean;
}

export function AdminNavigation({ 
  activeTab, 
  setActiveTab, 
  userActivityUnreadCount,
  pendingApplicationsCount = 0,
  isAdmin = false 
}: AdminNavigationProps) {
  const navigationItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart3,
      description: 'Platform overview and metrics'
    },
    ...(isAdmin ? [{
      id: 'users',
      label: 'Users',
      icon: Users,
      description: 'Manage user accounts'
    }] : []),
    {
      id: 'content',
      label: 'Content',
      icon: FileText,
      description: 'Review books and content flags'
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: ClipboardCheck,
      description: 'Review writer applications',
      badge: pendingApplicationsCount > 0 ? pendingApplicationsCount : undefined
    },
    {
      id: 'moderation',
      label: 'Moderation',
      icon: Shield,
      description: 'Handle moderation requests'
    },
    {
      id: 'support',
      label: 'Support',
      icon: HelpCircle,
      description: 'Manage support tickets'
    },
    ...(isAdmin ? [
      {
        id: 'invitations',
        label: 'Invitations',
        icon: UserPlus,
        description: 'Send moderator invitations'
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: DollarSign,
        description: 'Financial analytics and reports'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        description: 'System notifications and campaigns',
        badge: userActivityUnreadCount > 0 ? userActivityUnreadCount : undefined
      }
    ] : [])
  ];

  return (
    <div className="w-full lg:w-64 mb-6 lg:mb-0">
      <nav className="space-y-2">
        <div className="lg:hidden mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isAdmin ? 'Admin Panel' : 'Moderator Panel'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isAdmin ? 'Manage platform operations' : 'Manage content and support'}
          </p>
        </div>
        
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left flex-shrink-0 lg:flex-shrink relative",
                  activeTab === item.id 
                    ? "bg-red-600 text-white hover:bg-red-700" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                <div className="hidden lg:block">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70 hidden xl:block">
                    {item.description}
                  </div>
                </div>
                <span className="lg:hidden">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
