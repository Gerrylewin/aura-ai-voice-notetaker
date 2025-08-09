
import { supabase } from '@/integrations/supabase/client';
import { UserSignUpData } from '@/hooks/auth/types';
import { IntegrationService } from './integrationService';

/**
 * Core authentication service
 * Handles sign up, sign in, and sign out operations
 */
export class AuthService {
  /**
   * Sign up a new user with email and password
   * Profile will be created only after email confirmation
   */
  static async signUp(email: string, password: string, userData: UserSignUpData) {
    console.log('AuthService.signUp called with userData:', userData);
    
    // Set proper email confirmation redirect URL
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/onboarding?type=${userData.user_role}&confirmed=true`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: redirectUrl,
      },
    });
    
    console.log('SignUp result:', { data, error });
    
    if (error || !data.user) {
      return { data, error };
    }

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

    // Call the edge function to handle new user signup and send admin notifications
    try {
      console.log('Calling handle-new-user-signup edge function...');
      const { data: functionData, error: functionError } = await supabase.functions.invoke('handle-new-user-signup', {
        body: {
          event: 'user.created',
          userId: data.user.id,
          email: email,
          userData: userData
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
      } else {
        console.log('Edge function success:', functionData);
      }
    } catch (functionError) {
      console.error('Failed to call edge function:', functionError);
    }
    
    return { data, error };
  };

  /**
   * Sign in existing user with email and password
   */
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    try {
      console.log('Starting sign out process...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      console.log('Successfully signed out from Supabase');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  }
}
