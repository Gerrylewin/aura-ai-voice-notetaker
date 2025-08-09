
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Trash2, Clock } from 'lucide-react';
import { useModerationLog } from '@/hooks/chat/useModerationLog';

export function ModerationLogPanel() {
  const { data: moderationLog = [], isLoading } = useModerationLog();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading moderation log...</div>
        </CardContent>
      </Card>
    );
  }

  const getRecentStats = () => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const last24HoursCount = moderationLog.filter(
      entry => new Date(entry.created_at) > last24Hours
    ).length;
    
    const last7DaysCount = moderationLog.filter(
      entry => new Date(entry.created_at) > last7Days
    ).length;

    return { last24HoursCount, last7DaysCount };
  };

  const { last24HoursCount, last7DaysCount } = getRecentStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Chat Moderation Log
        </CardTitle>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last 24h: <Badge variant="outline">{last24HoursCount}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last 7 days: <Badge variant="outline">{last7DaysCount}</Badge>
          </div>
          <div>
            Total: <Badge variant="outline">{moderationLog.length}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {moderationLog.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No moderation actions recorded.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {moderationLog.map((entry) => (
              <div 
                key={entry.id} 
                className="border rounded-lg p-3 space-y-2 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-sm">Message Deleted</span>
                    <Badge variant="destructive" className="text-xs">
                      Moderation Action
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
                
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">User: </span>
                    <span className="font-medium">
                      {entry.user_profile?.display_name || entry.user_profile?.username || 'Unknown User'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Moderator: </span>
                    <span className="font-medium">
                      {entry.moderator_profile?.display_name || entry.moderator_profile?.username || 'Unknown Moderator'}
                    </span>
                  </div>
                  {entry.deletion_reason && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Reason: </span>
                      <span className="italic">{entry.deletion_reason}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Deleted message: </span>
                  <span className="font-mono text-xs break-words">
                    "{entry.message_content}"
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
