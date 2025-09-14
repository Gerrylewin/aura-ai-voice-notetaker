
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DiscoverBooksTab } from './DiscoverBooksTab';
import { AuthorGrid } from '@/components/authors/AuthorGrid';
import { StoryCard } from '@/components/stories/StoryCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileText } from 'lucide-react';
import { usePaginatedAuthors } from '@/hooks/usePaginatedAuthors';
import { usePaginatedStories } from '@/hooks/usePaginatedStories';

interface DiscoverTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  selectedCategory?: string;
  selectedGenre?: string;
  onCategoryChange: (category?: string) => void;
  onGenreChange: (genre?: string) => void;
  showFilters: boolean;
}

export function DiscoverTabs({
  activeTab,
  setActiveTab,
  searchQuery,
  selectedCategory,
  selectedGenre,
  onCategoryChange,
  onGenreChange,
  showFilters
}: DiscoverTabsProps) {
  const navigate = useNavigate();
  const { authors, loading: authorsLoading } = usePaginatedAuthors({ searchQuery, pageSize: 20 });
  const { stories, loading: storiesLoading } = usePaginatedStories(10);

  // Filter stories by search query
  const filteredStories = searchQuery 
    ? stories.filter(story => 
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stories;

  const handleStoryClick = (story: any) => {
    navigate('/stories');
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'books': return '∞'; // Infinite scroll, so show infinity
      case 'authors': return authorsLoading ? '...' : authors.length;
      case 'stories': return storiesLoading ? '...' : filteredStories.length;
      default: return 0;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-8">
        <TabsList className="grid grid-cols-3 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <TabsTrigger 
            value="books" 
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Books</span>
            <span className="text-xs text-gray-500">({getTabCount('books')})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="authors"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Authors</span>
            <span className="text-xs text-gray-500">({getTabCount('authors')})</span>
          </TabsTrigger>
          <TabsTrigger 
            value="stories"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Stories</span>
            <span className="text-xs text-gray-500">({getTabCount('stories')})</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="books" className="mt-0">
        <DiscoverBooksTab
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          selectedGenre={selectedGenre}
          onCategoryChange={onCategoryChange}
          onGenreChange={onGenreChange}
          showFilters={showFilters}
        />
      </TabsContent>

      <TabsContent value="authors" className="mt-0">
        <main>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {authorsLoading ? 'Loading authors...' : `${authors.length} authors found`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Discover talented independent authors'}
            </p>
          </div>
          <AuthorGrid authors={authors} loading={authorsLoading} />
        </main>
      </TabsContent>

      <TabsContent value="stories" className="mt-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Daily Stories</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Fresh stories published by our community'}
          </p>
        </div>
        
        <div className="space-y-6">
          {storiesLoading ? (
            Array.from({ length: 3 }, (_, index) => (
              <div key={`skeleton-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No stories found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? `No stories match "${searchQuery}"` : 'No stories available yet'}
              </p>
            </div>
          ) : (
            filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={{
                  ...story,
                  is_daily_winner: story.is_daily_winner || false,
                  reactions: story.reactions || { heart: 0, shock: 0, 'thumbs-down': 0 }
                }}
                onClick={() => handleStoryClick(story)}
              />
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
