
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Trash2, 
  Ban
} from 'lucide-react';

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

interface UserActionsTabProps {
  user: UserWithAuth;
  onUserUpdated: () => void;
  onClose: () => void;
}

export function UserActionsTab({ user, onUserUpdated, onClose }: UserActionsTabProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResendAuthEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: user.email || '',
          subject: 'Account Access - Million Dollar eBooks',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #dc2626;">Account Access</h1>
              <p>Hello ${user.display_name || user.email}!</p>
              <p>Your account has been verified and you now have full access to Million Dollar eBooks.</p>
              <p>You can log in at: <a href="${window.location.origin}">${window.location.origin}</a></p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy reading and writing!</p>
            </div>
          `,
          type: 'upgrade_confirmation'
        }
      });

      if (error) throw error;

      toast({
        title: 'Email sent',
        description: 'Account access email has been sent to the user.',
      });
    } catch (error: any) {
      console.error('Error sending auth email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send authentication email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMuteUser = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat_mutes')
        .insert({
          user_id: user.id,
          muted_by: (await supabase.auth.getUser()).data.user?.id,
          reason: 'Admin action',
          warning_count: 0,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: 'User muted',
        description: 'User has been muted for 24 hours.',
      });
      onUserUpdated();
    } catch (error: any) {
      console.error('Error muting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to mute user.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const { error: deleteRecordError } = await supabase
        .from('deleted_accounts')
        .insert({
          user_id: user.id,
          email: user.email || '',
          is_test_account: false
        });

      if (deleteRecordError) {
        console.error('Error recording deletion:', deleteRecordError);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: 'Account deleted',
        description: 'User account has been permanently deleted.',
      });
      onUserUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user account.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-600">Admin Actions</h3>
      
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={handleResendAuthEmail}
          disabled={loading}
          className="w-full justify-start"
        >
          <Mail className="h-4 w-4 mr-2" />
          Resend Authentication Email
        </Button>

        <Button
          variant="outline"
          onClick={handleMuteUser}
          disabled={loading}
          className="w-full justify-start text-orange-600 hover:text-orange-700"
        >
          <Ban className="h-4 w-4 mr-2" />
          Mute User (24 hours)
        </Button>

        <Separator />

        <Button
          variant="destructive"
          onClick={handleDeleteAccount}
          disabled={loading}
          className="w-full justify-start"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account Permanently
        </Button>
      </div>
    </div>
  );
}
