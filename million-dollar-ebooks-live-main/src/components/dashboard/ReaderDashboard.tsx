import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, BarChart3, Trophy, Sparkles, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReaderStats } from './reader/ReaderStats';
import { ContinueReading } from './reader/ContinueReading';
import { ReadingGoal } from './reader/ReadingGoal';
import { RecentActivity } from './reader/RecentActivity';
import { BookRecommendations } from './reader/BookRecommendations';
import { QuickActions } from './reader/QuickActions';
import { SocialTab } from './reader/SocialTab';
import { GamificationTab } from './reader/GamificationTab';
import { useGamification } from '@/hooks/useGamification';

export function ReaderDashboard() {
  const { user, profile } = useAuth();
  const { refreshProgress } = useGamification();

  // Fetch user's actual reading data including goals and completed books
  const { data: userData } = useQuery({
    queryKey: ['reader-dashboard-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Refresh gamification progress to sync with latest data
      refreshProgress();

      // Get recent books being read with actual book data
      const { data: recentBooks } = await supabase
        .from('reading_progress')
        .select(`
          *,
          books(*, profiles:author_id(display_name, username))
        `)
        .eq('user_id', user.id)
        .gt('progress_percentage', 0)
        .order('last_read_at', { ascending: false })
        .limit(5);

      // Get book recommendations (this could be more sophisticated)
      const { data: recommendations } = await supabase
        .from('books')
        .select('*, profiles:author_id(display_name, username)')
        .eq('book_status', 'published')
        .order('rating_average', { ascending: false })
        .limit(5);

      // Get recent activity (placeholder for now)
      const recentActivity: any[] = [];

      // Get completed books count for reading goal (this year)
      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const yearEnd = `${currentYear}-12-31`;
      
      const { data: completedBooks } = await supabase
        .from('reading_history')
        .select('id')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', yearStart)
        .lte('completed_at', yearEnd);

      // Get user's reading goal
      const { data: userGoals } = await supabase
        .from('user_goals')
        .select('monthly_reading_target')
        .eq('user_id', user.id)
        .maybeSingle();

      // Transform recent books data to match Book interface - keep as strings
      const transformedRecentBooks = (recentBooks || []).map(item => ({
        id: item.book_id, // Keep as string UUID
        title: item.books?.title || 'Unknown Title',
        author: item.books?.profiles?.display_name || item.books?.author_name || 'Unknown Author',
        progress: item.progress_percentage || 0,
        cover: item.books?.cover_image_url || '/placeholder.svg',
        lastRead: new Date(item.last_read_at).toLocaleDateString()
      }));

      // Transform recommendations data to match Recommendation interface - keep as strings  
      const transformedRecommendations = (recommendations || []).map(book => ({
        id: book.id, // Keep as string UUID
        title: book.title,
        author: book.profiles?.display_name || book.author_name,
        rating: book.rating_average || 0,
        cover: book.cover_image_url || '/placeholder.svg',
        price: book.price_cents ? `$${(book.price_cents / 100).toFixed(2)}` : 'Free'
      }));

      // Calculate reading goal (monthly target * 12 or default to 12)
      const monthlyTarget = userGoals?.monthly_reading_target || 1;
      const yearlyTarget = monthlyTarget * 12;

      return {
        recentBooks: transformedRecentBooks,
        recommendations: transformedRecommendations,
        recentActivity,
        completedBooksCount: completedBooks?.length || 0,
        readingGoalTarget: yearlyTarget
      };
    },
    enabled: !!user?.id,
  });

  const readingGoal = {
    target: userData?.readingGoalTarget || 12,
    current: userData?.completedBooksCount || 0,
    year: new Date().getFullYear()
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Version 1.0 Welcome Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-bold text-purple-800 dark:text-purple-200">
            🎉 Welcome to Version 1.0 - Support Creators Like Never Before!
          </h2>
        </div>
        <div className="flex items-start gap-4">
          <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1" />
          <div>
            <p className="text-purple-700 dark:text-purple-300 font-medium mb-2">
              ✅ Revolutionary 90% Creator Revenue Share • USDC Payments • Instant Global Support
            </p>
            <p className="text-purple-600 dark:text-purple-400 text-sm">
              Every book you buy now directly supports authors with crypto payments. 90 cents of every dollar goes straight to creators!
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome back, {profile?.display_name}!</h1>
        <p className="text-gray-600 dark:text-gray-300">Continue your reading journey and discover new stories while supporting creators with crypto</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Users className="w-4 h-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ReaderStats readingGoal={readingGoal} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <ContinueReading books={userData?.recentBooks || []} />
              <ReadingGoal readingGoal={readingGoal} />
            </div>

            {/* Sidebar */}
            <div>
              <RecentActivity activities={userData?.recentActivity || []} />
              <BookRecommendations recommendations={userData?.recommendations || []} />
              <QuickActions />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <GamificationTab />
        </TabsContent>

        <TabsContent value="social">
          <SocialTab />
        </TabsContent>

        <TabsContent value="stats">
          <ReaderStats readingGoal={readingGoal} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
