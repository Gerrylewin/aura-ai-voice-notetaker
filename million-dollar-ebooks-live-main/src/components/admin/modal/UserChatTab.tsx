
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IRCChat } from '@/components/chat/IRCChat';
import { MessageCircle } from 'lucide-react';

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

interface UserChatTabProps {
  user: UserWithAuth;
}

export function UserChatTab({ user }: UserChatTabProps) {
  const [showPrivateChat, setShowPrivateChat] = useState(false);

  const handleStartPrivateChat = () => {
    setShowPrivateChat(true);
  };

  if (showPrivateChat) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-medium">Private Chat with {user.display_name || user.email}</h3>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowPrivateChat(false)}
            className="text-gray-500 hover:text-red-600"
          >
            Close Chat
          </Button>
        </div>
        
        <div className="h-[600px]">
          <IRCChat 
            initialPrivateChat={{
              userId: user.id,
              userName: user.display_name || user.email || 'User',
              userAvatar: user.avatar_url || undefined
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600">
        <MessageCircle className="h-5 w-5" />
        <h3 className="font-medium">Private Chat with User</h3>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Start a private conversation with {user.display_name || user.email}.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This will open the IRC chat in private mode for admin-to-user communication.
          The user will receive an in-app notification and email about your message.
        </p>
        <Button 
          onClick={handleStartPrivateChat}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Start Private Chat
        </Button>
      </div>
    </div>
  );
}
