
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { decryptMessage } from './encryption';
import type { PublicChatMessage } from './types';

export function usePublicChatMessages() {
  return useQuery({
    queryKey: ['public-chat'],
    queryFn: async (): Promise<PublicChatMessage[]> => {
      console.log('🔍 FETCHING MESSAGES FROM DATABASE...');
      
      // GET ALL MESSAGES FROM DATABASE (NO FILTERING - DELETED MESSAGES DON'T EXIST)
      const { data: messagesData, error: messagesError } = await supabase
        .from('public_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100); // Limit for performance - can be increased as needed

      if (messagesError) {
        console.error('💥 ERROR FETCHING MESSAGES:', messagesError);
        throw messagesError;
      }
      
      if (!messagesData) {
        console.log('📭 NO MESSAGES FOUND');
        return [];
      }

      console.log('📨 FETCHED', messagesData.length, 'MESSAGES FROM DATABASE');

      // GET USER PROFILES SEPARATELY
      const userIds = [...new Set(messagesData.map(m => m.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, user_role')
        .in('id', userIds);

      if (profilesError) {
        console.error('💥 ERROR FETCHING PROFILES:', profilesError);
        // Continue with messages even if profiles fail
      }

      // Create a map of profiles for quick lookup
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // COMBINE DATA
      const result = messagesData.map(message => {
        const profile = profilesMap.get(message.user_id);
        return {
          ...message,
          decrypted_content: decryptMessage(message.encrypted_content),
          user_role: profile?.user_role || 'reader',
          profiles: profile ? {
            display_name: profile.display_name || 'User',
            avatar_url: profile.avatar_url
          } : {
            display_name: 'Anonymous',
            avatar_url: null
          }
        };
      });
      
      console.log('✅ PROCESSED', result.length, 'MESSAGES FOR DISPLAY');
      return result;
    },
    // OPTIMIZED REFRESH RATES FOR SCALE
    staleTime: 1000 * 30, // 30 seconds - data considered fresh for 30s
    gcTime: 1000 * 60 * 5, // 5 minutes - keep in cache for 5 minutes
    refetchInterval: false, // Rely on realtime updates instead of polling
    refetchOnWindowFocus: true, // Refresh when user comes back to tab
    refetchOnReconnect: true, // Refresh when connection is restored
    // For testing, you can temporarily enable polling:
    // refetchInterval: 1000 * 10, // Poll every 10 seconds during testing
  });
}
