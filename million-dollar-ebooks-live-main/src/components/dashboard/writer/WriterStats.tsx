
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, DollarSign, Users, Star, FileText, Heart } from 'lucide-react';
import { useStoryAnalyticsData } from '@/hooks/useStoryAnalyticsData';

interface WriterStatsProps {
  books: Array<{
    id: number;
    status: string;
    sales: number;
    revenue: number;
    rating: number;
    reviews: number;
  }>;
  stories?: Array<{
    id: string;
    reactions: {
      heart: number;
      shock: number;
      'thumbs-down': number;
    };
    view_count: number;
  }>;
  loading?: boolean;
}

export function WriterStats({ books, stories = [], loading = false }: WriterStatsProps) {
  const { fetchStoryAnalytics } = useStoryAnalyticsData();

  // Fetch analytics data when component mounts
  useEffect(() => {
    fetchStoryAnalytics();
  }, [fetchStoryAnalytics]);

  // Book statistics - using real data
  const totalRevenue = books.reduce((sum, book) => sum + book.revenue, 0);
  const totalSales = books.reduce((sum, book) => sum + book.sales, 0);
  const publishedBooks = books.filter(book => book.status === 'Published').length;
  const avgRating = books.filter(book => book.rating > 0).reduce((sum, book) => sum + book.rating, 0) / books.filter(book => book.rating > 0).length || 0;
  const totalReviews = books.reduce((sum, book) => sum + book.reviews, 0);

  // Story statistics - using REAL data from the stories prop
  const totalStories = stories.length;
  const totalStoryViews = stories.reduce((sum, story) => sum + (story.view_count || 0), 0);
  const totalStoryReactions = stories.reduce((sum, story) => 
    sum + (story.reactions?.heart || 0) + (story.reactions?.shock || 0) + (story.reactions?.['thumbs-down'] || 0), 0
  );
  const avgReactionsPerStory = totalStories > 0 ? Math.round(totalStoryReactions / totalStories) : 0;

  console.log('WriterStats: Calculating stats from stories:', stories);
  console.log('WriterStats: Total stories:', totalStories);
  console.log('WriterStats: Total views:', totalStoryViews);
  console.log('WriterStats: Total reactions:', totalStoryReactions);
  console.log('WriterStats: Avg reactions per story:', avgReactionsPerStory);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Loading Statistics...</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Books Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Book Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Published Books</CardTitle>
              <Book className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{publishedBooks}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {books.length > publishedBooks ? `${books.length - publishedBooks} in draft` : 'No drafts'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Sales</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Book purchases</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue (90%)</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your author earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Rating</CardTitle>
              <Star className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                From {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stories Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Story Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Published Stories</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalStories}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily story submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Views</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalStoryViews.toLocaleString()}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Story views received</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Reactions</CardTitle>
              <Heart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalStoryReactions}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hearts, shocks & thumbs</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Engagement</CardTitle>
              <Star className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgReactionsPerStory}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reactions per story</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
