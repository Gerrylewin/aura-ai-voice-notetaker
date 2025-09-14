
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';
import { ProfileService } from '@/services/profileService';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('useAuthState: Current state:', { user: !!user, profile: !!profile, loading });

  const fetchProfile = async (sessionUser: User) => {
    console.log('fetchProfile: Starting for user:', sessionUser.id);
    
    try {
      const { data: profileData, error } = await ProfileService.getOrCreateProfile(
        sessionUser.id,
        sessionUser.email || '',
        sessionUser.user_metadata
      );

      if (error) {
        console.error('fetchProfile: Error:', error);
        return;
      }

      if (profileData) {
        console.log('fetchProfile: Success:', profileData);
        setProfile(profileData);
      }
    } catch (error) {
      console.error('fetchProfile: Exception:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    console.log('useAuthState: Setting up auth listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuthState: Auth state changed:', event, !!session);
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('useAuthState: User found, setting user and fetching profile');
          setUser(session.user);
          // Use setTimeout to avoid blocking auth state change
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user);
            }
          }, 0);
        } else {
          console.log('useAuthState: No session, clearing state');
          setUser(null);
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('useAuthState: Getting initial session');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log('useAuthState: Initial session found');
          setUser(session.user);
          // Use setTimeout to avoid blocking
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user);
            }
          }, 0);
        } else {
          console.log('useAuthState: No initial session');
        }
      } catch (error) {
        console.error('useAuthState: Error getting initial session:', error);
      } finally {
        if (mounted) {
          console.log('useAuthState: Setting loading to false');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      console.log('useAuthState: Cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    setProfile,
    fetchProfile: refreshProfile,
    refreshProfile
  };
}
