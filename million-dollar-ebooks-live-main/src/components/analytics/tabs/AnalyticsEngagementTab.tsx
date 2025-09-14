
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsEngagementTabProps {
  analyticsData: {
    overview: {
      completionRate: number;
      averageReadingTime: number;
      shares: number;
      clicks: number;
    };
    topPages: Array<{
      page: string;
      views: number;
      avgTime: string;
    }>;
  };
}

export function AnalyticsEngagementTab({ analyticsData }: AnalyticsEngagementTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reading Engagement */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Reading Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">{analyticsData.overview.completionRate}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg. Session Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.overview.averageReadingTime} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Social Shares</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.overview.shares}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Link Clicks</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.overview.clicks}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Pages */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Top Performing Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.topPages.map((page, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{page.page}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{page.views} views</p>
                  </div>
                  <Badge variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">{page.avgTime}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
