
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { ProfileService } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function AuthenticationNotificationBanner() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const handleAuthenticate = async () => {
    if (!user) return;
    
    setIsAuthenticating(true);
    try {
      const { error } = await ProfileService.markAsAuthenticated(user.id);
      
      if (error) {
        throw error;
      }

      toast({
        title: 'Authentication Complete',
        description: 'Your account has been successfully authenticated!',
      });

      // Refresh the profile to update the UI
      await refreshProfile();
    } catch (error: any) {
      console.error('Error authenticating:', error);
      toast({
        title: 'Error',
        description: 'Failed to authenticate account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 dark:border-orange-800 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
              Account Authentication Required
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
              To complete your account setup and access all features, please authenticate your account by clicking the button below. This confirms you're a real person.
            </p>
            <Button 
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isAuthenticating ? 'Authenticating...' : 'Authenticate Account'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
