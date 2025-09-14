
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Settings, Bookmark } from 'lucide-react';

interface BookReaderHeaderSingleProps {
  title: string;
  progress: number;
  currentChapter: string;
  isMobile: boolean;
  showSettings: boolean;
  onClose: () => void;
  onToggleSettings: () => void;
  onBookmark: () => void;
}

export function BookReaderHeaderSingle({
  title,
  progress,
  currentChapter,
  isMobile,
  showSettings,
  onClose,
  onToggleSettings,
  onBookmark
}: BookReaderHeaderSingleProps) {
  return (
    <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-800 border-b border-amber-200 dark:border-amber-700 p-3 lg:p-4">
      <div className="flex items-center justify-between mb-2">
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

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
          <span>Reading Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2 bg-amber-200 dark:bg-amber-700"
        />
        {currentChapter && (
          <p className="text-xs text-amber-600 dark:text-amber-400 truncate">
            Current: {currentChapter}
          </p>
        )}
      </div>
    </div>
  );
}
