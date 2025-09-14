import { User } from '@supabase/supabase-js';

/**
 * User profile interface that matches the Supabase profiles table structure
 * This represents the extended user data stored in our public.profiles table
 */
export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  social_links: any;
  external_links: any;
  user_role: 'reader' | 'writer' | 'moderator' | 'admin';
  is_verified: boolean;
  profile_completed: boolean;
  stripe_account_id: string | null;
  stripe_connect_account_id: string | null;
  stripe_onboarding_completed: boolean | null;
  stripe_payouts_enabled: boolean | null;
  email_confirmed_at: string | null;
  requires_authentication: boolean;
  member_number: number | null;
}

/**
 * Authentication context interface
 * Provides all authentication-related functions and state to components
 */
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  upgradeToWriter: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * User data interface for sign up process
 * Contains the additional data collected during registration
 */
export interface UserSignUpData {
  display_name: string;
  user_role: 'reader' | 'writer';
}

/**
 * Moderation request interface
 */
export interface ModerationRequest {
  id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'denied';
  reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    username: string | null;
  };
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_comments: boolean;
  email_gifts: boolean;
  email_messages: boolean;
  email_new_books_from_favorites: boolean;
  email_new_stories_from_favorites: boolean;
  email_book_reviews: boolean;
  email_marketing: boolean;
  app_comments: boolean;
  app_gifts: boolean;
  app_messages: boolean;
  app_new_books_from_favorites: boolean;
  app_new_stories_from_favorites: boolean;
  app_book_reviews: boolean;
  created_at: string;
  updated_at: string;
}
