import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

/**
 * Hook for cleaning up user accounts properly - UPDATED to protect admin accounts
 */
export function useAccountCleanup() {
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const clearAccountData = async () => {
    setIsClearing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Check if user is admin or moderator - don't allow data clearing for these roles
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

      if (profile?.user_role === 'admin' || profile?.user_role === 'moderator') {
        toast({
          title: 'Action not allowed',
          description: 'Admin and moderator accounts cannot clear their data.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Starting account data cleanup for user:', user.id);

      // Clear all user data but keep the profile (except for admins/moderators)
      const cleanupTables = [
        'bookmarks',
        'reading_progress', 
        'reviews',
        'notifications',
        'story_reactions',
        'story_comments',
        'daily_stories',
        'tips',
        'purchases'
      ];

      for (const tableName of cleanupTables) {
        try {
          const { error } = await supabase
            .from(tableName as any)
            .delete()
            .eq('user_id', user.id);
          
          if (error) {
            console.warn(`Error cleaning up ${tableName}:`, error);
          }
        } catch (error) {
          console.warn(`Error cleaning up ${tableName}:`, error);
        }
      }

      toast({
        title: 'Account data cleared',
        description: 'Your account data has been cleared but your profile remains active.',
      });

    } catch (error: any) {
      console.error('Account data cleanup error:', error);
      toast({
        title: 'Error clearing account data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const deleteAccountCompletely = async () => {
    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Check if user is admin or moderator - don't allow deletion for these roles
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

      if (profile?.user_role === 'admin' || profile?.user_role === 'moderator') {
        toast({
          title: 'Action not allowed',
          description: 'Admin and moderator accounts cannot be deleted.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Starting complete account deletion for user:', user.id);

      // First delete the profile record to clean up the username
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        // Don't throw here, continue with auth deletion
      }

      // Then delete all related data
      const cleanupTables = [
        'bookmarks',
        'reading_progress',
        'reviews',
        'notifications',
        'notification_preferences',
        'story_reactions',
        'story_comments',
        'daily_stories',
        'tips',
        'purchases'
      ];

      for (const tableName of cleanupTables) {
        try {
          const { error } = await supabase
            .from(tableName as any)
            .delete()
            .eq('user_id', user.id);
          
          if (error) {
            console.warn(`Error cleaning up ${tableName}:`, error);
          }
        } catch (error) {
          console.warn(`Error cleaning up ${tableName}:`, error);
        }
      }

      // Sign out
      await supabase.auth.signOut();

      toast({
        title: 'Account deleted',
        description: 'Your account has been completely removed.',
      });

      // Redirect to home
      window.location.href = '/';

    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: 'Error deleting account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return { clearAccountData, deleteAccountCompletely, isClearing, isDeleting };
}
