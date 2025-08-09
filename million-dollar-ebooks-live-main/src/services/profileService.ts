import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/hooks/auth/types';

/**
 * Profile service for managing user profiles
 */
export class ProfileService {
  /**
   * Simple username generation - back to original approach
   */
  static async generateUniqueUsername(email: string): Promise<string> {
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return baseUsername;
  }

  /**
   * Check if user needs to authenticate (confirm email)
   */
  static async checkAuthenticationStatus(userId: string) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_confirmed_at, requires_authentication')
      .eq('id', userId)
      .maybeSingle();
    
    if (!profile) {
      // No profile means user hasn't confirmed email yet
      return { needsAuthentication: true, hasProfile: false };
    }
    
    return { 
      needsAuthentication: profile.requires_authentication || !profile.email_confirmed_at,
      hasProfile: true 
    };
  }

  /**
   * Mark user as authenticated
   */
  static async markAsAuthenticated(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        requires_authentication: false,
        email_confirmed_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  }

  /**
   * Get or create user profile - GUARANTEED to return a profile
   */
  static async getOrCreateProfile(userId: string, email: string, userData?: any) {
    try {
      console.log('ProfileService: Getting profile for user:', userId);
      
      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('ProfileService: Error fetching profile:', fetchError);
        return { data: null, error: fetchError };
      }
      
      if (existingProfile) {
        console.log('ProfileService: Found existing profile:', existingProfile);
        return { data: existingProfile, error: null };
      }
      
      console.log('ProfileService: No profile found, creating new one');
      
      // Generate username
      const username = await this.generateUniqueUsername(email);
      
      // Create new profile
      const newProfileData = {
        id: userId,
        display_name: userData?.display_name || email.split('@')[0],
        username: username,
        user_role: (userData?.user_role as any) || 'reader',
        profile_completed: false,
        email_confirmed_at: new Date().toISOString(),
        requires_authentication: false,
        is_verified: false
      };
      
      console.log('ProfileService: Creating profile with data:', newProfileData);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfileData)
        .select()
        .single();
      
      if (createError) {
        console.error('ProfileService: Error creating profile:', createError);
        return { data: null, error: createError };
      }
      
      console.log('ProfileService: Successfully created profile:', newProfile);
      return { data: newProfile, error: null };
      
    } catch (error) {
      console.error('ProfileService: Exception:', error);
      return { data: null, error };
    }
  }

  /**
   * Ensure user profile exists, create ONLY if missing (NEVER overwrite existing profiles)
   */
  static async ensureUserProfile(userId: string, email: string, userData: any) {
    return this.getOrCreateProfile(userId, email, userData);
  }

  /**
   * Update user profile - OVERWRITE ALL PROVIDED FIELDS
   */
  static async updateProfile(userId: string, updates: Partial<Profile>) {
    console.log('ProfileService.updateProfile called with:', { userId, updates });
    
    // ALWAYS add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    console.log('Database update data:', updateData);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Database update error:', error);
    } else {
      console.log('Profile updated in database:', data);
    }
    
    return { data, error };
  }

  static async upgradeToWriter(userId: string, email: string, displayName: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        user_role: 'writer',
        profile_completed: false // Will trigger onboarding
      })
      .eq('id', userId)
      .select()
      .single();
    
    return { data, error };
  }
}
