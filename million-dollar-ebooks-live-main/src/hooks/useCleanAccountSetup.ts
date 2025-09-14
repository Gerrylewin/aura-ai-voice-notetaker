
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to ensure new accounts start with clean, zero data
 * This runs once when a user first logs in to initialize default settings
 */
export function useCleanAccountSetup() {
  const { user, profile } = useAuth();

  useEffect(() => {
    const initializeCleanAccount = async () => {
      if (!user || !profile) return;

      try {
        // Check if this is a new account (no reading progress, no books, etc.)
        const { data: hasProgress } = await supabase
          .from('reading_progress')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        const { data: hasBooks } = await supabase
          .from('books')
          .select('id')
          .eq('author_id', user.id)
          .limit(1)
          .single();

        // If user has no progress and no books, ensure clean initialization
        if (!hasProgress && !hasBooks) {
          console.log('Initializing clean account for new user:', user.email);
          
          // Ensure notification preferences exist
          const { error: notifError } = await supabase
            .from('notification_preferences')
            .upsert({
              user_id: user.id,
              email_marketing: false,
              email_new_books_from_favorites: true,
              email_new_stories_from_favorites: true,
              email_messages: true,
              email_gifts: true,
              email_comments: true,
              email_book_reviews: true,
              app_new_books_from_favorites: true,
              app_new_stories_from_favorites: true,
              app_messages: true,
              app_gifts: true,
              app_comments: true,
              app_book_reviews: true
            }, {
              onConflict: 'user_id'
            });

          if (notifError) {
            console.error('Error creating notification preferences:', notifError);
          }

          // For writers, ensure author progress exists with clean state
          if (profile.user_role === 'writer' || profile.user_role === 'admin' || profile.user_role === 'moderator') {
            const { error: progressError } = await supabase
              .from('author_progress')
              .upsert({
                author_id: user.id,
                total_words_written: 0,
                books_published: 0,
                total_sales: 0,
                total_revenue_cents: 0,
                author_level: 1,
                author_points: 0,
                streak_days: 0,
                longest_streak: 0,
                achievements_unlocked: [],
                last_activity_date: null
              }, {
                onConflict: 'author_id'
              });

            if (progressError) {
              console.error('Error creating author progress:', progressError);
            }
          }
        }
      } catch (error) {
        console.error('Error during clean account setup:', error);
      }
    };

    initializeCleanAccount();
  }, [user, profile]);
}
