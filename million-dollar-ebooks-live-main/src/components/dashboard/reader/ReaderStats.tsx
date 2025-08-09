
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Clock, Library, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReadingGoal {
  target: number;
  current: number;
  year: number;
}

interface ReaderStatsProps {
  readingGoal: ReadingGoal;
}

export function ReaderStats({ readingGoal }: ReaderStatsProps) {
  const { user } = useAuth();

  // Fetch actual user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get books purchased/owned by user
      const { data: purchases } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('payment_status', 'completed');

      // Get completed books from reading history (this year)
      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const yearEnd = `${currentYear}-12-31`;
      
      const { data: completedBooks } = await supabase
        .from('reading_history')
        .select('id, completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', yearStart)
        .lte('completed_at', yearEnd);

      // Get user's reviews and average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', user.id);

      // Calculate reading hours from reading progress (estimate based on sessions)
      const { data: readingSessions } = await supabase
        .from('reading_progress')
        .select('last_read_at')
        .eq('user_id', user.id)
        .gte('last_read_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      const librarySize = purchases?.length || 0;
      const booksReadThisYear = completedBooks?.length || 0;
      const reviewCount = reviews?.length || 0;
      const averageRating = reviewCount > 0 
        ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount).toFixed(1)
        : '0.0';
      
      // Estimate reading hours (assume 30 minutes per session)
      const estimatedReadingHours = Math.round((readingSessions?.length || 0) * 0.5);

      return {
        librarySize,
        booksReadThisYear,
        reviewCount,
        averageRating: parseFloat(averageRating),
        readingHours: estimatedReadingHours
      };
    },
    enabled: !!user?.id,
  });

  const stats = userStats || {
    librarySize: 0,
    booksReadThisYear: 0,
    reviewCount: 0,
    averageRating: 0.0,
    readingHours: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Books Read This Year</CardTitle>
          <Book className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.booksReadThisYear}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Goal: {readingGoal.target} books</p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Reading Hours</CardTitle>
          <Clock className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.readingHours}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Library Size</CardTitle>
          <Library className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.librarySize}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Owned books</p>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Rating Given</CardTitle>
          <Star className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageRating}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">From {stats.reviewCount} reviews</p>
        </CardContent>
      </Card>
    </div>
  );
}
