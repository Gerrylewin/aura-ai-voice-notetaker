
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Hash, Lock, Users, Trash2, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileUtils } from '@/hooks/useMobileUtils';

interface PrivateChat {
  conversationId: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface ChatSidebarProps {
  privateChats: PrivateChat[];
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
  onRemoveChat: (chatId: string) => void;
  className?: string;
}

function SidebarContent({ 
  privateChats, 
  activeChannel, 
  onChannelSelect, 
  onRemoveChat 
}: Omit<ChatSidebarProps, 'className'>) {
  return (
    <div className="flex flex-col h-full">
      <div className="pb-3 flex-shrink-0">
        <div className="text-lg font-semibold flex items-center gap-2 px-4">
          <Users className="w-5 h-5" />
          Conversations
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2 px-4 pb-4">
            {/* Public Chat */}
            <Button
              variant={activeChannel === 'public' ? 'default' : 'ghost'}
              className={cn(
                "w-full justify-start h-auto p-3 text-left",
                activeChannel === 'public' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              onClick={() => onChannelSelect('public')}
            >
              <Hash className="w-4 h-4 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium">Public Chat</div>
                <div className="text-xs opacity-70">Community discussion</div>
              </div>
            </Button>

            {privateChats.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 px-3 mb-2">
                  Private Messages
                </div>
              </>
            )}

            {/* Private Chats */}
            {privateChats.map((chat) => (
              <div
                key={chat.conversationId}
                className={cn(
                  "group relative rounded-lg border transition-colors",
                  activeChannel === chat.conversationId
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                )}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left hover:bg-transparent"
                  onClick={() => onChannelSelect(chat.conversationId)}
                >
                  <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
                    <AvatarImage src={chat.participantAvatar} />
                    <AvatarFallback className="text-xs">
                      {chat.participantName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="font-medium truncate">{chat.participantName}</span>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5 min-w-[20px]">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    {chat.lastMessage && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </div>
                    )}
                    
                    {chat.lastMessageAt && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(chat.lastMessageAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveChat(chat.conversationId);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function ChatSidebar({ 
  privateChats, 
  activeChannel, 
  onChannelSelect, 
  onRemoveChat,
  className 
}: ChatSidebarProps) {
  const { isMobile } = useMobileUtils();

  // On mobile, render as a sheet/drawer
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="fixed top-20 left-4 z-40 bg-white dark:bg-gray-800">
            <Menu className="w-4 h-4 mr-2" />
            Chats
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4">
            <SheetTitle>Chat Menu</SheetTitle>
          </SheetHeader>
          <div className="h-full pb-16">
            <SidebarContent
              privateChats={privateChats}
              activeChannel={activeChannel}
              onChannelSelect={onChannelSelect}
              onRemoveChat={onRemoveChat}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // On desktop, render as normal card
  return (
    <Card className={cn("flex flex-col bg-white dark:bg-gray-800", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Conversations
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <SidebarContent
          privateChats={privateChats}
          activeChannel={activeChannel}
          onChannelSelect={onChannelSelect}
          onRemoveChat={onRemoveChat}
        />
      </CardContent>
    </Card>
  );
}
