
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAuthors() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          username,
          bio,
          avatar_url,
          social_links,
          external_links,
          is_verified,
          books:books!author_id(
            id,
            title,
            description,
            cover_image_url,
            price_cents,
            rating_average,
            rating_count,
            book_status,
            book_categories(category_id, categories(name, slug)),
            book_genres(genre_id, genres(name, slug))
          )
        `)
        .eq('user_role', 'writer')
        .eq('profile_completed', true)
        .not('display_name', 'is', null)
        .order('display_name', { ascending: true });

      if (error) throw error;
      
      // Get current date for comparison
      const today = new Date().toISOString().split('T')[0];
      
      // Get writers who have published stories from PREVIOUS days (not today)
      const { data: storiesData, error: storiesError } = await supabase
        .from('daily_stories')
        .select('author_id')
        .eq('is_published', true)
        .lt('story_date', today);

      if (storiesError) throw storiesError;

      const authorsWithCompletedStories = new Set(
        storiesData?.map(story => story.author_id) || []
      );

      // Filter to include writers who have:
      // 1. ANY books (regardless of status - since even draft books show writing activity)
      // 2. OR have stories that completed voting from previous days
      const qualifiedAuthors = data?.filter(author => {
        const hasAnyBooks = author.books && author.books.length > 0;
        const hasCompletedStories = authorsWithCompletedStories.has(author.id);
        
        console.log(`Author ${author.display_name}:`, {
          hasAnyBooks,
          bookCount: author.books?.length || 0,
          hasCompletedStories
        });
        
        return hasAnyBooks || hasCompletedStories;
      }) || [];
      
      console.log('Total qualified authors:', qualifiedAuthors.length);
      return qualifiedAuthors;
    },
  });
}

export function useAuthorById(authorId: string) {
  return useQuery({
    queryKey: ['author', authorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          display_name,
          username,
          bio,
          avatar_url,
          social_links,
          external_links,
          is_verified,
          created_at,
          books:books!author_id(
            id,
            title,
            description,
            cover_image_url,
            price_cents,
            rating_average,
            rating_count,
            publication_date,
            book_status,
            book_categories(category_id, categories(name, slug)),
            book_genres(genre_id, genres(name, slug))
          )
        `)
        .eq('id', authorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!authorId,
  });
}
