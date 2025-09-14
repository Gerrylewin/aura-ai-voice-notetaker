
import { queryClient } from '@/providers/ReactQueryProvider';

export class CacheManager {
  // Invalidate user-specific data when they perform actions
  static invalidateUserData(userId: string) {
    console.log('🔄 Invalidating user data for:', userId);
    
    // Invalidate user's stories, analytics, and submissions
    queryClient.invalidateQueries({ queryKey: ['analytics', userId] });
    queryClient.invalidateQueries({ queryKey: ['user-daily-submission', userId] });
    queryClient.invalidateQueries({ queryKey: ['user-content', userId] });
    queryClient.invalidateQueries({ queryKey: ['user-books', userId] });
  }

  // Invalidate stories when new content is published
  static invalidateStoriesAfterPublication() {
    console.log('🔄 Invalidating stories after new publication');
    queryClient.invalidateQueries({ queryKey: ['stories'] });
  }

  // Invalidate books when new book is published or covers are updated
  static invalidateBooksAfterPublication() {
    console.log('🔄 Invalidating books after new publication or update');
    queryClient.invalidateQueries({ queryKey: ['books'] });
    queryClient.invalidateQueries({ queryKey: ['user-books'] });
    queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    queryClient.invalidateQueries({ queryKey: ['user-content'] });
  }

  // Invalidate admin data specifically
  static invalidateAdminData() {
    console.log('🔄 Invalidating admin data');
    queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['admin-user-notifications'] });
  }

  // Prefetch critical data for faster navigation
  static prefetchCriticalData() {
    console.log('🚀 Prefetching critical data');
    
    // Prefetch popular stories
    queryClient.prefetchQuery({
      queryKey: ['stories'],
      staleTime: 2 * 60 * 1000,
    });

    // Prefetch popular books
    queryClient.prefetchQuery({
      queryKey: ['books', 20],
      staleTime: 5 * 60 * 1000,
    });
  }

  // Clear all cache (for logout or major updates)
  static clearAllCache() {
    console.log('🗑️ Clearing all cache');
    queryClient.clear();
  }

  // Get cache statistics for debugging
  static getCacheStats() {
    const queries = queryClient.getQueryCache().getAll();
    const activeQueries = queries.filter(q => q.isActive()).length;
    const staleQueries = queries.filter(q => q.isStale()).length;
    
    return {
      totalQueries: queries.length,
      activeQueries,
      staleQueries,
      cacheSize: queries.reduce((size, query) => {
        return size + JSON.stringify(query.state.data || {}).length;
      }, 0)
    };
  }
}

// Auto-prefetch on app startup
if (typeof window !== 'undefined') {
  // Prefetch after a short delay to not block initial render
  setTimeout(() => {
    CacheManager.prefetchCriticalData();
  }, 2000);
}
