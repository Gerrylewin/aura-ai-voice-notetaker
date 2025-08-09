
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalyticsAudienceTabProps {
  analyticsData: {
    overview: {
      uniqueVisitors: number;
    };
    demographics: Array<{
      name: string;
      value: number;
      color: string;
    }>;
  };
}

export function AnalyticsAudienceTab({ analyticsData }: AnalyticsAudienceTabProps) {
  const chartConfig = {
    views: { label: "Views", color: "#ef4444" },
    downloads: { label: "Downloads", color: "#3b82f6" },
    readingTime: { label: "Reading Time (min)", color: "#10b981" }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Usage */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Device Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.demographics}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {analyticsData.demographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Audience Stats */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Audience Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Unique Visitors</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData.overview.uniqueVisitors.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Return Visitors</span>
              <span className="font-semibold text-gray-900 dark:text-white">42%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Bounce Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Peak Reading Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">7-9 PM</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
