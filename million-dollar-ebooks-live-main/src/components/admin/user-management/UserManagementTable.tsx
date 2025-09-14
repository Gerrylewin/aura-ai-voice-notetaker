
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { UserTableHeader } from './UserTableHeader';
import { UserTableRow } from './UserTableRow';

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

interface UserManagementTableProps {
  users: UserWithAuth[];
  updating: string | null;
  onAuthenticate: (userId: string) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onOpenModal: (user: UserWithAuth) => void;
  getRoleBadgeVariant: (role: string) => string;
}

export function UserManagementTable({
  users,
  updating,
  onAuthenticate,
  onUpdateRole,
  onOpenModal,
  getRoleBadgeVariant
}: UserManagementTableProps) {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 h-full overflow-auto">
      <Table>
        <UserTableHeader />
        <TableBody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              updating={updating}
              onAuthenticate={onAuthenticate}
              onUpdateRole={onUpdateRole}
              onOpenModal={onOpenModal}
              getRoleBadgeVariant={getRoleBadgeVariant}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
