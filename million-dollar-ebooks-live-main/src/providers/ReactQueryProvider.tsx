import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client with optimized caching settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 30 minutes (renamed from cacheTime)
      gcTime: 30 * 60 * 1000,
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Retry failed requests 2 times
      retry: 2,
      // Refetch interval for background updates (10 minutes)
      refetchInterval: 10 * 60 * 1000,
      // Only refetch if component is visible
      refetchIntervalInBackground: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Enable persistence for better performance across sessions
if (typeof window !== 'undefined') {
  // Simple cache persistence using localStorage
  const persistCache = () => {
    try {
      const cacheData = queryClient.getQueryCache().getAll();
      const persistableData = cacheData.map(query => ({
        queryKey: query.queryKey,
        state: query.state,
      }));
      localStorage.setItem('react-query-cache', JSON.stringify(persistableData));
    } catch (error) {
      console.warn('Failed to persist query cache:', error);
    }
  };

  // Persist cache every 30 seconds
  setInterval(persistCache, 30000);

  // Persist on page unload
  window.addEventListener('beforeunload', persistCache);
}

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { queryClient };
