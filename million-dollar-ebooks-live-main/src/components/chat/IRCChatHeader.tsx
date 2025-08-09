
import React from 'react';
import { Users, MessageCircle, Hash, Lock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IRCChatHeaderProps {
  uniqueUsers: number;
  messagesCount: number;
  channelName?: string;
  isPrivate?: boolean;
}

export function IRCChatHeader({ uniqueUsers, messagesCount, channelName = "Public Chat", isPrivate = false }: IRCChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isPrivate ? (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Hash className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {channelName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isPrivate ? 'Private conversation' : 'Public community chat'}
            </p>
          </div>
        </div>
        
        {isPrivate && (
          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
            <Shield className="w-3 h-3 mr-1" />
            Encrypted
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border">
          <Users className="w-4 h-4" />
          <span className="font-medium">{uniqueUsers}</span>
          <span className="text-xs">online</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border">
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">{messagesCount}</span>
          <span className="text-xs">messages</span>
        </div>
      </div>
    </div>
  );
}
