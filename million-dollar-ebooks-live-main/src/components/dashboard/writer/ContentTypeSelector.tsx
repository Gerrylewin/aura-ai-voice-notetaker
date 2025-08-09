
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, PenTool, ArrowRight } from 'lucide-react';
import { BookWritingForm } from './BookWritingForm';
import { StoryCreationForm } from './StoryCreationForm';

interface ContentTypeSelectorProps {
  autoSelectBook?: boolean;
}

export function ContentTypeSelector({ autoSelectBook = false }: ContentTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<'book' | 'story' | null>(null);

  useEffect(() => {
    if (autoSelectBook) {
      setSelectedType('book');
    }
  }, [autoSelectBook]);

  if (selectedType === 'book') {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedType(null)}
          className="mb-4"
        >
          ← Back to Content Types
        </Button>
        <BookWritingForm />
      </div>
    );
  }

  if (selectedType === 'story') {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedType(null)}
          className="mb-4"
        >
          ← Back to Content Types
        </Button>
        <StoryCreationForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Create New Content</h2>
        <p className="text-gray-600 dark:text-gray-400">Choose the type of content you want to create</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedType('book')}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-gray-900 dark:text-white">Create a Book</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Write and publish a full-length book. Books can be sold and generate revenue through our platform.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Start Writing Book
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedType('story')}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <PenTool className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-gray-900 dark:text-white">Create a Story</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Write a daily story for the Story of the Day competition. Compete for 1000 author points!
            </p>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              Write Daily Story
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
