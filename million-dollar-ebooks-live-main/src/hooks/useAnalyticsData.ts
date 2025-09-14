
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  totalBooks: number;
  totalStories: number;
  totalViews: number;
  totalDownloads: number;
  totalRevenue: number;
  topBooks: any[];
  topStories: any[];
  recentPurchases: any[];
}

export function useAnalyticsData() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalBooks: 0,
    totalStories: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalRevenue: 0,
    topBooks: [],
    topStories: [],
    recentPurchases: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // Get total users from profiles table (this represents authenticated users)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      // Fetch other analytics data
      const [
        booksResponse,
        storiesResponse,
        purchasesResponse,
        storyViewsResponse
      ] = await Promise.all([
        supabase.from('books').select('id, title, author_name, download_count', { count: 'exact' }),
        supabase.from('daily_stories').select('id, title', { count: 'exact' }),
        supabase.from('purchases').select('amount_cents, purchased_at, books!inner(title, author_name)', { count: 'exact' }),
        supabase.from('story_analytics').select('story_id, event_type').eq('event_type', 'view')
      ]);

      // Calculate totals using ONLY analytics events for all views
      const totalBooks = booksResponse.count || 0;
      const totalStories = storiesResponse.count || 0;
      const totalViews = storyViewsResponse.data?.length || 0; // Only count actual analytics events
      const totalDownloads = booksResponse.data?.reduce((sum, book) => sum + (book.download_count || 0), 0) || 0;
      const totalRevenue = purchasesResponse.data?.reduce((sum, purchase) => sum + (purchase.amount_cents || 0), 0) || 0;

      // Get top books with analytics-based view counts
      const allBooks = booksResponse.data || [];
      
      // For now, since we don't have book analytics tracking yet, we'll show books without view counts
      // This ensures we're not showing fake data
      const topBooks = allBooks
        .slice(0, 5)
        .map(book => ({
          ...book,
          view_count: 0, // Reset to 0 until we implement proper book analytics
        }));

      // Get top stories with analytics-based view counts
      const topStoriesResponse = await supabase
        .from('daily_stories')
        .select(`
          id, 
          title, 
          profiles:author_id(display_name)
        `)
        .eq('is_published', true)
        .limit(20);

      // Get view counts from analytics for these stories
      const storyIds = topStoriesResponse.data?.map(s => s.id) || [];
      const storyAnalyticsResponse = await supabase
        .from('story_analytics')
        .select('story_id')
        .in('story_id', storyIds)
        .eq('event_type', 'view');

      // Get story reactions for top stories
      const reactionsResponse = await supabase
        .from('story_reactions')
        .select('story_id, reaction_type')
        .in('story_id', storyIds);

      // Process top stories with analytics-based view counts
      const storiesWithViews = topStoriesResponse.data?.map(story => {
        const viewCount = storyAnalyticsResponse.data?.filter(v => v.story_id === story.id).length || 0;
        const heartCount = reactionsResponse.data?.filter(r => r.story_id === story.id && r.reaction_type === 'heart').length || 0;
        const totalReactions = reactionsResponse.data?.filter(r => r.story_id === story.id).length || 0;
        
        return {
          ...story,
          view_count: viewCount,
          heart_count: heartCount,
          total_reactions: totalReactions
        };
      }) || [];

      // Sort by view count and take top 5
      const topStories = storiesWithViews
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5);

      // Get recent purchases
      const recentPurchasesResponse = await supabase
        .from('purchases')
        .select('amount_cents, purchased_at, books!inner(title, author_name)')
        .order('purchased_at', { ascending: false })
        .limit(10);

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalBooks,
        totalStories,
        totalViews,
        totalDownloads,
        totalRevenue: totalRevenue / 100, // Convert cents to dollars
        topBooks,
        topStories,
        recentPurchases: recentPurchasesResponse.data || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { analytics, loading, refetch: fetchAnalytics };
}
