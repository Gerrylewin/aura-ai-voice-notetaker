
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Ban } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChatModeration } from '@/hooks/chat/useChatModeration';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatModerationActionsProps {
  userId: string;
  userName: string;
  messageId: string;
}

export function ChatModerationActions({ userId, userName, messageId }: ChatModerationActionsProps) {
  const { profile } = useAuth();
  const { warnUser, isWarning } = useChatModeration();
  const { toast } = useToast();
  const [showWarnDialog, setShowWarnDialog] = useState(false);

  // Only show for admins and moderators
  if (!profile || (profile.user_role !== 'admin' && profile.user_role !== 'moderator')) {
    return null;
  }

  // Don't show for yourself
  if (userId === profile.id) {
    return null;
  }

  const handleWarnUser = async () => {
    try {
      await warnUser.mutateAsync({ userId, messageId });
      setShowWarnDialog(false);
      toast({
        title: 'Warning issued',
        description: `Warning issued to ${userName}`,
      });
    } catch (error) {
      console.error('Failed to warn user:', error);
      toast({
        title: 'Failed to issue warning',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowWarnDialog(true)}
        disabled={isWarning}
        className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-1 h-6 w-6"
        title="Issue warning"
      >
        <AlertTriangle className="w-3 h-3" />
      </Button>

      <AlertDialog open={showWarnDialog} onOpenChange={setShowWarnDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Issue Warning</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to issue a warning to {userName}? 
              If they receive 2 warnings, they will be muted for 1 hour.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWarnUser}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Issue Warning
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
