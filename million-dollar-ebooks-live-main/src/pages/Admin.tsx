
import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Admin() {
  const { user, profile, loading } = useAuth();

  console.log('Admin page - user:', user);
  console.log('Admin page - profile:', profile);
  console.log('Admin page - loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-lg sm:text-xl">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  // Check if user has admin or moderator access
  const hasAdminAccess = profile && (profile.user_role === 'admin' || profile.user_role === 'moderator');
  console.log('Admin page - hasAdminAccess:', hasAdminAccess);

  // Redirect if not admin or moderator
  if (!user || !hasAdminAccess) {
    console.log('Admin page - redirecting to dashboard, no access');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <Header />
      <div className="pt-16 sm:pt-20 lg:pt-32 pb-6 sm:pb-12">
        <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
          <div className="space-y-4 sm:space-y-8">
            <div className="text-center space-y-4 sm:space-y-6 px-4">
              <div className="space-y-2 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {profile.user_role === 'admin' ? 'Admin Panel' : 'Moderator Panel'}
                </h1>
                <p className="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  {profile.user_role === 'admin' 
                    ? 'Manage users, content, and platform operations from your centralized admin dashboard.'
                    : 'Manage content and support requests from your moderator dashboard.'
                  }
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <AdminDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
