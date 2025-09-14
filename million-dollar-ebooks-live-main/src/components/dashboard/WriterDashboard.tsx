import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { WriterStats } from './writer/WriterStats';
import { ContentTypeSelector } from './writer/ContentTypeSelector';
import { ContentManagement } from './writer/ContentManagement';
import { WriterAnalytics } from './writer/WriterAnalytics';
import { AuthorProgressCard } from '@/components/gamification/AuthorProgressCard';
import { AuthorAchievementsGrid } from '@/components/gamification/AuthorAchievementsGrid';
import { AuthorPointsDisplay } from '@/components/gamification/AuthorPointsDisplay';
import { LeaderboardTabs } from '@/components/leaderboard/LeaderboardTabs';
import { useStoryAnalyticsData } from '@/hooks/useStoryAnalyticsData';
import { useWriterContent } from '@/hooks/useWriterContent';
import { BookWritingForm } from './writer/BookWritingForm';
export function WriterDashboard() {
  const {
    profile
  } = useAuth();
  const {
    storyAnalytics,
    loading: analyticsLoading
  } = useStoryAnalyticsData();
  const {
    books,
    stories,
    loading: contentLoading,
    refetch
  } = useWriterContent();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingBook, setEditingBook] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  console.log('WriterDashboard: Profile:', profile?.id);
  console.log('WriterDashboard: Books from hook:', books);
  console.log('WriterDashboard: Stories from hook:', stories);

  // Use the real analytics data from the hook
  const userStories = storyAnalytics.map(story => ({
    id: story.id,
    reactions: {
      heart: story.heart_count || 0,
      shock: story.shock_count || 0,
      'thumbs-down': story.thumbs_down_count || 0
    },
    view_count: story.view_count || 0
  }));
  const handleEditBook = (book: any) => {
    console.log('WriterDashboard: Editing book:', book);
    setEditingBook(book);
    setActiveTab('create');
  };
  const handleCreateNewBook = () => {
    console.log('WriterDashboard: Creating new book');
    setEditingBook(null);
    setActiveTab('create');
  };
  const handleBookEditComplete = () => {
    setEditingBook(null);
    setActiveTab('manage');
    // Refresh content after editing
    handleRefresh();
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Check if we have draft books (these are actually published but pending review)
  const hasDraftBooks = books.some(book => book.book_status === 'draft');
  return <div className="container mx-auto px-4 py-8">
      {/* Version 1.0 Launch Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
        
        <div className="flex items-start gap-4">
          <Coins className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
          <div>
            <p className="text-green-700 dark:text-green-300 font-medium mb-2">
              ✅ USDC Payments Now Live on Polygon • 90% Creator Revenue Share • Global Accessibility
            </p>
            <p className="text-green-600 dark:text-green-400 text-sm">
              Connect your wallet and start earning crypto from your books instantly. No traditional payment barriers, no high fees.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Writer Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your books, track performance, and earn crypto from your creations</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {hasDraftBooks && <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            📚 Your book updates have been submitted successfully! Changes will be live soon after our quick review process.
          </p>
        </div>}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex w-max min-w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">Create Content</TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">Manage Content</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">Analytics</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">Author Progress</TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap">Leaderboards</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <WriterStats books={books} stories={userStories} loading={analyticsLoading || contentLoading} />
            </div>
            <div className="space-y-6">
              <AuthorPointsDisplay />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          {editingBook ? <BookWritingForm editingBook={editingBook} onEditComplete={handleBookEditComplete} /> : <ContentTypeSelector />}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <ContentManagement books={books} stories={stories} onEditBook={handleEditBook} onCreateNewBook={handleCreateNewBook} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <WriterAnalytics />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <AuthorProgressCard />
          <AuthorAchievementsGrid />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardTabs />
        </TabsContent>
      </Tabs>
    </div>;
}