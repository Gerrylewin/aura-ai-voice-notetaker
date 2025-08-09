
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Settings, Bookmark, Clock, BookOpen } from 'lucide-react';

interface ReadingStats {
  progress: {
    percentage: number;
    pagesRead: number;
    pagesRemaining: number;
  };
  wordsRead: number;
  wordsRemaining: number;
  readingTime: {
    formattedTime: string;
  };
  totalWords: number;
}

interface BookReaderHeaderPaginatedProps {
  title: string;
  currentPage: number;
  totalPages: number;
  readingStats: ReadingStats | null;
  isMobile: boolean;
  showSettings: boolean;
  onClose: () => void;
  onToggleSettings: () => void;
  onBookmark: () => void;
}

export function BookReaderHeaderPaginated({
  title,
  currentPage,
  totalPages,
  readingStats,
  isMobile,
  showSettings,
  onClose,
  onToggleSettings,
  onBookmark
}: BookReaderHeaderPaginatedProps) {
  return (
    <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-800 border-b border-amber-200 dark:border-amber-700 p-3 lg:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700"
          >
            <X className="h-4 w-4" />
          </Button>
          <h1 className={`font-bold text-amber-900 dark:text-amber-100 ${
            isMobile ? 'text-sm' : 'text-lg'
          } truncate max-w-xs lg:max-w-md`}>
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBookmark}
            className="text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700"
            title="Save bookmark"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSettings}
            className={`text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700 ${
              showSettings ? 'bg-amber-200 dark:bg-amber-700' : ''
            }`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page and Progress Information */}
      <div className="space-y-3">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3 w-3" />
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            <span>{readingStats?.progress.percentage || 0}% complete</span>
          </div>
          <Progress 
            value={readingStats?.progress.percentage || 0} 
            className="h-2 bg-amber-200 dark:bg-amber-700"
          />
        </div>

        {/* Reading Statistics */}
        {readingStats && !isMobile && (
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-4">
              <span>{readingStats.wordsRead.toLocaleString()} words read</span>
              <span>•</span>
              <span>{readingStats.wordsRemaining.toLocaleString()} remaining</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{readingStats.readingTime.formattedTime} left</span>
            </div>
          </div>
        )}

        {/* Mobile condensed stats */}
        {readingStats && isMobile && (
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
            <span>{readingStats.wordsRead.toLocaleString()} / {readingStats.totalWords.toLocaleString()} words</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{readingStats.readingTime.formattedTime}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
