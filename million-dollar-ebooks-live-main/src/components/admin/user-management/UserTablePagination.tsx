
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserTablePaginationProps {
  currentPage: number;
  totalPages: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function UserTablePagination({
  currentPage,
  totalPages,
  canGoNext,
  canGoPrev,
  onNextPage,
  onPrevPage
}: UserTablePaginationProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevPage}
        disabled={!canGoPrev}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNextPage}
        disabled={!canGoNext}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
