
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserModalHeader } from './modal/UserModalHeader';
import { UserOverviewTab } from './modal/UserOverviewTab';
import { UserAnalyticsTab } from './modal/UserAnalyticsTab';
import { UserChatTab } from './modal/UserChatTab';
import { UserActionsTab } from './modal/UserActionsTab';

interface UserWithAuth {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  user_role: string;
  is_verified: boolean;
  profile_completed: boolean;
  email_confirmed_at: string | null;
  requires_authentication: boolean;
  created_at: string;
  email?: string;
  is_authenticated?: boolean;
}

interface UserManagementModalProps {
  user: UserWithAuth | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function UserManagementModal({ user, isOpen, onClose, onUserUpdated }: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'chat' | 'actions'>('overview');

  if (!user) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'chat', label: 'Chat' },
    { id: 'actions', label: 'Actions' }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <UserOverviewTab user={user} onUserUpdated={onUserUpdated} />;
      case 'analytics':
        return <UserAnalyticsTab user={user} />;
      case 'chat':
        return <UserChatTab user={user} />;
      case 'actions':
        return <UserActionsTab user={user} onUserUpdated={onUserUpdated} onClose={onClose} />;
      default:
        return <UserOverviewTab user={user} onUserUpdated={onUserUpdated} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <UserModalHeader user={user} />
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm capitalize ${
                activeTab === tab.id
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
