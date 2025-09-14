
import React from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { AnalyticsMetricsCards } from './analytics/AnalyticsMetricsCards';
import { TopBooksCard } from './analytics/TopBooksCard';
import { TopStoriesCard } from './analytics/TopStoriesCard';
import { RecentPurchasesCard } from './analytics/RecentPurchasesCard';

export function AnalyticsDashboard() {
  const { analytics, loading } = useAnalyticsData();

  if (loading) {
    return <div className="text-center py-8 text-white">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
      
      {/* Key Metrics */}
      <AnalyticsMetricsCards analytics={analytics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Books */}
        <TopBooksCard topBooks={analytics.topBooks} />

        {/* Top Stories */}
        <TopStoriesCard topStories={analytics.topStories} />
      </div>

      {/* Recent Purchases */}
      <RecentPurchasesCard recentPurchases={analytics.recentPurchases} />
    </div>
  );
}
