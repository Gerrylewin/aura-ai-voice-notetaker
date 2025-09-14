import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookGrid } from '@/components/books/BookGrid';
import { StoryModal } from '@/components/stories/StoryModal';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useStoryBookmarks } from '@/hooks/useStoryBookmarks';
import { useReadingProgress, useReadingHistory } from '@/hooks/useReadingProgress';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Clock, CheckCircle, TrendingUp, BookOpen, Eye, ShoppingCart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: bookmarks, isLoading: loadingBookmarks } = useBookmarks();
  const { data: storyBookmarks, isLoading: loadingStoryBookmarks } = useStoryBookmarks();
  const { data: readingProgress, isLoading: loadingProgress } = useReadingProgress();
  const { data: readingHistory, isLoading: loadingHistory } = useReadingHistory();
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Fetch purchased books
  const { data: purchasedBooks, isLoading: loadingPurchases } = useQuery({
    queryKey: ['purchased-books', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          books(*, profiles:author_id(display_name, username))
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
        <Header />
        <div className="pt-32">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Please sign in to view your library</h1>
            <p className="text-gray-600 dark:text-gray-400">Your personal library awaits you after signing in.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleReadStory = (story: any) => {
    setSelectedStory(story);
    setIsStoryModalOpen(true);
  };

  const handleReadBook = (bookId: string) => {
    navigate(`/book/${bookId}/read`);
  };

  const closeStoryModal = () => {
    setIsStoryModalOpen(false);
    setSelectedStory(null);
  };

  // Transform data for BookGrid component
  const bookmarkedBooks = bookmarks?.map(bookmark => bookmark.books).filter(Boolean) || [];
  const bookmarkedStories = storyBookmarks?.map(bookmark => bookmark.daily_stories).filter(Boolean) || [];
  const booksInProgress = readingProgress?.map(progress => progress.books).filter(Boolean) || [];
  const completedBooks = readingHistory?.filter(history => history.completed_at)
    .map(history => history.books).filter(Boolean) || [];
  const purchasedBooksData = purchasedBooks?.map(purchase => purchase.books).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <Header />
      <div className="pt-32">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">My Library</h1>
            <p className="text-gray-600 dark:text-gray-400">Your personal collection of books, stories, and reading progress</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchased</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{purchasedBooksData.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Books owned</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Books</CardTitle>
                <Bookmark className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookmarkedBooks.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bookmarked</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Stories</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{bookmarkedStories.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Saved stories</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{booksInProgress.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Currently reading</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedBooks.length}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Books finished</p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Reading Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">7</div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Days in a row</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different collections */}
          <Tabs defaultValue="purchased" className="space-y-6">
            <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger 
                value="purchased" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300"
              >
                My Books ({purchasedBooksData.length})
              </TabsTrigger>
              <TabsTrigger 
                value="bookmarks" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300"
              >
                Bookmarks ({bookmarkedBooks.length})
              </TabsTrigger>
              <TabsTrigger 
                value="stories" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300"
              >
                Stories ({bookmarkedStories.length})
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300"
              >
                In Progress ({booksInProgress.length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300"
              >
                Completed ({completedBooks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchased" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">My Purchased Books</h2>
                {loadingPurchases ? (
                  <div className="text-center py-8">Loading...</div>
                ) : purchasedBooksData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No purchased books yet. Visit the Discover page to find books to buy!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchasedBooksData.map((book) => (
                      <Card key={book.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={book.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=60&h=80&fit=crop'}
                              alt={book.title}
                              className="w-16 h-20 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{book.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400">by {book.author_name}</p>
                              {book.description && (
                                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
                                  {book.description}
                                </p>
                              )}
                            </div>
                            <Button 
                              onClick={() => handleReadBook(book.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Read Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Bookmarked Books</h2>
                <BookGrid books={bookmarkedBooks} loading={loadingBookmarks} />
              </div>
            </TabsContent>

            <TabsContent value="stories" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Saved Stories</h2>
                {loadingStoryBookmarks ? (
                  <div className="text-center py-8">Loading...</div>
                ) : bookmarkedStories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No stories saved yet. Save stories from the Stories page to see them here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookmarkedStories.map((story) => (
                      <Card key={story.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                                {story.title}
                              </h3>
                              {story.description && (
                                <p className="text-gray-600 dark:text-gray-300 mb-2">
                                  {story.description}
                                </p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>by {story.profiles?.display_name || 'Anonymous'}</span>
                                <span>{formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}</span>
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {story.view_count} views
                                </span>
                              </div>
                            </div>
                            <Button 
                              onClick={() => handleReadStory(story)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Read Story
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Currently Reading</h2>
                {readingProgress && readingProgress.length > 0 ? (
                  <div className="space-y-4">
                    {readingProgress.map((progress) => (
                      <Card key={progress.id} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={progress.books?.cover_image_url || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=60&h=80&fit=crop'}
                              alt={progress.books?.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{progress.books?.title}</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">by {progress.books?.author_name}</p>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  <span>Progress</span>
                                  <span>{progress.progress_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-red-600 h-2 rounded-full"
                                    style={{ width: `${progress.progress_percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <BookGrid books={booksInProgress} loading={loadingProgress} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Completed Books</h2>
                <BookGrid books={completedBooks} loading={loadingHistory} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedStory && (
        <StoryModal
          isOpen={isStoryModalOpen}
          onClose={closeStoryModal}
          story={selectedStory}
        />
      )}
    </div>
  );
}
