
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoryAnalyticsContainer } from './analytics/StoryAnalyticsContainer';
import { BookAnalyticsContainer } from './analytics/BookAnalyticsContainer';

export function WriterAnalytics() {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Content Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stories" className="space-y-4">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="stories" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Story Analytics
            </TabsTrigger>
            <TabsTrigger value="books" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Book Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stories">
            <StoryAnalyticsContainer />
          </TabsContent>
          
          <TabsContent value="books">
            <BookAnalyticsContainer />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
