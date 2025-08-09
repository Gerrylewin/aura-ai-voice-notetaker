import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { IRCUserActions } from './IRCUserActions';
import { ChatModerationActions } from './ChatModerationActions';
import { RoleBadge } from '@/components/ui/role-badge';
import type { PublicChatMessage } from '@/hooks/chat/types';

interface MessageItemProps {
  message: PublicChatMessage;
  onDeleteMessage: (messageId: string) => void;
  onStartPrivateChat: (userId: string, userName: string, userAvatar?: string) => void;
  showPrivateChatOption?: boolean;
}

export function MessageItem({ 
  message, 
  onDeleteMessage, 
  onStartPrivateChat,
  showPrivateChatOption = true
}: MessageItemProps) {
  const { user, profile } = useAuth();
  
  const isOwnMessage = message.user_id === user?.id;
  const canDelete = isOwnMessage || profile?.user_role === 'admin' || profile?.user_role === 'moderator';
  const canModerate = profile?.user_role === 'admin' || profile?.user_role === 'moderator';
  
  const displayName = message.profiles?.display_name || 'Anonymous';
  const avatarUrl = message.profiles?.avatar_url;
  const userRole = message.user_role || 'reader';

  const handleDelete = () => {
    console.log('🗑️ USER INITIATED DELETE FOR MESSAGE:', message.id);
    onDeleteMessage(message.id);
  };

  return (
    <div className="group flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs">
          {displayName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {displayName}
          </span>
          <RoleBadge userRole={userRole} size="sm" showText={false} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {user && displayName !== 'Anonymous' && !isOwnMessage && (
            <IRCUserActions
              userId={message.user_id}
              userName={displayName}
              userAvatar={message.profiles?.avatar_url}
              onStartPrivateChat={onStartPrivateChat}
            />
          )}
        </div>
        
        <div className="mt-1">
          <p className="text-gray-900 dark:text-gray-100 break-words whitespace-pre-wrap">
            {message.decrypted_content}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showPrivateChatOption && (
          <IRCUserActions
            userId={message.user_id}
            userName={displayName}
            userAvatar={message.profiles?.avatar_url}
            onStartPrivateChat={onStartPrivateChat}
          />
        )}
        
        {canDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-6 w-6 shrink-0"
            title={isOwnMessage ? "Delete your message" : "Delete message (moderation)"}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
