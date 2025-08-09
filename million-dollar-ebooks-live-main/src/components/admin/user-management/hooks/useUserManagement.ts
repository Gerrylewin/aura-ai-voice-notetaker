
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/hooks/auth/types';

interface AuthUser {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  user_metadata?: any;
  app_metadata?: any;
}

interface UserWithAuth extends Profile {
  email?: string;
  is_authenticated?: boolean;
  created_at: string;
}

type UserRole = 'reader' | 'writer' | 'moderator' | 'admin';

const USERS_PER_PAGE = 10;

export function useUserManagement() {
  const [users, setUsers] = useState<UserWithAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      console.log('Fetching users for page:', currentPage);
      
      // Get total count first
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      setTotalUsers(count || 0);

      // Get paginated profiles with member_number
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*, member_number')
        .order('created_at', { ascending: false })
        .range(currentPage * USERS_PER_PAGE, (currentPage + 1) * USERS_PER_PAGE - 1);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles?.length || 0);

      let usersWithEmail = profiles?.map(profile => ({
        ...profile,
        email: 'Email not available',
        is_authenticated: !!profile.email_confirmed_at && !profile.requires_authentication,
        created_at: profile.created_at || new Date().toISOString()
      })) || [];

      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authData?.users && !authError) {
          console.log('Auth users fetched:', authData.users.length);
          usersWithEmail = profiles?.map(profile => {
            const authUser = authData.users.find((u: AuthUser) => u.id === profile.id);
            return {
              ...profile,
              email: authUser?.email || 'Email not available',
              is_authenticated: !!profile.email_confirmed_at && !profile.requires_authentication,
              created_at: profile.created_at || new Date().toISOString()
            };
          }) || [];
        }
      } catch (authError) {
        console.log('Auth admin access not available, continuing with profiles only');
      }

      setUsers(usersWithEmail);
      console.log('Final users list:', usersWithEmail.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async (userId: string) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          requires_authentication: false,
          email_confirmed_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'User has been marked as authenticated.',
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error authenticating user:', error);
      toast({
        title: 'Error',
        description: `Failed to authenticate user: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const sendModeratorUpgradeEmail = async (userEmail: string, displayName: string) => {
    try {
      console.log('Sending moderator upgrade email to:', userEmail);
      const { sendEmail, emailTemplates } = await import('@/utils/emailService');
      const template = emailTemplates.moderatorUpgrade(displayName || userEmail);
      
      await sendEmail({
        to: userEmail,
        subject: template.subject,
        html: template.html,
        type: 'upgrade_confirmation'
      });
      
      console.log('Moderator upgrade email sent successfully');
    } catch (error) {
      console.error('Failed to send moderator upgrade email:', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    console.log('Updating user role:', { userId, newRole });
    setUpdating(userId);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Database error updating role:', error);
        throw error;
      }

      console.log('Role updated successfully in database');

      const user = users.find(u => u.id === userId);
      
      if (newRole === 'moderator' && user?.email && user.email !== 'Email not available') {
        await sendModeratorUpgradeEmail(user.email, user.display_name || user.email);
      }

      toast({
        title: 'Success',
        description: `User role updated to ${newRole} successfully.`,
      });

      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: `Failed to update user role: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  return {
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
  };
}
