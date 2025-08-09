
import React from 'react';
import { ReadingStatsShare } from '@/components/social/ReadingStatsShare';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, MessageCircle } from 'lucide-react';

export function SocialTab() {
  return (
    <div className="space-y-6">
      {/* Reading Stats Share */}
      <ReadingStatsShare />

      {/* Social Features Coming Soon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connect with other readers and share your favorite books.
            </p>
            <div className="mt-4 text-center">
              <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs">
                Coming Soon
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Book Clubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Join reading groups and discuss books with fellow readers.
            </p>
            <div className="mt-4 text-center">
              <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs">
                Coming Soon
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Discussions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Participate in book discussions and reading challenges.
            </p>
            <div className="mt-4 text-center">
              <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs">
                Coming Soon
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
