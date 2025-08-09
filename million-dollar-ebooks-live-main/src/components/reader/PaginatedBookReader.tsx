
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BookReaderStyles } from './BookReaderStyles';
import { BookReaderHeaderPaginated } from './BookReaderHeaderPaginated';
import { BookReaderSettings } from './BookReaderSettings';
import { EnhancedBookReaderContent } from './EnhancedBookReaderContent';
import { BookReaderNavigationPaginated } from './BookReaderNavigationPaginated';
import { EnhancedBookPaginator, EnhancedPaginationInfo } from '@/utils/enhancedBookPagination';
import { useUpdateReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PaginatedBookReaderProps {
  content: string;
  title: string;
  bookId?: string;
  onClose: () => void;
}

export function PaginatedBookReader({ content, title, bookId, onClose }: PaginatedBookReaderProps) {
  const [selectedFont, setSelectedFont] = useState('serif');
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const updateProgress = useUpdateReadingProgress();

  // Enhanced pagination with HTML preservation
  const paginationInfo: EnhancedPaginationInfo = useMemo(() => {
    console.log('📖 Enhanced paginating book content...');
    setIsLoading(true);
    const result = EnhancedBookPaginator.paginateContent(content);
    console.log('📊 Enhanced pagination result:', {
      totalPages: result.totalPages,
      totalWords: result.totalWords,
      averageWordsPerPage: result.averageWordsPerPage,
      chapters: result.chapters.length
    });
    setIsLoading(false);
    return result;
  }, [content]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add Google Fonts
  useEffect(() => {
    const fontLinks = [
      'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap',
      'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600&display=swap'
    ];

    fontLinks.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showSettings) return; // Don't navigate when settings are open
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePreviousPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // Spacebar
          e.preventDefault();
          handleNextPage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, paginationInfo.totalPages, showSettings]);

  // Initialize loading state
  useEffect(() => {
    if (paginationInfo.totalPages > 0) {
      setIsLoading(false);
    }
  }, [paginationInfo.totalPages]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (bookId && user && currentPage > 0 && paginationInfo.totalPages > 0) {
        const progressData = EnhancedBookPaginator.calculateReadingProgress(currentPage, paginationInfo.totalPages);
        updateProgress.mutate({ bookId, percentage: progressData.percentage });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [bookId, user, currentPage, paginationInfo.totalPages, updateProgress]);

  // Enhanced navigation with smooth transitions
  const handlePageTransition = useCallback(async (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > paginationInfo.totalPages) {
      return;
    }

    setIsTransitioning(true);
    
    // Short delay for smooth transition effect
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsTransitioning(false);
    }, 150);
  }, [currentPage, paginationInfo.totalPages]);

  const handleNextPage = useCallback(() => {
    if (currentPage < paginationInfo.totalPages) {
      handlePageTransition(currentPage + 1);
    }
  }, [currentPage, paginationInfo.totalPages, handlePageTransition]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageTransition(currentPage - 1);
    }
  }, [currentPage, handlePageTransition]);

  const handleGoToPage = useCallback((page: number) => {
    handlePageTransition(page);
  }, [handlePageTransition]);

  const handleBookmark = () => {
    if (!bookId || !user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to save bookmarks.',
        variant: 'destructive',
      });
      return;
    }

    const progress = EnhancedBookPaginator.calculateReadingProgress(currentPage, paginationInfo.totalPages);
    updateProgress.mutate({ bookId, percentage: progress.percentage }, {
      onSuccess: () => {
        toast({
          title: 'Bookmark saved!',
          description: `Progress saved at page ${currentPage} of ${paginationInfo.totalPages}`,
        });
      }
    });
  };

  // Enhanced reading statistics
  const readingStats = useMemo(() => {
    if (!paginationInfo.pages.length) return null;
    
    const progress = EnhancedBookPaginator.calculateReadingProgress(currentPage, paginationInfo.totalPages);
    const currentPageData = paginationInfo.pages[currentPage - 1];
    const wordsRead = paginationInfo.pages
      .slice(0, currentPage - 1)
      .reduce((total, page) => total + page.wordCount, 0);
    const wordsRemaining = paginationInfo.totalWords - wordsRead - (currentPageData?.wordCount || 0);

    return {
      progress,
      wordsRead,
      wordsRemaining,
      readingTime: { formattedTime: `${progress.estimatedTimeRemaining}m` },
      totalWords: paginationInfo.totalWords,
      currentChapter: currentPageData?.chapterTitle
    };
  }, [currentPage, paginationInfo]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-amber-50 dark:bg-amber-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-800 dark:text-amber-200">Preparing your book...</p>
        </div>
      </div>
    );
  }

  const currentPageContent = paginationInfo.pages[currentPage - 1]?.content || '';

  return (
    <div className="fixed inset-0 bg-amber-50 dark:bg-amber-900 z-50 overflow-hidden flex flex-col">
      <BookReaderStyles />
      
      <BookReaderHeaderPaginated
        title={title}
        currentPage={currentPage}
        totalPages={paginationInfo.totalPages}
        readingStats={readingStats}
        isMobile={isMobile}
        showSettings={showSettings}
        onClose={onClose}
        onToggleSettings={() => setShowSettings(!showSettings)}
        onBookmark={handleBookmark}
      />

      <BookReaderSettings
        showSettings={showSettings}
        selectedFont={selectedFont}
        onFontChange={setSelectedFont}
        onClose={() => setShowSettings(false)}
      />

      <EnhancedBookReaderContent
        htmlContent={paginationInfo.pages[currentPage - 1]?.htmlContent || ''}
        currentPage={currentPage}
        totalPages={paginationInfo.totalPages}
        selectedFont={selectedFont}
        isMobile={isMobile}
        chapterTitle={paginationInfo.pages[currentPage - 1]?.chapterTitle}
        isChapterStart={paginationInfo.pages[currentPage - 1]?.isChapterStart || false}
        readingTimeMinutes={paginationInfo.pages[currentPage - 1]?.readingTimeMinutes || 0}
        isTransitioning={isTransitioning}
      />

      <BookReaderNavigationPaginated
        currentPage={currentPage}
        totalPages={paginationInfo.totalPages}
        isMobile={isMobile}
        onPrevPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onGoToPage={handleGoToPage}
        readingStats={readingStats}
      />
    </div>
  );
}
