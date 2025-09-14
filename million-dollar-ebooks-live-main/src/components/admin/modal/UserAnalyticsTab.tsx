
import React from 'react';
import { BarChart3 } from 'lucide-react';

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

interface UserAnalyticsTabProps {
  user: UserWithAuth;
}

export function UserAnalyticsTab({ user }: UserAnalyticsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600">
        <BarChart3 className="h-5 w-5" />
        <h3 className="font-medium">User Analytics</h3>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600 mb-4">
          Detailed analytics for {user.display_name || user.email} will be available here.
        </p>
        <p className="text-sm text-gray-500">
          This will include reading habits, writing progress, engagement metrics, 
          and AI-powered insights for writers.
        </p>
      </div>
    </div>
  );
}
