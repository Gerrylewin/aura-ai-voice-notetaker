
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';

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

interface BookReaderNavigationPaginatedProps {
  currentPage: number;
  totalPages: number;
  isMobile: boolean;
  readingStats: ReadingStats | null;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
}

export function BookReaderNavigationPaginated({
  currentPage,
  totalPages,
  isMobile,
  readingStats,
  onPrevPage,
  onNextPage,
  onGoToPage
}: BookReaderNavigationPaginatedProps) {
  const [jumpToPage, setJumpToPage] = useState('');

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum && pageNum >= 1 && pageNum <= totalPages) {
      onGoToPage(pageNum);
      setJumpToPage('');
    }
  };

  const handleJumpFirst = () => onGoToPage(1);
  const handleJumpLast = () => onGoToPage(totalPages);

  return (
    <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-800 border-t border-amber-200 dark:border-amber-700 p-3 lg:p-4">
      {/* Main Navigation */}
      <div className="flex items-center justify-between gap-2 lg:gap-4 mb-3">
        {/* Previous Page */}
        <div className="flex items-center gap-1">
          <Button 
            onClick={handleJumpFirst}
            disabled={currentPage === 1}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="border-amber-300 dark:border-amber-600"
            title="First page"
          >
            <SkipBack className="w-4 h-4" />
            {!isMobile && <span className="ml-1">First</span>}
          </Button>
          <Button 
            onClick={onPrevPage} 
            disabled={currentPage === 1}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="border-amber-300 dark:border-amber-600"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className={isMobile ? "hidden sm:inline" : ""}>Previous</span>
          </Button>
        </div>

        {/* Page Jump */}
        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center max-w-xs">
          {!isMobile && (
            <>
              <span className="text-xs lg:text-sm text-amber-700 dark:text-amber-300 whitespace-nowrap">
                Go to:
              </span>
              <Input
                type="number"
                min="1"
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                className="w-16 lg:w-20 text-center text-xs lg:text-sm border-amber-300 dark:border-amber-600"
                placeholder={currentPage.toString()}
              />
              <Button
                onClick={handleJumpToPage}
                disabled={!jumpToPage}
                variant="outline"
                size="sm"
                className="border-amber-300 dark:border-amber-600"
              >
                Go
              </Button>
            </>
          )}
          {isMobile && (
            <div className="text-center">
              <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {currentPage} / {totalPages}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400">
                {readingStats?.progress.percentage}% complete
              </div>
            </div>
          )}
        </div>

        {/* Next Page */}
        <div className="flex items-center gap-1">
          <Button 
            onClick={onNextPage} 
            disabled={currentPage >= totalPages}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="border-amber-300 dark:border-amber-600"
          >
            <span className={isMobile ? "hidden sm:inline" : ""}>Next</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button 
            onClick={handleJumpLast}
            disabled={currentPage === totalPages}
            variant="outline"
            size={isMobile ? "sm" : "default"}
            className="border-amber-300 dark:border-amber-600"
            title="Last page"
          >
            {!isMobile && <span className="mr-1">Last</span>}
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Reading Progress Info */}
      {readingStats && !isMobile && (
        <div className="flex items-center justify-center text-xs text-amber-600 dark:text-amber-400 space-x-4">
          <span>{readingStats.progress.pagesRead} pages read</span>
          <span>•</span>
          <span>{readingStats.progress.pagesRemaining} pages remaining</span>
          <span>•</span>
          <span>{readingStats.readingTime.formattedTime} estimated reading time</span>
        </div>
      )}
    </div>
  );
}
