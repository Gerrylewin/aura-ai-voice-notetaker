
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle } from 'lucide-react';

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

interface UserModalHeaderProps {
  user: UserWithAuth;
}

export function UserModalHeader({ user }: UserModalHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar_url || ''} />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          {user.display_name || 'No name'}
          <Badge variant={user.user_role === 'admin' ? 'destructive' : 'default'}>
            {user.user_role}
          </Badge>
          {user.is_verified && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          @{user.username || 'no-username'} • {user.email}
        </div>
      </div>
    </div>
  );
}
