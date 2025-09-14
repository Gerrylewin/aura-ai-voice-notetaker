
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, Clock, DollarSign } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface AnalyticsOverviewTabProps {
  analyticsData: {
    overview: {
      totalViews: number;
      downloads: number;
      totalReadingTime: number;
      revenue: number;
    };
    dailyStats: Array<{
      date: string;
      views: number;
      downloads: number;
      readingTime: number;
    }>;
  };
}

export function AnalyticsOverviewTab({ analyticsData }: AnalyticsOverviewTabProps) {
  const chartConfig = {
    views: { label: "Views", color: "#ef4444" },
    downloads: { label: "Downloads", color: "#3b82f6" },
    readingTime: { label: "Reading Time (min)", color: "#10b981" }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Views</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.overview.totalViews.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Downloads</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.overview.downloads}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Reading Hours</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {analyticsData.overview.totalReadingTime}h
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${analyticsData.overview.revenue}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">7-Day Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.dailyStats}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} />
                <Line type="monotone" dataKey="downloads" stroke="var(--color-downloads)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
