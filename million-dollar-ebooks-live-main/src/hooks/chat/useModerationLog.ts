
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

interface ModerationLogEntry {
  id: string;
  message_id: string;
  user_id: string;
  moderator_id: string;
  message_content: string;
  deletion_reason: string | null;
  created_at: string;
  user_profile?: {
    display_name: string;
    username: string;
  };
  moderator_profile?: {
    display_name: string;
    username: string;
  };
}

export function useModerationLog() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['moderation-log'],
    queryFn: async (): Promise<ModerationLogEntry[]> => {
      if (!profile || (profile.user_role !== 'admin' && profile.user_role !== 'moderator')) {
        return [];
      }

      console.log('📊 FETCHING MODERATION LOG...');

      try {
        // Query the moderation log table directly
        const { data: logData, error: logError } = await supabase
          .from('chat_moderation_log' as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (logError) {
          console.error('💥 ERROR FETCHING MODERATION LOG:', logError);
          throw logError;
        }

        if (!logData || logData.length === 0) {
          console.log('📊 NO MODERATION LOG ENTRIES FOUND');
          return [];
        }

        console.log('📊 FETCHED', logData.length, 'MODERATION LOG ENTRIES');

        // Get unique user IDs for profile lookup
        const userIds = [...new Set([
          ...logData.map((entry: any) => entry.user_id),
          ...logData.map((entry: any) => entry.moderator_id)
        ])].filter(Boolean);

        // Fetch profiles for users and moderators
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, username')
          .in('id', userIds);

        if (profilesError) {
          console.error('💥 ERROR FETCHING PROFILES:', profilesError);
          // Continue without profiles if this fails
        }

        // Create profile lookup map
        const profilesMap = new Map();
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }

        // Map the data to our interface
        const result: ModerationLogEntry[] = logData.map((entry: any) => {
          const userProfile = profilesMap.get(entry.user_id);
          const moderatorProfile = profilesMap.get(entry.moderator_id);

          return {
            id: entry.id,
            message_id: entry.message_id,
            user_id: entry.user_id,
            moderator_id: entry.moderator_id,
            message_content: entry.message_content || 'Content not available',
            deletion_reason: entry.deletion_reason,
            created_at: entry.created_at,
            user_profile: userProfile ? {
              display_name: userProfile.display_name || userProfile.username || 'Unknown User',
              username: userProfile.username || 'unknown'
            } : undefined,
            moderator_profile: moderatorProfile ? {
              display_name: moderatorProfile.display_name || moderatorProfile.username || 'Unknown Moderator',
              username: moderatorProfile.username || 'unknown'
            } : undefined
          };
        });

        return result;
      } catch (error) {
        console.error('💥 UNEXPECTED ERROR IN MODERATION LOG:', error);
        return [];
      }
    },
    enabled: !!(profile && (profile.user_role === 'admin' || profile.user_role === 'moderator')),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
