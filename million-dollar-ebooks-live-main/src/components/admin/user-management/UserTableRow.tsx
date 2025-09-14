
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, User, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { FirstMemberBadge } from '@/components/layout/navigation/notifications/FirstMemberBadge';

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
  member_number: number | null;
}

type UserRole = 'reader' | 'writer' | 'moderator' | 'admin';

interface UserTableRowProps {
  user: UserWithAuth;
  updating: string | null;
  onAuthenticate: (userId: string) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onOpenModal: (user: UserWithAuth) => void;
  getRoleBadgeVariant: (role: string) => string;
}

export function UserTableRow({ 
  user, 
  updating, 
  onAuthenticate, 
  onUpdateRole, 
  onOpenModal, 
  getRoleBadgeVariant 
}: UserTableRowProps) {
  return (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 dark:text-white truncate">
              {user.display_name || 'No name'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{user.username || 'no-username'}
            </div>
            {user.member_number && user.member_number <= 100 && (
              <div className="mt-1">
                <FirstMemberBadge memberNumber={user.member_number} />
              </div>
            )}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant={getRoleBadgeVariant(user.user_role) as any} className="text-xs">
          {user.user_role}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          {user.is_authenticated ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-xs text-green-600 dark:text-green-400">Auth'd</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAuthenticate(user.id)}
                disabled={updating === user.id}
                className="text-xs h-6 px-2"
              >
                {updating === user.id ? 'Auth...' : 'Auth'}
              </Button>
            </>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="max-w-24 truncate text-xs text-gray-600 dark:text-gray-300">
          {user.bio || 'No bio'}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-1">
          <Shield className={`h-4 w-4 ${user.is_verified ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-xs">
            {user.is_verified ? 'Yes' : 'No'}
          </span>
        </div>
      </TableCell>
      
      <TableCell>
        <Select
          value={user.user_role}
          onValueChange={(newRole: UserRole) => onUpdateRole(user.id, newRole)}
          disabled={updating === user.id}
        >
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reader">Reader</SelectItem>
            <SelectItem value="writer">Writer</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenModal(user)}
          className="h-8 px-2 text-xs"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
