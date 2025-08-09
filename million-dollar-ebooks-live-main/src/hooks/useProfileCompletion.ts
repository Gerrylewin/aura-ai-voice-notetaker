
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useProfileCompletion() {
  const { profile } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if profile needs completion
  const needsCompletion = profile && (
    !profile.display_name || 
    profile.display_name === 'User' ||
    !profile.username ||
    profile.username === 'user' ||
    !profile.bio
  );

  // Check if user has dismissed the notification in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('profile-completion-dismissed');
    setIsDismissed(dismissed === 'true');
  }, []);

  const dismissNotification = () => {
    setIsDismissed(true);
    sessionStorage.setItem('profile-completion-dismissed', 'true');
  };

  const shouldShowNotification = needsCompletion && !isDismissed;

  return {
    needsCompletion,
    shouldShowNotification,
    dismissNotification,
    completionItems: {
      hasDisplayName: profile?.display_name && profile.display_name !== 'User',
      hasUsername: profile?.username && profile.username !== 'user',
      hasBio: profile?.bio && profile.bio.length > 0,
    }
  };
}
