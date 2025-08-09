
import { Profile, UserSignUpData } from './types';
import { AuthService } from '@/services/authService';
import { ProfileService } from '@/services/profileService';
import { IntegrationService } from '@/services/integrationService';

/**
 * Custom hook for authentication actions
 * Orchestrates authentication, profile management, and integrations
 */
export function useAuthActions(
  setProfile: (profile: Profile | null) => void,
  user: any,
  profile: Profile | null
) {

  /**
   * Sign up a new user with email and password
   */
  const signUp = async (email: string, password: string, userData: UserSignUpData) => {
    console.log('Starting signup process:', { email, userData });
    
    const { data, error } = await AuthService.signUp(email, password, userData);
    
    if (error || !data.user) {
      console.error('Auth signup failed:', error);
      return { data, error };
    }

    console.log('Auth signup successful, user created:', data.user.id);
    
    // Send welcome email immediately after successful signup
    try {
      console.log('Sending welcome email...');
      await IntegrationService.sendWelcomeEmail(email, userData);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail signup if email fails, just log it
    }
    
    // Trigger Zapier webhook (don't fail signup if this fails)
    try {
      await IntegrationService.triggerZapierWebhook(
        email,
        userData.display_name || email.split('@')[0],
        data.user.id
      );
    } catch (webhookError) {
      console.error('Zapier webhook failed:', webhookError);
    }
    
    return { data, error };
  };

  /**
   * Sign in existing user with email and password
   */
  const signIn = async (email: string, password: string) => {
    return await AuthService.signIn(email, password);
  };

  const signOut = async () => {
    const { error } = await AuthService.signOut();
    
    // Clear local state and redirect regardless of errors
    setProfile(null);
    window.location.href = '/';
    
    if (error) {
      console.error('Sign out error, but proceeding with redirect:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('No user found');
    }
    
    console.log('Updating profile for user:', user.id);
    console.log('Updates to apply:', updates);
    
    // Use ProfileService to update profile
    const { data, error } = await ProfileService.updateProfile(user.id, updates);
    
    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }
    
    console.log('Profile updated successfully:', data);
    
    // Update local state with the returned data
    if (data) {
      setProfile(data);
    }
  };

  const upgradeToWriter = async () => {
    if (!user || !profile) return;
    
    const { error } = await ProfileService.upgradeToWriter(
      user.id, 
      user.email || '', 
      profile.display_name || user.email || 'Writer'
    );
    
    if (error) throw error;
    
    // Update local state
    setProfile({ ...profile, user_role: 'writer' });
  };

  return {
    signUp,
    signIn,
    signOut,
    updateProfile,
    upgradeToWriter
  };
}
