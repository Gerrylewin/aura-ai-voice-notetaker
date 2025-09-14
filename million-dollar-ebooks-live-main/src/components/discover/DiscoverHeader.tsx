
import React from 'react';
import { Search, BookOpen, Users, FileText } from 'lucide-react';

interface DiscoverHeaderProps {
  searchQuery: string;
}

export function DiscoverHeader({ searchQuery }: DiscoverHeaderProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Discover Your Next Great Read
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Explore carefully curated books from independent authors. From romance to biblical literature, from mystery to science fiction - find stories that inspire, entertain, and transform your world.
        </p>
      </div>

      <div className="flex justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-red-500" />
          <span>Premium eBooks</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <span>Daily Stories</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          <span>Indie Authors</span>
        </div>
      </div>

      {searchQuery && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200">
            <Search className="w-5 h-5" />
            <span className="font-medium">
              Showing results for: <span className="font-bold">"{searchQuery}"</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
