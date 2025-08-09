
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { releaseNotesData } from '@/components/support/release-notes-data';

export function useReleaseNotifications() {
  const { toast } = useToast();

  const notifyUsersOfReleaseUpdate = async () => {
    try {
      console.log('Calling notify-release-update function...');
      
      // Get the latest release from the release notes data
      const latestRelease = releaseNotesData[0];
      
      if (!latestRelease) {
        throw new Error('No release data found');
      }

      // Create a concise message from the release highlights
      const message = latestRelease.highlights.join('. ') || 
        `We're excited to announce ${latestRelease.title}! This update includes major improvements and new features to enhance your experience on Million Dollar eBooks.`;

      const { data, error } = await supabase.functions.invoke('notify-release-update', {
        body: {
          version: latestRelease.version,
          title: latestRelease.title,
          message: message,
          dashboardUrl: `${window.location.origin}/dashboard`,
          releaseNotesUrl: `${window.location.origin}/release-notes`,
          chatUrl: `${window.location.origin}/chat`
        }
      });

      if (error) {
        console.error('Error calling notify-release-update:', error);
        throw error;
      }

      console.log('notify-release-update response:', data);
      return data;
    } catch (error) {
      console.error('Error in notifyUsersOfReleaseUpdate:', error);
      throw error;
    }
  };

  return {
    notifyUsersOfReleaseUpdate
  };
}
