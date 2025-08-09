
import React, { useState, useEffect } from 'react';
import { AdminOverviewCards } from './AdminOverviewCards';
import { AdminContentManagement } from './AdminContentManagement';
import { AdminNotificationsPanel } from './AdminNotificationsPanel';
import { AdminUserNotificationsPanel } from './AdminUserNotificationsPanel';
import { NotificationCampaignManager } from './NotificationCampaignManager';
import { UserManagement } from './UserManagement';
import { ModerationRequestsPanel } from './ModerationRequestsPanel';
import { ModeratorInvitationsPanel } from './ModeratorInvitationsPanel';
import { SupportRequestsPanel } from './SupportRequestsPanel';
import { FinancialAnalytics } from './FinancialAnalytics';
import { WriterApplicationsPanel } from './WriterApplicationsPanel';
import { AdminNavigation } from './AdminNavigation';
import { AdminHandlers } from './AdminHandlers';
import { useAdminUserNotifications } from '@/hooks/useAdminUserNotifications';
import { useAdminData } from '@/hooks/useAdminData';
import { useAdminApplications } from '@/hooks/useAdminApplications';
import { useAuth } from '@/hooks/useAuth';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile } = useAuth();
  
  const { unreadCount: userActivityUnreadCount } = useAdminUserNotifications();
  const { pendingBooks, contentFlags, loading } = useAdminData();
  const { pendingCount: pendingApplicationsCount } = useAdminApplications();

  const isAdmin = profile?.user_role === 'admin';
  const isModerator = profile?.user_role === 'moderator';

  // Listen for tab change events from notifications
  useEffect(() => {
    const handleSetAdminTab = (event: CustomEvent) => {
      console.log('🔄 Setting admin tab from notification:', event.detail);
      setActiveTab(event.detail);
    };

    window.addEventListener('setAdminTab', handleSetAdminTab as EventListener);
    
    return () => {
      window.removeEventListener('setAdminTab', handleSetAdminTab as EventListener);
    };
  }, []);

  // Calculate counts from the actual data
  const pendingBooksCount = pendingBooks.length;
  const pendingFlagsCount = contentFlags.filter(flag => flag.status === 'pending').length;
  const totalFlagsCount = contentFlags.length;
  const resolvedFlagsCount = contentFlags.filter(flag => flag.status === 'resolved').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AdminOverviewCards
            pendingBooksCount={pendingBooksCount}
            pendingFlagsCount={pendingFlagsCount}
            totalFlagsCount={totalFlagsCount}
            resolvedFlagsCount={resolvedFlagsCount}
            pendingApplicationsCount={pendingApplicationsCount}
          />
        );
      case 'users':
        return isAdmin ? <UserManagement /> : null;
      case 'content':
        return (
          <AdminContentManagement
            pendingBooks={pendingBooks}
            flags={contentFlags}
            onBookReview={AdminHandlers.handleBookReview}
            onFlagReview={AdminHandlers.handleFlagReview}
            onBookDelete={AdminHandlers.handleBookDelete}
          />
        );
      case 'applications':
        return <WriterApplicationsPanel />;
      case 'moderation':
        return <ModerationRequestsPanel />;
      case 'support':
        return <SupportRequestsPanel />;
      case 'invitations':
        return isAdmin ? <ModeratorInvitationsPanel /> : null;
      case 'analytics':
        return isAdmin ? <FinancialAnalytics /> : null;
      case 'notifications':
        return isAdmin ? (
          <div className="space-y-6">
            <AdminUserNotificationsPanel />
            <AdminNotificationsPanel />
            <NotificationCampaignManager />
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 lg:py-8">
      <div className="mb-6 lg:mb-8">
        <div className="hidden lg:block">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isAdmin ? 'Admin Dashboard' : 'Moderator Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isAdmin ? 'Manage users, content, and platform operations' : 'Manage content and support requests'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userActivityUnreadCount={userActivityUnreadCount}
          pendingApplicationsCount={pendingApplicationsCount}
          isAdmin={isAdmin}
        />
        
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
