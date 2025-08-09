
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookReaderNavigationProps {
  currentPage: number;
  totalPages: number;
  isMobile: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
}

export function BookReaderNavigation({
  currentPage,
  totalPages,
  isMobile,
  onPrevPage,
  onNextPage,
  onGoToPage
}: BookReaderNavigationProps) {
  return (
    <div className="flex items-center justify-between p-3 lg:p-4 bg-amber-100 dark:bg-amber-800 border-t border-amber-200 dark:border-amber-700 flex-shrink-0 gap-2 lg:gap-4">
      <Button 
        onClick={onPrevPage} 
        disabled={currentPage === 0}
        variant="outline"
        size={isMobile ? "sm" : "default"}
        className="border-amber-300 dark:border-amber-600 min-w-0"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
        <span className="text-xs lg:text-sm text-amber-700 dark:text-amber-300 whitespace-nowrap">
          Go to:
        </span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage + 1}
          onChange={(e) => onGoToPage(parseInt(e.target.value) - 1)}
          className="w-12 lg:w-16 px-1 lg:px-2 py-1 text-xs lg:text-sm border border-amber-300 dark:border-amber-600 rounded bg-white dark:bg-amber-700 text-amber-900 dark:text-amber-100 text-center"
        />
        <span className="text-xs lg:text-sm text-amber-700 dark:text-amber-300">
          /{totalPages}
        </span>
      </div>

      <Button 
        onClick={onNextPage} 
        disabled={currentPage >= totalPages - 1}
        variant="outline"
        size={isMobile ? "sm" : "default"}
        className="border-amber-300 dark:border-amber-600 min-w-0"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
