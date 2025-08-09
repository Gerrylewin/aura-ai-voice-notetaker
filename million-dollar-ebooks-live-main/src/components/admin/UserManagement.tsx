
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { UserManagementModal } from './UserManagementModal';
import { UserManagementTable } from './user-management/UserManagementTable';
import { UserTablePagination } from './user-management/UserTablePagination';
import { useUserManagement } from './user-management/hooks/useUserManagement';

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

export function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<UserWithAuth | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const {
    users,
    loading,
    updating,
    currentPage,
    totalUsers,
    totalPages,
    canGoNext,
    canGoPrev,
    setCurrentPage,
    fetchUsers,
    handleAuthenticate,
    updateUserRole
  } = useUserManagement();

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'default';
      case 'writer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleOpenUserModal = (user: UserWithAuth) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  const handlePrevPage = () => setCurrentPage(prev => Math.max(0, prev - 1));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-xl text-gray-900 dark:text-white">Loading users...</div>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management ({totalUsers} total users)
            </CardTitle>
            <UserTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              canGoNext={canGoNext}
              canGoPrev={canGoPrev}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <UserManagementTable
            users={users}
            updating={updating}
            onAuthenticate={handleAuthenticate}
            onUpdateRole={updateUserRole}
            onOpenModal={handleOpenUserModal}
            getRoleBadgeVariant={getRoleBadgeVariant}
          />

          {users.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <UserManagementModal
        user={selectedUser}
        isOpen={modalOpen}
        onClose={handleCloseUserModal}
        onUserUpdated={fetchUsers}
      />
    </>
  );
}
