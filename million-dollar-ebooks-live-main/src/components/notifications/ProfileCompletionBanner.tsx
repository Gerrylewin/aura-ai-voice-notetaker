
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileCompletionBannerProps {
  onDismiss?: () => void;
}

export function ProfileCompletionBanner({ onDismiss }: ProfileCompletionBannerProps) {
  const { profile } = useAuth();

  // Check if profile needs completion
  const needsCompletion = profile && (
    !profile.display_name || 
    profile.display_name === 'User' ||
    !profile.username ||
    profile.username === 'user' ||
    !profile.bio
  );

  if (!needsCompletion) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Complete Your Profile
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Fill out your profile details to have the best experience in the app and unlock all features like submitting stories and connecting with other users.
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/settings">
                  Complete Profile
                </Link>
              </Button>
              {onDismiss && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDismiss}
                  className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                  Maybe Later
                </Button>
              )}
            </div>
          </div>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
              className="p-1 h-6 w-6 text-blue-600 dark:text-blue-400"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
