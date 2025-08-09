
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WriterLeaderboard } from './WriterLeaderboard';
import { ReaderLeaderboard } from './ReaderLeaderboard';
import { PenTool, BookOpen } from 'lucide-react';

export function LeaderboardTabs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Community Leaderboards</h1>
        <p className="text-gray-600 dark:text-gray-400">See how you rank among our amazing community of readers and writers</p>
      </div>

      <Tabs defaultValue="writers" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex w-max min-w-full">
            <TabsTrigger value="writers" className="data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Writer Leaderboard
            </TabsTrigger>
            <TabsTrigger value="readers" className="data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-nowrap flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Reader Leaderboard
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="writers" className="space-y-6">
          <WriterLeaderboard />
        </TabsContent>

        <TabsContent value="readers" className="space-y-6">
          <ReaderLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
