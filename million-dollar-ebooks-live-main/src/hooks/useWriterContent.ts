
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useWriterContent() {
  const { user, profile } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    if (!user || !profile) {
      console.log('❌ No user or profile found, skipping books fetch');
      setBooks([]);
      return;
    }

    try {
      console.log('🔍 FETCHING BOOKS: Starting fetch for user:', user.id, 'profile:', profile.id);
      
      // Get books for current user - only show published books to writers
      const { data: userBooks, error: fetchError } = await supabase
        .from('books')
        .select('*')
        .eq('author_id', profile.id)
        .eq('book_status', 'published')  // Only show published books
        .order('created_at', { ascending: false });

      console.log('📚 USER BOOKS QUERY RESULT (published only):', userBooks);
      console.log('📚 USER BOOKS COUNT:', userBooks?.length || 0);

      if (fetchError) {
        console.error('❌ Error fetching books:', fetchError);
        throw fetchError;
      }

      // Set the books
      setBooks(userBooks || []);

    } catch (error: any) {
      console.error('❌ Critical error in fetchBooks:', error);
      setError('Failed to fetch books: ' + error.message);
      setBooks([]);
    }
  }, [user, profile]);

  const fetchStories = useCallback(async () => {
    if (!user || !profile) {
      console.log('❌ No user or profile found, skipping stories fetch');
      setStories([]);
      return;
    }

    try {
      console.log('🔍 FETCHING STORIES for profile:', profile.id);
      
      const { data: userStories, error: fetchError } = await supabase
        .from('daily_stories')
        .select('*')
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ Error fetching stories:', fetchError);
        throw fetchError;
      }

      console.log('📖 USER STORIES FROM DATABASE:', userStories);
      setStories(userStories || []);

    } catch (error: any) {
      console.error('❌ Critical error in fetchStories:', error);
      setError('Failed to fetch stories: ' + error.message);
      setStories([]);
    }
  }, [user, profile]);

  const fetchAll = useCallback(async () => {
    if (!user || !profile) {
      console.log('🚫 No user or profile available for fetch');
      setLoading(false);
      return;
    }
    
    console.log('🚀 STARTING CONTENT FETCH for user:', user.id, 'profile:', profile.id);
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchBooks(), fetchStories()]);
    } catch (error) {
      console.error('❌ Error in fetchAll:', error);
    } finally {
      setLoading(false);
      console.log('🏁 FINISHED CONTENT FETCH');
    }
  }, [fetchBooks, fetchStories, user, profile]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refetch = useCallback(async () => {
    console.log('🔄 MANUAL REFETCH TRIGGERED');
    await fetchAll();
  }, [fetchAll]);

  return {
    books,
    stories,
    loading,
    error,
    refetch
  };
}
