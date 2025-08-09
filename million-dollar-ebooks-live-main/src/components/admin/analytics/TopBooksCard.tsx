
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopBooksCardProps {
  topBooks: Array<{
    id: string;
    title: string;
    author_name: string;
    download_count: number;
    view_count: number;
  }>;
}

export function TopBooksCard({ topBooks }: TopBooksCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Top Books</CardTitle>
        <p className="text-sm text-gray-400">Book analytics tracking coming soon</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topBooks.map((book) => (
            <div key={book.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{book.title}</p>
                <p className="text-sm text-gray-400">by {book.author_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Analytics pending</p>
                <p className="text-sm text-gray-400">{book.download_count || 0} downloads</p>
              </div>
            </div>
          ))}
          {topBooks.length === 0 && (
            <p className="text-center text-gray-400 py-4">No book data available yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
