
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Users, Mail, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReleaseNotifications } from '@/hooks/useReleaseNotifications';
import { supabase } from '@/integrations/supabase/client';

interface ReleaseNotificationManagerProps {
  version: string;
  title: string;
  description: string;
}

export function ReleaseNotificationManager({ version, title, description }: ReleaseNotificationManagerProps) {
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasSent, setHasSent] = useState(false);
  const { toast } = useToast();
  const { notifyUsersOfReleaseUpdate } = useReleaseNotifications();

  // Check if this version has already been sent
  React.useEffect(() => {
    const checkIfSent = async () => {
      try {
        const { data } = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'release_notes_update')
          .like('data', `%"version":"${version}"%`)
          .limit(1);
        
        setHasSent(data && data.length > 0);
      } catch (error) {
        console.error('Error checking if version was sent:', error);
      }
    };

    checkIfSent();
  }, [version]);

  const handleSendReleaseNotification = async () => {
    if (!confirm(`Send ${version} release notification to all users? This can only be done once.`)) {
      return;
    }

    setSending(true);
    try {
      const response = await notifyUsersOfReleaseUpdate();
      setResult(response);
      setHasSent(true);
      
      if (response.totalSent === 0) {
        toast({
          title: 'No New Users to Notify',
          description: response.message || 'All users have already been notified of this release.',
        });
      } else {
        toast({
          title: 'Release Notification Sent! 🚀',
          description: `${title} sent to ${response.totalSent} users successfully.`,
        });
      }
    } catch (error: any) {
      console.error('Error sending release notification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send release notifications',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!confirm('Delete ALL release notifications? This action cannot be undone and will allow resending all versions.')) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('type', 'release_notes_update');

      if (error) throw error;

      setHasSent(false);
      setResult(null);
      toast({
        title: 'All Notifications Deleted',
        description: 'All release notifications have been cleared. You can now resend any version.',
      });
    } catch (error: any) {
      console.error('Error deleting notifications:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete notifications',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Release Notification - {version}
        </CardTitle>
        <CardDescription>
          Send this release update to all platform users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            {title}
          </h4>
          <p className="text-purple-700 dark:text-purple-200 text-sm mb-3">
            {description}
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-purple-800 dark:text-purple-200">
            <Users className="h-4 w-4" />
            <span>Includes direct links to Dashboard and Release Notes</span>
          </div>
        </div>

        {hasSent && (
          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <CheckCircle className="h-4 w-4" />
              Already Sent
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              This version has already been sent to users. Use the delete button to clear all notifications if you need to resend.
            </p>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.totalSent > 0 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
          }`}>
            <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
              result.totalSent > 0 
                ? 'text-green-900 dark:text-green-100' 
                : 'text-blue-900 dark:text-blue-100'
            }`}>
              {result.totalSent > 0 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Release Notification Sent Successfully!
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Notification Status
                </>
              )}
            </h4>
            <div className={`text-sm ${
              result.totalSent > 0 
                ? 'text-green-700 dark:text-green-200' 
                : 'text-blue-700 dark:text-blue-200'
            }`}>
              <p>Release notification sent to {result.totalSent} users</p>
              {result.alreadyNotified > 0 && (
                <p>{result.alreadyNotified} users already notified for {version}</p>
              )}
              {result.totalFailed > 0 && <p>{result.totalFailed} failed</p>}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            onClick={handleSendReleaseNotification}
            disabled={sending || hasSent}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400"
          >
            <Mail className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : hasSent ? 'Already Sent' : `Send ${version} Release Notification`}
          </Button>
          
          <Button 
            onClick={handleDeleteAllNotifications}
            disabled={deleting}
            variant="destructive"
            size="default"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? 'Deleting...' : 'Delete All'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
