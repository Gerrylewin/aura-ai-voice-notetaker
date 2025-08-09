
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Settings, Menu } from 'lucide-react';

interface BookReaderHeaderProps {
  title: string;
  currentPage: number;
  totalPages: number;
  isMobile: boolean;
  showSettings: boolean;
  onClose: () => void;
  onToggleSettings: () => void;
}

export function BookReaderHeader({
  title,
  currentPage,
  totalPages,
  isMobile,
  showSettings,
  onClose,
  onToggleSettings
}: BookReaderHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 lg:p-4 bg-amber-100 dark:bg-amber-800 border-b border-amber-200 dark:border-amber-700 flex-shrink-0">
      <Button 
        onClick={onClose} 
        variant="outline" 
        size={isMobile ? "sm" : "default"}
        className="border-amber-300 dark:border-amber-600"
      >
        <ChevronLeft className="w-4 h-4 mr-1 lg:mr-2" />
        <span className="hidden sm:inline">Close</span>
      </Button>
      
      <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-1 mx-2 lg:mx-4">
        <h1 className="text-sm lg:text-lg font-semibold text-amber-900 dark:text-amber-100 truncate">
          {title}
        </h1>
        <span className="text-xs lg:text-sm text-amber-700 dark:text-amber-300 whitespace-nowrap">
          {currentPage + 1}/{totalPages}
        </span>
      </div>

      <Button 
        onClick={onToggleSettings} 
        variant="outline"
        size={isMobile ? "sm" : "default"}
        className="border-amber-300 dark:border-amber-600"
      >
        {isMobile ? <Menu className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
      </Button>
    </div>
  );
}
