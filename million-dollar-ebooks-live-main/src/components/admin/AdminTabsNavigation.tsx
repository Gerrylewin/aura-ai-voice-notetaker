
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Shield, 
  HelpCircle, 
  UserPlus, 
  Bell,
  DollarSign
} from 'lucide-react';

interface AdminTabsNavigationProps {
  userActivityUnreadCount: number;
  isAdmin?: boolean;
}

export function AdminTabsNavigation({ userActivityUnreadCount, isAdmin = false }: AdminTabsNavigationProps) {
  return (
    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mb-8">
      <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
        <BarChart3 className="w-4 h-4" />
        <span className="hidden sm:inline">Overview</span>
      </TabsTrigger>
      
      {isAdmin && (
        <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Users</span>
        </TabsTrigger>
      )}
      
      <TabsTrigger value="content" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline">Content</span>
      </TabsTrigger>
      
      <TabsTrigger value="moderation" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
        <Shield className="w-4 h-4" />
        <span className="hidden sm:inline">Moderation</span>
      </TabsTrigger>
      
      <TabsTrigger value="support" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Support</span>
      </TabsTrigger>
      
      {isAdmin && (
        <>
          <TabsTrigger value="invitations" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Invitations</span>
          </TabsTrigger>
          
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
            {userActivityUnreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {userActivityUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </>
      )}
    </TabsList>
  );
}
