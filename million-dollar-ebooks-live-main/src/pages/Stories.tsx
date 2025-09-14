
import React, { Suspense, lazy } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Lazy load the heavy story feed component
const VirtualizedStoryFeed = lazy(() => import('@/components/stories/VirtualizedStoryFeed').then(module => ({ default: module.VirtualizedStoryFeed })));

// Optimized loading component
const StoriesLoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading stories...</p>
    </div>
  </div>
);

export default function Stories() {
  const { user, loading } = useAuth();
  const { markMilestone } = usePerformanceMonitor('StoriesPage');

  React.useEffect(() => {
    markMilestone('Stories page mounted');
  }, [markMilestone]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <Header />
      <div className="pt-20 pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Daily Stories
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
                  Discover and read daily stories from our community of writers. Vote for your favorites and help decide the daily winner!
                </p>
              </div>
            </div>
            
            <ErrorBoundary>
              <Suspense fallback={<StoriesLoadingSpinner />}>
                <VirtualizedStoryFeed />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
