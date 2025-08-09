
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Write() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect non-writers to dashboard
  if (!user || (profile?.user_role !== 'writer' && profile?.user_role !== 'admin' && profile?.user_role !== 'moderator')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect writers to dashboard where they can write
  return <Navigate to="/dashboard" replace />;
}
