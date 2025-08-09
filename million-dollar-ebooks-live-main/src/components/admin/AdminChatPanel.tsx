
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IRCChat } from '@/components/chat/IRCChat';
import { MessageCircle } from 'lucide-react';

export function AdminChatPanel() {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Community Chat
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor and participate in community discussions. Use this to communicate with users.
        </p>
      </CardHeader>
      <CardContent>
        <IRCChat />
      </CardContent>
    </Card>
  );
}
