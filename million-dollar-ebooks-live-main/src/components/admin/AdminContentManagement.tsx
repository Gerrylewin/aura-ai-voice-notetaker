
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Flag, CheckCircle, Clock } from 'lucide-react';
import { PendingBook, ContentFlag } from '@/hooks/useAdminData';
import { BookReviewCard } from './BookReviewCard';

interface AdminContentManagementProps {
  pendingBooks: PendingBook[];
  flags: ContentFlag[];
  onBookReview: (book: any) => Promise<void>;
  onFlagReview: (flag: any) => Promise<void>;
  onBookDelete: (bookId: string) => Promise<void>;
}

export function AdminContentManagement({
  pendingBooks,
  flags,
  onBookReview,
  onFlagReview,
  onBookDelete
}: AdminContentManagementProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStatusUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
    // Force a page refresh to get updated data
    window.location.reload();
  };

  const pendingFlags = flags.filter(flag => flag.status === 'pending');
  const resolvedFlags = flags.filter(flag => flag.status === 'resolved');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Content Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage content across the platform.
        </p>
      </div>

      <Tabs defaultValue="books" className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="books" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 mr-2" />
            Pending Books ({pendingBooks.length})
          </TabsTrigger>
          <TabsTrigger value="flags" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            <Flag className="w-4 h-4 mr-2" />
            Content Flags ({pendingFlags.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4">
          {pendingBooks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No books are currently pending review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {pendingBooks.length} book{pendingBooks.length !== 1 ? 's' : ''} waiting for review
              </div>
              
              {pendingBooks.map((book) => (
                <BookReviewCard
                  key={book.id}
                  book={book}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flags" className="space-y-4">
          {pendingFlags.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No pending flags!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  All content flags have been reviewed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingFlags.map((flag) => (
                <Card key={flag.id} className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flag className="w-5 h-5 text-red-600" />
                      Content Flag - {flag.flag_type}
                      <Badge variant="destructive">Pending</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {flag.description}
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Reported on {new Date(flag.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
