
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookManagement } from './BookManagement';
import { StoryManagement } from './StoryManagement';

interface ContentManagementProps {
  books: any[];
  stories: any[];
  onEditBook?: (book: any) => void;
  onCreateNewBook?: () => void;
}

export function ContentManagement({ books, stories, onEditBook, onCreateNewBook }: ContentManagementProps) {
  const [activeTab, setActiveTab] = useState('books');

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Manage Your Content</h2>
        <p className="text-gray-600 dark:text-gray-400">View and manage your published books and stories</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="books" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Books ({books.length})
          </TabsTrigger>
          <TabsTrigger value="stories" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            Stories ({stories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="books">
          <BookManagement 
            books={books} 
            onEditBook={onEditBook}
            onCreateNewBook={onCreateNewBook}
          />
        </TabsContent>

        <TabsContent value="stories">
          <StoryManagement stories={stories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
