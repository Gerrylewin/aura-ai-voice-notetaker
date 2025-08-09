
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, Lock } from 'lucide-react';

interface IRCChatMessagesProps {
  messages: any[];
  isLoading: boolean;
  onDeleteMessage: (messageId: string) => void;
  onStartPrivateChat: (userId: string, userName: string, userAvatar?: string) => void;
  isPrivateChannel?: boolean;
}

export function IRCChatMessages({ 
  messages, 
  isLoading, 
  onDeleteMessage, 
  onStartPrivateChat,
  isPrivateChannel = false
}: IRCChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="space-y-3">
          {isPrivateChannel ? (
            <>
              <Lock className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Private Chat</h3>
              <p className="text-gray-500 dark:text-gray-400">Start a private conversation</p>
            </>
          ) : (
            <>
              <Hash className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Welcome to Public Chat</h3>
              <p className="text-gray-500 dark:text-gray-400">Start the conversation!</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onDeleteMessage={onDeleteMessage}
            onStartPrivateChat={onStartPrivateChat}
            showPrivateChatOption={!isPrivateChannel}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
