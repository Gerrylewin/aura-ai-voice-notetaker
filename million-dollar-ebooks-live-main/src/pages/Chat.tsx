
import React from 'react';
import { Header } from '@/components/layout/Header';
import { IRCChat } from '@/components/chat/IRCChat';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

export default function Chat() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-lg sm:text-xl">Loading chat...</div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex flex-col">
      <Header />
      
      {/* Full-height chat container */}
      <div className="flex-1 pt-16 sm:pt-20 lg:pt-24">
        <div className="h-full flex flex-col">
          {/* Chat header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Community Chat
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Connect with readers, writers, and the community
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Full embedded chat */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
              <IRCChat />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
